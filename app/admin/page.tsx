import { PageShell } from "../components/PageShell";
import { AdminClient } from "./AdminClient";

export default function AdminPage() {
  return (
    <PageShell
      eyebrow="Admin"
      title="SimSimPlay 관리자 페이지"
      description="Cloudflare D1에 카테고리와 YouTube/Spotify 음악 링크를 저장하고 플레이리스트를 관리합니다."
    >
      <AdminClient />
    </PageShell>
  );
}

