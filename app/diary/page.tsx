import { PageShell } from "../components/PageShell";
import { DiaryClient } from "./DiaryClient";

export default function DiaryPage() {
  return (
    <PageShell
      eyebrow="Mood Diary"
      title="저장된 감정일기"
      description="감정일기는 서버나 D1에 저장되지 않고 현재 브라우저의 localStorage에만 저장됩니다. 같은 브라우저에서는 배포 후에도 유지되지만 다른 기기나 다른 브라우저에서는 보이지 않습니다."
    >
      <DiaryClient />
    </PageShell>
  );
}
