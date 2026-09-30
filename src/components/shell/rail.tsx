"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { productForPath } from "@/lib/product";
import { buildRailModel } from "@/lib/rail-model";

import { ChaseLogo } from "./chase-logo";
import { ProductSwitch } from "./product-switch";
import { RailHandle } from "./rail-controls";
import { navIcons } from "./nav-icons";
import { RunMark } from "./run-mark";

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
  badgeKey,
  active,
}: {
  href: string;
  label: string;
  icon?: keyof typeof navIcons;
  badge?: string | number;
  badgeWarn?: boolean;
  badgeKey?: boolean;
  active: boolean;
}) {
  const Icon = icon ? navIcons[icon] : null;

  return (
    <Link className="nav" href={href} aria-current={active ? "page" : undefined}>
      {Icon ? <Icon /> : null}
      <span className="nav-label">{label}</span>
      {badge ? (
        <span className={["badge", badgeWarn && "warn", badgeKey && "badge-key"].filter(Boolean).join(" ")}>
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function Rail({
  collapsed,
  width,
}: {
  /** From the cookie, so the first render matches the document. */
  collapsed: boolean;
  width: number;
}) {
  const pathname = usePathname();
  const product = productForPath(pathname);
  const model = buildRailModel(product);
  const isActive = useIsActive();

  return (
    <nav className="rail" id="rail" aria-label="Workspace">
      {/* Figma · mark collapses; product name + chevron switches Evaluations / Experiments. */}
      <div className="rail-brand">
        <ChaseLogo collapsed={collapsed} />
        <ProductSwitch current={product} />
      </div>

      <RailHandle collapsed={collapsed} width={width} />

      <div className="rail-primary">
        {model.primary.map((item) => (
          <NavRow
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            badge={item.badge}
            badgeWarn={item.badgeWarn}
            badgeKey={item.badgeKey}
            active={isActive(item.href, item.prefix)}
          />
        ))}
      </div>

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
              key={`${loan.href}·${loan.loanRef}`}
              className="row"
              href={loan.href}
              title={[loan.borrower, loan.product, loan.loanRef].filter(Boolean).join(" · ")}
              aria-current={isActive(loan.href) && loan.state !== "working" ? "page" : undefined}
            >
              <RunMark state={loan.state} />
              <span className="name">{loan.borrower}</span>
              {loan.product ? <span className="meta">{loan.product}</span> : null}
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
            badgeKey={item.badgeKey}
            active={isActive(item.href, item.prefix)}
          />
        ))}
      </div>
    </nav>
  );
}
