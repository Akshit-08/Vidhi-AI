"use client";

import { useEffect, useState, useRef } from "react";
import {
  Scale,
  Shield,
  Gavel,
  FileText,
  LoaderCircle,
  AlertCircle,
  Copy,
  Check,
  Printer,
  Sparkles,
  BookOpen,
  RotateCcw,
  Maximize2,
  Minimize2,
  Columns,
  ListOrdered,
  ChevronDown,
} from "lucide-react";
import LegalContentRenderer from "./components/LegalContentRenderer";

type Verdict = {
  prosecution?: string;
  defense?: string;
  verdict?: string;
};

type PhaseName = "analyzing" | "prosecuting" | "defending" | "judging" | "complete";

const phases: { name: string; key: PhaseName }[] = [
  { name: "Case Analysis", key: "analyzing" },
  { name: "Prosecution Agent", key: "prosecuting" },
  { name: "Defense Agent", key: "defending" },
  { name: "Judge Processing", key: "judging" },
];

const courtFacts = [
  {
    title: "AI-Assisted Analysis",
    fact: "AI can organize and summarize case information.",
    impact: "AI output is informational and is not a substitute for a court.",
  },
  {
    title: "Justice Delayed is Justice Denied",
    fact: "Millions of cases are pending in Indian courts.",
    impact: "Delays can affect individuals, families, and businesses.",
  },
  {
    title: "The Undertrial Challenge",
    fact: "Many people in prison are awaiting trial.",
    impact: "Timely and fair proceedings matter to everyone involved.",
  },
  {
    title: "Access to Justice",
    fact: "Legal processes can be difficult to navigate.",
    impact: "Clear information can help people better understand a case.",
  },
];

const phaseMessages: Record<PhaseName, string> = {
  analyzing: "Case Analysis in progress...",
  prosecuting: "Prosecution Agent in progress...",
  defending: "Defense Agent in progress...",
  judging: "Judge Processing in progress...",
  complete: "Analysis complete",
};

const SAMPLE_CASES = [
  {
    name: "Sample 1: Theft & Assault (Jewellery Store)",
    text: `Case: State v. Rahul Sharma
Case Details:
- Accused: Rahul Sharma, 32
- Victim: Amit Verma, 28
- Location: New Delhi, India
- Date of Incident: 12 September 2026
- Incident: Alleged theft and assault at a jewellery store.

Charges:
1. Theft of jewellery worth ₹8,50,000.
2. Criminal trespass into the jewellery store after closing hours.
3. Assault on security guard Amit Verma with grievous hurt.
4. Damage and destruction of store CCTV recording equipment.
5. Possession of stolen property.

Recovered Evidence & Statements:
- Security guard statement identifying Rahul as the intruder who struck him with a blunt object.
- Medical report confirming concussion and laceration injuries to the guard.
- Jewellery worth ₹2,00,000 recovered from Rahul Sharma's residence.
- CCTV camera outside the adjoining bank shows an individual matching Rahul's physical build entering the alley at 11:15 PM.
- Fingerprints lifted from the shattered showcase match the accused.`,
  },
  {
    name: "Sample 2: Kidnapping & Extortion (Farmhouse)",
    text: `Case: State of Maharashtra v. Karan Malhotra
Case Details:
- Accused: Karan Malhotra, 34
- Victim: Ananya Kapoor, 29 (Director of a private real estate firm)
- Location: Mumbai / Pune Highway, Maharashtra
- Date of Incident: 18 October 2026
- Incident: Alleged kidnapping for ransom, extortion, and wrongful confinement.

Charges:
1. Kidnapping for ransom (IPC 364A).
2. Extortion through threatening SMS communications (IPC 384).
3. Wrongful confinement at an abandoned farmhouse (IPC 342).
4. Criminal intimidation with threat to cause grievous harm (IPC 506).

Recovered Evidence & Statements:
- Ananya Kapoor disappeared for approximately 36 hours before being rescued from an abandoned farmhouse.
- Victim suffered minor physical injuries and trauma.
- Two unidentified individuals were reportedly seen near the farmhouse.
- A ransom demand of ₹50,00,000 was sent via SMS to victim's family.
- Prepaid SIM card used for the ransom messages was recovered; vendor identified Karan Malhotra as purchaser.
- Mobile tower CDR records place Karan's phone near the farmhouse during confinement.
- Farmhouse belongs to a third party who claims it was rented out informally without written lease.
- Commercial records confirm a bitter prior financial disagreement between Karan and Ananya over real estate commission.`,
  },
];

export default function Page() {
  const [caseInput, setCaseInput] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFact, setCurrentFact] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [processingPhase, setProcessingPhase] = useState<PhaseName>("analyzing");
  const [activeTab, setActiveTab] = useState<"side-by-side" | "prosecution" | "defense" | "sequential">("side-by-side");
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sampleMenuOpen, setSampleMenuOpen] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) return;

    // Progress through courtroom phases realistically during inference
    const phaseInterval = window.setInterval(() => {
      setCurrentPhase((prev) => {
        const next = (prev + 1) % phases.length;
        setProcessingPhase(phases[next].key);
        return next;
      });
    }, 5500);

    const factInterval = window.setInterval(() => {
      setCurrentFact((current) => (current + 1) % courtFacts.length);
    }, 4500);

    return () => {
      window.clearInterval(phaseInterval);
      window.clearInterval(factInterval);
    };
  }, [loading]);

  async function fetchJudgement() {
    if (!caseInput.trim()) {
      setError("Please enter case details.");
      return;
    }

    const endpoint = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/judgement`
      : "/api/judgement";

    setLoading(true);
    setError(null);
    setVerdict(null);
    setCurrentPhase(0);
    setProcessingPhase("analyzing");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_text: caseInput }),
      });

      if (!response.ok) {
        let errorMsg = `Request failed with status ${response.status}.`;
        try {
          const errData = await response.json();
          if (errData && typeof errData === "object") {
            const dataObj = errData as { error?: string; detail?: string };
            if (dataObj.error && dataObj.detail) {
              errorMsg = `${dataObj.error}: ${dataObj.detail}`;
            } else if (dataObj.error) {
              errorMsg = dataObj.error;
            } else if (dataObj.detail) {
              errorMsg = dataObj.detail;
            }
          }
        } catch {
          // ignore parsing error
        }
        throw new Error(errorMsg);
      }

      const data: unknown = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("The backend returned an invalid response.");
      }

      const resObj = data as {
        error?: string;
        detail?: string;
        prosecution?: string;
        defense?: string;
        verdict?: string;
      };

      if (resObj.error) {
        throw new Error(
          resObj.detail ? `${resObj.error}: ${resObj.detail}` : resObj.error
        );
      }

      if (!resObj.prosecution && !resObj.defense && !resObj.verdict) {
        throw new Error("The backend produced no courtroom content. Please verify that the Railway backend service has GROQ_API_KEY set.");
      }

      setVerdict(data as Verdict);
      setProcessingPhase("complete");

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string | undefined, key: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcf9f2] via-[#f7f2e7] to-[#f4eedf] text-gray-900 flex flex-col font-sans">
      {/* Courtroom Header (Original Theme from Image 4) */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#5a2411] via-[#78350f] to-[#5a2411] text-white shadow-2xl border-b border-amber-800/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 shadow-inner">
              <Scale className="h-7 w-7 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">VIDHI AI</h1>
              <p className="mt-0.5 text-xs sm:text-sm text-amber-200 font-medium tracking-wider uppercase">
                MULTI-AGENT RAG-BASED COURTROOM
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs text-amber-100 bg-amber-950/60 px-3.5 py-1.5 rounded-full border border-amber-700/50">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              IPC Penal Code Vector Store Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-10 space-y-9">
        {/* Full-Screen Courtroom Immersion Loading View with Custom Background */}
        {loading && (
          <div
            className="fixed inset-0 z-50 flex flex-col justify-between bg-[#fbf7ee] text-[#6b1d1d] overflow-hidden select-none animate-fade-in bg-cover bg-left-bottom bg-no-repeat"
            style={{ backgroundImage: "url('/courtroom-bg.jpg')" }}
          >
            {/* Center Content Section */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto my-auto py-12">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#781b1b] tracking-tight leading-tight">
                AI-Assisted Analysis
              </h1>

              <p className="mt-5 text-lg sm:text-2xl font-bold text-[#781b1b] max-w-2xl leading-snug">
                AI can organize and summarize case information
              </p>

              <p className="mt-3 text-sm sm:text-base font-semibold text-[#781b1b]/80 max-w-xl">
                AI output is informational and is not a substitute for a court.
              </p>

              <div className="mt-8 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium text-[#7a4e3b]">
                <LoaderCircle className="h-4 w-4 animate-spin text-[#781b1b]" />
                <span>{phaseMessages[processingPhase] || "Case Analysis in progress..."}</span>
              </div>
            </div>

            {/* Bottom Stepper Pills Track (Single Horizontal Line) */}
            <div className="relative z-10 pb-8 sm:pb-12 pt-4 px-4 w-full">
              <div className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4 max-w-5xl mx-auto flex-wrap sm:flex-nowrap">
                {phases.map((phase, idx) => {
                  const isCompleted = idx < currentPhase;
                  const isActive = idx === currentPhase;
                  return (
                    <div key={phase.key} className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
                      <div
                        className={`px-3.5 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-xs md:text-sm font-bold tracking-wider uppercase transition-all whitespace-nowrap shadow-xs ${
                          isCompleted
                            ? "bg-[#0d8a43] text-white"
                            : isActive
                            ? "bg-[#6b0d0d] text-white shadow-md ring-2 ring-red-950/20"
                            : "bg-[#eedec5] text-[#7a4e3b]"
                        }`}
                      >
                        {phase.name}
                      </div>
                      {idx < phases.length - 1 && (
                        <span className="text-[#6b1d1d] font-bold text-base sm:text-lg">→</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Submit Case Details Card */}
        <section className="rounded-xl border-2 border-amber-200/90 bg-white p-7 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-amber-100">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-amber-800" />
              <div>
                <h2 className="text-2xl font-bold text-amber-950">Submit Case Details</h2>
                <p className="text-xs text-amber-700 mt-0.5">
                  Enter case information, police charges, witness statements, and recovered evidence.
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-2">
              {/* Sample Case Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSampleMenuOpen((prev) => !prev)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50/90 px-3.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition disabled:opacity-50 shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                  Load Sample Case
                  <ChevronDown className="h-3.5 w-3.5 text-amber-700 ml-0.5" />
                </button>

                {sampleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-amber-200 bg-white p-1.5 shadow-2xl z-30 animate-fade-in">
                    {SAMPLE_CASES.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCaseInput(sample.text);
                          setSampleMenuOpen(false);
                        }}
                        className="w-full text-left rounded-lg px-3 py-2 text-xs font-medium text-gray-800 hover:bg-amber-100/70 hover:text-amber-950 transition flex flex-col gap-0.5"
                      >
                        <span className="font-bold text-amber-900">{sample.name}</span>
                        <span className="text-[11px] text-gray-500 truncate">{sample.text.slice(0, 50)}...</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {caseInput && (
                <button
                  type="button"
                  onClick={() => setCaseInput("")}
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-amber-50 hover:text-red-700 transition disabled:opacity-50"
                  title="Clear text"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="mt-5">
            <textarea
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
              disabled={loading}
              placeholder="Case: State v. Accused Name&#10;Case Details:&#10;- Accused: ...&#10;- Victim: ...&#10;- Location: ...&#10;Charges:&#10;1. ...&#10;Evidence:&#10;..."
              rows={8}
              className="w-full resize-y rounded-lg border-2 border-amber-200 p-4 text-sm text-gray-800 placeholder-gray-400 focus:border-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 leading-relaxed font-mono transition disabled:bg-gray-100"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-amber-800/80 font-medium flex items-center gap-2">
              <span>{caseInput.length} characters</span>
              <span>•</span>
              <span>
                {caseInput.trim() ? caseInput.trim().split(/\s+/).length : 0} words
              </span>
            </div>

            <div className="flex items-center gap-3">
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-800"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={fetchJudgement}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-amber-950 active:scale-[0.98] px-8 py-3.5 font-bold uppercase tracking-wider text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Gavel className="h-4 w-4 text-amber-300" />
                    <span>Request Judgment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Empty State before submission */}
        {!verdict && !loading && (
          <section className="rounded-xl border-2 border-amber-200/80 bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-amber-950">
              Submit a case to begin the analysis
            </h3>
            <p className="mt-2 text-sm text-amber-800 max-w-lg mx-auto">
              The system will display prosecution arguments, defense counterarguments,
              and an AI-generated judicial analysis grounded in the Indian Penal Code.
            </p>
          </section>
        )}

        {/* Results Section */}
        {verdict && (
          <div ref={resultsRef} className="space-y-8 animate-fade-in">
            {/* View Mode & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border-2 border-amber-200/80 shadow-md">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 mr-1">
                  Presentation Mode:
                </span>
                <div className="inline-flex rounded-lg bg-amber-50/80 p-1 border border-amber-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("side-by-side")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                      activeTab === "side-by-side"
                        ? "bg-amber-900 text-white shadow-xs font-bold"
                        : "text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    <Columns className="h-3.5 w-3.5" />
                    Side-by-Side (Matched Height)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("sequential")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                      activeTab === "sequential"
                        ? "bg-amber-900 text-white shadow-xs font-bold"
                        : "text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    <ListOrdered className="h-3.5 w-3.5" />
                    Sequential Docket (Full Width)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("prosecution")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                      activeTab === "prosecution"
                        ? "bg-red-700 text-white shadow-xs font-bold"
                        : "text-red-900 hover:bg-red-50"
                    }`}
                  >
                    <Scale className="h-3.5 w-3.5" />
                    Prosecution Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("defense")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                      activeTab === "defense"
                        ? "bg-blue-700 text-white shadow-xs font-bold"
                        : "text-blue-900 hover:bg-blue-50"
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Defense Only
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {activeTab === "side-by-side" && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
                    title={isExpanded ? "Collapse to equal window" : "Expand to full content"}
                  >
                    {isExpanded ? (
                      <>
                        <Minimize2 className="h-3.5 w-3.5" />
                        Collapse Window
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3.5 w-3.5" />
                        Expand Full Height
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50 transition"
                >
                  <Printer className="h-3.5 w-3.5 text-amber-800" />
                  Print / PDF
                </button>
              </div>
            </div>

            {/* ADVERSARIAL SECTION: Prosecution vs Defense */}
            <section
              className={`transition-all ${
                activeTab === "side-by-side"
                  ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
                  : "space-y-6"
              }`}
            >
              {/* PROSECUTION BOX (Original Red Theme from Image 4, Improved Box) */}
              {(activeTab === "side-by-side" ||
                activeTab === "prosecution" ||
                activeTab === "sequential") && (
                <article
                  className={`flex flex-col rounded-xl border-2 border-red-300 bg-white shadow-xl overflow-hidden transition-all ${
                    activeTab === "side-by-side" && !isExpanded ? "h-[620px]" : "h-auto"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-red-700 to-red-800 text-white px-6 sm:px-8 py-5 border-b border-red-900 shrink-0">
                    <div className="flex items-center gap-3">
                      <Scale className="h-7 w-7 text-red-200" />
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-wide">
                          PROSECUTION
                        </h2>
                        <p className="mt-0.5 text-xs text-red-100 font-medium">
                          Arguments and evidence
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(verdict.prosecution, "prosecution")}
                      className="inline-flex items-center gap-1.5 rounded-md bg-red-900/60 hover:bg-red-900 px-3 py-1.5 text-xs font-semibold text-red-100 border border-red-500/40 transition"
                      title="Copy prosecution argument"
                    >
                      {copiedKey === "prosecution" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Body with Proper Indentation & Formatted Text */}
                  <div
                    className={`p-6 sm:p-8 bg-red-50/20 text-gray-800 leading-relaxed flex-1 ${
                      activeTab === "side-by-side" && !isExpanded
                        ? "overflow-y-auto custom-scrollbar"
                        : ""
                    }`}
                  >
                    <LegalContentRenderer
                      content={verdict.prosecution}
                      theme="prosecution"
                    />
                  </div>
                </article>
              )}

              {/* DEFENSE BOX (Original Royal Blue Theme from Image 4, Improved Box) */}
              {(activeTab === "side-by-side" ||
                activeTab === "defense" ||
                activeTab === "sequential") && (
                <article
                  className={`flex flex-col rounded-xl border-2 border-blue-300 bg-white shadow-xl overflow-hidden transition-all ${
                    activeTab === "side-by-side" && !isExpanded ? "h-[620px]" : "h-auto"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-800 text-white px-6 sm:px-8 py-5 border-b border-blue-900 shrink-0">
                    <div className="flex items-center gap-3">
                      <Shield className="h-7 w-7 text-blue-200" />
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-wide">
                          DEFENSE
                        </h2>
                        <p className="mt-0.5 text-xs text-blue-100 font-medium">
                          Arguments and response
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(verdict.defense, "defense")}
                      className="inline-flex items-center gap-1.5 rounded-md bg-blue-900/60 hover:bg-blue-900 px-3 py-1.5 text-xs font-semibold text-blue-100 border border-blue-500/40 transition"
                      title="Copy defense argument"
                    >
                      {copiedKey === "defense" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Body with Proper Indentation & Formatted Text */}
                  <div
                    className={`p-6 sm:p-8 bg-blue-50/20 text-gray-800 leading-relaxed flex-1 ${
                      activeTab === "side-by-side" && !isExpanded
                        ? "overflow-y-auto custom-scrollbar"
                        : ""
                    }`}
                  >
                    <LegalContentRenderer
                      content={verdict.defense}
                      theme="defense"
                    />
                  </div>
                </article>
              )}
            </section>

            {/* AI-GENERATED ANALYSIS (Original Theme from Image 4, Improved Box) */}
            <article className="overflow-hidden rounded-xl border-4 border-amber-500 bg-white shadow-2xl transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 px-6 sm:px-8 py-8 text-center text-white relative">
                <div className="flex items-center justify-center gap-4">
                  <Gavel className="h-8 w-8 text-amber-300 hidden sm:inline" />
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-wide">
                    AI-GENERATED ANALYSIS
                  </h2>
                  <Gavel className="h-8 w-8 text-amber-300 hidden sm:inline" />
                </div>
                <p className="mt-2 text-xs sm:text-sm text-amber-200 font-medium max-w-2xl mx-auto">
                  Informational output only. This is not an official or legally binding court judgment.
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(verdict.verdict, "verdict")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-950 px-3.5 py-1.5 text-xs font-semibold text-amber-100 border border-amber-500/50 transition shadow-sm"
                    title="Copy AI verdict"
                  >
                    {copiedKey === "verdict" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Copied Analysis!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Full Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Formatted Content Body */}
              <div className="p-6 sm:p-10 bg-white">
                <LegalContentRenderer
                  content={verdict.verdict}
                  theme="judge"
                />
              </div>

              {/* Bottom Footer Note */}
              <div className="px-6 sm:px-8 py-4 bg-amber-50/60 border-t border-amber-200 text-xs text-amber-900/80 flex items-center justify-between">
                <span>VIDHI AI Courtroom Analysis · Evidence & IPC RAG Synthesized</span>
                <span className="font-semibold text-amber-950">Statutory Analysis Complete</span>
              </div>
            </article>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-amber-950 px-6 py-6 text-center text-sm text-amber-200 border-t border-amber-900">
        VIDHI AI · Educational case analysis & legal multi-agent reasoning
      </footer>
    </div>
  );
}
