import { PageShell } from "../components/PageShell";
import { MoodClient } from "./MoodClient";

export default function MoodPage() {
  return (
    <PageShell
      eyebrow="Mood Check"
      title="오늘의 마음을 문장으로 정리해보세요"
      description="일기, 단어 나열, 감정 메모를 자유롭게 입력하면 생성형 AI가 감정정리 결과와 힐링음악을 추천합니다."
    >
      <MoodClient />
    </PageShell>
  );
}
