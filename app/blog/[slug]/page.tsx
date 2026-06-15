import { PageShell } from "../../components/PageShell";
import PostDetailClient from "./PostDetailClient";

// Since it's a client-side fetch in this architecture (CF Pages + D1), 
// we normally would need a separate way to get metadata for SEO if we wanted full SSR.
// But for now, I'll implement a basic shell.

export async function generateMetadata({ params }: { params: { slug: string } }) {
  // In a real CF Pages environment, we'd need to fetch from D1 here.
  // For simplicity in this environment, I'll use a placeholder or 
  // assume the client will handle most things, but Next.js metadata is better.
  return {
    title: "심심플레이 블로그",
    description: "마음을 돌보는 이야기",
  };
}

export async function generateStaticParams() {
  return [
    { slug: "dream-police-arrest-1" },
    { slug: "dream-police-investigation-1" },
    { slug: "dream-debt-collector-1" },
    { slug: "dream-detective-chase-1" },
    { slug: "dream-murder-witness-1" },
    { slug: "dream-stalking-1" },
    { slug: "dream-chase-repeat-1" },
    { slug: "dream-teeth-falling-1" },
    { slug: "dream-teeth-fix-1" },
    { slug: "dream-cleaning-toilet-1" },
  ];
}

export default function PostDetailPage({ params }: { params: { slug: string } }) {
  return (
    <PageShell
      eyebrow="Blog Post"
      title="상세 내용"
      description="나의 마음을 들여다보는 깊은 통찰"
    >
      <PostDetailClient slug={params.slug} />
    </PageShell>
  );
}
