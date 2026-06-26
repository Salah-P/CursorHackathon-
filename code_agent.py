"""
code_agent.py — a tiny NL -> code -> answer agent over the proptech CSVs.

Give it a plain-language instruction. It asks an LLM to write pandas code,
executes that code against the datasets, and returns the answer plus a
GROUNDED explanation (the explanation is built from the real values the code
computed, so it can't be hallucinated).

Provider-agnostic: it uses the OpenAI SDK, which also talks to Fireworks.
  OpenAI  (default): set OPENAI_API_KEY  (already in your .env)
  Fireworks        : LLM_API_KEY=$FIREWORKS_API_KEY
                     LLM_BASE_URL=https://api.fireworks.ai/inference/v1
                     LLM_MODEL=accounts/fireworks/models/<model>

Usage:
  python code_agent.py "Which district has the highest gross rental yield?"
  # or from code:  from code_agent import code_agent; code_agent("...")
"""
import os, io, json, contextlib
import pandas as pd
from openai import OpenAI

# ---- config ----------------------------------------------------------------
DATA_DIR = os.environ.get("DATA_DIR", "data")
MODEL = os.environ.get("LLM_MODEL", "gpt-4o")
TABLES = {                       # variable name the LLM uses -> csv file
    "districts":    "districts.csv",
    "amenities":    "osm_amenities.csv",
    "communities":  "sample_communities.csv",
    "investors":    "sample_investors.csv",
    "listings":     "sample_listings.csv",
    "parcels":      "sample_parcels.csv",
    "transactions": "sample_transactions.csv",
}

SYSTEM = """You are a data analyst for Abu Dhabi proptech datasets.
These pandas DataFrames are ALREADY loaded in memory (do not read files):
{schemas}
All tables join on the `district` column.

Answer the user's question by returning ONLY a JSON object: {{"code": "<python>"}}

The python code MUST:
- use the DataFrames above by name (districts, amenities, ...) and only pandas (`pd`)
- do no imports, file, or network access
- end by assigning two variables:
    answer       -> the final answer (number / string / list)
    explanation  -> a short string of the steps AND the real intermediate
                    values, built with f-strings so the numbers are the ones
                    actually computed (never invented)
"""


def _load_env(path=".env"):
    """Load KEY=VALUE lines from .env without adding a dependency."""
    if os.path.exists(path):
        for line in open(path):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


def _frames():
    return {name: pd.read_csv(os.path.join(DATA_DIR, f)) for name, f in TABLES.items()}


def _schemas(frames):
    return "\n".join(f"- {n} ({len(df)} rows): {list(df.columns)}" for n, df in frames.items())


def _client():
    _load_env()
    return OpenAI(
        api_key=os.environ.get("LLM_API_KEY") or os.environ["OPENAI_API_KEY"],
        base_url=os.environ.get("LLM_BASE_URL") or None,
    )


def code_agent(instruction: str) -> dict:
    """NL instruction -> {answer, explanation, code}."""
    frames = _frames()
    resp = _client().chat.completions.create(
        model=MODEL,
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM.format(schemas=_schemas(frames))},
            {"role": "user", "content": instruction},
        ],
    )
    code = json.loads(resp.choices[0].message.content)["code"]
    ns = {"pd": pd, **frames}
    with contextlib.redirect_stdout(io.StringIO()):   # ignore stray prints
        exec(code, ns)                                # noqa: S102 (trusted demo)
    return {
        "instruction": instruction,
        "answer": ns.get("answer"),
        "explanation": ns.get("explanation"),
        "code": code,
    }


if __name__ == "__main__":
    import sys
    q = " ".join(sys.argv[1:]) or "Which district has the highest gross rental yield, and what is it?"
    out = code_agent(q)
    print("Q:          ", out["instruction"])
    print("ANSWER:     ", out["answer"])
    print("EXPLANATION:", out["explanation"])
    print("\n--- generated code ---\n" + out["code"])
