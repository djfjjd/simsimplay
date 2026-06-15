import Link from "next/link";

const footerLinks = [
  ["홈", "/"],
  ["개인정보처리방침", "/privacy"],
  ["이용약관", "/terms"],
  ["문의하기", "/contact"],
  ["사이트소개", "/about"],
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#080914] px-4 py-10 text-center text-sm text-slate-400 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6">
        <nav aria-label="푸터 메뉴" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-semibold md:gap-x-6">
          {footerLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="transition hover:text-violet-300"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 leading-6 text-slate-500">
          <p className="font-semibold text-slate-300">© 2026 SimSimPlay</p>
          <p>본 서비스는 자기이해와 감정정리를 돕기 위한 참고용 콘텐츠를 제공합니다.</p>
          <p>심리상담 결과는 의학적 진단이나 치료를 대체하지 않습니다.</p>
          <p>사주 및 운세 콘텐츠는 전통 명리학 기반의 참고용 해석입니다.</p>
        </div>
      </div>
    </footer>
  );
}
