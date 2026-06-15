import { Suspense } from "react";
import { PageShell } from "../../components/PageShell";
import { PsychologyResultClient } from "./PsychologyResultClient";

export default function PsychologyResultPage() {
  return (
    <PageShell
      title="심리상담 + 사주 종합 리포트"
      description="심리테스트 결과와 생년월일시 기반 사주풀이를 함께 정리한 참고용 리포트입니다."
    >
      <Suspense fallback={<div className="text-slate-300">결과를 불러오는 중입니다.</div>}>
        <PsychologyResultClient />
      </Suspense>
    </PageShell>
  );
}
