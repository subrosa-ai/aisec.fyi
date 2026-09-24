"use client"

// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect } from "react"
import posthog from "posthog-js"

/* ==========================================================================
 *
 *   ####   ####  #    # ###### #  ####  #    # #####  ######
 *  #    # #    # ##   # #      # #    # #    # #    # #
 *  #      #    # # #  # #####  # #      #    # #    # #####
 *  #      #    # #  # # #      # #  ### #    # #####  #
 *  #    # #    # #   ## #      # #    # #    # #   #  #
 *   ####   ####  #    # #      #  ####   ####  #    # ######
 *
 *  >>>  REPLACE THE PLACEHOLDER BELOW WITH YOUR POSTHOG PROJECT KEY  <<<
 *
 *  Either:
 *    (a) paste the key directly over POSTHOG_KEY_PLACEHOLDER below, or
 *    (b) leave it alone and set NEXT_PUBLIC_POSTHOG_KEY instead
 *        (Netlify > Site configuration > Environment variables).
 *        Option (b) is preferred — the key then lives outside the repo.
 *
 *  Find the key at: PostHog > Settings > Project > Project API Key
 *  (it looks like "phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
 *
 *  A PostHog *project* key is public by design — it is meant to ship in
 *  client-side code — so committing it is not a secret leak. Do NOT put a
 *  personal API key here; those are private.
 *
 *  Until a real key is set, PostHog stays switched off and nothing is sent.
 *
 *  NOTE: this site is a static export, so NEXT_PUBLIC_* values are baked in
 *  at BUILD time. Changing the key in Netlify requires a redeploy to apply.
 *
 * ========================================================================== */

const POSTHOG_KEY_PLACEHOLDER = "phc_REPLACE_ME_WITH_YOUR_POSTHOG_PROJECT_KEY"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? POSTHOG_KEY_PLACEHOLDER

// Use "https://eu.i.posthog.com" if your PostHog project is on EU Cloud.
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"

/** True once a real key has been supplied. */
const isConfigured =
  POSTHOG_KEY.length > 0 && POSTHOG_KEY !== POSTHOG_KEY_PLACEHOLDER

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isConfigured) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[posthog] disabled — set NEXT_PUBLIC_POSTHOG_KEY, or replace the " +
            "placeholder in src/components/providers/posthog-provider.tsx"
        )
      }
      return
    }

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // The site is a single static page with no client-side navigation, so
      // PostHog's default pageview capture on init is sufficient.
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    })
  }, [])

  return <>{children}</>
}
