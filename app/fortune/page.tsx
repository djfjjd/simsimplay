import { PageShell } from "../components/PageShell";
import { FortuneClient } from "./FortuneClient";

export default function FortunePage() {
  return (
    <PageShell
      title="내 사주 분석하기"
      description="생년월일, 성별, 태어난 시간을 바탕으로 오행 비율과 인생 흐름, 운세별 조언, 추천 음악까지 한 번에 정리합니다."
      centered={true}
    >
      <FortuneClient />
    </PageShell>
  );
}
