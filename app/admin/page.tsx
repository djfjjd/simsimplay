import { PageShell } from "../components/PageShell";
import { AdminClient } from "./AdminClient";

export default function AdminPage() {
  return (
    <PageShell
      eyebrow="Admin"
      title="SimSimPlay 관리자 페이지"
      description="Cloudflare D1과 R2에 음악 파일, 카테고리, 플레이리스트를 관리합니다."
    >
      <AdminClient />
    </PageShell>
  );
}
