"use client";

// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as React from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "aisec-theme";
/** Same-tab notification; `storage` only fires in *other* tabs. */
const CHANGE_EVENT = "aisec-theme-change";

/**
 * Runs before first paint, inlined into <head>. Without it the document
 * renders light and then flips once React hydrates, which on a static export
 * is a visible flash on every page load.
 *
 * This duplicates the logic below on purpose: it has to be a string so it can
 * be a blocking script, and it has to be tiny.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY
)});if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var e=document.documentElement;e.classList.toggle("dark",t==="dark");e.style.colorScheme=t}catch(e){}})()`;

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** What the user picked. Absence of a stored value means "follow the OS". */
function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

/** What that choice resolves to right now. */
function readResolvedTheme(): "light" | "dark" {
  const theme = readTheme();
  if (theme !== "system") return theme;
  return prefersDark() ? "dark" : "light";
}

// The theme lives in localStorage and the OS, not in React, so it is read
// through useSyncExternalStore rather than mirrored into state. That also
// keeps two tabs of the site in agreement.
function subscribe(onStoreChange: () => void) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    query.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

// Prerendering knows neither localStorage nor the OS preference. "system" is
// the honest answer, and the blocking script has already dressed the DOM
// correctly by the time this matters.
const serverTheme = (): Theme => "system";
const serverResolvedTheme = (): "light" | "dark" => "light";

// Before paint on the client, but useEffect during prerender -- useLayoutEffect
// alone warns when a client component is rendered on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

interface ThemeContextValue {
  /** What the user picked; "system" means "follow the OS". */
  theme: Theme;
  /** What that actually resolves to right now. */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribe, readTheme, serverTheme);
  const resolvedTheme = React.useSyncExternalStore(
    subscribe,
    readResolvedTheme,
    serverResolvedTheme
  );

  // Push the resolved theme onto <html>. This covers an explicit choice, the OS
  // flipping underneath a "system" one, and React's Strict Mode dev remount,
  // which resets <html> to the attributes it manages and so drops what the
  // blocking script set. Before paint, so none of those is visible.
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    // Tells the UA to draw scrollbars and form controls to match.
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = React.useCallback((next: Theme) => {
    try {
      // Storing "system" as absence keeps the blocking script's check trivial.
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the choice just will not persist.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
