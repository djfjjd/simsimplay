import { MainMoodInput } from "./components/MainMoodInput";

export default function Home() {
  return (
    <main className="bg-[#080914] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.1),transparent_40%)]" />
        
        <div className="relative mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            감정을 기록하고,<br />
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              음악으로 치유하세요
            </span>
          </h1>
          <p className="mt-8 text-lg text-slate-300 sm:text-xl">
            오늘 당신의 마음은 어떤가요? 한 문장으로 들려주세요.
          </p>
          
          <MainMoodInput />
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="fixed bottom-0 w-full px-6 pb-8 text-center text-sm text-slate-600">
        <p>© 2026 SimSimPlay. 본 서비스는 의료적 진단을 대체하지 않는 셀프케어 보조 도구입니다.</p>
      </footer>
    </main>
  );
}
