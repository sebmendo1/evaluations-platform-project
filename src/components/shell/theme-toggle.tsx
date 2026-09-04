"use client";

import { useSyncExternalStore } from "react";

import { defaultTheme, isTheme, persist, THEME_COOKIE, type Theme } from "@/lib/prefs";

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : defaultTheme;
}

function getServerSnapshot(): Theme {
  return defaultTheme;
}

function setTheme(next: Theme) {
  // The attribute changes immediately so the switch is instant; the cookie is
  // what makes the server render it correctly next time.
  document.documentElement.dataset.theme = next;
  persist(THEME_COOKIE, next);
}

/**
 * The visual active state is driven by CSS off `[data-theme]`, and `aria-pressed`
 * is read from the DOM through an external store — so the control is announced
 * correctly without a setState in an effect.
 */
export function ThemeChoice() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="segmented" role="group" aria-label="Colour theme">
      <button
        type="button"
        className="seg seg-light"
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
      >
        Light
      </button>
      <button
        type="button"
        className="seg seg-dark"
        aria-pressed={theme === "dark"}
        onClick={() => setTheme("dark")}
      >
        Dark
      </button>
    </div>
  );
}
