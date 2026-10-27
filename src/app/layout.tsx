import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScanItBroo | Bitunix EMA 21 Confluence Scanner",
  description:
    "Real-time Crypto Scanner for Bitunix Futures. Instant confluence detection for coins trading above EMA 21 across 1H, 4H, and 1D timeframes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[140px]" />
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[130px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
