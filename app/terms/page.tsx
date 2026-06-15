import type { Metadata } from "next";
import { PageShell } from "../components/PageShell";

export const metadata: Metadata = {
  title: "이용약관 | SimSimPlay",
  description: "SimSimPlay 서비스 이용 조건, 콘텐츠 성격, 책임 범위와 이용자 준수사항을 안내합니다.",
};

const sections = [
  {
    title: "서비스 목적",
    body: "SimSimPlay는 사용자의 자기이해, 감정정리, 일상 기록, 힐링음악 탐색을 돕는 참고용 콘텐츠 서비스를 제공합니다.",
  },
  {
    title: "콘텐츠 이용 안내",
    body: "심리테스트, 감정분석, 꿈해몽, 사주 및 운세 콘텐츠는 참고용 해석입니다. 중요한 의사결정이나 건강 문제는 전문가와 상의해야 합니다.",
  },
  {
    title: "의학적 면책",
    body: "SimSimPlay는 의료기관, 심리치료기관, 상담기관이 아니며, 제공되는 결과는 의학적 진단, 치료, 처방, 전문 상담을 대체하지 않습니다.",
  },
  {
    title: "이용자 책임",
    body: "이용자는 타인의 권리를 침해하거나 불법적인 목적으로 서비스를 이용해서는 안 됩니다. 서비스 화면, 음악, 글 콘텐츠의 무단 복제와 재배포는 제한될 수 있습니다.",
  },
  {
    title: "서비스 변경",
    body: "운영상 필요에 따라 서비스 구성, 콘텐츠, 기능은 변경되거나 중단될 수 있습니다. 중요한 변경사항은 사이트 내 공지 또는 관련 페이지를 통해 안내합니다.",
  },
  {
    title: "약관 변경",
    body: "본 약관은 서비스 운영 상황과 관련 법령에 따라 개정될 수 있습니다. 변경된 약관은 게시된 시점부터 적용됩니다.",
  },
];

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms"
      title="이용약관"
      description="SimSimPlay 이용 전 알아야 할 서비스 성격과 책임 범위를 안내합니다."
    >
      <div className="space-y-4">
        {sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
            <h2 className="text-lg font-bold text-white">{section.title}</h2>
            <p className="mt-3 leading-7 text-slate-300">{section.body}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
