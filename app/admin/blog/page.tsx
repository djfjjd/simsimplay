import { PageShell } from "../../components/PageShell";
import AdminBlogClient from "./AdminBlogClient";

export default function AdminBlogPage() {
  return (
    <PageShell
      eyebrow="Admin"
      title="블로그 관리"
      description="블로그 게시글을 작성, 수정, 삭제하고 발행 상태를 관리합니다."
    >
      <AdminBlogClient />
    </PageShell>
  );
}
