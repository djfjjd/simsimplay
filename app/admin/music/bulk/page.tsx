import { PageShell } from "../../../components/PageShell";
import MusicBulkUploadClient from "./MusicBulkUploadClient";

export default function MusicBulkUploadPage() {
  return (
    <PageShell
      eyebrow="Admin"
      title="MP3 대량 업로드"
      description="여러 MP3 파일을 분석해 R2에 업로드하고 음악 테이블에 바로 저장합니다."
    >
      <MusicBulkUploadClient />
    </PageShell>
  );
}
