import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "AI 감정정리",
    description: "오늘의 문장을 감정 키워드로 정리하고 강도와 위로 문장을 제공합니다.",
  },
  {
    title: "힐링음악 추천",
    description: "감정 상태에 맞춰 수면, 명상, 집중, 회복 음악을 추천합니다.",
  },
  {
    title: "감정일기 기록",
    description: "분석 결과와 추천 음악을 저장해 내 마음의 변화를 돌아볼 수 있습니다.",
  },
];

const steps = ["마음 입력", "감정 분석", "음악 추천", "감정일기 저장"];

export default function Home() {
  return (
    <main className="bg-[#080914]">
      <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-8 lg:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.28),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_75%_80%,rgba(236,72,153,0.2),transparent_36%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-pink-100">
              감정정리와 힐링음악을 한 곳에서
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
              오늘의 마음을 입력하면, 어울리는 힐링음악을 추천해드려요
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              SimSimPlay는 감정정리, AI 마음코칭, 힐링음악 플레이리스트를
              결합한 셀프케어 플랫폼입니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/mood"
                className="rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 px-6 py-4 text-center font-bold text-white shadow-lg shadow-violet-950/40 transition hover:scale-[1.01]"
              >
                감정분석 시작하기
              </Link>
              <Link
                href="/music"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-4 text-center font-bold text-white transition hover:bg-white/15"
              >
                힐링음악 듣기
              </Link>
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 shadow-2xl shadow-violet-950/30">
            <Image
              src="/simsimplay-hero.png"
              alt="SimSimPlay 힐링음악 분위기 이미지"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-3xl border border-white/15 bg-black/35 p-5 backdrop-blur-md">
              <p className="text-sm text-slate-300">오늘의 추천</p>
              <p className="mt-1 text-xl font-bold text-white">
                Calm Piano for Tired Mind
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-xl shadow-black/20"
              >
                <h2 className="text-xl font-bold text-white">{feature.title}</h2>
                <p className="mt-3 leading-7 text-slate-300">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-pink-500/15 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white">사용 흐름</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-black/25 p-5"
              >
                <p className="text-sm font-bold text-pink-200">STEP {index + 1}</p>
                <p className="mt-2 text-lg font-semibold text-white">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 rounded-2xl border border-pink-300/20 bg-pink-500/10 p-5 leading-7 text-pink-50">
            본 서비스는 의료적 진단이나 치료를 대체하지 않으며, 일상적인
            감정정리와 셀프케어를 돕기 위한 서비스입니다.
          </p>
        </div>
      </section>
    </main>
  );
}
