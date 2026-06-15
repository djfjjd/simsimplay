import type { Metadata } from "next";
import { PageShell } from "../components/PageShell";

export const metadata: Metadata = {
  title: "문의하기 | SimSimPlay",
  description: "SimSimPlay 서비스 문의, 오류 제보, 개인정보 관련 요청 접수 방법을 안내합니다.",
};

const contactItems = [
  {
    title: "서비스 문의",
    body: "SimSimPlay 이용 중 불편한 점, 오류 제보, 콘텐츠 관련 의견은 운영자에게 전달할 수 있습니다.",
  },
  {
    title: "개인정보 요청",
    body: "개인정보 열람, 정정, 삭제, 처리 중지 요청은 문의 시 요청 내용을 구체적으로 남겨 주세요.",
  },
  {
    title: "응답 안내",
    body: "문의 내용은 확인 후 가능한 범위에서 순차적으로 답변합니다. 광고, 제휴, 권리 침해 신고도 같은 경로로 접수할 수 있습니다.",
  },
];

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="문의하기"
      description="서비스 이용 문의, 오류 제보, 개인정보 관련 요청을 접수하는 페이지입니다."
    >
      <div className="space-y-4">
        {contactItems.map((item) => (
          <section key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
            <h2 className="text-lg font-bold text-white">{item.title}</h2>
            <p className="mt-3 leading-7 text-slate-300">{item.body}</p>
          </section>
        ))}
        <div className="rounded-2xl border border-violet-300/20 bg-violet-500/10 p-6">
          <h2 className="text-lg font-bold text-white">문의 접수</h2>
          <p className="mt-3 leading-7 text-slate-300">
            현재 별도 문의 폼을 준비 중입니다. 서비스 관련 문의는 사이트 운영자에게 전달해 주세요.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
