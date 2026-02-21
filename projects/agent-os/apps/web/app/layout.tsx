import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent OS",
  description: "Universal orchestration layer for multi-framework AI agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
