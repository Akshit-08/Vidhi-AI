from src.states.case_state import CaseState


class ProsecutionNode:
    """
    Prosecution Lawyer Agent
    Constructs a structured, legally sound argument proving the accused is guilty,
    grounded firmly in the verified case facts and applicable IPC sections.
    """

    def __init__(self, llm):
        self.llm = llm

    def prosecutor_argument(self, state: CaseState):
        case_facts = state.get("raw_case_file", "")
        ipc_context = state.get("ipc_context", state.get("rag_context", ""))

        prompt = f"""
You are the SENIOR PUBLIC PROSECUTOR representing the State in an Indian Sessions Court.

Your duty:
- Argue that the accused is GUILTY beyond reasonable doubt.
- Rely strictly on the official facts, witness statements, and recovered evidence in the case file.
- Formulate charges under the applicable Indian Penal Code (IPC) sections provided below that genuinely correspond to the alleged acts.
- For each charge, establish the essential legal ingredients (Actus Reus and Mens Rea) and demonstrate how the evidence proves them.
- Anticipate and dismantle potential defense arguments.

============================================================
CASE FILE AND EVIDENCE:
{case_facts}
============================================================

APPLICABLE STATUTORY PROVISIONS (INDIAN PENAL CODE):
{ipc_context}
============================================================

FORMATTING & STRUCTURE:
Produce a complete, polished submission using GitHub Markdown:
- Format section titles with `###` (e.g. `### 1. OPENING STATEMENT`).
- Use markdown tables for charges and statutory elements.
- Use bullet points for evidence appreciation.
- Bold important section numbers (e.g. **IPC 379**, **IPC 451**), names, and key facts.

Write the formal Prosecution Submissions now following this structure:
### CASE DETAILS
- **Court:** Court of Sessions, New Delhi (or relevant jurisdiction from case file)
- **Case Title:** State vs. [Accused Name]
- **Public Prosecutor:** Senior Public Prosecutor for the State

### 1. OPENING STATEMENT
[Concise statement of the State's case and the gravity of the offences.]

### 2. CHARGES FRAMED & STATUTORY FRAMEWORK
| Offence | Applicable IPC Section | Essential Statutory Elements |
|:---|:---|:---|
| [Charge 1] | [IPC Section] | [Key legal ingredients] |
| [Charge 2] | [IPC Section] | [Key legal ingredients] |

### 3. EVIDENCE APPRECIATION & PROOF OF GUILT
- **Eyewitness & Direct Testimony:** [Analyze statements, witness identification]
- **Physical & Forensic Evidence:** [Analyze recoveries, fingerprints, CCTV, weapon]
- **Medical & Expert Evidence:** [Analyze injuries, MLC reports]
- **Motive & Conduct:** [Analyze preparation, opportunity, subsequent conduct]

### 4. REBUTTAL TO DEFENSE CLAIMS
[Refute claims of false implication, mistaken identity, or lack of intent.]

### 5. PRAYER FOR CONVICTION
[Formal prayer requesting conviction and maximum exemplary sentence under the applicable sections.]
"""

        try:
            response = self.llm.invoke(prompt)
            return {
                "prosecution_argument": response.content
            }
        except Exception as exc:
            return {
                "prosecution_argument": f"Unable to generate prosecution argument: {exc}"
            }
