// frontend/src/app/ui/Badge.tsx
"use client";

import React from "react";
import { ui, cx } from "./theme";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cx(ui.badge, className)}>{children}</span>;
}
