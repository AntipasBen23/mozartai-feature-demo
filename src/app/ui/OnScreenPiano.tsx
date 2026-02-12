// frontend/src/app/ui/OnScreenPiano.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import { cx, mozartGradient, ui } from "./theme";

type Mode = "Auto" | "On-screen" | "MIDI";

type Props = {
  mode: Mode;
  setMode: (m: Mode) => void;
  onNoteOn: (note: number, velocity?: number) => void;
  onNoteOff: (note: number) => void;
  label?: string;
};

type KeyDef = { note: number; name: string; black: boolean };

function noteName(note: number) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(note / 12) - 1;
  return `${names[note % 12]}${octave}`;
}

export function OnScreenPiano({
  mode,
  setMode,
  onNoteOn,
  onNoteOff,
  label = "Input",
}: Props) {
  const [octave, setOctave] = useState(4); // C4..B4 by default
  const [active, setActive] = useState<Record<number, boolean>>({});
  const downRef = useRef(false);

  const keys = useMemo<KeyDef[]>(() => {
    const base = (octave + 1) * 12; // C{octave}
    const whiteOffsets = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
    const blackMap: Record<number, number> = {
      0: 1,  // C#
      1: 3,  // D#
      3: 6,  // F#
      4: 8,  // G#
      5: 10, // A#
    };

    const out: KeyDef[] = [];
    for (let i = 0; i < 7; i++) {
      const whiteNote = base + whiteOffsets[i];
      out.push({ note: whiteNote, name: noteName(whiteNote), black: false });
      if (blackMap[i] !== undefined) {
        const blackNote = base + blackMap[i];
        out.push({ note: blackNote, name: noteName(blackNote), black: true });
      }
    }
    // Keep layout predictable: sort by note
    return out.sort((a, b) => a.note - b.note);
  }, [octave]);

  function press(note: number) {
    if (mode === "MIDI") return; // ignore clicks in MIDI-only mode
    setActive((s) => ({ ...s, [note]: true }));
    onNoteOn(note, 110);
  }

  function release(note: number) {
    setActive((s) => ({ ...s, [note]: false }));
    onNoteOff(note);
  }

  function onPointerDown(note: number) {
    downRef.current = true;
    press(note);
  }

  function onPointerEnter(note: number) {
    // allow click-drag glissando
    if (!downRef.current) return;
    press(note);
  }

  function onPointerUp(note: number) {
    downRef.current = false;
    release(note);
  }

  function stopAll() {
    downRef.current = false;
    Object.keys(active).forEach((k) => {
      const n = Number(k);
      if (active[n]) onNoteOff(n);
    });
    setActive({});
  }

  return (
    <section className={cx(ui.panel, ui.panelPad)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-white/90">{label}</div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/40">Mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className={cx(
              "rounded-md border border-white/12 bg-white/[0.03] px-2 py-1 text-white/80 outline-none",
              "[&>option]:bg-black"
            )}
          >
            <option value="Auto">Auto</option>
            <option value="On-screen">On-screen</option>
            <option value="MIDI">MIDI</option>
          </select>

          <div className="ml-2 flex items-center gap-1">
            <button
              className="rounded-md border border-white/12 bg-white/[0.03] px-2 py-1 text-white/70 hover:bg-white/[0.06]"
              onClick={() => setOctave((o) => Math.max(1, o - 1))}
              type="button"
            >
              −
            </button>
            <span className="min-w-[64px] text-center text-white/60">
              Oct {octave} ({noteName((octave + 1) * 12)})
            </span>
            <button
              className="rounded-md border border-white/12 bg-white/[0.03] px-2 py-1 text-white/70 hover:bg-white/[0.06]"
              onClick={() => setOctave((o) => Math.min(7, o + 1))}
              type="button"
            >
              +
            </button>
          </div>

          <button
            className="ml-2 rounded-md border border-white/12 bg-white/[0.03] px-2 py-1 text-white/70 hover:bg-white/[0.06]"
            onClick={stopAll}
            type="button"
          >
            Stop notes
          </button>
        </div>
      </div>

      {/* Piano */}
      <div className="mt-3 relative select-none">
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-2">
          {/* White keys row (we render both but style by black flag) */}
          {keys
            .filter((k) => !k.black)
            .map((k) => (
              <button
                key={k.note}
                type="button"
                onPointerDown={() => onPointerDown(k.note)}
                onPointerEnter={() => onPointerEnter(k.note)}
                onPointerUp={() => onPointerUp(k.note)}
                onPointerLeave={() => release(k.note)}
                className={cx(
                  "relative h-24 flex-1 rounded-md border transition",
                  active[k.note]
                    ? "border-white/30 bg-white/90"
                    : "border-white/15 bg-white/80 hover:bg-white/90",
                  mode === "MIDI" && "opacity-40 cursor-not-allowed"
                )}
                title={k.name}
              >
                <span className="absolute bottom-2 left-2 text-[10px] text-black/70">
                  {k.name}
                </span>
              </button>
            ))}
        </div>

        {/* Black keys overlay */}
        <div className="pointer-events-none absolute left-0 right-0 top-2 flex gap-1 px-2">
          {/* 7 white keys => 7 slots; black keys sit between certain whites */}
          {Array.from({ length: 7 }).map((_, i) => {
            const whiteOffsets = [0, 2, 4, 5, 7, 9, 11];
            const base = (octave + 1) * 12;
            const whiteNote = base + whiteOffsets[i];
            const blackForSlot: Record<number, number> = { 0: 1, 1: 3, 3: 6, 4: 8, 5: 10 };
            const blackOffset = blackForSlot[i];
            const blackNote = blackOffset !== undefined ? base + blackOffset : null;

            return (
              <div key={whiteNote} className="relative flex-1">
                {blackNote !== null ? (
                  <button
                    type="button"
                    onPointerDown={() => onPointerDown(blackNote)}
                    onPointerEnter={() => onPointerEnter(blackNote)}
                    onPointerUp={() => onPointerUp(blackNote)}
                    onPointerLeave={() => release(blackNote)}
                    className={cx(
                      "pointer-events-auto absolute -left-1/4 top-0 h-16 w-1/2 rounded-md border shadow",
                      active[blackNote]
                        ? `border-white/30 ${mozartGradient}`
                        : "border-white/15 bg-black hover:bg-black/80",
                      mode === "MIDI" && "opacity-40 cursor-not-allowed"
                    )}
                    title={noteName(blackNote)}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 text-xs text-white/40">
        Tip: <span className="text-white/60">Auto</span> uses MIDI if available, otherwise the on-screen piano.
      </div>
    </section>
  );
}
