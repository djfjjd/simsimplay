"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  answerOptions,
  createPsychologySessionQuestions,
  type PsychologyQuestion,
} from "../../src/lib/psychologyQuestions";

type Gender = "여성" | "남성";

type PsychologyProfile = {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  gender: Gender;
};

const profileKey = "simsimplay_psychology_profile";
const answersKey = "simsimplay_psychology_answers";
const questionsKey = "simsimplay_psychology_questions";
const resultKey = "simsimplay_psychology_result";

const hours = [
  { value: "모름", label: "모름" },
  { value: "자", label: "자시 (23:00 ~ 01:00)" },
  { value: "축", label: "축시 (01:00 ~ 03:00)" },
  { value: "인", label: "인시 (03:00 ~ 05:00)" },
  { value: "묘", label: "묘시 (05:00 ~ 07:00)" },
  { value: "진", label: "진시 (07:00 ~ 09:00)" },
  { value: "사", label: "사시 (09:00 ~ 11:00)" },
  { value: "오", label: "오시 (11:00 ~ 13:00)" },
  { value: "미", label: "미시 (13:00 ~ 15:00)" },
  { value: "신", label: "신시 (15:00 ~ 17:00)" },
  { value: "유", label: "유시 (17:00 ~ 19:00)" },
  { value: "술", label: "술시 (19:00 ~ 21:00)" },
  { value: "해", label: "해시 (21:00 ~ 23:00)" },
];

const initialProfile: PsychologyProfile = {
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  birthHour: "모름",
  gender: "여성",
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.sessionStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-left">
      <span className="mb-2 block text-sm font-bold text-slate-200">{label}</span>
      {children}
    </label>
  );
}

export function PsychologyClient() {
  const router = useRouter();
  const [step, setStep] = useState<"profile" | "questions">("profile");
  const [profile, setProfile] = useState<PsychologyProfile>(initialProfile);
  const [questions, setQuestions] = useState<PsychologyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setProfile(readJson(profileKey, initialProfile));
    setQuestions(readJson<PsychologyQuestion[]>(questionsKey, []));
    setAnswers(readJson<Record<string, number>>(answersKey, {}));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(profileKey, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (typeof window === "undefined" || questions.length === 0) return;
    window.sessionStorage.setItem(questionsKey, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(answersKey, JSON.stringify(answers));
  }, [answers]);

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  const currentQuestion = questions[currentIndex];
  const canStart = profile.birthYear && profile.birthMonth && profile.birthDay && profile.birthHour && profile.gender;
  const canGoNext = currentQuestion ? Boolean(answers[currentQuestion.id]) : false;

  function updateProfile(field: keyof PsychologyProfile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function startTest(event: FormEvent) {
    event.preventDefault();
    if (!canStart) return;
    const nextQuestions = createPsychologySessionQuestions();
    setQuestions(nextQuestions);
    setAnswers({});
    setCurrentIndex(0);
    setStep("questions");
    window.sessionStorage.removeItem(resultKey);
  }

  function selectAnswer(value: number) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  function goNext() {
    if (!canGoNext) return;
    if (currentIndex === questions.length - 1) {
      router.push("/psychology/result");
      return;
    }
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  }

  if (step === "questions" && currentQuestion) {
    return (
      <section className="w-full max-w-3xl text-left">
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-200">
            <span>진행률 {progress}%</span>
            <span>
              현재 문항: {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/30">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-pink-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <article className="rounded-3xl border border-white/10 bg-[#101425] p-5 shadow-2xl shadow-black/25 sm:p-8">
          <p className="text-sm font-bold text-sky-200">
            널리 쓰이는 심리 선별 문항 구조를 참고한 마음상태 체크
          </p>
          <h2 className="mt-4 text-2xl font-black leading-snug text-white sm:text-3xl">
            {currentQuestion.text}
          </h2>
          <div className="mt-7 grid gap-3">
            {answerOptions.map((option) => {
              const active = answers[currentQuestion.id] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectAnswer(option.value)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left text-base font-bold transition ${
                    active
                      ? "border-pink-300 bg-pink-300 text-slate-950"
                      : "border-white/10 bg-white/[0.04] text-slate-100 hover:border-white/25 hover:bg-white/[0.08]"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="tabular-nums">{option.value}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
              disabled={currentIndex === 0}
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-black text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              이전
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentIndex === questions.length - 1 ? "결과 분석하기" : "다음"}
            </button>
          </div>
        </article>
      </section>
    );
  }

  return (
    <form onSubmit={startTest} className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left shadow-2xl shadow-black/25 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="생년">
          <input
            value={profile.birthYear}
            onChange={(event) => updateProfile("birthYear", event.target.value)}
            inputMode="numeric"
            placeholder="1994"
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-sky-300"
          />
        </Field>
        <Field label="생월">
          <input
            value={profile.birthMonth}
            onChange={(event) => updateProfile("birthMonth", event.target.value)}
            inputMode="numeric"
            placeholder="08"
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-sky-300"
          />
        </Field>
        <Field label="생일">
          <input
            value={profile.birthDay}
            onChange={(event) => updateProfile("birthDay", event.target.value)}
            inputMode="numeric"
            placeholder="15"
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-sky-300"
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="출생시간">
          <select
            value={profile.birthHour}
            onChange={(event) => updateProfile("birthHour", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-sky-300"
          >
            {hours.map((hour) => (
              <option key={hour.value} value={hour.value}>
                {hour.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="성별">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/25 p-1">
            {(["여성", "남성"] as const).map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => updateProfile("gender", gender)}
                className={`rounded-xl px-4 py-3 text-sm font-black ${
                  profile.gender === gender ? "bg-sky-300 text-slate-950" : "text-slate-300"
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-6 rounded-2xl border border-sky-300/15 bg-sky-300/10 p-4 text-sm leading-6 text-slate-300">
        이 체크는 의학적 진단이 아닌 감정정리와 자기이해를 돕는 참고용 결과입니다. 입력 정보와 답변은 서버나 D1에 저장하지 않고 이 브라우저의 세션에만 임시 저장합니다.
      </div>

      <button
        type="submit"
        disabled={!canStart}
        className="mt-6 w-full rounded-full bg-white px-6 py-4 text-base font-black text-slate-950 shadow-lg shadow-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        테스트 시작하기
      </button>
    </form>
  );
}
