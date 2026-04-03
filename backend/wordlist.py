import urllib.request
import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

SOWPODS_URL = (
    "https://raw.githubusercontent.com/jesstess/Scrabble"
    "/refs/heads/master/scrabble/sowpods.txt"
)

COMMON_URL = (
    "https://raw.githubusercontent.com/skedwards88/word_lists"
    "/main/compiled/commonWords.json"
)


def fetch(url):
    print(f"  Fetching {url.split('/')[-1]} ...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode("utf-8")


def clean_txt(raw):
    words = set()
    for line in raw.splitlines():
        w = line.strip().lower()
        if w and w.isalpha() and 2 <= len(w) <= 15:
            words.add(w)
    return words


def clean_json(raw):
    words = set()
    for w in json.loads(raw):
        w = w.strip().lower()
        if w and w.isalpha() and 2 <= len(w) <= 15:
            words.add(w)
    return words


# ── SOWPODS ───────────────────────────────────────────────────────────────────
print("Downloading SOWPODS...")
sowpods_words = clean_txt(fetch(SOWPODS_URL))
out = os.path.join(DATA_DIR, "sowpods.txt")
with open(out, "w", encoding="utf-8") as f:
    f.write("\n".join(sorted(sowpods_words, key=lambda w: (len(w), w))))
print(f"  Saved {len(sowpods_words):,} words → {out}\n")

# ── Common words ──────────────────────────────────────────────────────────────
print("Downloading common words...")
common_words = clean_json(fetch(COMMON_URL))
print(f"  Fetched {len(common_words):,} words")
out = os.path.join(DATA_DIR, "common.txt")
with open(out, "w", encoding="utf-8") as f:
    f.write("\n".join(sorted(common_words, key=lambda w: (len(w), w))))
print(f"  Saved {len(common_words):,} words → {out}")

print("\nDone! Run: node server.js")