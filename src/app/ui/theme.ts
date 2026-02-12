// frontend/src/app/ui/theme.ts
// Central place for UI tokens so we can swap to exact Mozart colors later.

export const mozart = {
  bg: "#07070A", // near-black
  panel: "rgba(255,255,255,0.06)",
  panel2: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.12)",
  text: "rgba(255,255,255,0.92)",
  muted: "rgba(255,255,255,0.62)",
  faint: "rgba(255,255,255,0.40)",
  // Gradient inspired by the Mozart logo (warm orange -> pink -> purple).
  // We'll replace these with exact sampled hex once we lock it.
  gradFrom: "#FFB86B",
  gradMid: "#FF4FD8",
  gradTo: "#8B5CF6",
};

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// Tailwind-friendly class presets (keeps components short)
export const ui = {
  page: "min-h-screen",
  shell: "mx-auto max-w-7xl px-4 py-6",
  panel: "rounded-xl border bg-white/[0.05] border-white/[0.10]",
  panelPad: "p-4",
  subtle: "bg-white/[0.03]",
  text: "text-white/90",
  muted: "text-white/60",
  faint: "text-white/40",
  btn: "rounded-lg px-3 py-2 text-sm transition",
  btnPrimary:
    "rounded-lg px-3 py-2 text-sm font-semibold text-black bg-white hover:bg-white/90",
  btnGhost:
    "rounded-lg px-3 py-2 text-sm border border-white/15 bg-white/[0.03] hover:bg-white/[0.06]",
  badge:
    "rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-xs text-white/70",
  inputWrap:
    "flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2",
  input:
    "w-24 bg-transparent text-sm outline-none placeholder:text-white/30",
  select:
    "bg-transparent text-sm outline-none [&>option]:bg-black",
};

// Optional: inline gradient string for backgrounds / accents
export const mozartGradient =
  "bg-gradient-to-r from-[#FFB86B] via-[#FF4FD8] to-[#8B5CF6]";
