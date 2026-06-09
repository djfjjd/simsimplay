"use client";

import { useState } from "react";
import { calculateSaju, type SajuResult } from "../../src/lib/ganji";

export function FortuneClient() {
  const [birthDate, setBirthDate] = useState("");
  const [birthHour, setBirthHour] = useState("모름");
  const [result, setResult] = useState<SajuResult | null>(null);

  const hours = [
    "모름", "자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"
  ];

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;
    setResult(calculateSaju(birthDate, birthHour));
  };

  return (
    <div className="max-w-4xl">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
        <form onSubmit={handleAnalyze} className="grid gap-6 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">생년월일 (필수)</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white focus:ring-4 focus:ring-violet-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">태어난 시간 (선택)</label>
            <select
              value={birthHour}
              onChange={(e) => setBirthHour(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white focus:ring-4 focus:ring-violet-500/20 outline-none transition appearance-none"
            >
              {hours.map((h) => (
                <option key={h} value={h} className="bg-[#1a1b26]">
                  {h === "모름" ? "모름 (시간 선택 안함)" : `${h}시`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!birthDate}
              className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-4 font-bold text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              사주 분석하기
            </button>
          </div>
        </form>
      </section>

      {result && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            {/* Pillars */}
            <div className="flex gap-3 h-fit">
              {[
                { label: "시주", val: result.hour },
                { label: "일주", val: result.day },
                { label: "월주", val: result.month },
                { label: "연주", val: result.year },
              ].map((p) => (
                <div key={p.label} className="flex flex-col items-center">
                  <div className="w-14 h-28 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl font-black text-white">{p.val[0] || "?"}</span>
                    <span className="text-2xl font-black text-white">{p.val[1] || "?"}</span>
                  </div>
                  <span className="mt-2 text-xs font-bold text-slate-500 uppercase">{p.label}</span>
                </div>
              ))}
            </div>

            {/* Analysis */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-4">내 사주 분석 결과</h3>
              <p className="text-lg leading-relaxed text-slate-300">
                {result.description}
              </p>
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-sm text-slate-500">
                  * 본 분석은 입력하신 생년월일을 바탕으로 한 간이 사주 결과입니다. 타고난 기운을 참고하여 긍정적인 하루를 만들어보세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
