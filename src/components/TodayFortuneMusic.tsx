"use client";

import { useMemo } from "react";
import {
  getFortuneKeywordByGanji,
  getFortuneSummary,
  getTodayGanji,
} from "../lib/ganji";

export function TodayFortuneMusic() {
  const fortune = useMemo(() => {
    const ganji = getTodayGanji();
    return {
      ganji,
      keywords: getFortuneKeywordByGanji(ganji),
      summary: getFortuneSummary(ganji),
    };
  }, []);

  return (
    <aside className="rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
      <div className="grid gap-3">
        <div className="rounded-2xl bg-white/[0.06] p-4">
          <p className="text-xs text-slate-400">오늘 날짜</p>
          <p className="mt-1 text-xl font-bold text-white">{fortune.ganji.dateText}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] p-4">
          <p className="text-xs text-slate-400">오늘의 일진 / 60갑자</p>
          <p className="mt-1 font-bold text-white">{fortune.ganji.line}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {fortune.keywords.map((keyword) => (
          <span key={keyword} className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-100">
            {keyword}
          </span>
        ))}
      </div>
      <p className="mt-4 rounded-2xl border border-pink-300/20 bg-pink-500/10 p-4 text-sm leading-6 text-pink-50">
        {fortune.summary}
      </p>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        사주/운세 콘텐츠는 참고용 엔터테인먼트이며 확정적 예측이 아닙니다.
      </p>
    </aside>
  );
}
