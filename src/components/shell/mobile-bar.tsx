"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { productForPath } from "@/lib/product";

import { ProductSwitch } from "./product-switch";
import { setSheet, useCompact, useSheetOpen } from "./rail-controls";

/**
 * 08 §4a · the phone header. Below 640px the rail is hidden, so this is the only
 * way to reach it: mark (home), the product switch, and the menu button. Rendered
 * at every width and shown by CSS, so the first byte is already right.
 */
export function MobileBar() {
  const pathname = usePathname();
  const open = useSheetOpen();

  return (
    <header className="mobilebar">
      <Link href="/" className="mobilebar-mark" aria-label="Overview">
        <Image src="/brand/chase-octagon.png" alt="" width={22} height={22} />
      </Link>
      <ProductSwitch current={productForPath(pathname)} />
      <button
        type="button"
        className="mobilebar-menu"
        aria-controls="rail"
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setSheet(!open)}
      >
        <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          {open ? <path d="M4 4l8 8M12 4l-8 8" /> : <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />}
        </svg>
      </button>
    </header>
  );
}

/**
 * The scrim behind an open sheet, and the sheet's lifecycle: it closes on the
 * scrim, on Escape, on navigation and when the viewport grows into the desktop
 * tier. While open, the page behind is inert so focus cannot wander under it.
 */
export function SheetScrim() {
  const pathname = usePathname();
  const open = useSheetOpen();
  const compact = useCompact();

  useEffect(() => {
    setSheet(false);
  }, [pathname]);

  useEffect(() => {
    if (!compact) setSheet(false);
  }, [compact]);

  useEffect(() => {
    const main = document.getElementById("main");
    if (main) main.inert = open;
    if (!open) return;
    document.querySelector<HTMLElement>("#rail .rail-primary a")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSheet(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <button
      type="button"
      className="sheet-scrim"
      aria-label="Close navigation"
      tabIndex={-1}
      onClick={() => setSheet(false)}
    />
  );
}
