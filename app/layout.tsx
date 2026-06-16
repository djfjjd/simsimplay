import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseSideBanners } from "../src/components/AdSenseSideBanners";
import { GlobalMiniPlayer, MusicPlayerProvider } from "./components/GlobalMusicPlayer";
import { SiteFooter } from "./components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimSimPlay | 심리상담 · 감정분석 · 꿈해몽 · 힐링음악",
  description:
    "심리상담, 감정분석, 꿈해몽, 사주풀이, 힐링음악 플레이리스트를 제공하는 셀프케어 플랫폼",

  verification: {
    other: {
      "naver-site-verification":
        "3ee6eef2539bb55e48c56098ec581cdfe4733354",
    },
  },

  openGraph: {
    title: "SimSimPlay | 심리상담 · 감정분석 · 꿈해몽 · 힐링음악",
    description:
      "심리상담, 감정분석, 꿈해몽, 사주풀이, 힐링음악 플레이리스트를 제공하는 셀프케어 플랫폼",
    url: "https://simsimplay.com",
    siteName: "SimSimPlay",
    locale: "ko_KR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "SimSimPlay | 심리상담 · 감정분석 · 꿈해몽 · 힐링음악",
    description:
      "심리상담, 감정분석, 꿈해몽, 사주풀이, 힐링음악 플레이리스트를 제공하는 셀프케어 플랫폼",
  },

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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5217418488676415"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full bg-[#080914] text-slate-200">
        <MusicPlayerProvider>
          <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080914]/88 backdrop-blur-md">
            <nav className="mx-auto grid max-w-7xl items-center gap-2 px-4 py-2 md:gap-4 md:px-6 md:py-3 lg:grid-cols-[minmax(8rem,1fr)_minmax(14rem,22rem)_minmax(0,1fr)] lg:px-8">
              <Link href="/" className="justify-self-center text-xl font-bold tracking-tight text-white lg:justify-self-start">
                SimSimPlay
              </Link>
              <div className="order-3 flex w-full justify-center justify-self-center lg:order-none lg:col-start-2">
                <GlobalMiniPlayer />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-medium md:gap-x-4 md:text-sm lg:flex-nowrap lg:justify-self-end">
                {[
                  ["심리테스트", "/psychology"],
                  ["사주풀이", "/fortune"],
                  ["음악", "/music"],
                  ["일기장", "/diary"],
                  ["꿈해몽풀이", "/blog"],
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
          <SiteFooter />
          <AdSenseSideBanners />
        </MusicPlayerProvider>
      </body>
    </html>
  );
}
