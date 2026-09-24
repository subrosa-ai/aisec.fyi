"use client";

// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoGlyph } from "@/components/parts/logo";

type Status = "idle" | "submitting" | "done";

/**
 * Tiled monogram backdrop, in the manner of a fashion-house canvas: the mark
 * repeated on an offset lattice and turned right down.
 *
 * 5% is not a taste call. Measured against this card's surface, a glyph
 * sitting directly under the muted body text still leaves 5.02:1 in light mode
 * and 6.60:1 in dark -- both clear of the 4.5:1 AA floor. Raising it starts
 * eating that margin.
 */
function MonogramBackdrop() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-foreground opacity-[0.05]"
    >
      <defs>
        <pattern
          id="aisec-monogram"
          width="104"
          height="104"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-8)"
        >
          <g fill="currentColor">
            <g transform="translate(6 6) scale(0.3)">
              <LogoGlyph />
            </g>
            <g transform="translate(58 58) scale(0.3)">
              <LogoGlyph />
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#aisec-monogram)" />
    </svg>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  // `isolate` keeps the -z-10 backdrop inside this card instead of sliding
  // behind the page.
  return (
    <section className="relative isolate min-w-0 overflow-hidden rounded-lg border bg-muted/30 p-6 md:p-8">
      <MonogramBackdrop />
      {children}
    </section>
  );
}

/**
 * Kit (formerly ConvertKit) signup.
 *
 * Posts to the public form endpoint from Kit's HTML embed, which carries no
 * API key -- the form id is public by design. That matters because the site is
 * a static export with no server and no serverless functions, so there is
 * nowhere to keep a secret: anything the browser can read, everyone can read.
 *
 * The native <form method="post"> is the real submission path and works with
 * JavaScript off, ending on Kit's hosted page. Native posts are not subject to
 * CORS, so that path cannot be broken by cross-origin headers. The fetch below
 * only keeps the reader here; on any failure it hands back to a real submit.
 */
export function NewsletterSignup({ action }: { action: string }) {
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;

    // Bots fill every field they find. A human never sees this one.
    const trap = new FormData(form).get("website");
    if (typeof trap === "string" && trap.length > 0) {
      event.preventDefault();
      setStatus("done");
      return;
    }

    event.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      // Kit answers 200 even when it has NOT subscribed anyone, so the HTTP
      // status says nothing on its own -- the JSON body is the real outcome.
      const result = await response.json();

      if (result?.status === "quarantined" && typeof result.url === "string") {
        // No reCAPTCHA token was sent (Kit's own embed supplies one; a plain
        // form cannot), so Kit issued a challenge page rather than rejecting
        // the address. Sending the reader there completes the signup.
        window.location.assign(result.url);
        return;
      }

      if (result?.status === "failed") {
        const message: unknown = result?.errors?.messages?.[0];
        setError(
          typeof message === "string"
            ? message
            : "That did not go through. Please try again.",
        );
        setStatus("idle");
        return;
      }

      // Anything else is a subscription. Matched this way round on purpose:
      // the two failure shapes above are observed, the success literal is not.
      setStatus("done");
      form.reset();
    } catch {
      // Unreadable response or network failure: let the browser submit the
      // form for real. That navigates away, which is why it is the fallback.
      form.submit();
    }
  }

  if (status === "done") {
    return (
      <Shell>
        <div className="relative max-w-prose">
          <h3 className="text-lg font-semibold tracking-tight">
            You&apos;re on the list
          </h3>
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            If a confirmation email is on its way, clicking the link in it
            completes your subscription.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="relative grid min-w-0 gap-6 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-10">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight">
            Learn how AI systems actually fail
          </h3>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            This is a periodic briefing built from: the attack classes worth
            understanding, how defences are changing, and the attack patterns.
            Context and analysis are curated for people who build with AI and
            defend AI breaches.
          </p>
        </div>

        <div className="min-w-0">
          <form
            action={action}
            method="post"
            onSubmit={onSubmit}
            className="flex w-full flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            {/* Verified against the live embed at
                aisec-fyi.kit.com/c3864f7301/index.js: `email_address` is the
                only input Kit's own form posts. */}
            <Input
              id="newsletter-email"
              type="email"
              name="email_address"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10 min-w-0 flex-1 bg-background"
            />
            <div aria-hidden="true" className="hidden">
              <label htmlFor="newsletter-website">Leave this field empty</label>
              <input
                id="newsletter-website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <Button
              type="submit"
              className="h-10 shrink-0"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>

          {error && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            Your address is stored by{" "}
            <a
              href="https://kit.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Kit
            </a>{" "}
            and used only to send these updates. Unsubscribe any time.
          </p>
        </div>
      </div>
    </Shell>
  );
}
