"""
rebuild_bm25_index.py
=====================
Regenerates data/index/bm25.pkl into a dependency-minimal, pure-Python format.
Zero external framework dependencies (no langchain, no pydantic objects).
Only built-in Python types: list, dict, str, int, float, bool.
"""
import os
import pickle
from pathlib import Path

def rebuild_bm25_index(input_path: str = None, output_path: str = None):
    root_dir = Path(__file__).resolve().parent.parent.parent.parent
    if not input_path:
        input_path = str((root_dir / "data" / "index" / "bm25.pkl").resolve())
    if not output_path:
        output_path = input_path

    print(f"[BM25 Builder] Loading source index from: {input_path}")
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Source index not found at {input_path}")

    with open(input_path, "rb") as f:
        raw_docs = pickle.load(f)

    print(f"[BM25 Builder] Found {len(raw_docs)} source documents/chunks.")

    clean_docs = []
    for idx, d in enumerate(raw_docs):
        if isinstance(d, dict):
            meta = dict(d.get("metadata", {}))
            content = str(d.get("page_content", ""))
        else:
            meta = dict(getattr(d, "metadata", {}))
            content = str(getattr(d, "page_content", ""))

        # Ensure all values in metadata are pure standard Python types
        clean_meta = {}
        for k, v in meta.items():
            if v is None or isinstance(v, (str, int, float, bool)):
                clean_meta[str(k)] = v
            elif isinstance(v, (list, tuple)):
                clean_meta[str(k)] = [str(item) for item in v]
            elif isinstance(v, dict):
                clean_meta[str(k)] = {str(dk): str(dv) for dk, dv in v.items()}
            else:
                clean_meta[str(k)] = str(v)

        clean_docs.append({
            "page_content": content,
            "metadata": clean_meta
        })

    print(f"[BM25 Builder] Serializing {len(clean_docs)} clean chunks to: {output_path}")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        pickle.dump(clean_docs, f, protocol=pickle.HIGHEST_PROTOCOL)

    new_size = os.path.getsize(output_path)
    print(f"[BM25 Builder] Rebuilt successfully. File size: {new_size:,} bytes (~{new_size / (1024*1024):.2f} MB).")
    return clean_docs

if __name__ == "__main__":
    rebuild_bm25_index()
