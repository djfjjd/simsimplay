"use client";

import { useState } from "react";
import Link from "next/link";

type BulkResult = {
  title: string;
  status: "success" | "error";
  error?: string;
  category?: string;
  contentLength?: number;
};

export default function BulkUploadClient() {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  async function handleGenerate() {
    const titles = text.split("\n").map((title) => title.trim()).filter(Boolean);
    if (titles.length === 0) {
      setMessage("제목을 하나 이상 입력해 주세요.");
      return;
    }

    setIsGenerating(true);
    setMessage("");
    setResults([]);

    try {
      const res = await fetch("/api/admin/posts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles, status })
      });
      const data = (await res.json()) as { results?: BulkResult[]; error?: string };
      if (res.ok) {
        setResults(data.results || []);
        setMessage(`${data.results?.length || 0}개의 장문 SEO 글이 생성되었습니다.`);
        setText("");
      } else {
        setMessage(data.error || "생성에 실패했습니다.");
      }
    } catch (error) {
      setMessage("오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <label className="block text-sm font-bold text-slate-400 mb-4">
          제목 목록 (한 줄에 하나씩 입력, 각 제목당 3000~5000자 수준의 SEO 글 생성)
        </label>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="경찰에게 잡혀가는 꿈 해몽&#10;윗니가 전부 빠지는 꿈 해몽&#10;불안할 때 대처하는 법"
          className="w-full min-h-[300px] rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none focus:ring-2 focus:ring-violet-500/50"
        />

        <div className="mt-6 max-w-xs">
          <label className="block text-sm font-bold text-slate-400 mb-2">생성 상태</label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "draft" | "published")}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-2xl bg-violet-600 px-10 py-4 font-bold text-white hover:bg-violet-500 transition disabled:opacity-50"
          >
            {isGenerating ? "자동 생성 중..." : "대량 글 생성하기"}
          </button>
          <Link href="/admin/blog" className="text-sm text-slate-400 hover:text-white underline">
            목록으로 돌아가기
          </Link>
        </div>
        {message && <p className="mt-4 text-pink-400 font-bold">{message}</p>}
      </section>

      {results.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h2 className="mb-6 text-xl font-bold text-white">생성 결과</h2>
          <div className="space-y-2">
            {results.map((res, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-2 text-sm">
                <span className="text-white truncate flex-1 mr-4">{res.title}</span>
                {res.status === "success" ? (
                  <span className="shrink-0 text-green-400 font-bold">
                    성공 {res.category ? `· ${res.category}` : ""} {res.contentLength ? `· ${res.contentLength}자` : ""}
                  </span>
                ) : (
                  <span className="text-red-400 font-bold">실패: {res.error}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
