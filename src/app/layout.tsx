import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leak.fyi",
  description: "AI privacy breach, data leak and other related information"
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
    </html>
  );
}
