// frontend/src/app/ui/GridHeader.tsx
"use client";

import React from "react";
import { BAR_COUNT } from "./types";
import { ui } from "./theme";

export function GridHeader() {
  return (
    <div className="grid grid-cols-12 bg-white/[0.04] border-b border-white/[0.08]">
      {/* Track label column */}
      <div className="col-span-3 px-3 py-2 text-xs text-white/40 border-r border-white/[0.08]">
        Tracks
      </div>

      {/* Bar numbers */}
      <div className="col-span-9 px-3 py-2">
        <div
          className="grid gap-1 text-[10px] text-white/40"
          style={{ gridTemplateColumns: `repeat(${BAR_COUNT}, minmax(0, 1fr))` }}
        >
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
