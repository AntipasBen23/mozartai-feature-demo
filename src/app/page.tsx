// frontend/src/app/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "./ui/Badge";
import { Controls } from "./ui/Controls";
import { GridHeader } from "./ui/GridHeader";
import { TrackRow } from "./ui/TrackRow";
import { MidiMonitor } from "./ui/MidiMonitor";
import { OnScreenPiano } from "./ui/OnScreenPiano";
import { BAR_COUNT, Genre, Project, Track } from "./ui/types";
import { cx, ui } from "./ui/theme";
import { useMidi, MidiNoteEvent } from "./hooks/useMidi";
import { useSynth } from "./hooks/useSynth";

type InputMode = "Auto" | "On-screen" | "MIDI";
type BusEvent = MidiNoteEvent & { source: "MIDI" | "UI" };

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

  const [mode, setMode] = useState<InputMode>("Auto");

  const [aiLog, setAiLog] = useState<string[]>([
    "Tip: click anywhere once to enable audio.",
    "Input: Auto uses MIDI if found, otherwise on-screen piano.",
  ]);
  const [command, setCommand] = useState("");

  const [tracks, setTracks] = useState<Track[]>([
    { id: "t1", name: "Piano", kind: "Piano", clips: [{ id: "c1", name: "Your MIDI Take", startBar: 1, bars: 8 }] },
    { id: "t2", name: "Bass", kind: "Bass", clips: [{ id: "c2", name: "AI Bass (mock)", startBar: 1, bars: 8, variant: "A" }] },
    { id: "t3", name: "Drums", kind: "Drums", clips: [{ id: "c3", name: "AI Drums (mock)", startBar: 1, bars: 8, variant: "A" }] },
    { id: "t4", name: "Pads", kind: "Pads", clips: [{ id: "c4", name: "AI Pads (mock)", startBar: 9, bars: 8, variant: "B" }] },
  ]);

  const midi = useMidi(64);
  const synth = useSynth();

  // Combined input event bus (MIDI + UI)
  const [busEvents, setBusEvents] = useState<BusEvent[]>([]);
  const BUS_MAX = 64;

  function pushEvent(ev: BusEvent) {
    setBusEvents((prev) => [ev, ...prev].slice(0, BUS_MAX));
  }

  // Piano clip pulse
  const [pianoPulse, setPianoPulse] = useState(false);
  const pulseTimer = useRef<number | null>(null);

  function pulsePiano() {
    setPianoPulse(true);
    if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setPianoPulse(false), 120);
  }

  // Decide if we should accept physical MIDI right now.
  const allowMidi =
    mode === "MIDI" ||
    (mode === "Auto" &&
      midi.status === "connected" &&
      !!midi.inputName &&
      !midi.inputName.includes("No MIDI devices"));

  // Wire physical MIDI -> synth + bus
  const lastMidiTs = useRef<number>(0);
  useEffect(() => {
    if (!allowMidi) return;

    const ev = midi.events[0];
    if (!ev) return;
    if (ev.ts === lastMidiTs.current) return;
    lastMidiTs.current = ev.ts;

    pushEvent({ ...ev, source: "MIDI" });

    if (ev.type === "noteon") {
      synth.noteOn(ev.note, ev.velocity);
      pulsePiano();
    } else {
      synth.noteOff(ev.note);
    }
  }, [allowMidi, midi.events, synth]);

  function toggleTrack(id: string, field: "muted" | "solo") {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: !t[field] } : t)));
  }

  function runMockAI(action: string) {
    setAiLog((l) => [`Applied: ${action}`, `Ctx: {${genre}, ${keySig}, ${bpm}bpm, lock:${styleLock}}`, ...l].slice(0, 10));
    setTracks((prev) =>
      prev.map((t) => {
        if (t.kind === "Bass" || t.kind === "Drums" || t.kind === "Pads") {
          return { ...t, clips: t.clips.map((c) => ({ ...c, name: c.name.replace(/\(mock.*\)/, `(mock • ${action})`) })) };
        }
        return t;
      })
    );
  }

  function submitCommand(e: React.FormEvent) {
    e.preventDefault();
    const text = command.trim();
    if (!text) return;

    setAiLog((l) => [`You: “${text}”`, ...l].slice(0, 10));
    setCommand("");

    const lower = text.toLowerCase();
    if (lower.includes("darker")) runMockAI("Lower key + minor tension");
    else if (lower.includes("bounce")) runMockAI("Swing + syncopation");
    else if (lower.includes("tension")) runMockAI("Passing chords + cadence");
    else if (lower.includes("trance")) setGenre("Trance");
    else if (lower.includes("jazz")) setGenre("Jazz");
    else if (lower.includes("classical")) setGenre("Classical");
    else runMockAI("Refine groove + harmonize");
  }

  // On-screen piano handlers (UI -> synth + bus)
  function handleUiNoteOn(note: number, velocity: number = 110) {
    if (mode === "MIDI") return;

    const ev: BusEvent = {
      type: "noteon",
      note,
      velocity,
      channel: 0,
      ts: performance.now(),
      source: "UI",
    };
    pushEvent(ev);

    synth.noteOn(note, velocity);
    pulsePiano();
  }

  function handleUiNoteOff(note: number) {
    if (mode === "MIDI") return;

    const ev: BusEvent = {
      type: "noteoff",
      note,
      velocity: 0,
      channel: 0,
      ts: performance.now(),
      source: "UI",
    };
    pushEvent(ev);

    synth.noteOff(note);
  }

  const midiChip =
    !midi.supported ? "MIDI: unsupported" : `MIDI: ${midi.status}${midi.inputName ? ` (${midi.inputName})` : ""}`;
  const audioChip = !synth.supported ? "Audio: unsupported" : `Audio: ${synth.status}`;

  function clearMonitor() {
    midi.clear();
    setBusEvents([]);
  }

  return (
    <div
      className={cx(ui.page, "bg-black")}
      onPointerDown={() => synth.ensureStarted()}
      onKeyDown={() => synth.ensureStarted()}
      tabIndex={-1}
    >
      <div className={ui.shell}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>IGEM</Badge>
            <Badge>Project: {active.name}</Badge>
            <Badge>{genre}</Badge>
            <Badge>{keySig}</Badge>
            <Badge>{bpm} BPM</Badge>
            <Badge className="text-white/60">{midiChip}</Badge>
            <Badge className="text-white/60">{audioChip}</Badge>
            <Badge className="text-white/60">Input: {mode}</Badge>
          </div>
          <div className="text-xs text-white/40">Bars 1–{BAR_COUNT} • Frontend-only</div>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-4">
          <aside className={cx("col-span-12 md:col-span-3", ui.panel, "p-3")}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white/90">Projects</div>
              <div className="text-xs text-white/40">Library</div>
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
                    setAiLog((l) => [`Loaded: ${p.name}`, ...l].slice(0, 10));
                  }}
                  className={cx(
                    "w-full rounded-lg border px-3 py-2 text-left transition",
                    p.id === activeProjectId ? "border-white/15 bg-white/[0.08]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/90">{p.name}</span>
                    <span className="text-xs text-white/40">{p.updated}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                    <span>{p.genre}</span><span>•</span><span>{p.key}</span><span>•</span><span>{p.bpm} BPM</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white/80">Style Lock</div>
                  <div className="mt-1 text-xs text-white/40">Stops AI drift (key/tempo/motif).</div>
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={styleLock}
                    onChange={(e) => setStyleLock(e.target.checked)}
                    className="h-4 w-4 accent-white"
                  />
                  <span className="text-sm text-white/80">{styleLock ? "ON" : "OFF"}</span>
                </label>
              </div>
            </div>
          </aside>

          <main className="col-span-12 md:col-span-9 space-y-4">
            <Controls
              genre={genre}
              setGenre={setGenre}
              keySig={keySig}
              setKeySig={setKeySig}
              bpm={bpm}
              setBpm={setBpm}
              isPlaying={isPlaying}
              onPlayToggle={() => setIsPlaying((v) => !v)}
              onStop={() => {
                setIsPlaying(false);
                synth.stopAll();
                setAiLog((l) => ["Stopped.", ...l].slice(0, 10));
              }}
              onHarmonize={() => runMockAI("Harmonize + add genre groove")}
            />

            <OnScreenPiano
              mode={mode}
              setMode={setMode}
              onNoteOn={handleUiNoteOn}
              onNoteOff={handleUiNoteOff}
              label="Input (MIDI + On-screen)"
            />

            <MidiMonitor
              events={busEvents}
              status={midi.status}
              inputName={midi.inputName}
              onClear={clearMonitor}
            />

            <section className={cx(ui.panel, ui.panelPad)}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white/90">Timeline</div>
                <div className="text-xs text-white/40">Drag/drop later</div>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
                <GridHeader />
                {tracks.map((t) => (
                  <TrackRow
                    key={t.id}
                    track={t}
                    onToggleMute={() => toggleTrack(t.id, "muted")}
                    onToggleSolo={() => toggleTrack(t.id, "solo")}
                    pulseClipId={t.id === "t1" ? "c1" : undefined}
                    pulse={t.id === "t1" ? pianoPulse : false}
                  />
                ))}
              </div>
            </section>

            <section className={cx(ui.panel, ui.panelPad)}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white/90">Natural Language Edit</div>
                <div className="text-xs text-white/40">Intent → edits (mock)</div>
              </div>

              <form onSubmit={submitCommand} className="mt-3 flex gap-2">
                <input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder='Try: "make it darker", "add tension", "more bounce"'
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-white/20"
                />
                <button type="submit" className={ui.btnPrimary}>Apply</button>
              </form>

              <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs font-semibold text-white/70">Log</div>
                <ul className="mt-2 space-y-1 text-xs text-white/50">
                  {aiLog.map((line, i) => (
                    <li key={i} className="truncate">{line}</li>
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
