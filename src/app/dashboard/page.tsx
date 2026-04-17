"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  company_name: string;
  trigger_type: string;
  sequence_name: string;
  email1_sent: boolean;
  email2_sent: boolean;
  email3_sent: boolean;
  created_at: string;
}

interface Event {
  contact_id: string;
  event_type: string;
}

interface Lead {
  contact_id: string;
  meeting_booked: boolean;
}

const TRIGGER_LABELS: Record<string, string> = {
  "new-it-leader": "🔥 New IT Leader",
  "funding-round": "🚀 Funding Round",
  "layoffs": "💰 Restructuring",
  "hiring-cc-agents": "📞 Hiring CC Agents",
  "legacy-migration": "🔄 Legacy Migration",
  "security": "🔒 Security",
};

function Badge({ label, color }: { label: string; color: "gray" | "yellow" | "green" | "blue" }) {
  const colors = {
    gray: "bg-white/5 text-slate-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    green: "bg-green-500/20 text-green-400",
    blue: "bg-blue-500/20 text-blue-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>{label}</span>
  );
}

function EmailBadge({ sent1, sent2, sent3 }: { sent1: boolean; sent2: boolean; sent3: boolean }) {
  const count = [sent1, sent2, sent3].filter(Boolean).length;
  if (count === 0) return <Badge label="Not sent" color="gray" />;
  if (count === 3) return <Badge label="All 3 sent" color="green" />;
  return <Badge label={`${count}/3 sent`} color="yellow" />;
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const DASHBOARD_PW = "wuli2026";

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("wuli_dashboard_auth") === "true") {
      setAuthed(true);
    }
  }, []);

  const stats = {
    total: contacts.length,
    sent: contacts.filter(c => events.some(e => e.contact_id === c.id && e.event_type === "email_sent")).length,
    opened: contacts.filter(c => events.some(e => e.contact_id === c.id && e.event_type === "email_opened")).length,
    clicked: contacts.filter(c => events.some(e => e.contact_id === c.id && e.event_type === "link_clicked")).length,
    completed: contacts.filter(c => events.some(e => e.contact_id === c.id && e.event_type === "analyzer_completed")).length,
    booked: contacts.filter(c => leads.some(l => l.contact_id === c.id && l.meeting_booked)).length,
  };

  useEffect(() => {
    if (!authed) return;
    async function load() {
      const [{ data: c }, { data: e }, { data: l }] = await Promise.all([
        supabase.from("contacts").select("*").order("created_at", { ascending: false }),
        supabase.from("events").select("contact_id, event_type"),
        supabase.from("leads").select("contact_id, meeting_booked").eq("meeting_booked", true),
      ]);
      setContacts(c || []);
      setEvents(e || []);
      setLeads(l || []);
      setLoading(false);
    }
    load();
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard Access</h1>
          <p className="text-slate-400 text-sm mb-6">WULI TechMatch internal use only.</p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (password === DASHBOARD_PW) { setAuthed(true); sessionStorage.setItem("wuli_dashboard_auth", "true"); }
                else setError("Incorrect password");
              }
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            onClick={() => {
              if (password === DASHBOARD_PW) { setAuthed(true); sessionStorage.setItem("wuli_dashboard_auth", "true"); }
              else setError("Incorrect password");
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-white">WULI TechMatch</span>
          <span className="ml-3 text-slate-400 text-sm">Pipeline Dashboard</span>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/analytics" className="text-blue-400 hover:text-blue-300 text-sm transition-colors font-medium">Email Analytics</Link>
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">Back to site</Link>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-16 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Pipeline</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { label: "Total Contacts", value: stats.total, color: "text-white" },
            { label: "Emails Sent", value: stats.sent, color: "text-slate-300" },
            { label: "Emails Opened", value: stats.opened, color: "text-purple-400" },
            { label: "Link Clicks", value: stats.clicked, color: "text-blue-400" },
            { label: "Analyzer Completed", value: stats.completed, color: "text-yellow-400" },
            { label: "Meetings Booked", value: stats.booked, color: "text-green-400" },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading...</div>
          ) : contacts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-slate-400 text-lg mb-2">No contacts yet</div>
              <div className="text-slate-500 text-sm">Run signal detection to add targets.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-left">
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Trigger</th>
                    <th className="px-4 py-3 font-medium">Emails</th>
                    <th className="px-4 py-3 font-medium">Opened</th>
                    <th className="px-4 py-3 font-medium">Link Clicked</th>
                    <th className="px-4 py-3 font-medium">Analyzer</th>
                    <th className="px-4 py-3 font-medium">Meeting</th>
                    <th className="px-4 py-3 font-medium">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => {
                    const opened = events.some(e => e.contact_id === c.id && e.event_type === "email_opened");
                    const clicked = events.some(e => e.contact_id === c.id && e.event_type === "link_clicked");
                    const completed = events.some(e => e.contact_id === c.id && e.event_type === "analyzer_completed");
                    const booked = leads.some(l => l.contact_id === c.id && l.meeting_booked);
                    return (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{c.name || "—"}</div>
                          <div className="text-slate-400 text-xs">{c.title || ""}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{c.company_name}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs">{TRIGGER_LABELS[c.trigger_type] || c.trigger_type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <EmailBadge sent1={c.email1_sent} sent2={c.email2_sent} sent3={c.email3_sent} />
                        </td>
                        <td className="px-4 py-3">
                          {opened ? <Badge label="✓ Opened" color="blue" /> : <Badge label="No" color="gray" />}
                        </td>
                        <td className="px-4 py-3">
                          {clicked ? <Badge label="✓ Clicked" color="green" /> : <Badge label="No" color="gray" />}
                        </td>
                        <td className="px-4 py-3">
                          {completed ? <Badge label="✓ Done" color="green" /> : <Badge label="Pending" color="gray" />}
                        </td>
                        <td className="px-4 py-3">
                          {booked ? <Badge label="✓ Booked" color="green" /> : <Badge label="—" color="gray" />}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
