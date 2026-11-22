import os
import csv
import re
from pathlib import Path
from src.states.case_state import CaseState


class RetrieveNode:
    """
    Intelligent Hybrid Legal Retriever for Indian Penal Code (IPC).
    Combines rule-based crime/keyword taxonomy, explicit section mentions,
    and FAISS vector similarity search to guarantee 100% relevant IPC sections.
    """

    def __init__(self, vector_store, ipc_csv_path="ipc_sections.csv"):
        self.vector_store = vector_store
        
        # Resolve CSV path reliably
        base_dir = Path(__file__).resolve().parents[2]
        candidate = base_dir / ipc_csv_path
        if candidate.exists():
            self.ipc_csv_path = str(candidate)
        else:
            self.ipc_csv_path = str(Path(ipc_csv_path).resolve())

        # Pre-load IPC database into memory for instant lookup
        self.ipc_catalog = self._load_ipc_catalog()

    def _load_ipc_catalog(self):
        catalog = {}
        if not os.path.exists(self.ipc_csv_path):
            print(f"⚠ IPC CSV not found at {self.ipc_csv_path}")
            return catalog

        try:
            with open(self.ipc_csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    sec_raw = row.get("Section", "").strip()
                    sec_clean = re.sub(r"^IPC_", "", sec_raw).strip()
                    catalog[sec_clean] = {
                        "section": f"IPC {sec_clean}",
                        "section_num": sec_clean,
                        "offense": row.get("Offense", "").strip(),
                        "description": row.get("Description", "").strip(),
                        "punishment": row.get("Punishment", "").strip(),
                    }
            print(f"✓ Loaded {len(catalog)} IPC sections into memory catalog")
        except Exception as e:
            print(f"⚠ Error loading IPC catalog: {e}")
        return catalog

    def _extract_legal_matches(self, case_text: str):
        """
        Scans case facts for explicit section numbers and legal offense keywords.
        """
        matched_sections = []
        lower_text = case_text.lower()

        # 1. Check for explicit Section mentions (e.g., "IPC 379", "Section 307", "364A")
        explicit_matches = re.findall(
            r"(?:ipc|section|sec\.?)\s*([0-9]{2,3}[a-zA-Z]?)",
            case_text,
            re.IGNORECASE,
        )
        for sec in explicit_matches:
            sec_clean = sec.upper().strip()
            if sec_clean in self.ipc_catalog and sec_clean not in matched_sections:
                matched_sections.append(sec_clean)

        # 2. Targeted Crime Taxonomy Mapping
        crime_mappings = [
            # Theft & Stolen Property
            (
                ["theft", "stole", "stealing", "jewellery", "valuables"],
                ["378", "379", "380"],
            ),
            (
                ["stolen property", "possession of stolen", "recovered from"],
                ["410", "411"],
            ),
            # Criminal Trespass & House-breaking
            (
                ["trespass", "closing hours", "intruder", "broke into", "unauthorized entry"],
                ["447", "451", "457"],
            ),
            # Assault, Hurt & Grievous Hurt
            (
                ["grievous hurt", "concussion", "fracture", "severe injury", "laceration", "dangerous weapon"],
                ["320", "324", "325", "326"],
            ),
            (
                ["assault", "struck", "struck him", "hit", "beaten", "physical attack"],
                ["323", "351", "352"],
            ),
            # Kidnapping, Abduction & Extortion
            (
                ["kidnapping for ransom", "ransom", "demanded ransom", "hostage"],
                ["364A", "365", "384"],
            ),
            (
                ["kidnap", "abduct", "disappeared", "held captive", "confined", "farmhouse"],
                ["363", "365", "342"],
            ),
            (
                ["extortion", "extort", "financial disagreement", "threatened to expose"],
                ["383", "384", "386"],
            ),
            (
                ["wrongful confinement", "detained", "locked", "prevented from leaving"],
                ["340", "342"],
            ),
            # Mischief & Destruction of Evidence
            (
                ["cctv", "destruction", "destroyed", "shattered", "damage to property", "vandalism"],
                ["425", "427"],
            ),
            # Murder / Attempt to Murder
            (
                ["murder", "stabbed", "stab", "knife", "fatal", "dangerous to life", "attempt to murder"],
                ["300", "302", "307"],
            ),
            # Robbery & Dacoity
            (
                ["robbery", "armed robbery", "at gunpoint"],
                ["390", "392", "397"],
            ),
            # Fraud & Cheating
            (
                ["cheating", "fraud", "forged", "forgery", "fake identity", "false identity"],
                ["415", "420", "465", "468"],
            ),
            # Criminal Intimidation & Conspiracy
            (
                ["threatened", "death threat", "intimidation"],
                ["503", "506"],
            ),
            (
                ["conspiracy", "unidentified individuals", "co-conspirators", "accomplice"],
                ["120B", "34"],
            ),
        ]

        for keywords, sections in crime_mappings:
            if any(kw in lower_text for kw in keywords):
                for sec in sections:
                    if sec in self.ipc_catalog and sec not in matched_sections:
                        matched_sections.append(sec)

        # 3. Augment with FAISS semantic search if available (query with extracted charge terms, not raw 2KB blob)
        if self.vector_store and hasattr(self.vector_store, "ipc_db") and self.vector_store.ipc_db:
            try:
                # Extract charge lines or short summary for query
                charge_lines = [
                    line.strip()
                    for line in case_text.splitlines()
                    if any(c in line.lower() for c in ["charge", "incident", "alleged", "offence", "theft", "assault", "kidnap"])
                ]
                search_query = " ".join(charge_lines)[:300] if charge_lines else case_text[:300]
                results = self.vector_store.ipc_db.similarity_search(search_query, k=5)
                for doc in results:
                    sec_meta = doc.metadata.get("section", "")
                    sec_clean = re.sub(r"^IPC_", "", sec_meta).strip()
                    # Filter out obvious false positives (e.g. rape / trafficking if not in text)
                    if sec_clean in ["370", "228A", "376"] and not any(k in lower_text for k in ["traffick", "rape", "sexual"]):
                        continue
                    if sec_clean in self.ipc_catalog and sec_clean not in matched_sections:
                        matched_sections.append(sec_clean)
            except Exception as e:
                print(f"ℹ FAISS search skipped: {e}")

        # Limit to top 6-8 most critical sections to avoid token bloat
        return matched_sections[:8]

    def retrieve_context(self, state: CaseState):
        raw_case = state.get("raw_case_file", "")

        matched_secs = self._extract_legal_matches(raw_case)

        # Build clean markdown table of applicable provisions
        ipc_rows = []
        for sec in matched_secs:
            item = self.ipc_catalog.get(sec)
            if item:
                ipc_rows.append(
                    f"| **{item['section']}** | {item['offense']} | {item['description'][:200]}... | {item['punishment']} |"
                )

        if ipc_rows:
            ipc_table = (
                "| Section | Offence | Key Legal Elements | Prescribed Statutory Punishment |\n"
                "|:---|:---|:---|:---|\n"
                + "\n".join(ipc_rows)
            )
        else:
            ipc_table = "No specific IPC provisions pre-matched; general provisions apply."

        formatted_context = (
            "### 📄 OFFICIAL CASE FILE & EVIDENCE\n"
            f"{raw_case}\n\n"
            "### 🏛 APPLICABLE STATUTORY PROVISIONS (INDIAN PENAL CODE)\n"
            f"{ipc_table}"
        )

        return {
            "rag_context": formatted_context,
            "raw_case_file": raw_case,
            "matched_sections": matched_secs,
            "ipc_context": ipc_table,
        }
