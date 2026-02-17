import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Astra Motors",
    template: "%s | Astra Motors",
  },
  description: "Modern SUVs and crossovers designed for comfort, technology, and electric-ready mobility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
