"use client";

// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as React from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";

/** The query parameter Kit's post-subscribe redirect is configured to add. */
const PARAM = "subscribed";

// Latched on first read. The effect below strips the parameter out of the URL
// straight away -- so without a latch the banner would erase its own reason to
// exist and vanish on the next render.
let latched: boolean | null = null;

function readOnce() {
  if (latched === null) {
    try {
      latched =
        new URLSearchParams(window.location.search).get(PARAM) === "1";
    } catch {
      latched = false;
    }
  }
  return latched;
}

// Prerendering has no URL to read, so the server says "no banner" and the
// client decides after hydration. Read through useSyncExternalStore rather
// than mirrored into state: the URL is external, and this keeps the first
// client render agreeing with the DOM.
const subscribe = () => () => {};
const serverSnapshot = () => false;

export function SubscribeBanner() {
  const arrived = React.useSyncExternalStore(
    subscribe,
    readOnce,
    serverSnapshot
  );
  const [dismissed, setDismissed] = React.useState(false);

  // Take the parameter back out of the URL so a refresh, a bookmark or a
  // shared link does not replay the banner. Touches only the URL, never state.
  React.useEffect(() => {
    if (!arrived) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has(PARAM)) return;
    params.delete(PARAM);
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname
    );
  }, [arrived]);

  if (!arrived || dismissed) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-md border border-foreground/20 bg-muted/60 p-3"
    >
      <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium">Thanks for subscribing</p>
        <p className="mt-0.5 text-muted-foreground">
          If a confirmation email is on its way, clicking the link in it
          completes your subscription.
        </p>
      </div>
      <Button
        variant="ghost"
        className="h-7 w-7 shrink-0 p-0"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
