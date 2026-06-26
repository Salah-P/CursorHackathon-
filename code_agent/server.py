"""
server.py — a tiny FastAPI sidecar that exposes code_agent over HTTP.

Hakim AI's browser tool handler (via the Next API route /api/hakim/analyze)
POSTs a plain-language question here; we run code_agent against the proptech
CSVs and return the grounded answer, the explanation, and the data sources used
so the avatar can cite them.

Run:  npm run agent        (python3 -m uvicorn code_agent.server:app --port 8000)
"""
import os
import re

from fastapi import FastAPI
from pydantic import BaseModel

from code_agent.code_agent import code_agent, TABLES


def _load_env() -> None:
    """Load .env.local then .env from the repo root into os.environ."""
    here = os.path.dirname(os.path.abspath(__file__))
    root = os.path.join(here, "..")
    for name in (".env.local", ".env"):
        path = os.path.join(root, name)
        if not os.path.exists(path):
            continue
        for line in open(path):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key, value = key.strip(), value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


_load_env()

app = FastAPI(title="Hakim AI — code_agent sidecar")


class AnalyzeRequest(BaseModel):
    query: str


def _sources_from_code(code: str) -> tuple[list[str], str]:
    """Return (csv filenames, human label) for the tables referenced in code."""
    used = [name for name in TABLES if re.search(rf"\b{name}\b", code or "")]
    files = [TABLES[name] for name in used]
    if not files:
        return [], "Abu Dhabi AI PropTech Challenge synthetic datasets"
    label = ", ".join(files)
    return files, label


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/analyze")
def analyze(req: AnalyzeRequest) -> dict:
    try:
        out = code_agent(req.query)
    except Exception as exc:  # surface a clean error to the caller
        return {"error": str(exc)}

    files, source_label = _sources_from_code(out.get("code", ""))
    return {
        "answer": out.get("answer"),
        "explanation": out.get("explanation"),
        "code": out.get("code"),
        "sourceFiles": files,
        "source": source_label,
    }
