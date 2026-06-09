import { PageShell } from "../components/PageShell";
import { MoodClient } from "./MoodClient";

export default function MoodPage() {
  return (
    <PageShell
      eyebrow="Mood Check"
      title="오늘의 마음을 문장으로 정리해보세요"
      description="실제 AI API 없이 키워드 기반으로 감정을 분류하고, 위로 문장과 추천 행동, 힐링음악을 보여드립니다."
    >
      <MoodClient />
    </PageShell>
  );
}
