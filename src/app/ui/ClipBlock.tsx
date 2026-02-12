// frontend/src/app/ui/ClipBlock.tsx
"use client";

import React from "react";
import { Clip, BAR_COUNT } from "./types";
import { mozartGradient, cx } from "./theme";

export function ClipBlock({ clip, pulse }: { clip: Clip; pulse?: boolean }) {
  const leftPct = ((clip.startBar - 1) / BAR_COUNT) * 100;
  const widthPct = (clip.bars / BAR_COUNT) * 100;

  return (
    <div
      className={cx(
        "absolute h-10 rounded-md border px-2 py-1 text-xs text-white/90 shadow-sm",
        "border-white/[0.12] bg-white/[0.08] backdrop-blur-sm",
        "transition duration-150",
        pulse && "ring-2 ring-white/30 shadow-[0_0_22px_rgba(255,79,216,0.25)]"
      )}
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        top: "4px",
        transform: pulse ? "scale(1.01)" : "scale(1)",
      }}
      title={`${clip.name} • Bars ${clip.startBar}–${clip.startBar + clip.bars - 1}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate">{clip.name}</span>

        {clip.variant && (
          <span className="rounded-full px-2 py-[1px] text-[10px] border border-white/[0.15] bg-white/[0.05]">
            {clip.variant}
          </span>
        )}
      </div>

      <div className={`absolute left-0 top-0 h-1 w-full rounded-t-md ${mozartGradient}`} />
    </div>
  );
}
