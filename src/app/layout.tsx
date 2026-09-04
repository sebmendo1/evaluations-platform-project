import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono, Open_Sans } from "next/font/google";

import { cookies } from "next/headers";

import { Rail } from "@/components/shell/rail";
import {
  RAIL_COOKIE,
  readRail,
  readRole,
  readTheme,
  ROLE_COOKIE,
  THEME_COOKIE,
} from "@/lib/prefs";
import { buildRailModel } from "@/lib/rail-model";

import "./globals.css";
// Loaded after the token layer so its @layer components rules slot into the
// cascade order Tailwind declares.
import "./notebook.css";

/** 09 §3 · Chase's web face. 08 §2 caps the console at 500; 600 is loaded only for
 *  the brand lockup, which follows Chase's brand type rather than console chrome.
 *  The rest of the marketing ramp is deliberately absent. */
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Astro — Notebook",
    template: "%s · Astro",
  },
  description:
    "Underwriting notebook for the Astro HELOC file review agent: held files, experiments, bundle governance, and blind review.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Read the device preferences server-side so `data-theme` is already correct in
  // the first byte — no inline script, no flash, and nothing to hydrate.
  const jar = await cookies();
  const theme = readTheme(jar.get(THEME_COOKIE)?.value);
  const role = readRole(jar.get(ROLE_COOKIE)?.value);
  const rail_ = readRail(jar.get(RAIL_COOKIE)?.value);

  const rail = buildRailModel();

  return (
    <html
      lang="en"
      data-theme={theme}
      data-role={role}
      data-rail={rail_.collapsed ? "collapsed" : undefined}
      style={{ "--p-rail": `${rail_.width}px` } as React.CSSProperties}
      className={`${openSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {/* 09 §10 · required on every build, including internal ones. */}
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <div className="shell">
          <Rail model={rail} collapsed={rail_.collapsed} />
          <main className="main" id="main">
            <div className="body">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
