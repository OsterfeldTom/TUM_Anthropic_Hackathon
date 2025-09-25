import os
import re
import json
import logging
import warnings
from datetime import datetime
from typing import List, Dict, Any

from urllib3.util import Retry
from urllib3.exceptions import NotOpenSSLWarning, InsecureRequestWarning
from requests import Session
from requests.adapters import HTTPAdapter
# =========================
# CONFIG — set everything here
# =========================

CONFIG = {
    # Auth & API
    "TOKEN": os.getenv("LOGICMILL_TOKEN", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJBUEkiLCJleHAiOjI2Mjk2NDA3MDQsImlhdCI6MTc1ODcyODcwNCwiaXNzIjoiTE9HSUMtTUlMTCIsImp0aSI6IjAxZjNkZmMzLTRkMzgtNDg4ZS04MGRmLTZiMTdhYjE3NjEzZSIsIm5iZiI6MTc1ODcyODcwNCwicGF5bG9hZCI6eyJ0b2tlbk5hbWUiOiJEZWZhdWx0IEFQSSBUb2tlbiJ9LCJzdWIiOiJhNjAxMDk4Mi00ZDJjLTRlOWMtYjlkMi0yMmRiOTQ1YTZmNDUifQ.tT5RvHuLuxs-EB5s93W-6ZScIzRFUbYD0izKQqHSlus"),
    "URL": "https://api.logic-mill.net/api/v1/graphql/",
    "MODEL": "patspecter",

    # Indices (publications index name can vary; a fallback is tried automatically)
    "PATENT_INDEX": "patents",
    "PUB_INDEX_PRIMARY": "publications",
    "PUB_INDEX_FALLBACK": "papers",

    # Retrieval & filtering
    "AMOUNT": 500,          # requested candidates per index (auto-reduced if backend rejects)
    "THRESHOLD": 0.99,       # initial similarity cutoff for "relevant"
    "SAMPLE_SHOW": 1,       # set >0 to print sample items (kept 0 to print only counts)
    "SAVE_JSON": False,     # save full arrays to JSON files
    "PRINT_ONLY_COUNTS": False,  # if True, print exactly two lines (relevant counts)

    # Input data parts for the query
    "DATA_PARTS": [
        {"key": "title", "value": "Exploring the potentials and challenges of deep generative models in product design conception"},
        {"key": "abstract", "value": "The synthesis of product design concepts stands at the crux of early-phase development processes for technical products, traditionally posing an intricate interdisciplinary challenge. The application of deep learning methods, particularly Deep Generative Models (DGMs), holds the promise of automating and streamlining manual iterations and therefore introducing heightened levels of innovation and efficiency. However, DGMs have yet to be widely adopted into the synthesis of product design concepts. This paper aims to explore the reasons behind this limited application and derive the requirements for successful integration of these technologies. We systematically analyze DGM-families (VAE, GAN, Diffusion, Transformer, Radiance Field), assessing their strengths, weaknesses, and general applicability for product design conception. Our objective is to provide insights that simplify the decision-making process for engineers, helping them determine which method might be most effective for their specific challenges. Recognizing the rapid evolution of this field, we hope that our analysis contributes to a fundamental understanding and guides practitioners towards the most promising approaches. This work seeks not only to illuminate current challenges but also to propose potential solutions, thereby offering a clear roadmap for leveraging DGMs in the realm of product design conception."},
    ],
}
# =========================

# Bind config (read-only locals)
TOKEN = CONFIG["TOKEN"]
URL = CONFIG["URL"]
MODEL = CONFIG["MODEL"]
PATENT_INDEX = CONFIG["PATENT_INDEX"]
PUB_INDEX_PRIMARY = CONFIG["PUB_INDEX_PRIMARY"]
PUB_INDEX_FALLBACK = CONFIG["PUB_INDEX_FALLBACK"]
AMOUNT = CONFIG["AMOUNT"]
THRESHOLD = CONFIG["THRESHOLD"]
SAMPLE_SHOW = CONFIG["SAMPLE_SHOW"]
SAVE_JSON = CONFIG["SAVE_JSON"]
PRINT_ONLY_COUNTS = CONFIG["PRINT_ONLY_COUNTS"]
DATA_PARTS = CONFIG["DATA_PARTS"]

# Quiet library logs & common warnings so output is minimal
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("requests").setLevel(logging.WARNING)
warnings.filterwarnings("ignore", category=NotOpenSSLWarning)
warnings.filterwarnings("ignore", category=InsecureRequestWarning)

# -------------------------
# HTTP session with retries
# -------------------------
s = Session()
retries = Retry(total=5, backoff_factor=0.2,
                status_forcelist=[500, 501, 502, 503, 504, 524])
s.mount("https://", HTTPAdapter(max_retries=retries))

headers = {
    "content-type": "application/json",
    "Authorization": f"Bearer {TOKEN}",
}

# -------------------------
# GraphQL query (important fields only; avoid cast-prone family dates)
# -------------------------
query = """
query embedDocumentAndSimilaritySearch(
  $data: [EncodeDocumentPart],
  $indices: [String],
  $amount: Int,
  $model: String!
) {
  encodeDocumentAndSimilaritySearch(
    data: $data
    indices: $indices
    amount: $amount
    model: $model
  ) {
    id
    score
    index
    document {
      id
      title
      url

      # dates (papers usually have this; patents often don't)
      publicationDate

      # patent/publication identifiers
      publNo
      applnID
      applnAuth
      doi
      pubmed
      mag

      # flags
      isParatext
      isRetracted

      # misc
      type
      index
    }
  }
}
"""

# -------------------------
# Helpers
# -------------------------
DATE_FMT = "%Y-%m-%d"

def _infer_year_from_publno(publno: str) -> str:
    # e.g., GB202510518D0, CN119934750A, KR102656056B1 -> 2025
    m = re.search(r"(19|20|21)\d{2}", publno)
    return m.group(0) if m else ""

def parse_best_date(doc: Dict[str, Any]) -> str:
    """
    Return best-available ISO date string:
    publicationDate -> inferred year from publNo -> "".
    """
    if doc.get("publicationDate"):
        return doc["publicationDate"]

    publ_no = doc.get("publNo")
    if publ_no and isinstance(publ_no, list) and publ_no:
        year = _infer_year_from_publno(publ_no[0])
        if year:
            return f"{year}-01-01"

    return ""

def to_year(date_str: str) -> int:
    if not date_str:
        return 0
    try:
        return datetime.strptime(date_str, DATE_FMT).year
    except ValueError:
        if re.fullmatch(r"\d{4}", date_str):
            return int(date_str)
        return 0

def clean_and_sort(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    - drop paratext/retracted
    - compute bestDate/bestYear
    - sort by similarity score desc
    """
    cleaned = []
    for r in results:
        doc = r.get("document", {}) or {}
        if doc.get("isParatext") or doc.get("isRetracted"):
            continue

        best_date = parse_best_date(doc)
        cleaned.append({
            "id": r.get("id"),
            "index": r.get("index"),
            "score": r.get("score", 0.0),
            "title": doc.get("title", ""),
            "url": doc.get("url", ""),
            "publicationDate": doc.get("publicationDate"),
            "publNo": doc.get("publNo"),
            "doi": doc.get("doi"),
            "pubmed": doc.get("pubmed"),
            "mag": doc.get("mag"),
            "type": doc.get("type"),
            "isParatext": doc.get("isParatext"),
            "isRetracted": doc.get("isRetracted"),
            "bestDate": best_date,
            "bestYear": to_year(best_date),
        })

    cleaned.sort(key=lambda x: x["score"], reverse=True)
    return cleaned

def query_index(index_name: str, data_parts: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    """
    Calls the API with desired AMOUNT.
    If backend complains '[num_candidates] cannot be less than [k]', automatically
    halves AMOUNT until it succeeds.
    """
    SAFE_MIN = 1
    requested = AMOUNT
    amt = requested

    while amt >= SAFE_MIN:
        payload = {
            "query": query,
            "variables": {
                "model": MODEL,
                "data": data_parts,
                "amount": amt,
                "indices": [index_name],
            },
        }
        resp = s.post(URL, headers=headers, json=payload)
        resp.raise_for_status()
        body = resp.json()

        data = (body.get("data") or {}).get("encodeDocumentAndSimilaritySearch")
        errs = body.get("errors", [])

        if data is not None:
            # If there are non-fatal field errors, ignore them; use what we got
            return data or []

        # If we got here, there was likely a fatal error; check for the specific ANN msg
        err_msgs = " ".join(e.get("message", "") for e in errs)
        if "[num_candidates] cannot be less than [k]" in err_msgs:
            new_amt = max(SAFE_MIN, amt // 2)
            if new_amt == amt:
                break
            print(f"[note] amount={amt} exceeds backend num_candidates; retrying with amount={new_amt}")
            amt = new_amt
            continue

        # Unknown fatal error; raise to surface the issue
        raise RuntimeError(errs or "Unknown GraphQL error")

    return []

def filter_by_threshold(items: List[Dict[str, Any]], threshold: float) -> List[Dict[str, Any]]:
    return [it for it in items if it.get("score", 0.0) >= threshold]

def show_samples(label: str, items: List[Dict[str, Any]], n: int):
    print(f"Top {label}:")
    for it in items[:n]:
        print(f"- {it['title']} ({it['bestDate'] or 'Unknown'}) "
              f"score={it['score']:.3f}  url={it['url']}")
    print()

# Re-filtering helper you can call any time without new API calls
def recompute_for_threshold(threshold: float,
                            patents: List[Dict[str, Any]],
                            publications: List[Dict[str, Any]],
                            top_n: int = 0):
    pats = filter_by_threshold(patents, threshold)
    pubs = filter_by_threshold(publications, threshold)

    if PRINT_ONLY_COUNTS:
        print(len(pats))
        print(len(pubs))
    else:
        print(f"Patents_relevant(@{threshold}): {len(pats)}")
        print(f"Publications_relevant(@{threshold}): {len(pubs)}")
        if top_n > 0:
            show_samples("patents", pats, top_n)
            show_samples("publications", pubs, top_n)

# -------------------------
# Main
# -------------------------
if __name__ == "__main__":
    # 1) Patents
    raw_patents = query_index(PATENT_INDEX, DATA_PARTS)
    patents_sorted = clean_and_sort(raw_patents)

    # 2) Publications (try primary, then fallback)
    raw_pubs = query_index(PUB_INDEX_PRIMARY, DATA_PARTS)
    if not raw_pubs:
        raw_pubs = query_index(PUB_INDEX_FALLBACK, DATA_PARTS)
    publications_sorted = clean_and_sort(raw_pubs)

    # Initial counts at THRESHOLD
    patents_relevant = filter_by_threshold(patents_sorted, THRESHOLD)
    publications_relevant = filter_by_threshold(publications_sorted, THRESHOLD)

    if PRINT_ONLY_COUNTS:
        # Exactly two lines, just the counts ≥ THRESHOLD
        print(len(patents_relevant))
        print(len(publications_relevant))
    else:
        # Verbose summary
        print(f"\nThreshold: {THRESHOLD}")
        print(f"Patents: {len(patents_sorted)} total, {len(patents_relevant)} >= threshold")
        print(f"Publications: {len(publications_sorted)} total, {len(publications_relevant)} >= threshold\n")
        if SAMPLE_SHOW > 0:
            show_samples("patents", patents_sorted, SAMPLE_SHOW)
            show_samples("publications", publications_sorted, SAMPLE_SHOW)

    # Optional: save arrays for later re-filtering without API calls
    if SAVE_JSON:
        with open("patents_sorted.json", "w") as f:
            json.dump(patents_sorted, f, indent=2)
        with open("publications_sorted.json", "w") as f:
            json.dump(publications_sorted, f, indent=2)

    # Example: re-filter locally at a different threshold (no network)
    # recompute_for_threshold(0.5, patents_sorted, publications_sorted)   # prints counts (or verbose if configured)
