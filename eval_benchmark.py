"""
eval_benchmark.py — run code_agent over the benchmark and score it.

For each question in benchmark/questions.jsonl it:
  1. asks code_agent (an OLD gpt model) to answer,
  2. uses a small LLM judge to compare the answer to the ground truth
     (allows rounding / phrasing / set-match for lists),
  3. tallies accuracy and writes eval_results.jsonl — line 1 is a summary
     record (accuracy + breakdowns), then one line per question including the
     agent's generated code and explanation.

Run from a folder that has the benchmark, and point DATA_DIR at the 7 CSVs:

  export OPENAI_API_KEY=...            # or rely on ./.env
  export DATA_DIR=/path/to/starter-kit/data
  export AGENT_MODEL=gpt-4.1-nano      # the model under test (default)
  export JUDGE_MODEL=gpt-4o-mini       # grader (default)
  export BENCH=benchmark/questions.jsonl
  export WORKERS=8                     # parallel questions (default)
  python eval_benchmark.py
"""
import os, json
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

# the model under test — set BEFORE importing code_agent so it picks it up
AGENT_MODEL = os.environ.get("AGENT_MODEL", "gpt-4.1-nano")
os.environ["LLM_MODEL"] = AGENT_MODEL
os.environ.setdefault("DATA_DIR", "data")

import code_agent as ca          # noqa: E402  (must follow env setup above)
from openai import OpenAI        # noqa: E402

ca.MODEL = AGENT_MODEL           # belt-and-suspenders
BENCH = os.environ.get("BENCH", "benchmark/questions.jsonl")
JUDGE_MODEL = os.environ.get("JUDGE_MODEL", "gpt-4o-mini")
WORKERS = int(os.environ.get("WORKERS", "8"))   # parallel questions (I/O-bound API calls)

ca._load_env()                   # load keys from ./.env if present
_judge = OpenAI(api_key=os.environ.get("LLM_API_KEY") or os.environ["OPENAI_API_KEY"],
                base_url=os.environ.get("LLM_BASE_URL") or None)


def grade(question, ground_truth, gt_value, agent_answer):
    prompt = (
        f"Question: {question}\n"
        f"Reference answer (ground truth): {ground_truth}\n"
        f"Reference value: {gt_value}\n"
        f"Candidate answer: {agent_answer}\n\n"
        "Is the candidate answer CORRECT? Allow numeric rounding (within ~1%), "
        "different wording, and equivalent forms. For lists/rankings the named "
        "items must match (order matters only if the question asks to rank). "
        'Reply with ONLY JSON: {"correct": true|false, "reason": "<short>"}'
    )
    r = _judge.chat.completions.create(
        model=JUDGE_MODEL, temperature=0,
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}],
    )
    return json.loads(r.choices[0].message.content)


def run_one(q):
    """Answer + grade one question (runs in a worker thread)."""
    code, explanation = None, None
    try:
        out = ca.code_agent(q["question"])
        answer, explanation, code = out["answer"], out.get("explanation"), out.get("code")
    except Exception as e:                          # weak model may emit broken code
        answer = f"ERROR: {e}"
    try:
        verdict = grade(q["question"], q["ground_truth"], q["answer_value"], answer)
    except Exception as e:
        verdict = {"correct": False, "reason": f"judge error: {e}"}
    return {
        "id": q["id"], "question": q["question"], "category": q.get("category"),
        "agent_answer": answer, "ground_truth": q["answer_value"],
        "correct": bool(verdict.get("correct")), "reason": verdict.get("reason", ""),
        "explanation": explanation, "code": code,   # the agent's generated pandas
    }


def main():
    if not os.path.exists(BENCH):
        raise SystemExit(f"benchmark not found: {BENCH} (set BENCH=...)")
    if not os.path.exists(os.path.join(ca.DATA_DIR, "districts.csv")):
        raise SystemExit(f"CSVs not found in DATA_DIR={ca.DATA_DIR} (set DATA_DIR=/path/to/starter-kit/data)")

    rows = [json.loads(l) for l in open(BENCH) if l.strip()]
    print(f"Testing agent model = {AGENT_MODEL} | judge = {JUDGE_MODEL} "
          f"| {len(rows)} questions | {WORKERS} parallel workers\n")

    # I/O-bound (API calls) -> threads give near-linear speedup
    results = []
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(run_one, q): q for q in rows}
        for fut in tqdm(as_completed(futures), total=len(rows), desc="Evaluating", unit="q"):
            r = fut.result()
            results.append(r)
            tqdm.write(f"{r['id']} {'PASS' if r['correct'] else 'FAIL'} "
                       f"| agent={r['agent_answer']} | gt={r['ground_truth']}")

    results.sort(key=lambda r: r["id"])             # restore Q01..Q30 order
    correct = sum(r["correct"] for r in results)
    accuracy = round(correct / len(rows) * 100, 1)

    def breakdown(key):                             # accuracy grouped by a field
        g = {}
        for r in results:
            k = r.get(key) or "?"
            g.setdefault(k, [0, 0])
            g[k][0] += r["correct"]; g[k][1] += 1
        return {k: f"{c}/{t} ({c / t * 100:.0f}%)" for k, (c, t) in sorted(g.items())}

    fails = [r["id"] for r in results if not r["correct"]]
    by_cat = breakdown("category")

    print("\n" + "=" * 50)
    print(f"  ACCURACY: {accuracy}%   ({correct}/{len(rows)})   model = {AGENT_MODEL}")
    print("=" * 50)
    print("  by category   :", by_cat)
    print("  failed        :", fails)

    # JSONL: line 1 = summary record, then one record per question (incl. generated code)
    with open("eval_results.jsonl", "w") as f:
        summary = {"type": "summary", "model": AGENT_MODEL, "accuracy_pct": accuracy,
                   "correct": correct, "total": len(rows),
                   "by_category": by_cat, "failed_ids": fails}
        f.write(json.dumps(summary, ensure_ascii=False) + "\n")
        for r in results:
            f.write(json.dumps(r, ensure_ascii=False, default=str) + "\n")
    print("\n  -> eval_results.jsonl  (line 1 = summary w/ accuracy; then one line per "
          "question incl. the agent's generated code + explanation)")


if __name__ == "__main__":
    main()
