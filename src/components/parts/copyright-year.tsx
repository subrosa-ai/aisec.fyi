"use client"

// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useSyncExternalStore } from "react"

/**
 * Last-resort year, used only if no build year is supplied.
 */
const FALLBACK_YEAR = 2026

/**
 * The system clock never notifies us of changes, so there is nothing to
 * subscribe to — but useSyncExternalStore requires a subscribe function.
 */
const subscribe = () => () => {}

/**
 * Renders the current year in the footer without letting it go stale.
 *
 * This site is a static export, so anything computed during `next build` is
 * frozen into the HTML until the next deploy — a footer that said "2026" would
 * still say "2026" in January 2027 if nothing triggered a rebuild.
 *
 * useSyncExternalStore resolves the year twice, which is exactly what it exists
 * for: the server snapshot (`buildYear`) is baked into the static HTML so
 * crawlers and JS-less visitors see a sensible value, and the client snapshot
 * reads the visitor's real clock once hydrated. React is aware the two may
 * differ, so this does not produce a hydration mismatch.
 *
 * The client snapshot must be stable across calls or React re-renders in a
 * loop; returning a plain number satisfies that.
 *
 * The year only ever moves forward — a visitor with a misconfigured clock set
 * to the past cannot make the notice show an earlier year than the build.
 */
export function CopyrightYear({ buildYear = FALLBACK_YEAR }: { buildYear?: number }) {
  const year = useSyncExternalStore(
    subscribe,
    () => Math.max(buildYear, new Date().getFullYear()),
    () => buildYear
  )

  return <>{year}</>
}
