// frontend/src/app/ui/TrackRow.tsx
"use client";

import React from "react";
import { Track, BAR_COUNT } from "./types";
import { ClipBlock } from "./ClipBlock";
import { cx } from "./theme";

type Props = {
  track: Track;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  pulseClipId?: string;
  pulse?: boolean;
};

export function TrackRow({
  track,
  onToggleMute,
  onToggleSolo,
  pulseClipId,
  pulse,
}: Props) {
  return (
    <div className="grid grid-cols-12 border-b border-white/[0.06]">
      {/* Left: Track info */}
      <div className="col-span-3 border-r border-white/[0.06] px-3 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white/90">{track.name}</div>
            <div className="text-xs text-white/40">{track.kind}</div>
          </div>

          <div className="flex gap-1">
            <button
              onClick={onToggleMute}
              className={cx(
                "rounded-md border px-2 py-1 text-xs transition",
                track.muted
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
              )}
              type="button"
            >
              M
            </button>

            <button
              onClick={onToggleSolo}
              className={cx(
                "rounded-md border px-2 py-1 text-xs transition",
                track.solo
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
              )}
              type="button"
            >
              S
            </button>
          </div>
        </div>
      </div>

      {/* Right: Lane */}
      <div className="col-span-9 px-3 py-3">
        <div className="relative h-12 rounded-md bg-white/[0.03]">
          <div
            className="absolute inset-0 grid gap-1 p-1"
            style={{ gridTemplateColumns: `repeat(${BAR_COUNT}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <div key={i} className="rounded-sm bg-white/[0.03]" />
            ))}
          </div>

          <div className="absolute inset-0 p-1">
            {track.clips.map((clip) => (
              <ClipBlock
                key={clip.id}
                clip={clip}
                pulse={!!pulse && !!pulseClipId && clip.id === pulseClipId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
