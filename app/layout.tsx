import type { Metadata } from "next";
import Link from "next/link";
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
      <body className="min-h-full bg-[#080914] text-white">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080914]/85 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Link href="/" className="text-lg font-bold tracking-wide">
              SimSimPlay
            </Link>
            <div className="flex items-center gap-2 overflow-x-auto text-sm text-white/70">
              {[
                ["감정분석", "/mood"],
                ["음악", "/music"],
                ["플레이리스트", "/playlist"],
                ["일기", "/diary"],
                ["소개", "/about"],
                ["관리자", "/admin"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
