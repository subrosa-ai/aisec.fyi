import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";

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
      <body
      >
        {children}
      </body>
      <GoogleAnalytics gaId="G-M1VFFEQENF" />
    </html>
  );
}
