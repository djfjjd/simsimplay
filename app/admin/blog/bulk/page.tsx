import { PageShell } from "../../../components/PageShell";
import BulkUploadClient from "./BulkUploadClient";

export default function BulkUploadPage() {
  return (
    <PageShell
      eyebrow="Admin"
      title="대량 글 생성"
      description="여러 개의 제목을 입력하면 카테고리 분류와 본문 내용이 자동으로 생성됩니다."
    >
      <BulkUploadClient />
    </PageShell>
  );
}
