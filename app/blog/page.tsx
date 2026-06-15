import { PageShell } from "../components/PageShell";
import BlogClient from "./BlogClient";

export const metadata = {
  title: "심심플레이 블로그 - 꿈해몽, 심리상담, 운세",
  description: "마음을 돌보는 SimSimPlay 블로그에서 꿈해몽, 심리테스트, 심리상담, 오늘의 운세를 만나보세요.",
};

export default function BlogPage() {
  return (
    <PageShell
      eyebrow="Blog"
      title="마음 돌봄 블로그"
      description="나를 이해하고 위로하는 시간. 꿈해몽부터 심리테스트까지 다양한 이야기를 만나보세요."
    >
      <BlogClient />
    </PageShell>
  );
}
