import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import { UiProviders } from "@/components/ui/providers";
import { Rail } from "@/components/shell/rail";
import { MobileBar } from "@/components/shell/mobile-bar";

import "./globals.css";
import "./notebook.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Loan Originator",
    template: "%s · Loan Originator",
  },
  description: "Underwriting review console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={openSans.variable} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("astro.theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`,
          }}
        />
        <UiProviders>
          <a className="skip" href="#main">
            Skip to content
          </a>
          <div className="shell">
            <Rail />
            <MobileBar />
            <div className="maincol">
              <main id="main" className="page">
                {children}
              </main>
            </div>
          </div>
        </UiProviders>
      </body>
    </html>
  );
}
