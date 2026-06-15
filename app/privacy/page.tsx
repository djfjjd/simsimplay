import type { Metadata } from "next";
import { PageShell } from "../components/PageShell";

export const metadata: Metadata = {
  title: "개인정보처리방침 | SimSimPlay",
  description: "SimSimPlay의 개인정보 수집, 이용, 보관, 제3자 제공 여부와 이용자 권리를 안내합니다.",
};

const sections = [
  {
    title: "수집하는 정보",
    body: "SimSimPlay는 회원가입 없이 사용할 수 있는 서비스를 지향합니다. 감정일기 내용은 사용자의 브라우저 localStorage에 저장되며, 서버 데이터베이스에 저장하지 않습니다. 문의하기를 통해 사용자가 직접 입력한 연락처와 문의 내용은 답변을 위해서만 확인합니다.",
  },
  {
    title: "이용 목적",
    body: "입력된 정보는 감정정리 결과 제공, 힐링음악 추천, 서비스 문의 응대, 오류 확인과 서비스 품질 개선 목적에 한해 사용합니다.",
  },
  {
    title: "쿠키와 광고",
    body: "사이트 운영 과정에서 접속 통계, 보안, 광고 표시를 위해 쿠키가 사용될 수 있습니다. Google AdSense 등 제3자 광고 서비스는 맞춤형 광고 제공을 위해 쿠키나 유사 기술을 사용할 수 있습니다.",
  },
  {
    title: "보관 및 삭제",
    body: "브라우저에 저장된 감정일기 데이터는 사용자가 직접 삭제할 수 있습니다. 문의 목적으로 전달된 정보는 응대 완료 후 합리적인 기간 동안 보관한 뒤 삭제합니다.",
  },
  {
    title: "제3자 제공",
    body: "SimSimPlay는 법령에 따른 요청이 있는 경우를 제외하고 사용자의 개인정보를 임의로 판매하거나 제3자에게 제공하지 않습니다.",
  },
  {
    title: "이용자 권리",
    body: "이용자는 본인 정보에 대한 열람, 정정, 삭제, 처리 중지를 요청할 수 있습니다. 개인정보 관련 요청은 문의하기 페이지를 통해 접수할 수 있습니다.",
  },
];

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title="개인정보처리방침"
      description="SimSimPlay는 필요한 정보를 최소한으로 다루며, 감정기록과 자기이해 콘텐츠 이용 과정의 개인정보 보호를 중요하게 봅니다."
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
