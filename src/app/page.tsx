import Link from "next/link";

const steps = [
  { num: "01", icon: "📋", title: "Tell Us About You", desc: "Share your company profile and current challenges in under 60 seconds." },
  { num: "02", icon: "🤖", title: "AI Analyzes", desc: "Our AI evaluates your needs against 481+ providers across 7 categories." },
  { num: "03", icon: "📊", title: "Get Your Report", desc: "Receive a custom business case, strategic approaches, and next steps." },
];

const features = [
  { icon: "💰", title: "Business Case", desc: "Data-driven cost analysis with realistic benchmarks, ROI timelines, and risk assessment tailored to your situation." },
  { icon: "🎯", title: "Provider Matching", desc: "AI-powered matching against 481+ vetted providers across UCaaS, CCaaS, SD-WAN, Security, and more." },
  { icon: "📑", title: "Comparison Report", desc: "Strategic approach recommendations with fit scores, deployment timelines, and cost estimates." },
];

const stats = [
  { value: "481+", label: "Providers" },
  { value: "7", label: "Categories" },
  { value: "<60s", label: "Analysis Time" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-sm">W</div>
            <span className="font-semibold text-lg">WULI TechMatch</span>
          </div>
          <Link
            href="/analyze"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            Get Analysis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8">
            AI-Powered Technology Advisory
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your tech stack,{" "}
            <span className="gradient-text">analyzed in 60 seconds</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Tell us about your business. Our AI matches you against 600+ technology providers and builds a custom business case — free.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-600/25"
          >
            Analyze My Tech Stack
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-blue-400 text-sm font-mono mb-2">Step {step.num}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What You Get</h2>
          <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto">Every analysis includes three deliverables, generated in real-time by AI.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="glass-card-hover p-8">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto glass-card p-8">
          <div className="grid grid-cols-3 divide-x divide-white/10">
            {stats.map((s) => (
              <div key={s.label} className="text-center px-4">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{s.value}</div>
                <div className="text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to see what you&apos;re missing?</h2>
          <p className="text-slate-400 mb-10 text-lg">Free analysis. No commitment. Results in 60 seconds.</p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-600/25"
          >
            Start Free Analysis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-500">
          <span>© 2026 WULI TechMatch. All rights reserved.</span>
          <span>Powered by AI</span>
        </div>
      </footer>
    </main>
  );
}
