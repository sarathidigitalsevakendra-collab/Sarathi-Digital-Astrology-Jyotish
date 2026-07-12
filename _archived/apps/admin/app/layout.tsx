import type { Metadata } from "next";
import "@jyotisya/fonts/index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jyotishya Admin",
  description: "Control centre for astrologers, orders, and content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100">{children}</body>
    </html>
  );
}
