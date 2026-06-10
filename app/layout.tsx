import type { Metadata } from "next";
import Link from "next/link";
import { MusicPlayerProvider } from "./components/GlobalMusicPlayer";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimSimPlay",
  description: "감정정리와 힐링음악을 연결하는 셀프케어 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-[#080914] text-slate-200">
        <MusicPlayerProvider>
          <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080914]/80 backdrop-blur-md">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8">
              <Link href="/" className="text-xl font-bold tracking-tight text-white">
                SimSimPlay
              </Link>
              <div className="flex items-center gap-6 text-sm font-medium">
                {[
                  ["운세", "/fortune"],
                  ["음악", "/music"],
                  ["일기", "/diary"],
                  ["소개", "/about"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="transition hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </nav>
          </header>
          <div className="pt-36 sm:pt-20">
            {children}
          </div>
        </MusicPlayerProvider>
      </body>
    </html>
  );
}
