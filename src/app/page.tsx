"use client";

import React, { useMemo, useState } from "react";

type Genre = "Jazz" | "Trance" | "Classical";

type Clip = {
  id: string;
  name: string;
  startBar: number; // 1-based
  bars: number;
  variant?: "A" | "B";
};

type Track = {
  id: string;
  name: string;
  kind: "Piano" | "Bass" | "Drums" | "Pads";
  muted?: boolean;
  solo?: boolean;
  clips: Clip[];
};

type Project = {
  id: string;
  name: string;
  genre: Genre;
  key: string;
  bpm: number;
  updated: string;
};

const BAR_COUNT = 16;

export default function Page() {
  const projects: Project[] = useMemo(
    () => [
      { id: "p1", name: "Midnight Sketch", genre: "Jazz", key: "C minor", bpm: 124, updated: "Today" },
      { id: "p2", name: "Neon Drive", genre: "Trance", key: "F# minor", bpm: 132, updated: "Yesterday" },
      { id: "p3", name: "Warm Cadence", genre: "Classical", key: "D major", bpm: 98, updated: "3 days ago" },
    ],
    []
  );

  const [activeProjectId, setActiveProjectId] = useState(projects[0].id);
  const active = projects.find((p) => p.id === activeProjectId)!;

  const [genre, setGenre] = useState<Genre>(active.genre);
  const [keySig, setKeySig] = useState(active.key);
  const [bpm, setBpm] = useState(active.bpm);
  const [styleLock, setStyleLock] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [command, setCommand] = useState("");
  const [aiLog, setAiLog] = useState<string[]>([
    "Ready. Play MIDI or draw notes, then ask: “make it darker”, “add tension”, “more bounce”.",
  ]);

  const [tracks, setTracks] = useState<Track[]>(() => [
    {
      id: "t1",
      name: "Piano",
      kind: "Piano",
      clips: [{ id: "c1", name: "Your MIDI Take", startBar: 1, bars: 8 }],
    },
    {
      id: "t2",
      name: "Bass",
      kind: "Bass",
      clips: [{ id: "c2", name: "AI Bass (mock)", startBar: 1, bars: 8, variant: "A" }],
    },
    {
      id: "t3",
      name: "Drums",
      kind: "Drums",
      clips: [{ id: "c3", name: "AI Drums (mock)", startBar: 1, bars: 8, variant: "A" }],
    },
    {
      id: "t4",
      name: "Pads",
      kind: "Pads",
      clips: [{ id: "c4", name: "AI Pads (mock)", startBar: 9, bars: 8, variant: "B" }],
    },
  ]);

  function toggleTrack(id: string, field: "muted" | "solo") {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: !t[field] } : t))
    );
  }

  function runMockAI(action: string) {
    const parsed = [
      `Parsed: { genre: "${genre}", key: "${keySig}", bpm: ${bpm}, styleLock: ${styleLock} }`,
      `Applied: ${action}`,
    ];
    setAiLog((l) => [...parsed, ...l].slice(0, 8));

    // Tiny “believable” UI change: rename mock clips based on action.
    setTracks((prev) =>
      prev.map((t) => {
        if (t.kind === "Bass" || t.kind === "Drums" || t.kind === "Pads") {
          return {
            ...t,
            clips: t.clips.map((c) => ({
              ...c,
              name: c.name.replace("(mock)", `(mock • ${action})`),
            })),
          };
        }
        return t;
      })
    );
  }

  function onSubmitCommand(e: React.FormEvent) {
    e.preventDefault();
    const text = command.trim();
    if (!text) return;

    setAiLog((l) => [`You: “${text}”`, ...l].slice(0, 8));
    setCommand("");

    // Super simple intent mapping for the demo
    const lower = text.toLowerCase();
    if (lower.includes("darker")) runMockAI("Lower key + add minor tension");
    else if (lower.includes("bounce")) runMockAI("Add swing + syncopation");
    else if (lower.includes("tension")) runMockAI("Add passing chords + cadence");
    else if (lower.includes("trance")) setGenre("Trance");
    else if (lower.includes("jazz")) setGenre("Jazz");
    else if (lower.includes("classical")) setGenre("Classical");
    else runMockAI("Refine groove + harmonize");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">IGEM Demo</h1>
            <p className="text-sm text-zinc-400">
              Interactive Genre-Accurate Editing + MIDI (frontend prototype)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge>Project: {active.name}</Badge>
            <Badge>{genre}</Badge>
            <Badge>{keySig}</Badge>
            <Badge>{bpm} BPM</Badge>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200">Projects</h2>
              <span className="text-xs text-zinc-500">Library</span>
            </div>

            <div className="mt-3 space-y-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setGenre(p.genre);
                    setKeySig(p.key);
                    setBpm(p.bpm);
                  }}
                  className={[
                    "w-full rounded-lg border px-3 py-2 text-left transition",
                    p.id === activeProjectId
                      ? "border-zinc-700 bg-zinc-800/60"
                      : "border-zinc-800 bg-zinc-950/30 hover:bg-zinc-800/30",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-zinc-500">{p.updated}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                    <span>{p.genre}</span>
                    <span>•</span>
                    <span>{p.key}</span>
                    <span>•</span>
                    <span>{p.bpm} BPM</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
              <h3 className="text-xs font-semibold text-zinc-300">Style Lock</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Prevents AI drift (key/tempo/motif stays stable).
              </p>
              <label className="mt-2 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={styleLock}
                  onChange={(e) => setStyleLock(e.target.checked)}
                  className="h-4 w-4 accent-zinc-200"
                />
                <span className="text-sm">{styleLock ? "ON" : "OFF"}</span>
              </label>
            </div>
          </aside>

          {/* Main */}
          <main className="col-span-12 md:col-span-9 space-y-4">
            {/* Transport */}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying((v) => !v)}
                    className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-white"
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setAiLog((l) => ["Stopped playback.", ...l].slice(0, 8));
                    }}
                    className="rounded-lg border border-zinc-700 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-800/30"
                  >
                    Stop
                  </button>
                  <span className="ml-2 text-xs text-zinc-500">
                    Bars: 1–{BAR_COUNT} • Grid: 1/16
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={genre} onChange={(v) => setGenre(v as Genre)} label="Genre" />
                  <Input value={keySig} onChange={setKeySig} label="Key" placeholder="C minor" />
                  <Input value={String(bpm)} onChange={(v) => setBpm(Number(v || 0))} label="BPM" />
                  <button
                    onClick={() => runMockAI("Harmonize + add genre groove")}
                    className="rounded-lg border border-zinc-700 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-800/30"
                  >
                    Harmonize (Mock AI)
                  </button>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Timeline</h2>
                <span className="text-xs text-zinc-500">Drag/drop later • MIDI capture next</span>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border border-zinc-800">
                <GridHeader />
                <div className="divide-y divide-zinc-800">
                  {tracks.map((t) => (
                    <TrackRow
                      key={t.id}
                      track={t}
                      onToggleMute={() => toggleTrack(t.id, "muted")}
                      onToggleSolo={() => toggleTrack(t.id, "solo")}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Command / AI Panel */}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Natural Language Edit</h2>
                <span className="text-xs text-zinc-500">Intent → structured edits (mock)</span>
              </div>

              <form onSubmit={onSubmitCommand} className="mt-3 flex gap-2">
                <input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder='Try: "make it darker", "add tension", "more bounce", "make it trance"'
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-white"
                >
                  Apply
                </button>
              </form>

              <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="text-xs font-semibold text-zinc-300">AI Log</div>
                <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                  {aiLog.map((line, i) => (
                    <li key={i} className="truncate">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI bits (kept inline; we can extract later) ---------- */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-300">
      {children}
    </span>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
      <span className="text-xs text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-24 bg-transparent text-sm outline-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
      <span className="text-xs text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm outline-none"
      >
        <option className="bg-zinc-950" value="Jazz">Jazz</option>
        <option className="bg-zinc-950" value="Trance">Trance</option>
        <option className="bg-zinc-950" value="Classical">Classical</option>
      </select>
    </label>
  );
}

function GridHeader() {
  return (
    <div className="grid grid-cols-12 bg-zinc-950/50">
      <div className="col-span-3 border-r border-zinc-800 px-3 py-2 text-xs text-zinc-500">
        Tracks
      </div>
      <div className="col-span-9 px-3 py-2">
        <div className="grid grid-cols-16 gap-1 text-[10px] text-zinc-500">
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <div key={i} className="text-center">
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackRow({
  track,
  onToggleMute,
  onToggleSolo,
}: {
  track: Track;
  onToggleMute: () => void;
  onToggleSolo: () => void;
}) {
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-3 border-r border-zinc-800 px-3 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{track.name}</div>
            <div className="text-xs text-zinc-500">{track.kind}</div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onToggleMute}
              className={[
                "rounded-md border px-2 py-1 text-xs",
                track.muted
                  ? "border-zinc-200 bg-zinc-200 text-zinc-950"
                  : "border-zinc-700 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-800/30",
              ].join(" ")}
            >
              M
            </button>
            <button
              onClick={onToggleSolo}
              className={[
                "rounded-md border px-2 py-1 text-xs",
                track.solo
                  ? "border-zinc-200 bg-zinc-200 text-zinc-950"
                  : "border-zinc-700 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-800/30",
              ].join(" ")}
            >
              S
            </button>
          </div>
        </div>
      </div>

      <div className="col-span-9 px-3 py-3">
        <div className="relative h-12 rounded-md bg-zinc-950/40">
          {/* bar grid */}
          <div className="absolute inset-0 grid grid-cols-16 gap-1 p-1">
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <div key={i} className="rounded-sm bg-zinc-900/40" />
            ))}
          </div>

          {/* clips */}
          <div className="absolute inset-0 p-1">
            {track.clips.map((c) => (
              <ClipBlock key={c.id} clip={c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClipBlock({ clip }: { clip: Clip }) {
  const leftPct = ((clip.startBar - 1) / BAR_COUNT) * 100;
  const widthPct = (clip.bars / BAR_COUNT) * 100;
  return (
    <div
      className="absolute h-10 rounded-md border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-200 shadow-sm"
      style={{ left: `${leftPct}%`, width: `${widthPct}%`, top: "4px" }}
      title={`${clip.name} • Bars ${clip.startBar}-${clip.startBar + clip.bars - 1}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate">{clip.name}</span>
        {clip.variant ? (
          <span className="rounded-full border border-zinc-700 bg-zinc-950/40 px-2 py-[1px] text-[10px] text-zinc-400">
            {clip.variant}
          </span>
        ) : null}
      </div>
    </div>
  );
}
