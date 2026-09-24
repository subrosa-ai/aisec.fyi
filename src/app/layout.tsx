// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";
import { EnvelopeClosedIcon, GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { CopyrightYear } from "@/components/parts/copyright-year";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://aisec.fyi"),
  title: "AISec.fyi",
  description: "AI security, privacy breaches, data leaks and other related information",
  icons: [
    {
      media: "(prefers-color-scheme: light)",
      url: 'icon-light.svg',
      type: "image/svg+xml",
    },
    {
      media: "(prefers-color-scheme: dark)",
      url: 'icon-dark.svg',
      type: "image/svg+xml",
    },
  ],
  openGraph: {
    images: 'ai-sec.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-full flex-1 flex-col p-8 md:flex"
      >
        <PostHogProvider>
          {children}
          <footer className="flex items-center px-2 space-x-2">
            <div className="text-sm text-muted-foreground">
              Maintained by the <Link href='https://subrosa.ai' className="underline" target="_blank" rel="noopener">Subrosa.ai</Link> team
              {" · "}
              &copy; 2024&ndash;<CopyrightYear buildYear={new Date().getFullYear()} />
            </div>
            <div className="flex items-center space-x-2">
              <Button asChild variant="link" className="flex h-8 w-8 p-0">
                <Link href='https://github.com/subrosa-ai/aisec.fyi' target="_blank" rel="noopener noreferrer">
                  <GitHubLogoIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="link" className="flex h-8 w-8 p-0">
                <Link href='https://x.com/SubrosaAi' target="_blank" rel="noopener noreferrer">
                  <TwitterLogoIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="link" className="flex h-8 w-8 p-0">
                <Link href='mailto:aisecfyi@subrosa.ai' aria-label="Email AISec.fyi">
                  <EnvelopeClosedIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </footer>
          <Toaster />
        </PostHogProvider>
      </body>
      <GoogleAnalytics gaId="G-M1VFFEQENF" />

    </html>
  );
}
