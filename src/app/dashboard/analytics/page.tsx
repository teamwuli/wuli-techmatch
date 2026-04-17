"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface EventRow {
  contact_id: string;
  event_type: string;
  metadata: {
    subject?: string;
    recipient_title?: string;
    message_variant?: string;
    sent_at_hour?: number;
    sent_at_day?: string;
    sent_at_iso?: string;
    sequence_number?: number;
    timestamp?: string;
  };
}

interface BreakdownRow {
  label: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: string;
  clickRate: string;
}

function calcBreakdown(
  label: string,
  sentEvents: EventRow[],
  openEvents: EventRow[],
  clickEvents: EventRow[]
): BreakdownRow {
  const sentContacts = new Set(sentEvents.map((e) => e.contact_id));
  const openedContacts = new Set(
    openEvents.filter((e) => sentContacts.has(e.contact_id)).map((e) => e.contact_id)
  );
  const clickedContacts = new Set(
    clickEvents.filter((e) => sentContacts.has(e.contact_id)).map((e) => e.contact_id)
  );
  const sent = sentContacts.size;
  return {
    label,
    sent,
    opened: openedContacts.size,
    clicked: clickedContacts.size,
    openRate: sent > 0 ? `${Math.round((openedContacts.size / sent) * 100)}%` : "—",
    clickRate: sent > 0 ? `${Math.round((clickedContacts.size / sent) * 100)}%` : "—",
  };
}

function BreakdownTable({ title, rows }: { title: string; rows: BreakdownRow[] }) {
  const sorted = [...rows].sort((a, b) => {
    const rateA = parseFloat(a.openRate) || 0;
    const rateB = parseFloat(b.openRate) || 0;
    return rateB - rateA;
  });

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <h3 className="text-lg font-semibold px-5 py-4 border-b border-white/10">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-slate-400 text-left">
            <th className="px-5 py-3 font-medium">{title.replace(" Performance", "")}</th>
            <th className="px-5 py-3 font-medium text-center">Sent</th>
            <th className="px-5 py-3 font-medium text-center">Opened</th>
            <th className="px-5 py-3 font-medium text-center">Open Rate</th>
            <th className="px-5 py-3 font-medium text-center">Clicked</th>
            <th className="px-5 py-3 font-medium text-center">Click Rate</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={row.label} className={`border-b border-white/5 ${i === 0 && sorted.length > 1 ? "bg-green-500/5" : ""}`}>
              <td className="px-5 py-3 font-medium text-white">
                {row.label}
                {i === 0 && sorted.length > 1 && row.sent > 0 && (
                  <span className="ml-2 text-xs text-green-400">Best</span>
                )}
              </td>
              <td className="px-5 py-3 text-center text-slate-300">{row.sent}</td>
              <td className="px-5 py-3 text-center text-slate-300">{row.opened}</td>
              <td className="px-5 py-3 text-center font-medium text-purple-400">{row.openRate}</td>
              <td className="px-5 py-3 text-center text-slate-300">{row.clicked}</td>
              <td className="px-5 py-3 text-center font-medium text-blue-400">{row.clickRate}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                No data yet — send emails to start seeing analytics
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Best Practices Panel ─── */
function BestPractices() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Research-Backed Best Practices <span className="text-xs text-slate-500 font-normal">(2025-2026 data)</span></h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <h4 className="font-medium text-blue-400 mb-2">Optimal Send Times</h4>
          <ul className="space-y-1 text-slate-300">
            <li><span className="text-white font-medium">C-Suite (CTO/CIO):</span> Tue-Thu, 7-9 AM or 4:30-6 PM (25% higher reply rate early AM)</li>
            <li><span className="text-white font-medium">VP level:</span> Tue-Wed, 9-11 AM (avoid 12-2 PM)</li>
            <li><span className="text-white font-medium">Director:</span> Tue-Thu, 9:30-11:30 AM (most responsive group: 17.8% reply rate)</li>
            <li><span className="text-white font-medium">Manager:</span> Mon-Wed, 10 AM-12 PM</li>
            <li className="text-slate-500 mt-1">Friday is worst day across all titles. Avoid.</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-blue-400 mb-2">Subject Lines</h4>
          <ul className="space-y-1 text-slate-300">
            <li>21-40 characters: 49.1% avg open rate</li>
            <li>Trigger-event reference (new hire, funding): 54.7% open rate</li>
            <li>Company name inclusion: +22% open rate</li>
            <li>Numbers/data in subject: +113% improvement</li>
            <li>Avoid ALL CAPS, spam words, 60+ char subjects</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-blue-400 mb-2">Sequence Cadence (3-7-7)</h4>
          <ul className="space-y-1 text-slate-300">
            <li><span className="text-white font-medium">Day 0:</span> Initial email</li>
            <li><span className="text-white font-medium">Day 3:</span> First follow-up (brief, adds value)</li>
            <li><span className="text-white font-medium">Day 10:</span> Second follow-up (different angle)</li>
            <li>Follow-ups generate 42% of all replies</li>
            <li>93% of total replies come by Day 17</li>
            <li className="text-slate-500">48% of reps never send email 2 — huge missed opportunity</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-blue-400 mb-2">Message Content</h4>
          <ul className="space-y-1 text-slate-300">
            <li>50-125 words: highest reply rate (12% at 50-75 words)</li>
            <li>Personalized first line: reply rate jumps 3% → 7%</li>
            <li>One clear CTA per email</li>
            <li>Over 200 words drops to ~2% reply rate</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-blue-400 mb-2">Title-Specific Response Rates</h4>
          <ul className="space-y-1 text-slate-300">
            <li><span className="text-green-400 font-medium">Director: 17.8%</span> — most responsive (4.2x C-suite)</li>
            <li><span className="text-white font-medium">Manager: 12.9%</span> — strong but may lack budget authority</li>
            <li><span className="text-white font-medium">VP: 11.3%</span> — good authority + accessibility</li>
            <li><span className="text-slate-400 font-medium">C-Suite: 4-6%</span> — lowest response, heaviest filtering</li>
            <li className="text-slate-500 mt-1">Strategy: engage Directors as internal champions → leverage to reach CTO/CIO</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-blue-400 mb-2">Hook Types (by reply rate)</h4>
          <ul className="space-y-1 text-slate-300">
            <li><span className="text-green-400 font-medium">Timeline hooks: 10.0%</span> — &quot;planning for Q3?&quot;</li>
            <li><span className="text-white font-medium">Numbers hooks: 8.6%</span> — &quot;67% of peers have...&quot;</li>
            <li><span className="text-white font-medium">Social proof: 6.5%</span> — peer company examples</li>
            <li><span className="text-slate-400 font-medium">Problem hooks: 4.4%</span> — tech leaders already know their problems</li>
            <li className="text-slate-500 mt-1">CTO/VP Tech: timeline hooks hit 10.5% reply rate</li>
          </ul>
        </div>
      </div>
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="font-medium text-blue-400 mb-1">Key Benchmarks (2026)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300">
          <div><span className="text-white font-medium block">Avg Open Rate:</span> 27.7%</div>
          <div><span className="text-white font-medium block">Avg Reply Rate:</span> 3.4-5.1%</div>
          <div><span className="text-white font-medium block">Good Reply Rate:</span> 5-8%</div>
          <div><span className="text-white font-medium block">Elite Reply Rate:</span> 10%+</div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");

  const DASHBOARD_PW = "wuli2026";

  useEffect(() => {
    if (!authed) return;
    async function load() {
      const { data } = await supabase
        .from("events")
        .select("contact_id, event_type, metadata")
        .in("event_type", ["email_sent", "email_opened", "link_clicked"]);
      setEvents(data || []);
      setLoading(false);
    }
    load();
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-2">Email Analytics</h1>
          <p className="text-slate-400 text-sm mb-6">WULI TechMatch internal use only.</p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (password === DASHBOARD_PW) setAuthed(true);
              }
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />
          <button
            onClick={() => { if (password === DASHBOARD_PW) setAuthed(true); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  const sentEvents = events.filter((e) => e.event_type === "email_sent");
  const openEvents = events.filter((e) => e.event_type === "email_opened");
  const clickEvents = events.filter((e) => e.event_type === "link_clicked");

  /* ─── By Day of Week ─── */
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const byDay = DAYS.map((day) =>
    calcBreakdown(
      day,
      sentEvents.filter((e) => e.metadata?.sent_at_day === day),
      openEvents,
      clickEvents
    )
  ).filter((r) => r.sent > 0);

  /* ─── By Hour of Day ─── */
  const byHour: BreakdownRow[] = [];
  for (let h = 6; h <= 20; h++) {
    const label = h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
    const row = calcBreakdown(
      label,
      sentEvents.filter((e) => e.metadata?.sent_at_hour === h),
      openEvents,
      clickEvents
    );
    if (row.sent > 0) byHour.push(row);
  }

  /* ─── By Recipient Title ─── */
  const titles = Array.from(new Set(sentEvents.map((e) => e.metadata?.recipient_title).filter(Boolean))) as string[];
  const byTitle = titles.map((title) =>
    calcBreakdown(
      title,
      sentEvents.filter((e) => e.metadata?.recipient_title === title),
      openEvents,
      clickEvents
    )
  );

  /* ─── By Subject Line ─── */
  const subjects = Array.from(new Set(sentEvents.map((e) => e.metadata?.subject).filter(Boolean))) as string[];
  const bySubject = subjects.map((subj) =>
    calcBreakdown(
      subj.length > 50 ? subj.slice(0, 50) + "..." : subj,
      sentEvents.filter((e) => e.metadata?.subject === subj),
      openEvents,
      clickEvents
    )
  );

  /* ─── By Sequence Number ─── */
  const bySequence = [1, 2, 3].map((seq) =>
    calcBreakdown(
      `Email ${seq}`,
      sentEvents.filter((e) => e.metadata?.sequence_number === seq),
      openEvents.filter((e) => e.metadata?.sequence_number === seq),
      clickEvents
    )
  ).filter((r) => r.sent > 0);

  /* ─── Overall Stats ─── */
  const totalSent = new Set(sentEvents.map((e) => e.contact_id)).size;
  const totalOpened = new Set(openEvents.map((e) => e.contact_id)).size;
  const totalClicked = new Set(clickEvents.map((e) => e.contact_id)).size;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-white">WULI TechMatch</span>
          <span className="ml-3 text-slate-400 text-sm">Email Analytics</span>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
            Pipeline
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
            Back to site
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-16 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Email Analytics</h1>
        <p className="text-slate-400 mb-8">Performance insights by timing, title, and content</p>

        {loading ? (
          <div className="text-center text-slate-400 py-20">Loading analytics...</div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-4xl font-bold">{totalSent}</div>
                <div className="text-slate-400 text-sm mt-1">Total Sent</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-4xl font-bold text-purple-400">{totalOpened}</div>
                <div className="text-slate-400 text-sm mt-1">Unique Opens</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-4xl font-bold text-blue-400">{totalClicked}</div>
                <div className="text-slate-400 text-sm mt-1">Link Clicks</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-4xl font-bold text-green-400">
                  {totalSent > 0 ? `${Math.round((totalOpened / totalSent) * 100)}%` : "—"}
                </div>
                <div className="text-slate-400 text-sm mt-1">Avg Open Rate</div>
              </div>
            </div>

            {/* Breakdowns */}
            <div className="space-y-8">
              <BreakdownTable title="Day of Week Performance" rows={byDay} />
              <BreakdownTable title="Time of Day Performance" rows={byHour} />
              <BreakdownTable title="Recipient Title Performance" rows={byTitle} />
              <BreakdownTable title="Sequence Step Performance" rows={bySequence} />
              <BreakdownTable title="Subject Line Performance" rows={bySubject} />
              <BestPractices />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
