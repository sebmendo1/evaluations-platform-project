"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

/** Row-level click as an affordance on top of the real link in the first cell,
 *  so keyboard and middle-click still behave like navigation. */
export function ClickableRow({
  href,
  selected,
  children,
}: {
  href: string;
  selected?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      className={selected ? "clickable sel" : "clickable"}
      onClick={() => router.push(href)}
    >
      {children}
    </tr>
  );
}
