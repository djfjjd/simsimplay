"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { recommendedTracks } from "../../lib/music";
import {
  calculatePsychologyResult,
  type PsychologyQuestion,
  type PsychologyResult,
  type PsychologyScoreKey,
} from "../../../src/lib/psychologyQuestions";
import { calculateDaewoonTimeline, getDaewoonDirection, type DaewoonItem } from "../../../src/lib/daewoon";
import { calculateSaju, getFiveElements, getTodayGanji, type GanjiInfo, type SajuResult } from "../../../src/lib/ganji";

type Gender = "여성" | "남성";
type ElementKey = "목" | "화" | "토" | "금" | "수";

type PsychologyProfile = {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  gender: Gender;
};

type CombinedStoredResult = {
  profile: PsychologyProfile;
  psychology: PsychologyResult;
  saju: SajuResult;
  todayGanji: GanjiInfo;
  elementCounts: Record<ElementKey, number>;
  dominantElement: ElementKey;
  weakElement: ElementKey;
  daewoon: DaewoonItem[];
  todayFortuneScore: number;
  createdAt: string;
};

type FullReport = {
  mentalState: string;
  emotions: string[];
  thoughtPattern: string;
  cautions: string[];
  recommendedActions: string[];
  journalQuestions: string[];
  sajuNature: string;
  daewoonFlow: string;
  recoveryRoutine: string[];
  sajuCautions: string[];
  usefulEnergy: string;
  combinedInterpretation: string[];
  playlists: string[];
  songs: string[];
};

let devUnlockToken: string | null = null;

const profileKey = "simsimplay_psychology_profile";
const answersKey = "simsimplay_psychology_answers";
const questionsKey = "simsimplay_psychology_questions";
const resultKey = "simsimplay_psychology_result";

const scoreLabels: Record<PsychologyScoreKey, string> = {
  stress: "스트레스",
  anxiety: "불안",
  lowMood: "우울",
  selfEsteem: "자존감",
  sociality: "사회성",
  relationship: "대인관계",
  career: "직업성향",
};

const cautionKeys: PsychologyScoreKey[] = ["stress", "anxiety", "lowMood"];
const strengthKeys: PsychologyScoreKey[] = ["selfEsteem", "sociality", "relationship", "career"];
const elementNames: ElementKey[] = ["목", "화", "토", "금", "수"];
const branchElements: Record<string, ElementKey> = {
  인: "목",
  묘: "목",
  사: "화",
  오: "화",
  진: "토",
  술: "토",
  축: "토",
  미: "토",
  신: "금",
  유: "금",
  자: "수",
  해: "수",
};

const elementMessages: Record<ElementKey, { nature: string; routine: string[]; caution: string; useful: string; playlist: string }> = {
  목: {
    nature: "성장과 확장 감각이 살아 있어 새로운 시도와 배움에서 회복감을 얻을 가능성이 있습니다.",
    routine: ["아침 산책 10분", "오늘 키울 일 한 가지 적기", "초록색 환경 가까이 두기"],
    caution: "일을 넓히기만 하고 마무리를 미루는 흐름을 조심해볼 수 있습니다.",
    useful: "작게 시작하고 반복하는 목의 기운을 활용하면 좋습니다.",
    playlist: "아침 성장 플레이리스트",
  },
  화: {
    nature: "표현과 활력의 감각이 강해 감정을 밖으로 정리할 때 마음이 가벼워질 가능성이 있습니다.",
    routine: ["햇빛 보기", "가벼운 유산소", "감정 한 문장 말로 표현하기"],
    caution: "감정이 올라온 순간 바로 결정하거나 말하는 흐름을 주의해볼 수 있습니다.",
    useful: "따뜻하게 움직이고 표현하는 화의 기운을 활용하면 좋습니다.",
    playlist: "활력 회복 플레이리스트",
  },
  토: {
    nature: "현실감과 책임감이 중심에 있어 생활 기반을 정리할수록 안정감을 얻을 가능성이 있습니다.",
    routine: ["식사 시간 고정", "방 한 곳 정리", "오늘 예산 한 줄 기록"],
    caution: "걱정을 오래 붙잡으며 결정을 미루는 흐름을 조심해볼 수 있습니다.",
    useful: "루틴과 정리로 중심을 잡는 토의 기운을 활용하면 좋습니다.",
    playlist: "마음정리 안정 플레이리스트",
  },
  금: {
    nature: "기준과 판단이 선명해 복잡한 상황을 정리하고 우선순위를 세우는 데 강점이 있을 가능성이 있습니다.",
    routine: ["책상 위 정리", "오늘 할 일 3개만 선택", "짧은 근력 운동"],
    caution: "완벽한 기준으로 자신을 몰아붙이는 흐름을 주의해볼 수 있습니다.",
    useful: "선택지를 줄이고 결론을 내는 금의 기운을 활용하면 좋습니다.",
    playlist: "집중 정리 플레이리스트",
  },
  수: {
    nature: "내면을 깊이 살피는 감각이 있어 조용한 회복과 기록에서 균형을 찾을 가능성이 있습니다.",
    routine: ["따뜻한 물 마시기", "5분 호흡", "잠들기 전 감정일기 세 줄"],
    caution: "생각이 길어져 실행이 늦어지는 흐름을 조심해볼 수 있습니다.",
    useful: "쉬고 관찰하며 감정을 순환시키는 수의 기운을 활용하면 좋습니다.",
    playlist: "힐링 명상 플레이리스트",
  },
};

function isReportUnlocked(token: string | null) {
  return Boolean(token && devUnlockToken && token === devUnlockToken);
}

function unlockReport() {
  devUnlockToken = `dev-${crypto.randomUUID()}`;
  return devUnlockToken;
}

function verifyPaymentSession() {
  return false;
}

function handlePaymentClick() {
  if (verifyPaymentSession()) return null;
  return unlockReport();
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.sessionStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeElement(value: string): ElementKey {
  return value.slice(0, 1) as ElementKey;
}

function addElement(counts: Record<ElementKey, number>, pillar: string) {
  const stem = pillar[0];
  const branch = pillar[1];
  if (stem && stem !== "?") counts[normalizeElement(getFiveElements(stem))] += 1;
  if (branch && branch !== "?") counts[branchElements[branch] ?? "토"] += 1;
}

function getElementCounts(saju: SajuResult) {
  const counts: Record<ElementKey, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [saju.year, saju.month, saju.day, saju.hour].forEach((pillar) => addElement(counts, pillar));
  return counts;
}

function pickElement(counts: Record<ElementKey, number>, mode: "max" | "min") {
  return elementNames.reduce((best, element) => {
    if (mode === "max") return counts[element] > counts[best] ? element : best;
    return counts[element] < counts[best] ? element : best;
  }, "목" as ElementKey);
}

function clampScore(value: number) {
  return Math.max(42, Math.min(96, Math.round(value)));
}

function calculateTodayFortuneScore(counts: Record<ElementKey, number>, todayGanji: GanjiInfo) {
  const todayElement = normalizeElement(getFiveElements(todayGanji.dayStem));
  const weak = pickElement(counts, "min");
  const dominant = pickElement(counts, "max");
  let score = 66;
  if (todayElement === weak) score += 14;
  if (todayElement === dominant) score -= 5;
  score += Math.max(0, 4 - counts[weak]) * 3;
  return clampScore(score);
}

function buildStoredResult(): CombinedStoredResult | null {
  const profile = readJson<PsychologyProfile | null>(profileKey, null);
  const questions = readJson<PsychologyQuestion[]>(questionsKey, []);
  const answers = readJson<Record<string, number>>(answersKey, {});
  if (!profile || questions.length !== 50 || Object.keys(answers).length < 50) return null;

  const birthYear = Number(profile.birthYear);
  const birthMonth = String(profile.birthMonth).padStart(2, "0");
  const birthDay = String(profile.birthDay).padStart(2, "0");
  const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;
  const psychology = calculatePsychologyResult(questions, answers);
  const saju = calculateSaju(birthDate, profile.birthHour);
  const todayGanji = getTodayGanji();
  const elementCounts = getElementCounts(saju);
  const dominantElement = pickElement(elementCounts, "max");
  const weakElement = pickElement(elementCounts, "min");
  const daewoon = calculateDaewoonTimeline(saju, profile.gender, birthYear);

  return {
    profile,
    psychology,
    saju,
    todayGanji,
    elementCounts,
    dominantElement,
    weakElement,
    daewoon,
    todayFortuneScore: calculateTodayFortuneScore(elementCounts, todayGanji),
    createdAt: new Date().toISOString(),
  };
}

function getPreviewReport(result: CombinedStoredResult) {
  const highSignals = result.psychology.dominantSignals.map((key) => scoreLabels[key]).join("와 ");
  const weakProfile = elementMessages[result.weakElement];
  return [
    `현재 ${highSignals} 관련 응답이 비교적 높게 나타났습니다.`,
    `사주 흐름상 현재는 ${result.weakElement} 기운을 보완하며 정리와 회복을 참고해볼 수 있는 시기로 해석됩니다.`,
    `오늘은 무리한 확장보다 감정 정리와 생활 루틴 회복에 집중하는 것이 좋습니다. ${weakProfile.routine[0]}부터 시작해보세요.`,
  ];
}

function getFullReport(result: CombinedStoredResult): FullReport {
  const scores = result.psychology.scores;
  const highestSignal = result.psychology.dominantSignals[0];
  const strongest = result.psychology.strengths[0];
  const dominantProfile = elementMessages[result.dominantElement];
  const weakProfile = elementMessages[result.weakElement];
  const tracks = recommendedTracks.slice(0, 3);

  return {
    mentalState: `${scoreLabels[highestSignal]} 항목이 가장 선명하게 나타났습니다. 이는 최근 마음의 에너지가 한 방향으로 몰려 있거나 회복 루틴이 필요하다는 신호로 참고해볼 수 있습니다.`,
    emotions: [
      scores.stress >= 61 ? "압박감" : "정리 욕구",
      scores.anxiety >= 61 ? "긴장감" : "차분함",
      scores.lowMood >= 61 ? "무거움" : "회복감",
    ],
    thoughtPattern: `${scoreLabels[strongest]} 항목은 상대적으로 강점으로 볼 수 있습니다. 다만 부담 신호가 높을 때는 강점을 증명하려는 방향보다 회복에 쓰는 방향이 더 안정적일 가능성이 있습니다.`,
    cautions: [
      "결과를 단정적인 판단으로 받아들이기보다 현재 상태를 정리하는 참고 자료로 활용하세요.",
      "감정 신호가 높게 느껴지는 날에는 중요한 결정을 잠시 미루고 수면과 식사를 먼저 확인하세요.",
      "혼자 감당하기 어렵다고 느껴지면 신뢰할 수 있는 사람이나 전문가의 도움을 검토하세요.",
    ],
    recommendedActions: [
      weakProfile.routine[0],
      "오늘 할 일을 3개 이하로 줄이기",
      "잠들기 전 감정일기 세 줄 적기",
    ],
    journalQuestions: [
      "오늘 내 마음을 가장 많이 차지한 감정은 무엇이었나요?",
      "내가 지금 줄여도 되는 부담은 무엇인가요?",
      "내일의 나를 위해 오늘 작게 회복할 수 있는 행동은 무엇인가요?",
    ],
    sajuNature: dominantProfile.nature,
    daewoonFlow: `대운은 ${getDaewoonDirection(result.profile.gender, Number(result.profile.birthYear))} 기준으로 보며, 다음 흐름은 ${result.daewoon[1]?.age ?? result.daewoon[0]?.age}세 전후 ${result.daewoon[1]?.ganji ?? result.daewoon[0]?.ganji} 기운을 참고해볼 수 있습니다.`,
    recoveryRoutine: weakProfile.routine,
    sajuCautions: [weakProfile.caution, "운세 해석은 선택의 방향을 가볍게 점검하는 참고 콘텐츠로 보는 것이 좋습니다."],
    usefulEnergy: weakProfile.useful,
    combinedInterpretation: [
      `이번 결과에서는 ${scoreLabels[highestSignal]} 신호가 비교적 선명하게 나타났고, 사주에서는 ${result.dominantElement} 기운이 중심으로 보입니다. 두 결과를 함께 보면 에너지를 더 쓰기보다 어디에 쓰고 있는지 확인하는 시간이 필요할 가능성이 있습니다.`,
      `${result.dominantElement} 기운은 ${dominantProfile.nature} 이 강점은 현재의 감정 신호를 억누르는 데 쓰기보다, 생활을 다시 정돈하는 기준으로 활용해볼 수 있습니다.`,
      `부족하게 나타난 ${result.weakElement} 기운은 ${weakProfile.useful} 심리 결과에서 부담이 높게 나온 항목과 연결하면, 큰 변화보다 작고 반복 가능한 회복 행동이 더 잘 맞을 가능성이 있습니다.`,
      `${scoreLabels[strongest]} 점수는 현재 당신이 이미 가진 자원을 보여주는 지표로 참고할 수 있습니다. 다만 강점을 계속 증명하려고 하면 피로가 커질 수 있으니, 오늘은 강점을 회복의 도구로 쓰는 편이 좋습니다.`,
      `오늘의 운세 점수는 ${result.todayFortuneScore}점으로 계산됩니다. 이는 좋고 나쁨을 단정하는 수치가 아니라, 오늘의 기운을 생활 리듬과 감정 정리에 어떻게 연결할지 보는 참고 지표입니다.`,
      `따라서 지금은 무리한 확장보다 루틴 회복, 감정 기록, 관계와 일정의 정리가 도움이 될 가능성이 있습니다. 특히 ${weakProfile.routine.join(", ")} 같은 행동을 작게 시도해볼 수 있습니다.`,
    ],
    playlists: [weakProfile.playlist, "감정정리 안정 플레이리스트", "잠들기 전 회복 플레이리스트"],
    songs: tracks.map((track) => track.title),
  };
}

function ScoreBar({ label, score, caution }: { label: string; score: number; caution: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold text-slate-100">{label}</span>
        <span className={caution ? "font-black text-rose-200" : "font-black text-sky-200"}>{score}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${caution ? "bg-rose-300" : "bg-sky-300"}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function RadarChart({ scores }: { scores: Record<PsychologyScoreKey, number> }) {
  const keys = Object.keys(scoreLabels) as PsychologyScoreKey[];
  const center = 120;
  const radius = 86;
  const points = keys.map((key, index) => {
    const angle = (Math.PI * 2 * index) / keys.length - Math.PI / 2;
    const distance = (scores[key] / 100) * radius;
    return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 240 240" className="mx-auto aspect-square w-full max-w-[18rem]" role="img" aria-label="심리 결과 레이더 차트">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <circle key={scale} cx={center} cy={center} r={radius * scale} fill="none" stroke="rgba(255,255,255,0.14)" />
      ))}
      {keys.map((key, index) => {
        const angle = (Math.PI * 2 * index) / keys.length - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        const labelX = center + Math.cos(angle) * (radius + 22);
        const labelY = center + Math.sin(angle) * (radius + 22);
        return (
          <g key={key}>
            <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.12)" />
            <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" className="fill-slate-300 text-[10px] font-bold">
              {scoreLabels[key]}
            </text>
          </g>
        );
      })}
      <polygon points={points} fill="rgba(125,211,252,0.28)" stroke="#7dd3fc" strokeWidth="3" />
    </svg>
  );
}

function ElementBars({ counts }: { counts: Record<ElementKey, number> }) {
  const max = Math.max(...Object.values(counts), 1);
  return (
    <div className="grid gap-3">
      {elementNames.map((element) => (
        <div key={element}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-bold text-white">{element}</span>
            <span className="text-slate-300">{counts[element]}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-pink-300" style={{ width: `${Math.max(8, (counts[element] / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(date: Date, separator: "." | "" = ".") {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return separator === "." ? `${year}.${month}.${day}` : `${year}${month}${day}`;
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function downloadPdf(result: CombinedStoredResult, report: FullReport, token: string | null) {
  if (!isReportUnlocked(token)) return;
  const created = formatDate(new Date(result.createdAt));
  const rows = Object.entries(result.psychology.scores)
    .map(([key, score]) => `<tr><td>${escapeHtml(scoreLabels[key as PsychologyScoreKey])}</td><td>${score}</td></tr>`)
    .join("");
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>SimSimPlay-종합리포트-${formatDate(new Date(), "")}</title><style>body{font-family:Arial,'Malgun Gothic',sans-serif;line-height:1.7;color:#111;padding:40px}h1,h2{page-break-after:avoid}table{border-collapse:collapse;width:100%}td{border:1px solid #ddd;padding:8px}.cover{min-height:60vh;display:flex;flex-direction:column;justify-content:center}.note{color:#555;font-size:13px}</style></head><body><section class="cover"><h1>SimSimPlay 종합 리포트</h1><p>생성일 ${created}</p></section><h2>심리테스트 결과</h2><table>${rows}</table><h2>사주풀이 결과</h2><p>원국: ${result.saju.year}년 ${result.saju.month}월 ${result.saju.day}일 ${result.saju.hour}시</p><p>강한 오행: ${result.dominantElement}, 부족한 오행: ${result.weakElement}</p><p>오늘의 운세 점수: ${result.todayFortuneScore}</p><h2>종합 해석</h2>${report.combinedInterpretation.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}<h2>추천 행동</h2><ul>${report.recommendedActions.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul><h2>추천 플레이리스트</h2><ul>${report.playlists.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul><p class="note">본 결과는 자기이해와 감정정리를 돕기 위한 참고용 콘텐츠이며, 의학적 진단이나 치료를 대체하지 않습니다. 사주 및 운세 해석은 전통 명리학 기반의 참고용 콘텐츠입니다.</p><script>document.title='SimSimPlay-종합리포트-${formatDate(new Date(), "")}.pdf';window.print();</script></body></html>`;
  const popup = window.open("", "_blank", "width=900,height=1200");
  if (!popup) return;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}

export function PsychologyResultClient() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<CombinedStoredResult | null>(null);
  const [unlockToken, setUnlockToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = readJson<CombinedStoredResult | null>(resultKey, null);
    const built = saved ?? buildStoredResult();
    if (built) {
      setResult(built);
      window.sessionStorage.setItem(resultKey, JSON.stringify(built));
    }
  }, []);

  const hasUtm = Boolean(searchParams.get("utm"));
  const unlocked = isReportUnlocked(unlockToken);
  const fullReport = useMemo(() => (result && unlocked ? getFullReport(result) : null), [result, unlocked]);
  const preview = useMemo(() => (result ? getPreviewReport(result) : []), [result]);

  if (!result) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-slate-300">
        저장된 심리상담 Q&A 결과가 없습니다. <Link className="font-bold text-sky-200" href="/psychology">처음부터 다시 시작하기</Link>
      </div>
    );
  }

  return (
    <section className="w-full space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 sm:p-7">
        <p className="text-sm font-bold text-sky-200">무료 3줄 요약</p>
        <ol className="mt-4 grid gap-3 text-base leading-7 text-white">
          {preview.map((line, index) => (
            <li key={line} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2">
              <span className="font-black text-pink-200">{index + 1}.</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </div>

      {!unlocked ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <div className="space-y-4" aria-hidden="true">
              <div className="h-6 w-2/3 rounded-full bg-white/10" />
              <div className="h-28 rounded-2xl bg-white/10" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-36 rounded-2xl bg-white/10" />
                <div className="h-36 rounded-2xl bg-white/10" />
              </div>
              <div className="h-44 rounded-2xl bg-white/10" />
            </div>
          </div>
          <aside className="rounded-3xl border border-pink-300/30 bg-pink-300/10 p-5 sm:p-6">
            <h2 className="text-2xl font-black text-white">전체 심리상담 + 사주 리포트 보기</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              심리테스트 결과, 사주 성향 분석, 오늘의 회복 루틴, 추천 플레이리스트를 모두 확인할 수 있습니다.
            </p>
            <div className="mt-5">
              {hasUtm ? (
                <p className="text-3xl font-black text-pink-100">오늘만 990원</p>
              ) : (
                <p className="text-3xl font-black text-white">2,990원</p>
              )}
              <p className="mt-1 text-xs font-bold text-slate-400">현재 버튼은 개발용 임시 잠금 해제만 수행합니다.</p>
            </div>
            <button
              type="button"
              onClick={() => setUnlockToken(handlePaymentClick())}
              className="mt-6 w-full rounded-full bg-white px-5 py-4 text-sm font-black text-slate-950"
            >
              결제하고 전체 페이지 보기
            </button>
          </aside>
        </div>
      ) : null}

      {unlocked && fullReport ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-300">잠금 해제된 전체 리포트</p>
            <button
              type="button"
              onClick={() => downloadPdf(result, fullReport, unlockToken)}
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
            >
              PDF로 저장하기
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
              <h2 className="text-2xl font-black text-white">심리테스트 결과</h2>
              <div className="mt-5 grid gap-4">
                {(Object.keys(scoreLabels) as PsychologyScoreKey[]).map((key) => (
                  <ScoreBar key={key} label={`${scoreLabels[key]} · ${result.psychology.levels[key]}`} score={result.psychology.scores[key]} caution={cautionKeys.includes(key)} />
                ))}
              </div>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
              <h2 className="text-2xl font-black text-white">그래프</h2>
              <RadarChart scores={result.psychology.scores} />
            </section>
          </div>

          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
            <h2 className="text-2xl font-black text-white">심리 리포트</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ReportBlock title="현재 마음 상태" body={fullReport.mentalState} />
              <ReportBlock title="주요 감정" body={fullReport.emotions.join(", ")} />
              <ReportBlock title="사고 패턴" body={fullReport.thoughtPattern} />
              <ReportBlock title="주의할 점" body={fullReport.cautions.join(" ")} />
              <ReportBlock title="오늘의 추천 행동" body={fullReport.recommendedActions.join(" / ")} />
              <ReportBlock title="감정일기에 적어볼 질문" body={fullReport.journalQuestions.join(" ")} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
            <h2 className="text-2xl font-black text-white">사주 리포트</h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="grid gap-4 md:grid-cols-2">
                <ReportBlock title="사주 원국" body={`${result.saju.year}년 ${result.saju.month}월 ${result.saju.day}일 ${result.saju.hour}시`} />
                <ReportBlock title="타고난 성향" body={fullReport.sajuNature} />
                <ReportBlock title="강한 오행" body={result.dominantElement} />
                <ReportBlock title="부족한 오행" body={result.weakElement} />
                <ReportBlock title="대운 흐름" body={fullReport.daewoonFlow} />
                <ReportBlock title="오늘의 운세 점수" body={`${result.todayFortuneScore}점`} />
                <ReportBlock title="오늘의 회복 루틴" body={fullReport.recoveryRoutine.join(" / ")} />
                <ReportBlock title="조심해야 할 점" body={fullReport.sajuCautions.join(" ")} />
                <ReportBlock title="활용하면 좋은 기운" body={fullReport.usefulEnergy} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="mb-4 text-sm font-black text-white">목화토금수 오행 개수</p>
                <ElementBars counts={result.elementCounts} />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
            <h2 className="text-2xl font-black text-white">종합 해석</h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-slate-300">
              {fullReport.combinedInterpretation.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Recommendation title="추천 행동 3개" items={fullReport.recommendedActions} />
            <Recommendation title="추천 플레이리스트 3개" items={fullReport.playlists} />
            <Recommendation title="추천 음악 3곡" items={fullReport.songs} />
          </section>
        </div>
      ) : null}

      <footer className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-400">
        <p>본 결과는 자기이해와 감정정리를 돕기 위한 참고용 콘텐츠이며, 의학적 진단이나 치료를 대체하지 않습니다.</p>
        <p className="mt-2">사주 및 운세 해석은 전통 명리학 기반의 참고용 콘텐츠입니다.</p>
      </footer>
    </section>
  );
}

function ReportBlock({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-sm font-black text-sky-200">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </article>
  );
}

function Recommendation({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3">{item}</li>
        ))}
      </ul>
    </section>
  );
}
