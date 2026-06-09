import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "AI 감정 분석",
    description: "오늘의 마음을 문장으로 입력하면 AI가 감정 키워드와 강도를 분석합니다.",
  },
  {
    title: "맞춤형 음악 추천",
    description: "분석된 감정에 최적화된 수면, 명상, 집중, 회복 음악을 제안합니다.",
  },
  {
    title: "마음 일기 저장",
    description: "감정 분석 결과와 음악을 기록하여 나만의 마음 변화를 추적합니다.",
  },
];

export default function Home() {
  return (
    <main className="bg-[#080914] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.2),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.15),transparent_40%)]" />
        
        <div className="relative mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            감정을 기록하고,<br />
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              음악으로 치유하세요
            </span>
          </h1>
          <p className="mt-8 text-lg text-slate-300 sm:text-xl">
            SimSimPlay는 AI 기술을 통해 당신의 마음을 읽고,<br className="hidden sm:block" />
            현재 상태에 가장 어울리는 힐링 음악을 선물합니다.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/mood"
              className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-4 font-bold shadow-lg transition hover:scale-105"
            >
              지금 바로 시작하기
            </Link>
            <Link
              href="/music"
              className="rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold transition hover:bg-white/10"
            >
              음악 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-4 leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Image Section - Simplified */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
          <div className="relative aspect-[21/9] w-full">
            <Image
              src="/simsimplay-hero.png"
              alt="SimSimPlay Healing Experience"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-center sm:text-left">
              <p className="text-sm font-medium text-blue-300">New Release</p>
              <h2 className="mt-1 text-2xl font-bold">공간을 채우는 마음의 평온</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="px-6 pb-12 text-center text-sm text-slate-500">
        <p>© 2026 SimSimPlay. 본 서비스는 의료적 진단을 대체하지 않는 셀프케어 보조 도구입니다.</p>
      </footer>
    </main>
  );
}
