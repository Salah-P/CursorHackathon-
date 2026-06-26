# Benchmark Questions (Ground Truth)

30 cross-dataset questions for the Decision Intelligence copilot. Every answer was computed by running pandas on the real CSVs and independently re-verified.

### Q01 — Which district has the highest gross rental yield, and what is that yield?
- **Category:** single-dataset  |  **Difficulty:** easy  |  **Answer type:** string
- **Datasets:** `districts.csv`
- **Ground truth:** Al Ghadeer has the highest gross rental yield at 9.00%.
- **Answer value:** `Al Ghadeer, 9.0%`
- **Citations:**
    - `districts.csv` — cols ['district', 'gross_yield_pct']; filter: Selected row(s) where gross_yield_pct equals the column maximum (9.0); alphabetical tie-break on district (only one row qualified).; evidence: Max gross_yield_pct = 9.0; sole district at this max is 'Al Ghadeer' with gross_yield_pct = 9.0.
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q02 — What is the average base sale price per square meter across all 20 districts?
- **Category:** single-dataset  |  **Difficulty:** easy  |  **Answer type:** number
- **Datasets:** `districts.csv`
- **Ground truth:** The average base sale price across all 20 districts is 11,650 AED per square meter.
- **Answer value:** `11650`
- **Citations:**
    - `districts.csv` — cols ['base_sale_aed_sqm']; filter: No filter; mean computed over all 20 district rows; evidence: 20 rows; mean(base_sale_aed_sqm) = 11650.0 AED/sqm; rounded = 11650
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q03 — Rank the top 5 districts by infrastructure score.
- **Category:** single-dataset  |  **Difficulty:** easy  |  **Answer type:** ranking
- **Datasets:** `districts.csv`
- **Ground truth:** Top 5 districts by infrastructure score (descending; tie-break: higher gross_yield_pct, then alphabetical): 1) Al Maryah Island (score 96, yield 6.0%), 2) Corniche (score 93, yield 6.5%), 3) Saadiyat Island (score 92, yield 6.0%), 4) Masdar City (score 90, yield 7.0%), 5) Al Bateen (score 90, yield 6.0%). Note the tie at score 90 between Masdar City and Al Bateen is broken by higher gross_yield_pct (7.0% > 6.0%), placing Masdar City ahead. Infrastructure scores are unitless index points; yields are in %.
- **Answer value:** `Al Maryah Island, Corniche, Saadiyat Island, Masdar City, Al Bateen`
- **Citations:**
    - `districts.csv` — cols ['district', 'infrastructure_score', 'gross_yield_pct']; filter: No filter; sorted all 20 rows by infrastructure_score desc, then gross_yield_pct desc, then district asc; took top 5; evidence: Al Maryah Island=96 (6.0%), Corniche=93 (6.5%), Saadiyat Island=92 (6.0%), Masdar City=90 (7.0%), Al Bateen=90 (6.0%). Masdar City beats Al Bateen on the score-90 tie via higher yield (7.0% vs 6.0%).
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q04 — How many residential property listings are for rent versus for buy?
- **Category:** single-dataset  |  **Difficulty:** easy  |  **Answer type:** number
- **Datasets:** `sample_listings.csv`
- **Ground truth:** Of the 6,000 listings, 3,558 are for rent and 2,442 are for buy. NOTE: the buy side is encoded as listing_type=='sale' in the data (there is no literal 'buy' value).
- **Answer value:** `rent=3558, buy=2442`
- **Citations:**
    - `sample_listings.csv` — cols ['listing_type']; filter: group by listing_type and count rows; listing_type=='rent' vs the buy side which is stored as 'sale'; evidence: value_counts: rent=3558, sale=2442; total rows=6000. listing_type=='buy' literally returns 0 because the buy value is encoded as 'sale'.
- **Verification:** corrected (code-computed (pandas) + independent re-verification) — Buy listings are stored under listing_type=='sale'; a literal 'buy' filter returns 0.

### Q05 — What is the median asking price per square meter for buy listings?
- **Category:** single-dataset  |  **Difficulty:** easy  |  **Answer type:** number
- **Datasets:** `sample_listings.csv`
- **Ground truth:** 11,579 AED per square meter
- **Answer value:** `11579`
- **Citations:**
    - `sample_listings.csv` — cols ['listing_type', 'price_per_sqm_aed']; filter: listing_type == 'sale' (the dataset's representation of buy/for-sale listings; literal 'buy' has 0 rows); evidence: 2,442 sale rows, all non-null price_per_sqm_aed; median = 11579.0 AED/sqm -> rounded 11579. listing_type value counts: rent=3558, sale=2442.
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q06 — Which property type has the most listings, and how many?
- **Category:** single-dataset  |  **Difficulty:** easy  |  **Answer type:** string
- **Datasets:** `sample_listings.csv`
- **Ground truth:** The property type with the most listings is "apartment" with 2,584 listings.
- **Answer value:** `apartment, 2584`
- **Citations:**
    - `sample_listings.csv` — cols ['property_type', 'listing_id']; filter: Group all 6,000 rows by property_type and count rows per group; pick max count, alphabetical tie-break; evidence: Counts: apartment=2584, studio=1298, townhouse=865, villa=836, penthouse=417. Max is apartment=2584.
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q07 — How many parcels are currently vacant, and what share of all parcels is that?
- **Category:** single-dataset  |  **Difficulty:** easy  |  **Answer type:** number
- **Datasets:** `sample_parcels.csv`
- **Ground truth:** 205 parcels are currently vacant, which is 34.2% of all 600 parcels.
- **Answer value:** `{"count": 205, "share_pct": 34.2}`
- **Citations:**
    - `sample_parcels.csv` — cols ['current_status']; filter: Count rows where current_status == 'vacant'; divide by total row count (600).; evidence: current_status value_counts: vacant=205, developed=203, under_development=150, reserved=42. Total rows=600. vacant count=205; 205/600*100=34.2%.
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q08 — What are the three most common amenity categories in the OpenStreetMap data, with counts?
- **Category:** single-dataset  |  **Difficulty:** easy  |  **Answer type:** ranking
- **Datasets:** `osm_amenities.csv`
- **Ground truth:** The three most common amenity categories are: 1) community with 985 amenities, 2) mobility with 618 amenities, 3) healthcare with 527 amenities (counts of amenity_id rows).
- **Answer value:** `community: 985; mobility: 618; healthcare: 527`
- **Citations:**
    - `osm_amenities.csv` — cols ['category', 'amenity_id']; filter: group by category, count amenity_id rows per category, sort by count descending with alphabetical category tie-break, take top 3; evidence: community=985, mobility=618, healthcare=527 (total rows=3155)
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q09 — How many investors fall into each risk profile bucket?
- **Category:** single-dataset  |  **Difficulty:** easy  |  **Answer type:** list
- **Datasets:** `sample_investors.csv`
- **Ground truth:** Investors by risk profile bucket (count of investor_id): conservative = 73, aggressive = 68, balanced = 59. Total = 200 investors.
- **Answer value:** `conservative: 73, aggressive: 68, balanced: 59`
- **Citations:**
    - `sample_investors.csv` — cols ['investor_id', 'risk_profile']; filter: Group all 200 rows by risk_profile and count investor_id per group; sort by count desc then risk_profile asc; evidence: conservative=73, aggressive=68, balanced=59 (sum=200)
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q10 — What is the average resident experience score across all communities, and which single community scores lowest?
- **Category:** single-dataset  |  **Difficulty:** medium  |  **Answer type:** string
- **Datasets:** `sample_communities.csv`
- **Ground truth:** The average resident experience score across all 90 communities is 85.26 (score points), and the lowest-scoring community is COM-076 at 57.
- **Answer value:** `{"avg": 85.26, "lowest_community_id": "COM-076", "lowest_score": 57}`
- **Citations:**
    - `sample_communities.csv` — cols ['community_id', 'resident_experience_score']; filter: No filter; mean computed over all 90 rows. Lowest selected via min(resident_experience_score) with alphabetical tie-break on community_id.; evidence: 90 rows; mean resident_experience_score = 85.26; min = 57 at community_id COM-076
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q11 — What was the total transaction value in 2025, and how does it compare to 2024 (percent change)?
- **Category:** single-dataset  |  **Difficulty:** medium  |  **Answer type:** number
- **Datasets:** `sample_transactions.csv`
- **Ground truth:** Total transaction value in 2025 was 24,318,592,000 AED versus 25,160,085,000 AED in 2024, a -3.3% change (decline).
- **Answer value:** `{"total_2024": 25160085000, "total_2025": 24318592000, "pct_change": -3.3}`
- **Citations:**
    - `sample_transactions.csv` — cols ['date', 'transaction_value_aed']; filter: Parsed year from date; filtered rows where year==2024 (1490 rows) and year==2025 (1475 rows); summed transaction_value_aed for each year; evidence: total_2024 = 25,160,085,000 AED (1490 transactions); total_2025 = 24,318,592,000 AED (1475 transactions); pct_change = (24318592000-25160085000)/25160085000*100 = -3.3%
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q12 — Which calendar month historically sees the highest transaction volume (count of deals) across all years?
- **Category:** single-dataset  |  **Difficulty:** medium  |  **Answer type:** string
- **Datasets:** `sample_transactions.csv`
- **Ground truth:** April (month 4) sees the highest transaction volume, with 551 transactions (count of deals) aggregated across all years 2023-2026.
- **Answer value:** `month=4 (April), count=551`
- **Citations:**
    - `sample_transactions.csv` — cols ['date', 'transaction_id']; filter: Extract calendar month (1-12) from the date column; group all rows by month and count transactions (rows) per month aggregated across all years 2023-2026; take max count, tie-break earliest month.; evidence: Per-month counts: Jan=487, Feb=505, Mar=497, Apr=551, May=507, Jun=307, Jul=329, Aug=311, Sep=340, Oct=420, Nov=364, Dec=382. Max is April (month 4) with 551 deals. Year range 2023-2026.
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q13 — For each district, what is the average price per square meter in transactions, and which 3 districts are most expensive?
- **Category:** single-dataset  |  **Difficulty:** medium  |  **Answer type:** ranking
- **Datasets:** `sample_transactions.csv`
- **Ground truth:** The 3 most expensive districts by average price per square meter: Al Maryah Island (23,310 AED/sqm), Saadiyat Island (20,101 AED/sqm), Al Bateen (16,827 AED/sqm).
- **Answer value:** `Al Maryah Island: 23310 AED/sqm; Saadiyat Island: 20101 AED/sqm; Al Bateen: 16827 AED/sqm`
- **Citations:**
    - `sample_transactions.csv` — cols ['district', 'price_per_sqm']; filter: Group by district; compute mean of price_per_sqm and transaction count per district; sort descending by mean, tie-break by higher count then alphabetical district; round mean to whole AED; take top 3; evidence: Al Maryah Island mean=23310.400000 (245 txns) -> 23310 AED; Saadiyat Island mean=20101.386831 (243 txns) -> 20101 AED; Al Bateen mean=16826.515982 (219 txns) -> 16827 AED. Next: Corniche 16058, Al Raha Beach 15298. Total rows=5000.
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q14 — Across our listings, which district has the highest average asking price per sqm, and how does that compare to its official base sale price per sqm in the districts table?
- **Category:** cross-dataset  |  **Difficulty:** medium  |  **Answer type:** string
- **Datasets:** `sample_listings.csv`, `districts.csv`
- **Ground truth:** Al Maryah Island has the highest average asking price per sqm among sale listings at 23,950 AED/sqm. Its official base sale price in the districts table is 22,000 AED/sqm, so the listing average sits at a premium of +8.9% above the official base.
- **Answer value:** `{"district": "Al Maryah Island", "listing_avg_price_per_sqm": 23950, "base_sale_aed_sqm": 22000, "premium_pct": 8.9}`
- **Citations:**
    - `sample_listings.csv` — cols ['listing_type', 'district', 'price_per_sqm_aed']; filter: Filter rows where listing_type=='sale' (the data's encoding of the buy market; spec's 'buy' value does not exist — only 'rent' and 'sale'), then group by district and take mean of price_per_sqm_aed, sort desc with alphabetical tie-break.; evidence: Top districts by mean price_per_sqm_aed: Al Maryah Island=23950.27, Saadiyat Island=19954.30, Al Bateen=16926.82, Corniche=15741.02, Al Raha Beach=15727.84. Winner Al Maryah Island rounds to 23950 AED/sqm.
    - `districts.csv` — cols ['district', 'base_sale_aed_sqm']; filter: Join on district = 'Al Maryah Island' to read base_sale_aed_sqm.; evidence: Al Maryah Island base_sale_aed_sqm = 22000 AED/sqm. Premium = (23950.27-22000)/22000*100 = 8.9%.
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q15 — Which districts show listing prices significantly above their official base sale price (top 5 by premium), suggesting an overheated market?
- **Category:** cross-dataset  |  **Difficulty:** medium  |  **Answer type:** ranking
- **Datasets:** `sample_listings.csv`, `districts.csv`
- **Ground truth:** Top 5 districts by listing-price premium over official base sale price (overheated markets): 1) Al Khalidiyah +10.62% (listing mean 14,933.63 vs base 13,500 AED/sqm), 2) Al Maryah Island +8.86% (23,950.27 vs 22,000), 3) Al Zahiyah +8.80% (11,968.37 vs 11,000), 4) Zayed City +8.73% (9,785.83 vs 9,000), 5) Al Raha Beach +8.47% (15,727.84 vs 14,500). Premiums in %, prices in AED/sqm. Note: the spec filter listing_type=='buy' matches zero rows; the dataset uses 'sale' as the buy-side listing type (2,442 rows), so 'sale' was used.
- **Answer value:** `Al Khalidiyah, Al Maryah Island, Al Zahiyah, Zayed City, Al Raha Beach`
- **Citations:**
    - `sample_listings.csv` — cols ['listing_type', 'district', 'price_per_sqm_aed']; filter: rows where listing_type=='sale' (buy equivalent; 'buy' has 0 rows, 2442 sale rows), then group by district and take mean of price_per_sqm_aed; evidence: Al Khalidiyah listing mean 14933.63, Al Maryah Island 23950.27, Al Zahiyah 11968.37, Zayed City 9785.83, Al Raha Beach 15727.84 AED/sqm
    - `districts.csv` — cols ['district', 'base_sale_aed_sqm']; filter: inner join on district to attach base_sale_aed_sqm; premium_pct=(listing_mean-base)/base*100; sort premium_pct desc, tie-break base desc then alphabetical; evidence: base_sale_aed_sqm: Al Khalidiyah 13500, Al Maryah Island 22000, Al Zahiyah 11000, Zayed City 9000, Al Raha Beach 14500; premiums 10.62%, 8.86%, 8.80%, 8.73%, 8.47%
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q16 — How many amenities per 10,000 residents does each district have, and which district is most under-served on this metric?
- **Category:** cross-dataset  |  **Difficulty:** hard  |  **Answer type:** string
- **Datasets:** `osm_amenities.csv`, `sample_communities.csv`
- **Ground truth:** The most under-served district is Al Raha Beach with 1.05 amenities per 10,000 residents (27 amenities over a population of 257,039). It edges out Al Ghadeer (1.05 = 1.0523, 26 amenities / pop 247,087) on the unrounded metric. Per-district amenities_per_10k (counts, rounded 2 dp), ascending: Al Raha Beach 1.05, Al Ghadeer 1.05, Masdar City 1.48, Yas Island 1.77, Al Bateen 2.06, Al Maryah Island 2.13, Saadiyat Island 2.17, Corniche 2.61, Al Reem Island 3.10, Khalifa City 4.02, Mohammed Bin Zayed City 4.59, Al Bahia 4.75, Mussafah 5.58, Al Khalidiyah 5.65, Danet Abu Dhabi 7.88, Al Maqta 12.16, Al Shamkha 14.00, Zayed City 20.58, Al Zahiyah 22.02, Al Reef 53.94.
- **Answer value:** `Al Raha Beach = 1.05 amenities per 10,000 residents`
- **Citations:**
    - `osm_amenities.csv` — cols ['district']; filter: Count rows grouped by district to get amenity_count; evidence: Al Raha Beach has 27 amenity rows; Al Ghadeer 26; Al Reef 130; Al Zahiyah 679 (max count)
    - `sample_communities.csv` — cols ['district', 'population_estimate']; filter: Sum population_estimate grouped by district; keep pop>0; evidence: Al Raha Beach pop=257039; Al Ghadeer pop=247087
    - `osm_amenities.csv + sample_communities.csv` — cols ['district', 'amenity_count', 'population_estimate']; filter: Join on district; amenities_per_10k = amenity_count/(pop/10000); min ascending; evidence: Al Raha Beach = 27/(257039/10000) = 1.0504 -> 1.05 (minimum); Al Ghadeer = 1.0523
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q17 — Which districts have high resident populations but the lowest health-amenity coverage per 10,000 people (bottom 3)?
- **Category:** cross-dataset  |  **Difficulty:** hard  |  **Answer type:** ranking
- **Datasets:** `osm_amenities.csv`, `sample_communities.csv`
- **Ground truth:** Among the top 10 districts by resident population, the 3 with the lowest healthcare-amenity coverage per 10,000 people are: 1) Saadiyat Island - 0.0637 per 10k (2 healthcare amenities, pop 313,795); 2) Al Bateen - 0.0792 per 10k (3 amenities, pop 378,835); 3) Al Reem Island - 0.1392 per 10k (4 amenities, pop 287,319). NOTE: the spec says category=='health', but the osm_amenities.csv category column has no value 'health' — the relevant value is 'healthcare' (527 rows). Using the literal 'health' filter yields 0 amenities for every district (a degenerate all-zero tie); the result above uses category=='healthcare', the clearly intended value.
- **Answer value:** `Saadiyat Island, Al Bateen, Al Reem Island`
- **Citations:**
    - `osm_amenities.csv` — cols ['category', 'district']; filter: Filter rows where category=='healthcare' (spec said 'health' which has 0 matches; actual value is 'healthcare', 527 rows), then count rows grouped by district; evidence: Bottom-3 healthcare counts among top-pop districts: Saadiyat Island=2, Al Bateen=3, Al Reem Island=4. Category value_counts: community 985, mobility 618, healthcare 527, retail 458, services 316, education 251 (no 'health').
    - `sample_communities.csv` — cols ['district', 'population_estimate']; filter: Sum population_estimate grouped by district; restrict to top 10 districts by total population (top half of 20); evidence: Top-pop districts include Saadiyat Island pop=313795, Al Bateen pop=378835, Al Reem Island pop=287319. Largest: Danet Abu Dhabi=562345, Corniche=509261, Al Khalidiyah=487073.
- **Verification:** corrected (code-computed (pandas) + independent re-verification) — Verifier mistakenly filtered category=='health' (0 rows). Correct category is 'healthcare'; orchestrator re-confirmed the compute result. Saadiyat Island 2 hc (0.0637/10k), Al Bateen 3 (0.0792), Al Reem Island 4 (0.1392).

### Q18 — For investors targeting Saadiyat Island, what is the total addressable capital (sum of capital range midpoints) and how many such investors are there?
- **Category:** cross-dataset  |  **Difficulty:** hard  |  **Answer type:** number
- **Datasets:** `sample_investors.csv`, `districts.csv`
- **Ground truth:** There are 8 investors with preferred_district == 'Saadiyat Island'. Their total addressable capital (sum of capital-range midpoints) is 4,923,000,000 AED (4.923 billion AED).
- **Answer value:** `{"count": 8, "total_midpoint_capital_aed": 4923000000}`
- **Citations:**
    - `districts.csv` — cols ['district']; filter: Verified 'Saadiyat Island' exists as a valid district value; evidence: 'Saadiyat Island' present (island, premium profile row)
    - `sample_investors.csv` — cols ['investor_id', 'preferred_district', 'capital_range_aed']; filter: preferred_district == 'Saadiyat Island'; midpoint of capital_range_aed bounds (M=1e6, B=1e9) summed and counted; evidence: 8 investors: INV-029 (600M-2.5B, mid 1.55B), INV-034 (600M-2.5B, 1.55B), INV-043 (8M-40M, 24M), INV-054 (100M-400M, 250M), INV-056 (400M-1.5B, 950M), INV-076 (30M-120M, 75M), INV-101 (200M-800M, 500M), INV-118 (8M-40M, 24M); sum = 4,923,000,000 AED
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q19 — Which preferred sector attracts the most investor capital (by summed midpoint capital), and what is that total?
- **Category:** single-dataset  |  **Difficulty:** medium  |  **Answer type:** string
- **Datasets:** `sample_investors.csv`
- **Ground truth:** The "residential" preferred sector attracts the most investor capital, totaling 28,111,500,000 AED across 51 investors.
- **Answer value:** `residential; 28111500000 AED`
- **Citations:**
    - `sample_investors.csv` — cols ['preferred_sector', 'capital_range_aed']; filter: Parsed capital_range_aed midpoint (M=1e6, B=1e9), grouped by preferred_sector, summed midpoints; sorted descending with tie-break more-investors then alphabetical; evidence: residential total=28,111,500,000 AED (51 investors), next mixed_use=20,345,000,000 (35), commercial=17,557,500,000 (35), hospitality=12,582,500,000 (28), industrial=9,610,500,000 (20), community=7,760,500,000 (12), logistics=6,048,000,000 (19)
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q20 — For each district, do investor preferences align with where the highest-yield opportunities are? Identify districts in the top 5 by gross yield that have fewer than the median number of interested investors.
- **Category:** cross-dataset  |  **Difficulty:** hard  |  **Answer type:** list
- **Datasets:** `districts.csv`, `sample_investors.csv`
- **Ground truth:** No, investor preferences do not fully align with the highest-yield districts. The top 5 districts by gross yield are Al Ghadeer (9.0%), Al Reef (8.5%), Al Shamkha (8.5%), Mussafah (8.5%), and Al Bahia (8.0%). The median number of interested investors across all 20 districts is 11. Three of these top-yield districts have fewer than 11 interested investors: Al Shamkha (6 investors), Al Bahia (7 investors), and Mussafah (8 investors).
- **Answer value:** `Al Shamkha: 6, Al Bahia: 7, Mussafah: 8 (median investor count = 11)`
- **Citations:**
    - `districts.csv` — cols ['district', 'gross_yield_pct']; filter: Sorted all 20 rows by gross_yield_pct descending with alphabetical tie-break on district; took top 5; evidence: Top5 = Al Ghadeer (9.0%), Al Reef (8.5%), Al Shamkha (8.5%), Mussafah (8.5%), Al Bahia (8.0%)
    - `sample_investors.csv` — cols ['preferred_district']; filter: For each of the 20 districts, counted rows where preferred_district==district; median of the 20 counts = 11.0; kept top-5 districts with count < 11; evidence: Al Shamkha=6, Al Bahia=7, Mussafah=8 (below median 11); Al Ghadeer=12 and Al Reef=12 excluded
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q21 — Which districts have the most vacant developable land (by total vacant parcel area) and how does that align with their development potential scores?
- **Category:** cross-dataset  |  **Difficulty:** hard  |  **Answer type:** ranking
- **Datasets:** `sample_parcels.csv`, `districts.csv`
- **Ground truth:** Filtering sample_parcels.csv to current_status=='vacant', grouping by district, the top 5 districts by total vacant parcel area (sqm) are: 1) Al Maqta — 296,229 sqm, mean development potential 72.1; 2) Danet Abu Dhabi — 259,319 sqm, mean dev potential 65.8; 3) Al Khalidiyah — 250,342 sqm, mean dev potential 68.5; 4) Zayed City — 231,275 sqm, mean dev potential 67.0; 5) Mohammed Bin Zayed City — 215,229 sqm, mean dev potential 78.1. All five are valid districts confirmed via join on districts.csv. Alignment: the district with the most vacant land (Al Maqta) has a high mean dev potential (72.1), and the 5th-ranked district (Mohammed Bin Zayed City) actually has the highest dev potential of the group (78.1), while Danet Abu Dhabi has the largest area-2 but the lowest dev potential (65.8) — so vacant land volume does not strictly track development potential.
- **Answer value:** `[{"rank":1,"district":"Al Maqta","vacant_area_sqm":296229,"mean_dev_potential":72.1},{"rank":2,"district":"Danet Abu Dhabi","vacant_area_sqm":259319,"mean_dev_potential":65.8},{"rank":3,"district":"Al Khalidiyah","vacant_area_sqm":250342,"mean_dev_potential":68.5},{"rank":4,"district":"Zayed City","vacant_area_sqm":231275,"mean_dev_potential":67.0},{"rank":5,"district":"Mohammed Bin Zayed City","vacant_area_sqm":215229,"mean_dev_potential":78.1}]`
- **Citations:**
    - `sample_parcels.csv` — cols ['district', 'parcel_size_sqm', 'current_status', 'development_potential_score']; filter: Filter rows where current_status=='vacant'; group by district; sum parcel_size_sqm and mean development_potential_score; evidence: Top 5 by vacant area: Al Maqta 296229 sqm (dev 72.1), Danet Abu Dhabi 259319 (65.8), Al Khalidiyah 250342 (68.5), Zayed City 231275 (67.0), Mohammed Bin Zayed City 215229 (78.1)
    - `districts.csv` — cols ['district']; filter: Membership check on district to confirm valid districts (join on district); evidence: All five top districts present in districts.csv (valid=True for all)
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q22 — What is the total estimated value of vacant parcels recommended for residential use, broken down by district (top 3)?
- **Category:** single-dataset  |  **Difficulty:** medium  |  **Answer type:** ranking
- **Datasets:** `sample_parcels.csv`
- **Ground truth:** Top 3 districts by total estimated value of vacant parcels recommended for residential use: 1) Al Raha Beach = 485,620,000 AED (4 parcels); 2) Danet Abu Dhabi = 349,000,000 AED (4 parcels); 3) Corniche = 269,930,000 AED (4 parcels). (53 parcels matched the filter overall.)
- **Answer value:** `Al Raha Beach: 485620000 AED; Danet Abu Dhabi: 349000000 AED; Corniche: 269930000 AED`
- **Citations:**
    - `sample_parcels.csv` — cols ['current_status', 'recommended_use', 'district', 'estimated_value_aed', 'parcel_id']; filter: current_status=='vacant' AND recommended_use contains 'residential' (case-insensitive); grouped by district, summed estimated_value_aed, sorted by sum desc with tie-break more parcels then alphabetical; evidence: 53 parcels matched. Top 3: Al Raha Beach 485,620,000 AED (4 parcels), Danet Abu Dhabi 349,000,000 AED (4 parcels), Corniche 269,930,000 AED (4 parcels). Next: Al Reem Island 262,430,000 (3).
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q23 — Where should a developer build housing now? Find districts with high vacant-land development potential AND high unmet service demand in their communities (top 3 combined).
- **Category:** cross-dataset  |  **Difficulty:** hard  |  **Answer type:** ranking
- **Datasets:** `sample_parcels.csv`, `sample_communities.csv`, `districts.csv`
- **Ground truth:** Top 3 districts by combined score (avg of min-max-normalized mean vacant-parcel development_potential_score and mean community service_demand_index, both scaled to [0,1] across the 20 qualifying districts): 1) Mohammed Bin Zayed City - combined 0.906 (dev_potential mean 78.13, service_demand mean 78.75); 2) Al Reef - combined 0.785 (dev 77.00, service_demand 72.00); 3) Al Shamkha - combined 0.705 (dev 71.22, service_demand 84.00). Scores are unitless indices; means are over score points (0-100 scale).
- **Answer value:** `Mohammed Bin Zayed City (0.906), Al Reef (0.785), Al Shamkha (0.705)`
- **Citations:**
    - `sample_parcels.csv` — cols ['district', 'current_status', 'development_potential_score']; filter: Filter rows current_status=='vacant', group by district, take mean of development_potential_score (excludes districts with no vacant parcels); evidence: Mohammed Bin Zayed City dev mean 78.133, Al Reef 77.0, Al Shamkha 71.222
    - `sample_communities.csv` — cols ['district', 'service_demand_index']; filter: Group all rows by district, take mean of service_demand_index; evidence: Mohammed Bin Zayed City svc mean 78.75, Al Reef 72.0, Al Shamkha 84.0
    - `districts.csv` — cols ['district']; filter: Used as whitelist; both A and B restricted to its district values, then intersected -> 20 qualifying districts; evidence: 20 districts qualify with both vacant-parcel and community means; combined scores: MBZ City 0.906, Al Reef 0.785, Al Shamkha 0.705
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q24 — Which districts are heating up fastest: rank districts by transaction price-per-sqm momentum from H1-2024 to H1-2025 (top 5).
- **Category:** single-dataset  |  **Difficulty:** hard  |  **Answer type:** ranking
- **Datasets:** `sample_transactions.csv`
- **Ground truth:** Top 5 districts by price-per-sqm momentum (H1-2024 to H1-2025): Al Raha Beach +34.3%, Al Reef +21.7%, Al Bahia +21.5%, Masdar City +16.6%, Mohammed Bin Zayed City +16.1% (momentum_pct in %, price_per_sqm in AED).
- **Answer value:** `Al Raha Beach: 34.3%; Al Reef: 21.7%; Al Bahia: 21.5%; Masdar City: 16.6%; Mohammed Bin Zayed City: 16.1%`
- **Citations:**
    - `sample_transactions.csv` — cols ['date', 'district', 'price_per_sqm']; filter: Window1 = date in 2024-01-01..2024-06-30, Window2 = date in 2025-01-01..2025-06-30; grouped by district; districts must appear in both windows; evidence: Al Raha Beach mean ppsqm 12512.58->16809.48 (+34.3%, w2 n=50); Al Reef 6792.43->8264.71 (+21.7%, n=38); Al Bahia 7525.68->9143.34 (+21.5%, n=38); Masdar City 12015.28->14008.03 (+16.6%, n=36); Mohammed Bin Zayed City 8692.71->10096.13 (+16.1%, n=38). Dataset 5000 rows total.
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q25 — For the single district with the strongest recent transaction price momentum, how many active buy listings and how many interested investors does it currently have?
- **Category:** cross-dataset  |  **Difficulty:** hard  |  **Answer type:** number
- **Datasets:** `sample_transactions.csv`, `sample_listings.csv`, `sample_investors.csv`
- **Ground truth:** The district with the strongest recent transaction price momentum is Al Raha Beach (H1-2024 mean price_per_sqm = 12,512.58 AED, H1-2025 = 16,809.48 AED, momentum = +34.34%). Following the spec's literal filters, it has 0 active buy listings (the sample_listings.csv data uses listing_type values of 'rent'/'sale' and status values of 'available'/'let'/'under_offer'/'sold' — there are no rows with listing_type=='buy' AND status=='active', so the count is 0) and 11 interested investors (rows in sample_investors.csv with preferred_district=='Al Raha Beach'). Note: if 'buy'/'active' is interpreted semantically as the data's 'sale'/'available', the active buy listings count would be 62 instead.
- **Answer value:** `{"district": "Al Raha Beach", "active_buy_listings": 0, "interested_investors": 11}`
- **Citations:**
    - `sample_transactions.csv` — cols ['date', 'district', 'price_per_sqm']; filter: Split into H1-2024 (2024-01-01..2024-06-30) and H1-2025 (2025-01-01..2025-06-30); mean price_per_sqm per district per window; momentum_pct=(H1_2025-H1_2024)/H1_2024*100; sort desc, tie-break h1_2024 asc; evidence: Top by momentum: Al Raha Beach H1_2024=12512.58, H1_2025=16809.48, momentum=+34.34%. Next: Al Reef +21.68%, Al Bahia +21.50%, Masdar City +16.59%.
    - `sample_listings.csv` — cols ['district', 'listing_type', 'status']; filter: district=='Al Raha Beach' AND listing_type=='buy' AND status=='active'; evidence: Literal-spec count = 0. Data listing_type values are ['rent','sale'] and status values ['available','let','under_offer','sold'] — no 'buy'/'active' rows. (Al Raha Beach has 265 total listings; 62 are sale+available.)
    - `sample_investors.csv` — cols ['preferred_district']; filter: preferred_district=='Al Raha Beach'; evidence: Count = 11 investors.
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q26 — Do districts with more transport (mobility) amenities command higher transaction prices? Report the Pearson correlation across districts. (Transport amenities are stored under osm category=='mobility'.)
- **Category:** cross-dataset  |  **Difficulty:** hard  |  **Answer type:** number
- **Datasets:** `osm_amenities.csv`, `sample_transactions.csv`
- **Ground truth:** Weak positive correlation: Pearson r = 0.15 between a district's mobility-amenity count and its mean transaction price per sqm, across all 20 districts. More transport amenities are only weakly associated with higher prices.
- **Answer value:** `r = 0.15`
- **Citations:**
    - `osm_amenities.csv` — cols ['category', 'district']; filter: count rows where category=='mobility', grouped by district; evidence: e.g. Al Zahiyah=138, Danet Abu Dhabi=119, Al Khalidiyah=63 mobility amenities
    - `sample_transactions.csv` — cols ['district', 'price_per_sqm']; filter: mean price_per_sqm grouped by district; evidence: 20 districts; mean price/sqm e.g. Al Maryah Island=23310, Al Khalidiyah=14514
    - `districts.csv` — cols ['district']; filter: join spine (20 districts); evidence: Pearson r(mobility_count, mean_price_per_sqm) = 0.1531
- **Verification:** corrected (code-computed (pandas) + independent re-verification) — Original spec used category=='transport', which does not exist in osm_amenities.csv (zero rows -> undefined corr). Transport amenities live under category=='mobility' (bus_stop/bus_station/ferry_terminal). Recomputed with 'mobility': Pearson r = 0.1531 over 20 districts.

### Q27 — Is infrastructure score a good predictor of rental yield across districts? Give the correlation.
- **Category:** single-dataset  |  **Difficulty:** medium  |  **Answer type:** number
- **Datasets:** `districts.csv`
- **Ground truth:** Pearson r between infrastructure_score and gross_yield_pct across all 20 districts is -0.929 (unitless correlation coefficient). Infrastructure score is a strong predictor of rental yield, but the relationship is strongly NEGATIVE: districts with higher infrastructure scores tend to have lower gross rental yields (%), and lower-infrastructure districts have higher yields. So infrastructure score is a good (strong) predictor, just inversely related to yield.
- **Answer value:** `-0.929`
- **Citations:**
    - `districts.csv` — cols ['infrastructure_score', 'gross_yield_pct']; filter: No filter; all 20 district rows used. Pearson correlation computed between the two columns.; evidence: 20 rows. r = -0.929. Range of infrastructure_score 60-96, gross_yield_pct 6.0-9.0. High-infra districts (e.g. Al Maryah Island infra=96, yield=6.0%; Saadiyat Island infra=92, yield=6.0%) have low yields; low-infra districts (e.g. Al Ghadeer infra=60, yield=9.0%; Al Shamkha infra=63, yield=8.5%) have high yields, giving a strong negative correlation.
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q28 — Which districts offer the best value for investors: high gross yield, strong infrastructure, and listing prices not yet bid above base value (top 3 composite)?
- **Category:** cross-dataset  |  **Difficulty:** hard  |  **Answer type:** ranking
- **Datasets:** `districts.csv`, `sample_listings.csv`
- **Ground truth:** The top 3 districts by composite value-for-investor score (rounded to 3 decimals) are: 1) Corniche with composite 0.694 (gross_yield_pct 6.5%, infrastructure_score 93, listing_premium_pct 4.94%); 2) Yas Island with composite 0.683 (gross_yield_pct 7.0%, infrastructure_score 88, listing_premium_pct 5.30%); 3) Saadiyat Island with composite 0.625 (gross_yield_pct 6.0%, infrastructure_score 92, listing_premium_pct 5.02%). Computed over 20 qualifying districts that have buy (sale) listings. Listing premium is in %, yield in %, infrastructure_score is a unitless index.
- **Answer value:** `1. Corniche (0.694), 2. Yas Island (0.683), 3. Saadiyat Island (0.625)`
- **Citations:**
    - `sample_listings.csv` — cols ['listing_type', 'district', 'price_per_sqm_aed']; filter: Filter listing_type=='sale' (the buy/purchase listing type; data has only 'rent' and 'sale'), then group by district and take mean of price_per_sqm_aed; evidence: 2442 sale listings; mean price_per_sqm used per district yielding listing_premium_pct e.g. Corniche 4.94%, Yas Island 5.30%, Saadiyat Island 5.02%
    - `districts.csv` — cols ['district', 'base_sale_aed_sqm', 'gross_yield_pct', 'infrastructure_score']; filter: Inner join to per-district mean sale price on `district`; 20 districts qualify (have buy listings); evidence: Corniche: yield 6.5%, infra 93, base_sale used in premium calc -> composite 0.694; Yas Island: yield 7.0%, infra 88 -> 0.683; Saadiyat Island: yield 6.0%, infra 92 -> 0.625
- **Verification:** verified (code-computed (pandas) + independent re-verification)

### Q29 — Match supply to demand: for each district compare the count of available buy listings against the number of interested investors, and list the 5 districts with the largest investor-to-listing imbalance (most investors per available listing).
- **Category:** cross-dataset  |  **Difficulty:** hard  |  **Answer type:** ranking
- **Datasets:** `sample_listings.csv`, `sample_investors.csv`
- **Ground truth:** Top 5 districts by investor-to-listing ratio (most investors per available buy/sale listing): 1) Masdar City (15 investors / 110 listings = 0.136); 2) Al Khalidiyah (15/115 = 0.130); 3) Al Reem Island (12/110 = 0.109); 4) Al Ghadeer (12/112 = 0.107); 5) Al Raha Beach (11/103 = 0.107). Ranked by the unrounded ratio.
- **Answer value:** `Masdar City, Al Khalidiyah, Al Reem Island, Al Ghadeer, Al Raha Beach`
- **Citations:**
    - `sample_listings.csv` — cols ['listing_type', 'district']; filter: Filter rows where listing_type=='sale' (the column has only 'rent'/'sale'; spec's 'buy' has 0 rows so mapped to 'sale'), then group by district and count = listings_count.; evidence: listing_type unique = ['rent','sale']; (listing_type=='buy').sum()==0. Sale listings_count per top district: Masdar City=110, Al Khalidiyah=115, Al Ghadeer=112, Al Reem Island=110, Al Raha Beach=103.
    - `sample_investors.csv` — cols ['preferred_district']; filter: Group by preferred_district and count = investors_count; joined to listings on district==preferred_district.; evidence: investors_count: Masdar City=15, Al Khalidiyah=15, Al Ghadeer=12, Al Reem Island=12, Al Raha Beach=11. Ratios: 0.14, 0.13, 0.11, 0.11, 0.11.
- **Verification:** corrected (code-computed (pandas) + independent re-verification) — Ranks 3 and 4 ordered by the TRUE (unrounded) ratio: Al Reem Island 12/110=0.10909 > Al Ghadeer 12/112=0.10714.

### Q30 — Build a full opportunity snapshot for the top-yield district: its gross yield, total community population, amenities per 10,000 residents, vacant parcel count, active buy listings, and number of interested investors.
- **Category:** cross-dataset  |  **Difficulty:** hard  |  **Answer type:** list
- **Datasets:** `districts.csv`, `sample_communities.csv`, `osm_amenities.csv`, `sample_parcels.csv`, `sample_listings.csv`, `sample_investors.csv`
- **Ground truth:** Top-yield district D = Al Ghadeer (gross_yield_pct = 9.0%, the single highest in districts.csv; next-highest is 8.5%). Opportunity snapshot for Al Ghadeer: gross yield = 9.0%; total community population = 247,087 residents; amenity count = 26, giving amenities per 10,000 residents = 1.05; vacant parcels = 10; active buy listings = 0 (no row matches listing_type=='buy' AND status=='active' — the listings dataset uses listing_type values 'sale'/'rent' and status values 'available'/'under_offer'/'sold'/'let', so the literal spec filter returns 0); interested investors (preferred_district==Al Ghadeer) = 12.
- **Answer value:** `district=Al Ghadeer; gross_yield_pct=9.0%; population=247087; amenity_count=26; amenities_per_10k=1.05; vacant_parcels=10; active_buy_listings=0; interested_investors=12`
- **Citations:**
    - `districts.csv` — cols ['district', 'gross_yield_pct']; filter: max gross_yield_pct with alphabetical tie-break; evidence: Al Ghadeer = 9.0 (uniquely highest; next are Al Reef/Mussafah/Al Shamkha at 8.5)
    - `sample_communities.csv` — cols ['district', 'population_estimate']; filter: sum population_estimate where district=='Al Ghadeer'; evidence: 247087
    - `osm_amenities.csv` — cols ['district']; filter: count rows where district=='Al Ghadeer'; evidence: 26 amenities; 26/(247087/10000)=1.05 per 10k
    - `sample_parcels.csv` — cols ['district', 'current_status']; filter: count where district=='Al Ghadeer' AND current_status=='vacant'; evidence: 10
    - `sample_listings.csv` — cols ['district', 'listing_type', 'status']; filter: count where district=='Al Ghadeer' AND listing_type=='buy' AND status=='active'; evidence: 0 (listing_type values are 'sale'/'rent'; status values are 'available'/'under_offer'/'sold'/'let' — no literal 'buy'/'active')
    - `sample_investors.csv` — cols ['preferred_district']; filter: count where preferred_district=='Al Ghadeer'; evidence: 12
- **Verification:** verified (code-computed (pandas) + independent re-verification)
