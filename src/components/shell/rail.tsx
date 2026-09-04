"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { RailModel } from "@/lib/rail-model";

import { ChaseLogo } from "./chase-logo";
import { RailHandle } from "./rail-controls";
import { navIcons } from "./nav-icons";

function useIsActive() {
  const pathname = usePathname();
  return (href: string, prefix?: boolean) => {
    if (href === "/") return pathname === "/";
    if (prefix) return pathname === href || pathname.startsWith(`${href}/`);
    return pathname === href;
  };
}

function NavRow({
  href,
  label,
  icon,
  badge,
  badgeWarn,
  active,
}: {
  href: string;
  label: string;
  icon?: keyof typeof navIcons;
  badge?: string;
  badgeWarn?: boolean;
  active: boolean;
}) {
  const Icon = icon ? navIcons[icon] : null;

  return (
    <Link className="nav" href={href} aria-current={active ? "page" : undefined}>
      {Icon ? <Icon /> : null}
      <span className="nav-label">{label}</span>
      {badge ? <span className={badgeWarn ? "badge warn" : "badge"}>{badge}</span> : null}
    </Link>
  );
}

export function Rail({
  model,
  collapsed,
}: {
  model: RailModel;
  /** From the cookie, so the first render matches the document. */
  collapsed: boolean;
}) {
  const isActive = useIsActive();

  return (
    <nav className="rail" aria-label="Workspace">
      <div className="rail-brand">
        <ChaseLogo collapsed={collapsed} />
      </div>

      <RailHandle collapsed={collapsed} />

      <div className="rail-primary">
        {model.primary.map((item) => (
          <NavRow
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            badge={item.badge}
            badgeWarn={item.badgeWarn}
            active={isActive(item.href, item.prefix)}
          />
        ))}
      </div>

      {/* Active loans take the remaining height and scroll on their own, so the
          list is the body of the rail rather than one group among several.
          07 §The rail */}
      <div className="rail-loans">
        <div className="rail-h">
          <Link href={model.loansHref} className="rail-h-link">
            {model.loansLabel}
          </Link>
          <span className="ct">{model.loans.length}</span>
        </div>
        <div className="rail-loans-list">
          {model.loans.map((loan) => (
            <Link
              key={loan.loanRef}
              className="row"
              href={loan.href}
              aria-current={isActive(loan.href) ? "page" : undefined}
            >
              <span className="name">{loan.borrower}</span>
              <span className="meta">
                {loan.product}
                {" · "}
                <span className="mono">{loan.loanRef}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rail-utility">
        {model.utility.map((item) => (
          <NavRow
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            badge={item.badge}
            badgeWarn={item.badgeWarn}
            active={isActive(item.href, item.prefix)}
          />
        ))}
      </div>
    </nav>
  );
}
