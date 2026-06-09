import { PageShell } from "../components/PageShell";
import { FortuneClient } from "./FortuneClient";

export default function FortunePage() {
  return (
    <PageShell
      eyebrow="Saju Analysis"
      title="간편 사주로 타고난 기운 확인하기"
      description="이름과 성별 없이, 오직 생년월일과 시간만으로 나의 타고난 오행 기운과 성품을 분석해드립니다."
      centered={true}
    >
      <FortuneClient />
    </PageShell>
  );
}
