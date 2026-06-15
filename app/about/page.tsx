import type { Metadata } from "next";
import { PageShell } from "../components/PageShell";

export const metadata: Metadata = {
  title: "사이트소개 | SimSimPlay",
  description: "SimSimPlay의 서비스 목적, 감정정리 콘텐츠 방향, 힐링음악 운영 원칙을 소개합니다.",
};

const sections = [
  {
    title: "SimSimPlay 소개",
    body: "SimSimPlay는 오늘의 마음을 짧은 문장으로 정리하고, 그 감정에 어울리는 힐링음악을 연결하는 셀프케어 플랫폼입니다.",
  },
  {
    title: "응용심리학 기반 감정정리 컨셉",
    body: "감정을 바로 해결해야 할 문제로 보기보다, 이름 붙이고 기록하며 자기이해를 넓히는 일상 루틴으로 다룹니다.",
  },
  {
    title: "힐링음악 제작 및 플레이리스트 운영 방향",
    body: "수면, 집중, 명상, 불안완화, 긍정에너지, 감정회복처럼 실제 사용 상황에 맞춘 음악 카테고리를 운영합니다.",
  },
  {
    title: "AI 상담이 아닌 AI 감정정리 서비스",
    body: "SimSimPlay는 상담자나 치료자의 역할을 대신하지 않습니다. 사용자의 문장을 정리하고 셀프케어 행동을 제안하는 도구입니다.",
  },
  {
    title: "음원 유통 및 채널 운영",
    body: "DistroKid를 통한 음원 유통을 예정하고 있으며, YouTube 힐링음악 플레이리스트도 함께 운영할 계획입니다.",
  },
];

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="감정정리와 음악 기반 셀프케어"
      description="SimSimPlay가 지향하는 서비스 방향과 운영 계획을 소개합니다."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-3xl border border-white/10 bg-white/[0.07] p-6"
          >
            <h2 className="text-xl font-bold text-white">{section.title}</h2>
            <p className="mt-3 leading-7 text-slate-300">{section.body}</p>
          </article>
        ))}
      </div>
      <p className="mt-6 rounded-3xl border border-pink-300/25 bg-pink-500/10 p-6 leading-7 text-pink-50">
        본 서비스는 의료 행위, 심리치료, 정신건강 진단을 제공하지 않습니다.
        일상적인 감정기록, 자기이해, 음악 기반 셀프케어를 돕는 서비스입니다.
      </p>
    </PageShell>
  );
}
