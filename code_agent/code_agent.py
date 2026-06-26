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
_HERE = os.path.dirname(os.path.abspath(__file__))
# data lives one level above this folder (../data); override with $DATA_DIR
DATA_DIR = os.environ.get("DATA_DIR", os.path.join(_HERE, "..", "data"))
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

DATA_GUIDE = """The 7 datasets describe the Abu Dhabi real-estate market. They all join on
the `district` column (districts is the spine — one row per district):

- districts: reference table, one row per district. base_sale_aed_sqm = baseline
  apartment sale price/sqm; gross_yield_pct = annual rental yield %;
  infrastructure_score 0-100; area_type in {island, waterfront, central, mainland,
  border, coastal}; profile in {premium, high, mid_high, mid, mid_affordable,
  affordable, established, emerging, leisure, innovation, industrial};
  latitude/longitude = district centroid; established_year.
- amenities: REAL OpenStreetMap points of interest. category in {community,
  mobility, healthcare, retail, services, education}; subtype = finer type
  (park, school, clinic, bus_stop...); has lat/long + district. NOTE: "transport"
  amenities live under category 'mobility'; clinics/hospitals/pharmacies are 'healthcare'.
- communities: community-level quality-of-life records (several communities per
  district). population_estimate; occupancy_rate 0-1; service_demand_index,
  mobility_score, resident_experience_score all 0-100; optimization_opportunity =
  suggested fix label (e.g. add_clinic_capacity, expand_retail_offering).
- investors: investor mandates (the demand side). investor_type in {private_equity,
  hnwi, developer, family_office, reit, sovereign_fund, institutional};
  preferred_sector; preferred_district; capital_range_aed = band like "15M-60M" or
  "400M-1.5B" (M=millions, B=billions); risk_profile; investment_horizon
  (short/medium/long); strategic_fit_score 0-100.
- listings: residential rent/sale portal listings. listing_type in {rent, sale}
  (NOTE: a "buy"/"for-sale" listing is listing_type=='sale'); property_type
  (studio/apartment/villa/townhouse...); size_sqm; price_aed (total);
  price_per_sqm_aed; furnished (bool); amenities = ';'-separated tags; lat/long;
  listed_date; status; agency_type.
- parcels: land parcels (the supply side). land_use in {residential, mixed_use,
  commercial, community, hospitality, industrial}; current_status in
  {under_development, vacant, developed, reserved}; parcel_size_sqm;
  infrastructure_score & development_potential_score 0-100; estimated_value_aed;
  recommended_use = model-suggested best use.
- transactions: closed deals, a 2023-01 to 2026-05 time series with seasonality.
  date; asset_type; transaction_value_aed (total); size_sqm; price_per_sqm;
  buyer_type. Good for trends/momentum per district."""

SYSTEM = """You are a data analyst for Abu Dhabi proptech datasets.

{guide}

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


def _load_env(path=None):
    """Load KEY=VALUE lines from .env (defaults to ../.env) without a dependency."""
    if path is None:
        path = os.path.join(_HERE, "..", ".env")
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
        timeout=60, max_retries=2,
    )


def code_agent(instruction: str) -> dict:
    """NL instruction -> {answer, explanation, code}."""
    frames = _frames()
    resp = _client().chat.completions.create(
        model=MODEL,
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM.format(guide=DATA_GUIDE, schemas=_schemas(frames))},
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
