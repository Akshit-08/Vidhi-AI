import re
from src.states.case_state import CaseState


class JudgeNode:
    """
    Judge Agent
    Synthesizes case facts, prosecution arguments, defense counterarguments,
    and statutory provisions to deliver an authoritative, complete judicial verdict.
    """

    def __init__(self, llm, vector_store=None):
        self.llm = llm
        self.vector_store = vector_store

    def judge_draft(self, state: CaseState):
        case_facts = state.get("raw_case_file", "")
        prosecution = state.get("prosecution_argument", "No prosecution argument provided")
        defense = state.get("defense_argument", "No defense argument provided")
        ipc_context = state.get("ipc_context", state.get("rag_context", ""))

        if not case_facts:
            return {
                "final_verdict": "ERROR: No case facts provided. Cannot render judgment."
            }

        prompt = f"""
You are the PRESIDING SESSIONS JUDGE in an Indian Court of Law delivering the FINAL JUDGMENT.

Your duty:
- Synthesize the Case Facts, Prosecution Arguments, Defense Arguments, and Applicable IPC Provisions.
- Apply the golden rule of Indian criminal jurisprudence: the prosecution must prove guilt beyond reasonable doubt; suspicion, however grave, cannot substitute for proof.
- For each charge framed: evaluate the evidence, determine whether essential elements under the IPC are satisfied, and record a categorical finding of GUILTY or NOT GUILTY.
- If guilty on any charge, award appropriate statutory sentencing (imprisonment term and fine). If acquitted, order immediate release and discharge of bail bonds.

============================================================
CASE FACTS & EVIDENCE:
{case_facts}
============================================================

PROSECUTION SUBMISSIONS:
{prosecution}
============================================================

DEFENSE SUBMISSIONS:
{defense}
============================================================

APPLICABLE STATUTORY PROVISIONS (INDIAN PENAL CODE):
{ipc_context}
============================================================

FORMATTING & STRUCTURE:
Produce an authoritative, complete, formal judgment using GitHub Markdown:
- Format section titles with `###` (e.g. `### 1. BRIEF FACTS OF THE CASE`).
- Use markdown tables for charges and statutory analysis.
- Use bullet points for clear findings.
- Bold key findings and section numbers (e.g. **IPC 379**, **IPC 451**).

Write the complete Final Judgment now following this exact structure:
### IN THE COURT OF SESSIONS
- **Case Title:** State vs. [Accused Name]
- **Case Number:** [Realistic Court Case No, e.g. SC/CR/2026/0184]
- **Presiding Judge:** Additional Sessions Judge, Court of Sessions
- **Date of Judgment:** [Current Date]

### 1. BRIEF FACTS OF THE CASE
[Neutral, chronological statement of facts, investigation, and charges in 6-10 lines.]

### 2. CHARGES FRAMED
| Charge No. | Offence Alleged | Section of Law |
|:---|:---|:---|
| 1 | [Offence Description] | [IPC Section] |
| 2 | [Offence Description] | [IPC Section] |

### 3. APPRECIATION OF PROSECUTION & DEFENSE CONTENTIONS
[Balanced synthesis of arguments and evidence advanced by both sides.]

### 4. ISSUES FOR DETERMINATION
(i) Whether the prosecution has established the identity and complicity of the accused beyond reasonable doubt?
(ii) Whether the ingredients of [Charged IPC Sections] are proven by credible and unimpeachable evidence?
(iii) Whether the defense has raised a reasonable doubt warranting acquittal?

### 5. JUDICIAL ANALYSIS & APPLICATION OF LAW
| IPC Section | Essential Statutory Requirement | Evidence Produced | Judicial Finding |
|:---|:---|:---|:---|
| [Section 1] | [Legal Test] | [Admissible Evidence] | [Proven / Not Proven] |
| [Section 2] | [Legal Test] | [Admissible Evidence] | [Proven / Not Proven] |

### 6. FINDINGS ON EACH CHARGE
[Clear, reasoned judicial findings on each individual count.]

### 7. FINAL VERDICT & ORDER
- **Verdict:** [The Accused is found GUILTY / NOT GUILTY of offences under Sections...]
- **Sentence (if convicted):** [Rigorous/Simple imprisonment term and fine for each count, whether concurrent or consecutive, and set-off under Section 428 CrPC / BNSS.]
- **Directions (if acquitted):** [Immediate discharge of surety bonds, return of seized articles.]

**Pronounced in Open Court.**
"""

        try:
            response = self.llm.invoke(prompt)
            verdict = response.content
            verdict = self._clean_verdict_formatting(verdict)
            return {
                "final_verdict": verdict
            }
        except Exception as exc:
            return {
                "final_verdict": f"Unable to generate judicial verdict: {exc}"
            }

    def _clean_verdict_formatting(self, verdict: str):
        unicode_chars = ['═', '║', '╔', '╗', '╚', '╝', '╠', '╣', '╦', '╩', '╬', '─', '│', '┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼']
        for char in unicode_chars:
            verdict = verdict.replace(char, '')
        verdict = re.sub(r'={4,}', '---', verdict)
        verdict = re.sub(r'─{4,}', '---', verdict)
        verdict = re.sub(r'\n{3,}', '\n\n', verdict)
        return verdict.strip()
