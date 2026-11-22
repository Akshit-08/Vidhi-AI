import os
import csv
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


class IngestNode:
    def __init__(self, vector_store, ipc_csv_path="ipc_sections.csv"):
        self.vector_store = vector_store
        if not os.path.isabs(ipc_csv_path):
            base_dir = Path(__file__).resolve().parents[2]
            candidate = base_dir / ipc_csv_path
            if candidate.exists():
                ipc_csv_path = str(candidate)
            else:
                ipc_csv_path = str(Path(ipc_csv_path).resolve())
        self.ipc_csv_path = ipc_csv_path

    def _load_ipc_sections(self):
        if self.vector_store.ipc_db:
            print("✓ IPC already loaded — skipping re-embedding")
            return

        if not os.path.exists(self.ipc_csv_path):
            print(f"⚠ Cannot load IPC sections: file not found at {self.ipc_csv_path}")
            return

        docs = []
        with open(self.ipc_csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                docs.append(Document(
                    page_content=f"IPC {row['Section']} — {row['Description']}",
                    metadata={"source": "ipc", "section": row["Section"]}
                ))

        self.vector_store.add_ipc_documents(docs)

    def load_and_embed(self, state):
        text = state.get("raw_case_file", "")
        if not text:
            return {"status": "no_case"}

        # Load IPC once if not yet loaded
        self._load_ipc_sections()

        # Rebuild ONLY case DB
        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
        chunks = splitter.split_text(text)
        docs = [Document(page_content=c, metadata={"source": "case"}) for c in chunks]

        self.vector_store.add_case_documents(docs)

        return {"status": "case_embedded", "raw_case_file": text}
