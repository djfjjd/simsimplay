import { PageShell } from "../components/PageShell";
import { PsychologyClient } from "./PsychologyClient";

export default function PsychologyPage() {
  return (
    <PageShell
      title="심리상담 Q&A"
      description="생년월일시와 성별을 입력하면 심리상담 결과와 사주 기반 성향 리포트를 함께 확인할 수 있습니다."
      centered={true}
    >
      <PsychologyClient />
    </PageShell>
  );
}
