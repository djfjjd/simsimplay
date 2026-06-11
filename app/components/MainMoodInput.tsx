"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MainMoodInput() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;
    
    sessionStorage.setItem(
      "simsimplay.mood.autoplayRequest",
      JSON.stringify({ prompt, createdAt: Date.now() }),
    );

    const encodedInput = encodeURIComponent(prompt);
    router.push(`/mood?q=${encodedInput}`);
  };

  return (
    <div className="mx-auto mt-12 max-w-2xl">
      <form onSubmit={handleSubmit} className="relative group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="오늘의 일기를 작성하세요"
          className="min-h-[190px] w-full rounded-3xl border border-white/10 bg-white/5 p-6 pr-24 text-lg leading-relaxed text-white placeholder:text-slate-500 transition-all backdrop-blur-sm focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
        />
        <button
          type="submit"
          className="absolute bottom-4 right-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 font-bold text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50"
          disabled={!input.trim()}
        >
          분석하기
        </button>
      </form>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {["평온함", "약간 우울", "스트레스", "활기참"].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setInput((prev) => (prev ? `${prev} ${tag}` : tag))}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}
