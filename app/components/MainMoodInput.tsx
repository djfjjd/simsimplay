"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MainMoodInput() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Redirect to mood page with the input as a query param (or similar logic)
    // For now, let's just go to /mood. 
    // In a real app, we might pass the state or use a global store.
    // Given the current structure, let's just redirect to the mood page.
    router.push(`/mood`);
  };

  return (
    <div className="mx-auto mt-12 max-w-2xl">
      <form onSubmit={handleSubmit} className="relative group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="오늘 당신의 기분은 어떤가요? 마음을 들려주세요."
          className="w-full min-h-[160px] rounded-3xl border border-white/10 bg-white/5 p-6 pr-24 text-lg leading-relaxed text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all backdrop-blur-sm"
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
