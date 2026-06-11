"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  getFortuneKeywordByGanji,
  getFortuneSummary,
  getTodayGanji,
} from "../lib/ganji";

export function TodayFortuneMusic() {
  const fortune = useMemo(() => {
    const ganji = getTodayGanji();
    const [year, month, day] = ganji.dateText.split(".");
    const weekday = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      weekday: "long",
    }).format(new Date(`${year}-${month}-${day}T00:00:00+09:00`));

    return {
      ganji,
      keywords: getFortuneKeywordByGanji(ganji),
      summary: getFortuneSummary(ganji),
      dateLabel: `${year}(${ganji.yearGanji}년) ${month}(${ganji.monthGanji}월) ${day}(${ganji.dayGanji}일) ${weekday}`,
    };
  }, []);

  return (
    <aside className="rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
      <div className="rounded-2xl bg-white/[0.06] p-4">
        <p className="text-xs text-slate-400">오늘날짜</p>
        <p className="mt-1 text-lg font-bold leading-7 text-white">{fortune.dateLabel}</p>
        <p className="mt-3 text-xs text-slate-400">오늘의 일진 / 60갑자</p>
        <p className="mt-1 font-bold text-white">{fortune.ganji.line}</p>
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
      <Link
        href="/fortune"
        className="mt-4 inline-flex w-full justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-pink-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 active:scale-[0.98]"
      >
        오늘의운세 보러가기
      </Link>
    </aside>
  );
}
