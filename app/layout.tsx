import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { AdSenseSideBanners } from "../src/components/AdSenseSideBanners";
import { GlobalMiniPlayer, MusicPlayerProvider } from "./components/GlobalMusicPlayer";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimSimPlay",
  description: "감정정리와 힐링음악을 연결하는 셀프케어 플랫폼",
  other: {
    "google-adsense-account": "ca-pub-5217418488676415",
  },
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
          <Script
            id="google-adsense"
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5217418488676415"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
          <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080914]/88 backdrop-blur-md">
            <nav className="mx-auto grid max-w-7xl items-center gap-2 px-4 py-2 md:gap-4 md:px-6 md:py-3 lg:grid-cols-[12rem_minmax(24rem,1fr)_12rem] lg:px-8">
              <Link href="/" className="justify-self-center text-xl font-bold tracking-tight text-white lg:justify-self-start">
                SimSimPlay
              </Link>
              <div className="order-3 w-full justify-self-center lg:order-none">
                <GlobalMiniPlayer />
              </div>
              <div className="flex items-center justify-center gap-5 text-xs font-medium md:gap-6 md:text-sm lg:justify-self-end">
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
          <div>
            {children}
          </div>
          <AdSenseSideBanners />
        </MusicPlayerProvider>
      </body>
    </html>
  );
}
