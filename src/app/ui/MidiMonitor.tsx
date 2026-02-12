// frontend/src/app/ui/MidiMonitor.tsx
"use client";

import React from "react";
import { ui, cx } from "./theme";
import { MidiNoteEvent } from "../hooks/useMidi";

type Props = {
  events: MidiNoteEvent[];
  status: string;
  inputName: string | null;
  onClear: () => void;
};

function midiToNoteName(note: number) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(note / 12) - 1;
  const name = names[note % 12];
  return `${name}${octave}`;
}

export function MidiMonitor({ events, status, inputName, onClear }: Props) {
  return (
    <section className={cx(ui.panel, ui.panelPad)}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white/90">
          MIDI Monitor
        </div>
        <div className="text-xs text-white/40">
          {status}
          {inputName ? ` • ${inputName}` : ""}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
        {events.length === 0 ? (
          <div className="text-xs text-white/40">
            Play your MIDI keyboard…
          </div>
        ) : (
          <ul className="space-y-1 text-xs text-white/70">
            {events.slice(0, 10).map((ev, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>
                  {ev.type === "noteon" ? "On" : "Off"} •{" "}
                  {midiToNoteName(ev.note)}
                </span>
                <span className="text-white/40">
                  vel {ev.velocity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={onClear}
          className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-white/70 hover:bg-white/[0.08]"
        >
          Clear
        </button>
      </div>
    </section>
  );
}
