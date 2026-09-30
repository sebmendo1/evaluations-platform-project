"use client"

import * as React from "react"

import { TooltipProvider } from "@/components/ui/tooltip"

function UiProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}

export { UiProviders }
