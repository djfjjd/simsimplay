"use client";

import { useCallback, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  analyzeMood,
  diaryStorageKey,
  type DiaryEntry,
  type MoodAnalysis,
} from "../lib/mood";
import { useMusicPlayer, type PlayerTrack } from "../components/GlobalMusicPlayer";
import { TodayFortuneMusic } from "../../src/components/TodayFortuneMusic";

const lastAnalysisKey = "simsimplay_last_analysis";
const concernCandidates = ["진로", "돈", "가족", "인간관계", "건강", "수면", "자존감", "미래불안"];

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function buildCounselingAnalysis(result: MoodAnalysis, input: string): MoodAnalysis {
  const text = input.trim();
  const normalized = text.toLowerCase();
  const primary = result.mood || result.emotion || "정리필요";
  const topics = new Set<string>(result.topics);

  if (includesAny(normalized, ["퇴사", "회사", "직장", "일", "이직", "진로"])) topics.add("진로");
  if (includesAny(normalized, ["돈", "월세", "대출", "카드", "생활비", "재정"])) topics.add("돈");
  if (includesAny(normalized, ["엄마", "아빠", "부모", "가족", "병원"])) topics.add("가족");
  if (includesAny(normalized, ["사람", "친구", "연인", "관계", "만나기 싫"])) topics.add("인간관계");
  if (includesAny(normalized, ["병원", "아파", "건강", "몸", "통증"])) topics.add("건강");
  if (includesAny(normalized, ["잠", "불면", "새벽", "잠이 안"])) topics.add("수면");
  if (includesAny(normalized, ["내가 싫", "자책", "못난", "자존감"])) topics.add("자존감");
  if (includesAny(normalized, ["미래", "불안", "막막", "걱정"])) topics.add("미래불안");

  const concernTopics = concernCandidates.filter((topic) => topics.has(topic));
  const emotions = [
    { name: String(primary), intensity: result.intensity },
    {
      name: includesAny(normalized, ["지치", "피곤", "아무것도", "잠"]) ? "피로" : "압박감",
      intensity: Math.max(35, Math.min(100, result.intensity - 12)),
    },
    {
      name: includesAny(normalized, ["미래", "돈", "병원", "걱정", "불안"]) ? "불안" : "혼란",
      intensity: Math.max(30, Math.min(95, result.intensity - 20)),
    },
  ].filter((emotion, index, array) => array.findIndex((item) => item.name === emotion.name) === index).slice(0, 3);

  const thoughtPatterns = [
    includesAny(normalized, ["걱정", "불안", "막막", "돈", "병원"]) ? "과도한 걱정" : "",
    includesAny(normalized, ["완벽", "실수", "망치", "잘해야"]) ? "완벽주의" : "",
    includesAny(normalized, ["싫다", "피하고", "만나기 싫", "아무것도"]) ? "회피" : "",
    includesAny(normalized, ["내 탓", "자책", "못난", "싫었다"]) ? "자책" : "",
    includesAny(normalized, ["미래", "앞으로", "어떻게"]) ? "미래 예측 불안" : "",
    includesAny(normalized, ["괜찮은 척", "참", "말 못", "억눌"]) ? "감정 억압" : "",
  ].filter(Boolean);

  const patternList = thoughtPatterns.length > 0 ? thoughtPatterns : ["과도한 걱정", "감정 억압"];
  const topicText = concernTopics.length > 0 ? concernTopics.join(", ") : "마음정리";
  const summary = text.length > 0
    ? `입력한 내용에서는 ${topicText}와 관련된 부담이 마음의 많은 공간을 차지하는 흐름이 보입니다. 오늘은 감정을 바로 해결하려 하기보다, 가장 크게 올라온 감정의 이름을 붙이고 작은 행동으로 압박을 낮추는 정리가 필요해 보입니다.`
    : result.message;

  const counselingReport = [
    {
      title: "현재 마음 상태",
      body: `${primary} 감정이 앞에 있고, 그 아래에 피로와 긴장이 함께 쌓인 상태로 정리해볼 수 있습니다. 마음이 약해서가 아니라 처리해야 할 정보와 책임이 한꺼번에 몰리면 누구에게나 이런 반응이 나타날 수 있습니다.`,
    },
    {
      title: "이런 감정이 생긴 이유",
      body: `${topicText}처럼 바로 답을 내기 어려운 주제가 겹치면서 마음이 계속 경계 상태에 머문 가능성이 있습니다. 특히 해결책이 선명하지 않은 문제는 생각을 반복하게 만들고, 그 반복이 피로감으로 이어질 수 있습니다.`,
    },
    {
      title: "지금 가장 필요한 것",
      body: "큰 결론보다 몸과 생각의 속도를 낮추는 시간이 먼저 필요합니다. 오늘은 문제 전체를 붙잡기보다 지금 할 수 있는 한 가지, 미룰 수 있는 한 가지, 도움을 요청할 수 있는 한 가지로 나누어보는 편이 좋습니다.",
    },
    {
      title: "피해야 할 생각 패턴",
      body: `${patternList.join(", ")} 경향이 강해지면 아직 일어나지 않은 일을 이미 확정된 일처럼 느낄 수 있습니다. 생각이 커질수록 '지금 확인된 사실'과 '내가 예측한 장면'을 분리해 적어보세요.`,
    },
    {
      title: "오늘 당장 할 수 있는 작은 행동",
      body: result.action || "물 한 잔을 마신 뒤, 오늘 꼭 해야 할 일 3개만 적고 가장 쉬운 것부터 10분만 시작해보세요.",
    },
    {
      title: "스스로에게 해줄 말",
      body: "지금 이렇게 흔들리는 건 내가 부족해서가 아니라, 너무 많은 것을 혼자 들고 있었기 때문일 수 있어. 오늘은 전부 해결하지 않아도 되고, 작은 정리 하나만 해도 충분해.",
    },
  ];

  const recoveryRoutine = [
    "물 한 잔 마시기",
    includesAny(normalized, ["잠", "새벽", "피곤"]) ? "잠들기 전 음악 1곡 듣기" : "10분 산책",
    "할 일 3개만 적기",
    "휴대폰 20분 멀리하기",
    "천천히 숨 5번 고르기",
  ];

  const musicReasons = Object.fromEntries(
    result.recommendedMusic.map((track) => [
      track.title,
      `${track.category} 분위기와 ${track.moodTags.slice(0, 2).join(", ")} 태그가 오늘 감정의 속도를 낮추는 데 어울립니다.`,
    ]),
  );

  return {
    ...result,
    summary,
    emotions,
    concernTopics: concernTopics.length > 0 ? concernTopics : ["감정정리"],
    counselingReport,
    thoughtPatterns: patternList,
    recoveryRoutine,
    musicReasons,
  };
}

function MoodContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { playQueue } = useMusicPlayer();
  
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
  const [saved, setSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = useCallback(async (text: string) => {
    setIsAnalyzing(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });

      if (!response.ok) {
        throw new Error("analysis failed");
      }

      const result = (await response.json()) as MoodAnalysis;
      const nextAnalysis = buildCounselingAnalysis({
        ...result,
        emotion: result.mood,
        comfort: result.message,
        tracks: result.recommendedMusic,
      }, text);
      setAnalysis(nextAnalysis);
      sessionStorage.setItem(lastAnalysisKey, JSON.stringify({ query: text.trim(), analysis: nextAnalysis }));
    } catch {
      const nextAnalysis = buildCounselingAnalysis(analyzeMood(text), text);
      setAnalysis(nextAnalysis);
      sessionStorage.setItem(lastAnalysisKey, JSON.stringify({ query: text.trim(), analysis: nextAnalysis }));
      setError("AI 분석 연결이 불안정해 기본 감정정리 결과를 표시했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (query) {
      queueMicrotask(() => {
        void handleAnalyze(query);
      });
      return;
    }

    const stored = sessionStorage.getItem(lastAnalysisKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { analysis?: MoodAnalysis };
        if (parsed.analysis) setAnalysis(parsed.analysis);
      } catch {
        sessionStorage.removeItem(lastAnalysisKey);
      }
    }
  }, [handleAnalyze, query]);

  function handleSave() {
    if (!analysis || !query.trim()) return;

    const nextEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      content: query.trim(),
      mood: analysis.emotion,
      analysis,
      recommendedMusic: analysis.tracks,
      createdAt: new Date().toISOString(),
    };

    const previous = JSON.parse(
      localStorage.getItem(diaryStorageKey) ?? "[]",
    ) as DiaryEntry[];

    localStorage.setItem(
      diaryStorageKey,
      JSON.stringify([nextEntry, ...previous]),
    );
    setSaved(true);
  }

  function toPlayerTrack(track: MoodAnalysis["recommendedMusic"][number]): PlayerTrack {
    return {
      id: `recommend-${track.title}`,
      title: track.title,
      description: track.description,
      src: track.musicUrl,
      durationLabel: track.duration,
    };
  }

  const recommendedQueue = analysis?.recommendedMusic.map(toPlayerTrack) ?? [];

  return (
    <div className="grid gap-5 md:gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      {/* Left Column: Analysis Results */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm md:p-8">
        {isAnalyzing ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
            <p className="text-lg font-medium text-slate-300">마음을 분석하고 있습니다...</p>
          </div>
        ) : !analysis ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 text-center">
            <p className="text-xl text-slate-400">분석할 내용이 없습니다.</p>
            <Link href="/" className="rounded-full bg-white/10 px-8 py-3 font-bold hover:bg-white/20 transition">
              메인으로 돌아가기
            </Link>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            {error ? (
              <p className="mb-6 rounded-2xl border border-yellow-300/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                {error}
              </p>
            ) : null}
            
            <div className="mb-6 md:mb-8">
              <p className="text-sm font-semibold tracking-wider text-violet-400 uppercase">AI 심리상담 리포트</p>
              <h2 className="mt-2 text-3xl font-black text-white md:text-5xl">오늘의 마음 요약</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">{analysis.summary ?? analysis.message}</p>
              
              <div className="mt-6 grid gap-3">
                {(analysis.emotions ?? [{ name: analysis.mood, intensity: analysis.intensity }]).map((emotion) => (
                  <div key={emotion.name}>
                    <div className="mb-2 flex justify-between text-sm font-medium text-slate-400">
                      <span>{emotion.name}</span>
                      <span>{emotion.intensity}/100</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/5 md:h-4">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 transition-all duration-1000 ease-out"
                        style={{ width: `${emotion.intensity}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(analysis.concernTopics ?? analysis.topics).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-xs font-medium text-violet-300"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">심리상담 리포트</p>
              <div className="mt-2 divide-y divide-white/10">
                {(analysis.counselingReport ?? []).map((section) => (
                  <article key={section.title} className="py-4">
                    <h3 className="text-base font-black text-white">{section.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{section.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">사고 패턴 분석</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(analysis.thoughtPatterns ?? []).map((pattern) => (
                    <span key={pattern} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">오늘의 회복 루틴</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  {(analysis.recoveryRoutine ?? [analysis.action]).map((routine) => (
                    <li key={routine} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-300" />
                      <span>{routine}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">추천 플레이리스트</p>
              <p className="mt-2 text-lg font-black text-white">{analysis.playlist}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {analysis.musicCategory} 흐름에 맞춰 오늘 감정에 어울리는 곡들을 우선 추천했습니다.
              </p>
            </div>

            <div className="mt-8 border-t border-white/5 pt-6 md:mt-10 md:pt-8">
              <button
                type="button"
                onClick={handleSave}
                disabled={saved}
                className={`w-full rounded-2xl py-5 font-bold transition-all ${
                  saved 
                  ? "cursor-default border border-emerald-400/30 bg-emerald-500/15 text-emerald-200" 
                  : "border border-pink-200/30 bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500 text-white shadow-lg shadow-pink-950/30 hover:brightness-110 active:scale-[0.98]"
                }`}
              >
                {saved ? "감정일기에 저장되었습니다" : "감정일기에 저장하기"}
              </button>
              <p className="mt-4 text-center text-xs text-slate-500">
                버튼을 누른 경우에만 입력 내용과 분석 결과가 이 브라우저의 localStorage에 저장됩니다.
              </p>
              <Link
                href="/"
                className="mt-3 block w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 text-center text-sm font-bold text-white transition hover:bg-white/10"
              >
                다시 분석하기
              </Link>
              <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                이 결과는 감정정리와 자기이해를 돕는 참고용 콘텐츠이며, 의학적 진단이나 치료를 대체하지 않습니다.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Right Column: Today's Fortune */}
      <aside className="space-y-6">
        <div className="sticky top-24">
          <TodayFortuneMusic />
          {analysis ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
              <p className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                추천 힐링음악
              </p>
              <div className="grid gap-3">
                {analysis.recommendedMusic.map((track, index) => (
                  <button
                    type="button"
                    key={track.title}
                    onClick={() => playQueue(recommendedQueue, index)}
                    className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.06] p-4 text-left transition hover:border-white/10 hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-white transition group-hover:text-pink-300">{track.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{track.description}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{analysis.musicReasons?.[track.title]}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 transition group-hover:bg-pink-500/20">
                      <svg className="h-5 w-5 text-slate-300 group-hover:text-pink-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/5 to-pink-500/5 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Guide</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              분석 결과가 마음에 드셨나요? 저장된 일기는 상단 &apos;일기&apos; 메뉴에서 언제든 다시 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function MoodClient() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    }>
      <MoodContent />
    </Suspense>
  );
}
