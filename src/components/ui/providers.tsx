"use client";

import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

/** Client providers required by shadcn overlays (08 §5a). */
export function UiProviders({ children }: { children: ReactNode }) {
 return <TooltipProvider delayDuration={200}>{children}</TooltipProvider>;
}
