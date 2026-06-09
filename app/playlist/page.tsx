import { PageShell } from "../components/PageShell";
import { PlaylistClient } from "./PlaylistClient";

export default function PlaylistPage() {
  return (
    <PageShell
      eyebrow="Playlists"
      title="감정별 플레이리스트 추천"
      description="상황과 감정에 맞춰 바로 고를 수 있는 SimSimPlay 플레이리스트입니다."
    >
      <PlaylistClient />
    </PageShell>
  );
}
