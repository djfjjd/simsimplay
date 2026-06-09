import { PageShell } from "../components/PageShell";
import { DiaryClient } from "./DiaryClient";

export default function DiaryPage() {
  return (
    <PageShell
      eyebrow="Mood Diary"
      title="저장된 감정일기"
      description="localStorage에 저장된 감정분석 기록을 확인하고 삭제할 수 있습니다. 데이터 타입은 D1 저장소로 옮기기 쉽게 분리되어 있습니다."
    >
      <DiaryClient />
    </PageShell>
  );
}
