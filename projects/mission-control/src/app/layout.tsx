import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mission Control",
  description: "AI Agent Mission Control Platform",
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
