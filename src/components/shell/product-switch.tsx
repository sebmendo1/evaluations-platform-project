"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EXP_AT_COOKIE,
  EVAL_AT_COOKIE,
  isReturnPath,
  productById,
  productForPath,
  products,
  type ProductId,
} from "@/lib/product";
import { persist } from "@/lib/prefs";

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function returnHref(product: ProductId): string {
  const stored = readCookie(product === "evaluations" ? EVAL_AT_COOKIE : EXP_AT_COOKIE);
  return isReturnPath(stored, product) ? stored : productById(product).home;
}

/**
 * Figma shell · product lives in the brand row as a dropdown (Evaluations /
 * Experiments), not a two-segment track. One click still switches products;
 * last-place memory stays in the cookies.
 */
export function ProductSwitch({ current }: { current: ProductId }) {
  const pathname = usePathname();
  const router = useRouter();
  const label = productById(current).label;

  function goTo(id: ProductId) {
    const leaving = productForPath(pathname);
    if (leaving !== id) {
      persist(leaving === "evaluations" ? EVAL_AT_COOKIE : EXP_AT_COOKIE, pathname);
    }
    if (id === current) return;
    router.push(returnHref(id));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="product-switch"
        aria-label="Product"
        title={label}
      >
        <span className="product-switch-label brandtype">{label}</span>
        <ChevronsUpDownIcon className="product-switch-chevron" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        {products.map((product) => (
          <DropdownMenuItem
            key={product.id}
            asChild
            onSelect={(event) => {
              event.preventDefault();
              goTo(product.id);
            }}
          >
            <Link href={product.home}>{product.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
