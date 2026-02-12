// frontend/src/app/ui/Controls.tsx
"use client";

import React from "react";
import { Genre } from "./types";
import { ui, mozartGradient, cx } from "./theme";

type Props = {
  genre: Genre;
  setGenre: (g: Genre) => void;
  keySig: string;
  setKeySig: (k: string) => void;
  bpm: number;
  setBpm: (n: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onStop: () => void;
  onHarmonize: () => void;
};

export function Controls({
  genre,
  setGenre,
  keySig,
  setKeySig,
  bpm,
  setBpm,
  isPlaying,
  onPlayToggle,
  onStop,
  onHarmonize,
}: Props) {
  return (
    <section className={cx(ui.panel, ui.panelPad)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Transport */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPlayToggle}
            className={ui.btnPrimary}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={onStop}
            className={ui.btnGhost}
          >
            Stop
          </button>

          <span className="ml-2 text-xs text-white/40">
            Grid: 1/16 • Demo Mode
          </span>
        </div>

        {/* Musical controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={ui.inputWrap}>
            <span className="text-xs text-white/40">Genre</span>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
              className={ui.select}
            >
              <option value="Jazz">Jazz</option>
              <option value="Trance">Trance</option>
              <option value="Classical">Classical</option>
            </select>
          </div>

          <div className={ui.inputWrap}>
            <span className="text-xs text-white/40">Key</span>
            <input
              value={keySig}
              onChange={(e) => setKeySig(e.target.value)}
              placeholder="C minor"
              className={ui.input}
            />
          </div>

          <div className={ui.inputWrap}>
            <span className="text-xs text-white/40">BPM</span>
            <input
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value || 0))}
              className={ui.input}
              type="number"
              min={40}
              max={220}
            />
          </div>

          <button
            onClick={onHarmonize}
            className={cx(
              "relative overflow-hidden text-black font-semibold",
              ui.btn,
              mozartGradient
            )}
          >
            Harmonize (Mock AI)
          </button>
        </div>
      </div>
    </section>
  );
}
