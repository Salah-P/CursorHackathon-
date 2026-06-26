# code_agent

A tiny **NL → code → answer** agent over the 7 Abu Dhabi proptech datasets, plus a
harness that evaluates it against the benchmark.

Give it a plain-language question; an LLM writes pandas code, the code runs against the
real CSVs, and you get back the **answer**, a **grounded explanation** (built from the
values the code actually computed, so it can't be hallucinated), and the **generated code**.

## Files

| File | What it is |
|---|---|
| `code_agent.py` | the agent: `code_agent(instruction) -> {answer, explanation, code}` |
| `eval_benchmark.py` | runs the agent over the benchmark, LLM-judges each answer, reports accuracy |
| `eval_results.jsonl` | last eval output — line 1 = summary (accuracy), then one line per question incl. the generated code |

## Folder layout

This folder sits next to the data and benchmark (the code reads them via `../`):

```
cursor_hackathon/
├── .env                 # OPENAI_API_KEY  (loaded automatically)
├── data/                # the 7 CSVs
├── benchmark/           # questions.jsonl (ground truth)
└── code_agent/          # <- you are here
    ├── code_agent.py
    ├── eval_benchmark.py
    └── eval_results.jsonl
```

Paths are resolved relative to the script, so it works whether you run it from inside
`code_agent/` or from the parent. Override with `DATA_DIR`, `BENCH`, `LLM_MODEL`, etc.

## How the agent works

```mermaid
flowchart TD
    U["User instruction (plain English)"] --> CA["code_agent(instruction)"]
    CA --> LD["Load 7 CSVs from ../data as pandas DataFrames"]
    LD --> SP["Build system prompt:<br/>DATA_GUIDE (what each dataset is) + live column schemas"]
    SP --> LLM{{"OpenAI LLM — gpt-4.1-nano"}}
    LLM -->|returns JSON with code| EX["exec the code in a namespace<br/>holding the DataFrames (pd + 7 tables)"]
    EX --> AV["code sets two variables:<br/>answer + explanation<br/>explanation is built from the REAL computed values"]
    AV --> RET["return answer, explanation, code"]
```

Key idea: the model never states a number from memory — it writes code that computes it,
and the explanation is assembled from those computed values, so the answer is auditable.

## How the eval works

```mermaid
flowchart LR
    B[("../benchmark/questions.jsonl")] --> POOL["ThreadPoolExecutor<br/>(WORKERS questions in parallel)"]
    GT["ground_truth + answer_value"] --> JG{{"LLM judge — gpt-4o-mini"}}
    POOL --> CA["code_agent → answer + code"]
    CA --> JG
    JG -->|correct? true / false| V["verdict per question"]
    V --> SUM["accuracy + by-category breakdown"]
    SUM --> OUT[("eval_results.jsonl<br/>summary line + per-question records incl. code")]
```

The judge tolerates rounding, phrasing, and set-matching for lists, so it grades the
*answer*, not the formatting. Calls are run in parallel (the work is I/O-bound API calls)
with a per-request timeout so one stalled call can't hang the run.

## Run it

```bash
# from this folder (key auto-loads from ../.env):
python eval_benchmark.py

# knobs (all optional):
AGENT_MODEL=gpt-4o WORKERS=16 python eval_benchmark.py
```

Output ends with:

```
==================================================
  ACCURACY: NN.N%   (k/30)   model = gpt-4.1-nano
==================================================
  by category   : {'cross-dataset': '.../13', 'single-dataset': '.../17'}
  failed        : [...]
```

…and writes `eval_results.jsonl`. To use the agent directly:

```python
from code_agent import code_agent
out = code_agent("Which district has the highest gross rental yield?")
print(out["answer"], "\n", out["explanation"], "\n", out["code"])
```
