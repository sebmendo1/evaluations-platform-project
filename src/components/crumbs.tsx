"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import type { CrumbSegment } from "@/lib/crumbs";

function closeOpen(root: HTMLElement | null) {
  root?.querySelectorAll("details[open]").forEach((node) => {
    node.removeAttribute("open");
  });
}

export function Crumbs({ segments }: { segments: CrumbSegment[] }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeOpen(rootRef.current);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeOpen(rootRef.current);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <nav className="crumb" aria-label="Breadcrumb" ref={rootRef}>
      <ol className="crumb-list">
        {segments.map((segment, index) => (
          <li className="crumb-seg" key={`${segment.label}-${index}`}>
            {index > 0 ? (
              <span className="crumb-sep" aria-hidden="true">
                ›
              </span>
            ) : null}
            {segment.href && !segment.current ? (
              <Link className={segment.mono ? "mono" : undefined} href={segment.href}>
                {segment.label}
              </Link>
            ) : (
              <span
                aria-current={segment.current ? "page" : undefined}
                className={segment.mono ? "mono" : undefined}
              >
                {segment.label}
              </span>
            )}
            {segment.items.length > 0 ? (
              <details className="crumb-disc" name="crumb">
                <summary aria-label={`Pages under ${segment.label}`}>
                  <svg
                    viewBox="0 0 12 12"
                    width="10"
                    height="10"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  >
                    <path d="M2.5 4.5 6 8l3.5-3.5" />
                  </svg>
                </summary>
                <ul className="crumb-menu">
                  {segment.items.map((item) => {
                    const selected = item.href === segment.href;
                    return (
                      <li key={item.href}>
                        <Link
                          aria-current={selected ? "page" : undefined}
                          className="crumb-item"
                          href={item.href}
                          onClick={() => closeOpen(rootRef.current)}
                        >
                          <span className={item.mono ? "mono" : undefined}>{item.label}</span>
                          {item.detail ? (
                            <span className="crumb-item-detail">{item.detail}</span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
