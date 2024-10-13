import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AISec.fyi",
  description: "AI security, privacy breach, data leak and other related information"
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
        {children}
        <footer className="flex items-center px-2 space-x-2">
          <div className="text-sm text-muted-foreground">Maintain by Subrosa.ai team</div>
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
          </div>
        </footer>
        <Toaster />
      </body>
      <GoogleAnalytics gaId="G-M1VFFEQENF" />

    </html>
  );
}
