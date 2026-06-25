"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface CA {
  id: string;
  date: string;
  category: string;
  title: string;
  content: string;
  source: string | null;
}

const CATEGORIES = [
  "National",
  "International",
  "Economy",
  "Sports",
  "Science & Tech",
  "Awards",
  "Govt Schemes",
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminCurrentAffairsPage() {
  const [adminKey, setAdminKey] = useState("dev-admin");
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState("National");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [items, setItems] = useState<CA[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedUrl, setFeedUrl] = useState("https://www.thehindu.com/news/national/feeder/default.rss");
  const [feedCategory, setFeedCategory] = useState("National");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/current-affairs?limit=50", { cache: "no-store" });
    const data = await res.json();
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/current-affairs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ date, category, title, content, source: source || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Failed to add");
      setMsg("✓ Added");
      setTitle("");
      setContent("");
      setSource("");
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this current-affairs item?")) return;
    const res = await fetch(`/api/admin/current-affairs?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function importFeed() {
    setImporting(true);
    setImportMsg(null);
    try {
      const res = await fetch("/api/admin/current-affairs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ url: feedUrl, category: feedCategory, limit: 15 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Import failed");
      setImportMsg(`✓ Imported ${data.imported}, skipped ${data.skipped} (already present). Review them below and delete any that aren’t exam-relevant.`);
      load();
    } catch (e) {
      setImportMsg(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-examnavy text-white">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <Link href="/admin" className="text-sm text-blue-300 hover:underline">
            ← Admin dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Manage Current Affairs</h1>
          <p className="text-sm text-slate-300">
            Add the day’s current affairs from a trusted source (newspaper / CA site). Students read
            these in the Current Affairs section.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-5 px-6 py-8">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="font-medium text-slate-700">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-700">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-700">Admin key</span>
              <input
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="mt-3 block text-sm">
            <span className="font-medium text-slate-700">Headline / title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. India launches XYZ mission"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className="font-medium text-slate-700">Details</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Key facts students should remember…"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className="font-medium text-slate-700">Source (optional)</span>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. The Hindu, 25 Jun 2026"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={add}
              disabled={saving || !title.trim() || !content.trim()}
              className="rounded-lg bg-examblue px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
            >
              {saving ? "Adding…" : "Add current affair"}
            </button>
            {msg && <span className="text-sm text-slate-500">{msg}</span>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Auto-import from a news feed (RSS)
          </h2>
          <p className="mb-3 text-xs text-slate-400">
            Pulls the latest items from any RSS feed. Raw news isn’t exam-curated — review and delete
            what isn’t relevant after importing. (PIB / The Hindu feeds work well for exams.)
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="https://...rss"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={feedCategory}
              onChange={(e) => setFeedCategory(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={importFeed}
              disabled={importing || !feedUrl.trim()}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300"
            >
              {importing ? "Importing…" : "Import latest 15"}
            </button>
            {importMsg && <span className="text-xs text-slate-500">{importMsg}</span>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent entries ({items.length})
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing added yet.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id} className="flex items-start justify-between gap-3 border-t border-slate-100 py-2">
                  <div>
                    <span className="text-xs text-slate-400">
                      {it.date} · {it.category}
                    </span>
                    <p className="text-sm font-medium text-slate-800">{it.title}</p>
                  </div>
                  <button
                    onClick={() => remove(it.id)}
                    className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
