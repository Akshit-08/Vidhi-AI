from pathlib import Path


class IngestNode:
    """
    Lightweight, fast ingestion node.
    Passes case text directly to retrieve node without heavy on-the-fly re-embedding,
    ensuring cloud serverless & container environments respond in seconds.
    """

    def __init__(self, vector_store=None, ipc_csv_path="ipc_sections.csv"):
        self.vector_store = vector_store
        self.ipc_csv_path = ipc_csv_path

    def load_and_embed(self, state):
        text = state.get("raw_case_file", "")
        if not text:
            return {"status": "no_case"}

        return {"status": "case_ready", "raw_case_file": text}
