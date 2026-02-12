// frontend/src/app/ui/ClipBlock.tsx
"use client";

import React from "react";
import { Clip, BAR_COUNT } from "./types";
import { mozartGradient } from "./theme";

export function ClipBlock({ clip }: { clip: Clip }) {
  const leftPct = ((clip.startBar - 1) / BAR_COUNT) * 100;
  const widthPct = (clip.bars / BAR_COUNT) * 100;

  return (
    <div
      className={`absolute h-10 rounded-md border border-white/[0.12] 
                  bg-white/[0.08] backdrop-blur-sm px-2 py-1 text-xs 
                  text-white/90 shadow-sm`}
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        top: "4px",
      }}
      title={`${clip.name} • Bars ${clip.startBar}–${
        clip.startBar + clip.bars - 1
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate">{clip.name}</span>

        {clip.variant && (
          <span
            className={`rounded-full px-2 py-[1px] text-[10px] 
                        border border-white/[0.15] bg-white/[0.05]`}
          >
            {clip.variant}
          </span>
        )}
      </div>

      {/* Subtle gradient accent line */}
      <div
        className={`absolute left-0 top-0 h-1 w-full rounded-t-md ${mozartGradient}`}
      />
    </div>
  );
}
