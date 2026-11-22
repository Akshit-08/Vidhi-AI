from src.states.case_state import CaseState


class DefenseNode:
    """
    Defense Lawyer Agent
    Constructs a strong, persuasive argument defending the accused,
    responding directly to prosecution claims, highlighting reasonable doubt,
    and pointing out evidentiary gaps and procedural flaws.
    """

    def __init__(self, llm):
        self.llm = llm

    def defense_argument(self, state: CaseState):
        case_facts = state.get("raw_case_file", "")
        prosecution_argument = state.get("prosecution_argument", "")
        ipc_context = state.get("ipc_context", state.get("rag_context", ""))

        prompt = f"""
You are the SENIOR DEFENSE COUNSEL representing the Accused in an Indian Sessions Court.

Your duty:
- Argue that the accused is NOT GUILTY and entitled to an honourable acquittal.
- Respond directly to and rebut each claim in the Prosecution's Argument.
- Identify evidentiary gaps, uncorroborated assertions, contradictions in witness statements, and procedural lapses (e.g. failure to hold Test Identification Parade, recovery without independent witnesses, lack of conclusive forensic proof).
- Demonstrate that the prosecution has failed to establish the essential statutory ingredients under the charged IPC sections beyond reasonable doubt.

============================================================
CASE FILE AND EVIDENCE:
{case_facts}
============================================================

PROSECUTION ARGUMENT:
{prosecution_argument}
============================================================

APPLICABLE STATUTORY PROVISIONS (INDIAN PENAL CODE):
{ipc_context}
============================================================

FORMATTING & STRUCTURE:
Produce a complete, polished submission using GitHub Markdown:
- Format section titles with `###` (e.g. `### 1. OPENING STATEMENT & DEFENSE THEORY`).
- Use markdown tables for charge rebuttals.
- Use bullet points for evidentiary infirmities.
- Bold important section numbers (e.g. **IPC 379**, **IPC 451**), names, and legal principles.

Write the formal Defense Submissions now following this structure:
### CASE DETAILS
- **Court:** Court of Sessions, New Delhi (or relevant jurisdiction from case file)
- **Case Title:** State vs. [Accused Name]
- **Defense Counsel:** Senior Counsel for the Accused

### 1. OPENING STATEMENT & DEFENSE THEORY
[Affirm the presumption of innocence and outline the core defense theory, e.g. mistaken identity, planting of evidence, or absence of mens rea.]

### 2. POINT-BY-POINT REBUTTAL TO PROSECUTION CHARGES
| Charged IPC Section | Prosecution Allegation | Fatal Defect / Missing Statutory Element |
|:---|:---|:---|
| [IPC Section 1] | [Prosecution Claim] | [Why this charge cannot legally or factually stand] |
| [IPC Section 2] | [Prosecution Claim] | [Why this charge cannot legally or factually stand] |

### 3. CRITICAL EVIDENTIARY INFIRMITIES & REASONABLE DOUBT
- **Unreliable / Contradictory Witness Statements:** [Expose discrepancies, interested witnesses, or lack of proper identification]
- **Defective Recoveries & Procedural Lapses:** [Highlight non-compliance with Section 27 Evidence Act, lack of independent panchas]
- **Inconclusive Forensic & Circumstantial Links:** [Expose missing links in chain of custody, alternate innocent explanations]

### 4. ABSENCE OF CRIMINAL INTENT (MENS REA) & CAUSATION
[Demonstrate that the statutory intent or knowledge required for conviction is entirely absent.]

### 5. PRAYER FOR ACQUITTAL
[Formal prayer urging the Hon'ble Court to grant an honorable acquittal with benefit of reasonable doubt.]
"""

        try:
            response = self.llm.invoke(prompt)
            return {
                "defense_argument": response.content
            }
        except Exception as exc:
            return {
                "defense_argument": f"Unable to generate defense argument: {exc}"
            }
