# Decision Intelligence Copilot — Cross-Dataset Benchmark

A 30-question evaluation benchmark for a **Decision Intelligence copilot** that answers
plain-language questions across the seven Abu Dhabi PropTech datasets **with sources**.

Every ground-truth value here was **computed by executing pandas code against the real CSVs**
and then **independently re-verified by a second pass** — not hand-written. That is what makes
it safe to grade a model against.

---

## What this is for

The copilot's whole value is joining datasets and answering in plain language while citing where
each number came from. This benchmark tests exactly that:

- **Correctness** — does the copilot return the right value?
- **Grounding** — does it cite the right dataset(s), columns, and filter?
- **Cross-dataset reasoning** — most questions require joining 2–4 files on `district`.

## The 7 source datasets

The spine is `districts.csv`; everything else joins to it on the `district` column.

| Dataset | Rows | What it holds |
|---|---|---|
| `districts.csv` | 20 | Reference/spine: base price/sqm, gross yield, infrastructure score, centroid lat/long |
| `osm_amenities.csv` | 3,155 | **Real OpenStreetMap** POIs — categories: `community`, `mobility`, `healthcare`, `retail`, `services`, `education` |
| `sample_communities.csv` | 90 | Population, occupancy, service-demand / mobility / experience indices |
| `sample_investors.csv` | 200 | Investor mandates: sector, district, capital band, risk profile, horizon |
| `sample_listings.csv` | 6,000 | Rent/sale listings: price, size, type, amenities, coordinates |
| `sample_parcels.csv` | 600 | Land parcels: zoning, status (incl. `vacant`), dev-potential, estimated value |
| `sample_transactions.csv` | 5,000 | 2023–2026 transaction time series (value, size, price/sqm, buyer type) |

## Coverage

All seven datasets are exercised (counts sum to >30 because cross-dataset questions touch several):

| Dataset | Questions |
|---|---|
| `districts.csv` | 12 |
| `sample_listings.csv` | 9 |
| `sample_investors.csv` | 7 |
| `sample_transactions.csv` | 6 |
| `osm_amenities.csv` | 5 |
| `sample_communities.csv` | 5 |
| `sample_parcels.csv` | 5 |

Mix: **12 single-dataset**, **18 cross-dataset** · difficulty spread across easy / medium / hard.

## Files

- **`questions.jsonl`** — one JSON object per line (the machine-readable benchmark).
- **`questions.md`** — the same content, human-readable.
- **`README.md`** — this file.

### `questions.jsonl` schema

```json
{
  "id": "Q01",
  "question": "Which district has the highest gross rental yield, and what is that yield?",
  "category": "single-dataset | cross-dataset",
  "datasets": ["districts.csv"],
  "difficulty": "easy | medium | hard",
  "answer_type": "number | string | list | ranking | boolean",
  "ground_truth": "Al Ghadeer has the highest gross rental yield at 9.00%.",
  "answer_value": "Al Ghadeer, 9.0%",
  "citations": [
    {"file": "districts.csv", "columns": ["district","gross_yield_pct"],
     "filter": "row(s) where gross_yield_pct == column max",
     "evidence": "max gross_yield_pct = 9.0; sole district = Al Ghadeer"}
  ],
  "verification": {"method": "code-computed (pandas) + independent re-verification",
                   "status": "verified | corrected", "note": ""}
}
```

`answer_value` is the precise, machine-checkable form; `ground_truth` is the full sentence a
copilot should produce. `citations` is the source trail: **file → columns → filter → evidence**.

## How to grade a copilot with it

For each question, prompt the copilot and compare:

1. **Value** —
   - `number`: exact match, or within a small numeric tolerance (e.g. ±0.5% for rounded means/prices).
   - `string`: case-insensitive exact match of the named entity.
   - `list` / `ranking`: set-match on the named items; for rankings also check order.
   - `boolean`: exact.
2. **Sources** — the copilot should cite at least the datasets listed in `datasets` (a stronger
   check: the specific columns in `citations`). A correct value with no/incorrect sources is a
   partial pass at best — grounding is the point.

Suggested score: `0.7 * value_correct + 0.3 * sources_correct`, averaged over 30 questions.

## Methodology & integrity

1. **Designed** — 30 deterministic questions (no opinion questions) spanning all 7 datasets.
2. **Computed** — each ground truth produced by running pandas on the real CSVs.
3. **Re-verified** — an independent pass recomputed every answer with fresh code.
4. **Reconciled** — 4 questions were hand-corrected after the verification pass surfaced
   discrepancies (real OSM category labels, a `sale`-vs-`buy` encoding, and an unrounded-ratio
   tie-break). These carry `verification.status = "corrected"` with a `note` explaining the fix.
   The other 26 are `"verified"`.

> Data note: the OSM "transport" concept is stored under `category == 'mobility'`, and listing
> "buy" is stored as `listing_type == 'sale'`. The benchmark uses the real labels and flags this.

Source data: `abu-dhabi-ai-proptech-challenge/starter-kit` · `data/`.
