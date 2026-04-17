"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/* ─── Types ─── */
interface CompanyData {
  name: string;
  size: string;
  industry: string;
  trigger: string;
  contact_name: string;
  contact_title: string;
}

interface BusinessCase {
  executive_summary: string;
  cost_of_current_situation: string;
  potential_annual_savings: string;
  roi_timeline: string;
  key_benefits: string[];
  risk_of_inaction: string;
  key_insight: string;
}

interface StrategicApproach {
  approach_name: string;
  description: string;
  fit_score: number;
  estimated_annual_cost: string;
  deployment_timeline: string;
  best_for: string;
  key_strengths: string[];
  relevant_technologies: string[];
  key_risk: string;
}

interface MatchedProvider {
  name?: string;
  category?: string;
  similarity?: number;
}

/* ─── Constants ─── */
const PAIN_POINT_OPTIONS = [
  { id: "costs", emoji: "🏷️", label: "Costs too high" },
  { id: "reliability", emoji: "⚡", label: "Reliability / outages" },
  { id: "features", emoji: "🔧", label: "Missing features" },
  { id: "contract", emoji: "📋", label: "Contract expiring" },
  { id: "remote", emoji: "🏠", label: "Remote / hybrid workforce" },
  { id: "security", emoji: "🔒", label: "Security concerns" },
];

const INDUSTRIES = [
  "Technology", "Healthcare", "Financial Services", "Manufacturing",
  "Retail / E-Commerce", "Education", "Legal", "Real Estate",
  "Professional Services", "Logistics / Transportation",
  "Energy / Utilities", "Media / Entertainment", "Government",
  "Nonprofit", "Other",
];

const COMPANY_SIZES = [
  "1-50", "51-200", "201-500", "501-2000", "2001-5000", "5000+",
];

const ANALYSIS_MESSAGES = [
  "Analyzing your technology landscape...",
  "Evaluating strategic approaches...",
  "Building your business case...",
  "Matching against 481+ providers...",
  "Generating your report...",
];

const STEP_LABELS = ["Profile", "Challenges", "Analysis", "Results", "Next Steps"];

/* ─── Progress Bar ─── */
function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          return (
            <div key={label} className="flex flex-col items-center relative flex-1">
              {i > 0 && (
                <div
                  className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                    isCompleted ? "bg-green-500" : "bg-white/10"
                  }`}
                />
              )}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-800 border-white/20 text-slate-500"
                }`}
              >
                {isCompleted ? "✓" : stepNum}
              </div>
              <span
                className={`mt-2 text-xs ${
                  isActive ? "text-blue-400" : isCompleted ? "text-green-400" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 1: Company Profile ─── */
function StepProfile({
  companyData,
  setCompanyData,
  hasUrlParams,
  onNext,
}: {
  companyData: CompanyData;
  setCompanyData: (d: CompanyData) => void;
  hasUrlParams: boolean;
  onNext: () => void;
}) {
  const canProceed = companyData.name && companyData.size && companyData.industry;
  return (
    <div className="animate-fadeIn max-w-xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">
        {hasUrlParams && companyData.contact_name
          ? `Hi ${companyData.contact_name} — we put this together for you`
          : hasUrlParams ? "We already know a bit about you" : "Tell us about your company"}
      </h2>
      <p className="text-slate-400 mb-8">This helps us tailor the analysis to your situation.</p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
          <input
            type="text"
            value={companyData.name}
            onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
            placeholder="Acme Corp"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Company Size</label>
          <select
            value={companyData.size}
            onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="" className="bg-slate-900">Select size...</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s} className="bg-slate-900">{s} employees</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
          <select
            value={companyData.industry}
            onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="" className="bg-slate-900">Select industry...</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind} className="bg-slate-900">{ind}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Your Name <span className="text-slate-500">(optional)</span></label>
          <input
            type="text"
            value={companyData.contact_name}
            onChange={(e) => setCompanyData({ ...companyData, contact_name: e.target.value })}
            placeholder="Jane Smith"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Your Title <span className="text-slate-500">(optional)</span></label>
          <input
            type="text"
            value={companyData.contact_title}
            onChange={(e) => setCompanyData({ ...companyData, contact_title: e.target.value })}
            placeholder="CTO"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2: Pain Points ─── */
function StepChallenges({
  painPoints,
  setPainPoints,
  freeText,
  setFreeText,
  onNext,
  onBack,
}: {
  painPoints: string[];
  setPainPoints: (p: string[]) => void;
  freeText: string;
  setFreeText: (t: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const togglePain = (id: string) => {
    if (painPoints.includes(id)) {
      setPainPoints(painPoints.filter((p) => p !== id));
    } else if (painPoints.length < 3) {
      setPainPoints([...painPoints, id]);
    }
  };

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">What&apos;s driving the change?</h2>
      <p className="text-slate-400 mb-8">Select up to 3 challenges. This shapes your analysis.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {PAIN_POINT_OPTIONS.map((opt) => {
          const selected = painPoints.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => togglePain(opt.id)}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                selected
                  ? "ring-2 ring-blue-500 bg-blue-500/10 border-blue-500"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
              <div className="text-2xl mb-2">{opt.emoji}</div>
              <div className="text-sm font-medium">{opt.label}</div>
            </button>
          );
        })}
      </div>
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Anything else? (optional)
        </label>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Tell us more about your situation..."
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-white/10 rounded-xl font-medium hover:bg-white/5 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={painPoints.length === 0}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors"
        >
          Analyze My Stack →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3: Analyzing Animation ─── */
function StepAnalyzing({ progress, statusMessage }: { progress: number; statusMessage: string }) {
  return (
    <div className="animate-fadeIn max-w-lg mx-auto text-center">
      <div className="relative w-32 h-32 mx-auto mb-10">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 animate-pulse-glow opacity-30 blur-xl" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 animate-pulse-glow opacity-50 blur-md" />
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 animate-pulse-glow" />
      </div>
      <h2 className="text-2xl font-bold mb-4">{statusMessage}</h2>
      <div className="w-full bg-white/10 rounded-full h-2 mb-4">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-slate-400 text-sm">{Math.round(progress)}% complete</p>
    </div>
  );
}

/* ─── Step 4: Results ─── */
function StepResults({
  businessCase,
  comparisonReport,
  onNext,
}: {
  businessCase: BusinessCase | null;
  comparisonReport: StrategicApproach[];
  onNext: () => void;
}) {
  if (!businessCase) return null;

  const metrics = [
    { label: "Current Cost", value: businessCase.cost_of_current_situation, color: "red" },
    { label: "Potential Savings", value: businessCase.potential_annual_savings, color: "green" },
    { label: "ROI Timeline", value: businessCase.roi_timeline, color: "blue" },
    { label: "Risk of Inaction", value: businessCase.risk_of_inaction, color: "amber" },
  ];

  const colorMap: Record<string, string> = {
    red: "from-red-500/20 to-red-900/10 border-red-500/30",
    green: "from-green-500/20 to-green-900/10 border-green-500/30",
    blue: "from-blue-500/20 to-blue-900/10 border-blue-500/30",
    amber: "from-amber-500/20 to-amber-900/10 border-amber-500/30",
  };

  const fitScoreColor = (score: number) =>
    score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto" id="results-content">
      {/* Business Case */}
      <div className="glass-card p-8 mb-8 border-t-2 border-t-blue-500">
        <h2 className="text-2xl font-bold mb-4">📊 Business Case Analysis</h2>
        <p className="text-slate-300 leading-relaxed mb-8">{businessCase.executive_summary}</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`p-4 rounded-xl bg-gradient-to-br border ${colorMap[m.color]} animate-slideUp`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-sm text-slate-400 mb-1">{m.label}</div>
              <div className="text-lg font-bold">{m.value}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Key Benefits</h3>
          <div className="space-y-2">
            {businessCase.key_benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3 animate-slideUp" style={{ animationDelay: `${(i + 4) * 100}ms` }}>
                <span className="text-green-400 mt-0.5">✓</span>
                <span className="text-slate-300">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="text-sm text-blue-400 font-medium mb-1">💡 Key Insight</div>
          <p className="text-slate-300">{businessCase.key_insight}</p>
        </div>
      </div>

      {/* Strategic Approaches */}
      {comparisonReport.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">🎯 Strategic Approaches</h2>
          <div className="space-y-6">
            {comparisonReport.map((approach, i) => (
              <div
                key={i}
                className="glass-card p-6 animate-slideUp"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">{approach.approach_name}</h3>
                  <span className="text-sm text-slate-400">{approach.fit_score}% fit</span>
                </div>
                <p className="text-slate-400 mb-4">{approach.description}</p>

                <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                  <div
                    className={`h-full rounded-full transition-all ${fitScoreColor(approach.fit_score)}`}
                    style={{ width: `${approach.fit_score}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-slate-500">Est. Annual Cost</span>
                    <div className="font-medium">{approach.estimated_annual_cost}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Deployment</span>
                    <div className="font-medium">{approach.deployment_timeline}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Best For</span>
                    <div className="font-medium">{approach.best_for}</div>
                  </div>
                </div>

                <div className="mb-3">
                  {approach.key_strengths.map((s, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                      <span className="text-green-400">✓</span> {s}
                    </div>
                  ))}
                </div>

                {approach.relevant_technologies?.length > 0 && (
                  <div className="mb-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Technologies</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {approach.relevant_technologies.map((tech, j) => (
                        <span key={j} className="px-2 py-1 text-xs rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                  <span className="text-amber-400 font-medium">⚠ Risk:</span>{" "}
                  <span className="text-slate-300">{approach.key_risk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
      >
        See Next Steps →
      </button>
    </div>
  );
}

/* ─── Step 5: Book Meeting ─── */
function StepNextSteps({ onDownloadPdf }: { onDownloadPdf: () => void }) {
  return (
    <div className="animate-fadeIn max-w-xl mx-auto text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h2 className="text-3xl font-bold mb-4">
        Ready to see which providers fit each approach?
      </h2>
      <p className="text-slate-400 mb-10 text-lg">
        Talk to an advisor to get specific provider recommendations tailored to your business.
      </p>
      <a
        href="#"
        className="inline-block w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/25 mb-4"
      >
        Book a Free Consultation
      </a>
      <button
        onClick={onDownloadPdf}
        className="w-full py-4 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors"
      >
        📄 Download Full Report (PDF)
      </button>
    </div>
  );
}

/* ─── Main Wizard (inner, uses useSearchParams) ─── */
function AnalyzeWizardInner() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    size: "",
    industry: "",
    trigger: "",
    contact_name: "",
    contact_title: "",
  });
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [, setMatchedProviders] = useState<MatchedProvider[]>([]);
  const [businessCase, setBusinessCase] = useState<BusinessCase | null>(null);
  const [comparisonReport, setComparisonReport] = useState<StrategicApproach[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(ANALYSIS_MESSAGES[0]);
  const [hasUrlParams, setHasUrlParams] = useState(false);
  const analysisStarted = useRef(false);

  // Read URL params on mount
  useEffect(() => {
    const trigger = searchParams.get("trigger") || "";
    const company = searchParams.get("company") || "";
    const size = searchParams.get("size") || "";
    const industry = searchParams.get("industry") || "";

    const contact_name = searchParams.get("name") || "";
    const contact_title = searchParams.get("title") || "";
    if (trigger || company || size || industry || contact_name || contact_title) {
      setHasUrlParams(true);
      setCompanyData({ name: company, size, industry, trigger, contact_name, contact_title });
    }
  }, [searchParams]);

  // Run analysis when step 3 is reached
  const runAnalysis = useCallback(async () => {
    if (analysisStarted.current) return;
    analysisStarted.current = true;
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 1.5, 90));
    }, 300);

    // Status message rotation
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % ANALYSIS_MESSAGES.length;
      setStatusMessage(ANALYSIS_MESSAGES[msgIndex]);
    }, 3500);

    const painPointLabels = painPoints.map(
      (id) => PAIN_POINT_OPTIONS.find((o) => o.id === id)?.label || id
    );

    const payload = {
      company_name: companyData.name,
      company_size: companyData.size,
      industry: companyData.industry,
      pain_points: painPointLabels,
      free_text: freeText,
    };

    try {
      // Step 1: Match providers
      const matchRes = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const matchData = await matchRes.json();
      const providers = matchData.providers || [];
      setMatchedProviders(providers);

      const enrichedPayload = { ...payload, matched_providers: providers };

      // Step 2: Business case and comparison in parallel
      const [bcRes, compRes] = await Promise.all([
        fetch("/api/business-case", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enrichedPayload),
        }),
        fetch("/api/comparison", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enrichedPayload),
        }),
      ]);

      const bcData = await bcRes.json();
      const compData = await compRes.json();

      if (bcData.error && !bcData.executive_summary) throw new Error(bcData.error);
      if (compData.error && !Array.isArray(compData)) throw new Error(compData.error);

      setBusinessCase(bcData);
      setComparisonReport(Array.isArray(compData) ? compData : []);

      // Fire-and-forget lead save
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          matched_providers: providers,
          business_case: bcData,
          comparison_report: compData,
        }),
      }).catch(() => {});

      setProgress(100);
      clearInterval(progressInterval);
      clearInterval(msgInterval);

      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentStep(4);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      clearInterval(msgInterval);
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      analysisStarted.current = false;
    }
  }, [companyData, painPoints, freeText]);

  useEffect(() => {
    if (currentStep === 3 && !isAnalyzing && !error) {
      runAnalysis();
    }
  }, [currentStep, isAnalyzing, error, runAnalysis]);

  const handleDownloadPdf = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      let resultsEl = document.getElementById("results-content");
      
      // If on step 5, results-content might not be visible - check for hidden copy
      if (!resultsEl) {
        resultsEl = document.getElementById("results-content-hidden");
      }
      if (!resultsEl) {
        alert("No results found. Please go back and run the analysis again.");
        return;
      }

      // Temporarily show results for capture (print-friendly: white bg, dark text)
      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.left = "-9999px";
      wrapper.style.top = "0";
      wrapper.style.width = "900px";
      wrapper.style.background = "#ffffff";
      wrapper.style.padding = "40px";
      wrapper.style.color = "#1e293b";
      wrapper.innerHTML = resultsEl.innerHTML;
      // Override all colors for print
      wrapper.querySelectorAll("*").forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.color = "#1e293b";
        htmlEl.style.borderColor = "#cbd5e1";
        htmlEl.style.backgroundColor = "transparent";
      });
      // Preserve green on savings elements
      wrapper.querySelectorAll(".pdf-savings").forEach((el) => {
        (el as HTMLElement).style.color = "#16a34a";
      });
      // Style section containers
      wrapper.querySelectorAll("[class*='border']").forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.border = "1px solid #cbd5e1";
        htmlEl.style.borderRadius = "8px";
        htmlEl.style.padding = "12px";
      });
      // Style headings
      wrapper.querySelectorAll("h1, h2, h3").forEach((el) => {
        (el as HTMLElement).style.color = "#0f172a";
      });
      // Style strong/bold
      wrapper.querySelectorAll("strong").forEach((el) => {
        (el as HTMLElement).style.color = "#0f172a";
      });
      // Prevent page breaks inside sections
      wrapper.querySelectorAll("div").forEach((el) => {
        (el as HTMLElement).style.pageBreakInside = "avoid";
        (el as HTMLElement).style.breakInside = "avoid";
      });
      document.body.appendChild(wrapper);

      // Render each section as a separate canvas to avoid splitting
      const sections: HTMLElement[] = [];
      wrapper.querySelectorAll(":scope > div > *").forEach((el) => {
        sections.push(el as HTMLElement);
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      let yPos = margin;
      let firstPage = true;

      for (const section of sections) {
        const sectionWrapper = document.createElement("div");
        sectionWrapper.style.position = "absolute";
        sectionWrapper.style.left = "-9999px";
        sectionWrapper.style.top = "0";
        sectionWrapper.style.width = "900px";
        sectionWrapper.style.background = "#ffffff";
        sectionWrapper.style.padding = "0 40px";
        sectionWrapper.appendChild(section.cloneNode(true));
        // Re-apply green savings color on cloned elements
        sectionWrapper.querySelectorAll(".pdf-savings").forEach((el) => {
          (el as HTMLElement).style.color = "#16a34a";
        });
        document.body.appendChild(sectionWrapper);

        const sectionCanvas = await html2canvas(sectionWrapper, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
        });
        document.body.removeChild(sectionWrapper);

        const sectionHeight = (sectionCanvas.height * (pdfWidth - margin * 2)) / sectionCanvas.width;

        // If this section won't fit on current page, start a new page
        if (!firstPage && yPos + sectionHeight > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }

        const imgData = sectionCanvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", margin, yPos, pdfWidth - margin * 2, sectionHeight);
        yPos += sectionHeight + 2;
        firstPage = false;
      }

      pdf.save(`WULI-TechMatch-${companyData.name || "Report"}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("PDF generation failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-sm">
              W
            </div>
            <span className="font-semibold text-lg">WULI TechMatch</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <ProgressBar currentStep={currentStep} />

        {/* Error state */}
        {error && currentStep === 3 && (
          <div className="max-w-lg mx-auto text-center animate-fadeIn">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                analysisStarted.current = false;
              }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Steps */}
        {currentStep === 1 && (
          <StepProfile
            companyData={companyData}
            setCompanyData={setCompanyData}
            hasUrlParams={hasUrlParams}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepChallenges
            painPoints={painPoints}
            setPainPoints={setPainPoints}
            freeText={freeText}
            setFreeText={setFreeText}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && !error && (
          <StepAnalyzing progress={progress} statusMessage={statusMessage} />
        )}

        {currentStep === 4 && (
          <StepResults
            businessCase={businessCase}
            comparisonReport={comparisonReport}
            onNext={() => setCurrentStep(5)}
          />
        )}

        {currentStep === 5 && (
          <>
            <StepNextSteps onDownloadPdf={handleDownloadPdf} />
            {/* Hidden results for PDF capture on step 5 */}
            <div id="results-content-hidden" className="hidden">
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: "14px", lineHeight: "1.6" }}>
                <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>WULI TechMatch Analysis</h1>
                <h2 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "24px" }}>{companyData.name} — {companyData.industry} — {companyData.size} employees</h2>
                {businessCase && (
                  <div style={{ marginBottom: "32px" }}>
                    <h2 style={{ fontSize: "20px", borderBottom: "2px solid #0f172a", paddingBottom: "4px", marginBottom: "12px" }}>Business Case</h2>
                    <p style={{ marginBottom: "16px" }}>{businessCase.executive_summary}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                      <p><strong>Current Cost:</strong> {businessCase.cost_of_current_situation}</p>
                      <p><strong>Potential Savings:</strong> <span className="pdf-savings" style={{ color: "#16a34a", fontWeight: "bold" }}>{businessCase.potential_annual_savings}</span></p>
                      <p><strong>ROI Timeline:</strong> <span className="pdf-savings" style={{ color: "#16a34a", fontWeight: "bold" }}>{businessCase.roi_timeline}</span></p>
                    </div>
                    <p style={{ marginBottom: "8px" }}><strong>Key Benefits:</strong></p>
                    <ul style={{ marginLeft: "20px", marginBottom: "16px" }}>
                      {businessCase.key_benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    <p><strong>Risk of Inaction:</strong> {businessCase.risk_of_inaction}</p>
                    <p style={{ marginTop: "8px" }}><strong>Key Insight:</strong> {businessCase.key_insight}</p>
                  </div>
                )}
                {comparisonReport.length > 0 && (
                  <div>
                    <h2 style={{ fontSize: "20px", borderBottom: "2px solid #0f172a", paddingBottom: "4px", marginBottom: "16px" }}>Strategic Approaches</h2>
                    {comparisonReport.map((a, i) => (
                      <div key={i} style={{ marginBottom: "24px", padding: "16px", border: "1px solid #cbd5e1", borderRadius: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>{a.approach_name}</h3>
                          <span style={{ fontSize: "14px", fontWeight: "bold" }}>{a.fit_score}% fit</span>
                        </div>
                        <p style={{ marginBottom: "12px" }}>{a.description}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px", fontSize: "13px" }}>
                          <div><strong>Est. Annual Cost:</strong><br />{a.estimated_annual_cost}</div>
                          <div><strong>Deployment:</strong><br />{a.deployment_timeline}</div>
                          <div><strong>Best For:</strong><br />{a.best_for}</div>
                        </div>
                        <p style={{ marginBottom: "4px" }}><strong>Key Strengths:</strong></p>
                        <ul style={{ marginLeft: "20px", marginBottom: "12px" }}>
                          {a.key_strengths.map((s, j) => (
                            <li key={j}>{s}</li>
                          ))}
                        </ul>
                        {a.relevant_technologies?.length > 0 && (
                          <p style={{ marginBottom: "8px" }}><strong>Technologies:</strong> {a.relevant_technologies.join(" · ")}</p>
                        )}
                        <p style={{ padding: "8px", backgroundColor: "#fef3c7", borderRadius: "4px", fontSize: "13px" }}>
                          <strong>Risk:</strong> {a.key_risk}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: "32px", paddingTop: "12px", borderTop: "1px solid #cbd5e1", fontSize: "12px", color: "#64748b" }}>
                  Generated by WULI TechMatch — wuli-techmatch-app.vercel.app
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ─── Wrapper with Suspense (required for useSearchParams) ─── */
export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading...</div>
        </div>
      }
    >
      <AnalyzeWizardInner />
    </Suspense>
  );
}
