"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type TrackStatus = "draft" | "published";

type PreviewTrack = {
  id: string;
  file: File;
  selected: boolean;
  title: string;
  slug: string;
  category: string;
  emotionTags: string[];
  situationTags: string[];
  timeTags: string[];
  energyScore: number;
  prompt: string;
  status: TrackStatus;
};

const categories = ["수면", "불안완화", "우울회복", "집중", "새벽감성", "행운"];

function cleanTitle(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createSlug(input: string) {
  return input
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "") || "music";
}

function hasAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function analyzeFile(file: File, index: number): PreviewTrack {
  const title = cleanTitle(file.name) || `Untitled Track ${index + 1}`;
  const lower = `${file.name} ${title}`.toLowerCase();
  const korean = `${file.name} ${title}`;

  let category = "행운";
  if (hasAny(lower, ["sleep", "night", "dream", "bed"]) || hasAny(korean, ["수면", "잠", "숙면", "밤"])) {
    category = "수면";
  } else if (hasAny(lower, ["anxiety", "calm", "relief", "breath"]) || hasAny(korean, ["불안", "진정", "호흡", "안정"])) {
    category = "불안완화";
  } else if (hasAny(lower, ["sad", "blue", "recovery", "heal"]) || hasAny(korean, ["우울", "회복", "치유", "위로"])) {
    category = "우울회복";
  } else if (hasAny(lower, ["focus", "study", "work", "coding", "lofi"]) || hasAny(korean, ["집중", "공부", "작업", "코딩"])) {
    category = "집중";
  } else if (hasAny(lower, ["dawn", "midnight", "early morning"]) || hasAny(korean, ["새벽", "몽환", "감성"])) {
    category = "새벽감성";
  }

  const preset: Record<string, Pick<PreviewTrack, "emotionTags" | "situationTags" | "timeTags" | "energyScore">> = {
    "수면": { emotionTags: ["수면", "평온"], situationTags: ["잠들기전", "명상"], timeTags: ["밤"], energyScore: 18 },
    "불안완화": { emotionTags: ["불안", "평온"], situationTags: ["호흡", "휴식"], timeTags: ["저녁"], energyScore: 28 },
    "우울회복": { emotionTags: ["우울", "회복"], situationTags: ["퇴근후", "감정정리"], timeTags: ["저녁"], energyScore: 42 },
    "집중": { emotionTags: ["집중", "평온"], situationTags: ["공부", "작업"], timeTags: ["오후"], energyScore: 64 },
    "새벽감성": { emotionTags: ["그리움", "명상"], situationTags: ["새벽", "독서"], timeTags: ["새벽"], energyScore: 34 },
    "행운": { emotionTags: ["희망", "행복"], situationTags: ["아침", "출근길"], timeTags: ["아침"], energyScore: 72 },
  };
  const tags = preset[category];

  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    file,
    selected: true,
    title,
    slug: createSlug(title),
    category,
    ...tags,
    prompt: `${category} mood, ${title}, warm ambient texture, gentle piano, clean mix, loopable, no vocal`,
    status: "published",
  };
}

function uniqueTracks(files: File[]) {
  const seen = new Set<string>();
  return files.filter((file) => {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function MusicBulkUploadClient() {
  const [tracks, setTracks] = useState<PreviewTrack[]>([]);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ count: number; errors: Array<{ fileName: string; error: string }> } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  const selectedTracks = useMemo(() => tracks.filter((track) => track.selected), [tracks]);

  function addFiles(fileList: FileList | File[]) {
    const mp3Files = Array.from(fileList).filter((file) => {
      return file.type.startsWith("audio/") || file.name.toLowerCase().endsWith(".mp3");
    });
    const nextFiles = uniqueTracks([...tracks.map((track) => track.file), ...mp3Files]);
    setTracks(nextFiles.slice(0, 100).map(analyzeFile));
    setUploadResult(null);
    setMessage(mp3Files.length === 0 ? "MP3 파일만 업로드할 수 있습니다." : `${Math.min(nextFiles.length, 100)}개 파일을 분석했습니다.`);
  }

  function updateTrack(id: string, patch: Partial<PreviewTrack>) {
    setTracks((current) => current.map((track) => track.id === id ? { ...track, ...patch } : track));
  }

  function setSelectedStatus(status: TrackStatus) {
    setTracks((current) => current.map((track) => track.selected ? { ...track, status } : track));
  }

  async function handleUpload() {
    if (selectedTracks.length === 0) {
      setMessage("업로드할 곡을 선택해 주세요.");
      return;
    }

    setIsUploading(true);
    setMessage(`1 / ${selectedTracks.length} 파일을 R2에 업로드하고 D1에 저장하는 중입니다.`);
    setUploadProgress({ current: 0, total: selectedTracks.length });
    setUploadResult(null);

    const uploadedTrackIds: string[] = [];
    const errors: Array<{ fileName: string; error: string }> = [];
    let savedCount = 0;

    try {
      for (const [index, track] of selectedTracks.entries()) {
        setUploadProgress({ current: index, total: selectedTracks.length });
        setMessage(`${index + 1} / ${selectedTracks.length} 파일을 R2에 업로드하고 D1에 저장하는 중입니다: ${track.file.name}`);

        const form = new FormData();
        form.append("files", track.file, track.file.name);
        form.append("metadata", JSON.stringify([{
          fileName: track.file.name,
          title: track.title,
          slug: track.slug,
          category: track.category,
          emotionTags: track.emotionTags,
          situationTags: track.situationTags,
          timeTags: track.timeTags,
          energyScore: track.energyScore,
          prompt: track.prompt,
          status: track.status,
        }]));

        try {
          const response = await fetch("/api/admin/music/bulk", {
            method: "POST",
            body: form,
          });
          const payload = await response.json().catch(() => null) as {
            count?: number;
            errors?: Array<{ fileName: string; error: string }>;
            error?: string;
          } | null;

          if (!response.ok) {
            errors.push({ fileName: track.file.name, error: payload?.error || `업로드 실패 (${response.status})` });
            continue;
          }

          if (payload?.errors?.length) {
            errors.push(...payload.errors);
          }

          const count = payload?.count || 0;
          savedCount += count;
          if (count > 0) {
            uploadedTrackIds.push(track.id);
          }
        } catch (error) {
          errors.push({ fileName: track.file.name, error: error instanceof Error ? error.message : "업로드에 실패했습니다." });
        }
      }

      setUploadProgress({ current: selectedTracks.length, total: selectedTracks.length });
      setUploadResult({ count: savedCount, errors });
      setMessage(errors.length > 0 ? `${savedCount}개 저장, ${errors.length}개 실패했습니다.` : `${savedCount}개 곡이 저장되었습니다.`);
      if (uploadedTrackIds.length > 0) {
        setTracks((current) => current.filter((track) => !uploadedTrackIds.includes(track.id)));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            addFiles(event.dataTransfer.files);
          }}
          className="flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-black/25 p-8 text-center transition hover:border-blue-400/60"
        >
          <p className="text-lg font-bold text-white">MP3 파일 드래그앤드롭</p>
          <p className="mt-2 text-sm text-slate-400">30~100개 파일을 한 번에 분석하고, 50개 이상도 같은 요청에서 처리합니다.</p>
          <label className="mt-6 cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500">
            파일 선택
            <input
              type="file"
              accept="audio/mpeg,audio/mp3,.mp3"
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);
              }}
            />
          </label>
        </div>
        {message && <p className="mt-4 text-sm font-bold text-pink-300">{message}</p>}
        {uploadProgress && (
          <div className="mt-4 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-2 rounded-full bg-violet-400 transition-all"
              style={{ width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%` }}
            />
          </div>
        )}
      </section>

      {tracks.length > 0 && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">업로드 전 미리보기</h2>
              <p className="mt-1 text-sm text-slate-400">선택 {selectedTracks.length}개 / 전체 {tracks.length}개</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTracks((current) => current.map((track) => ({ ...track, selected: true })))}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10"
              >
                전체 선택
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("published")}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-500"
              >
                선택곡 전체 공개
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("draft")}
                className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold text-white hover:bg-slate-600"
              >
                선택곡 전체 비공개
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleUpload}
                className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? "업로드 중..." : "선택곡 R2 업로드 및 저장"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04]">
            <table className="w-full min-w-[1200px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs text-slate-400">
                <tr>
                  <th className="px-3 py-3">선택</th>
                  <th className="px-3 py-3">제목 / slug</th>
                  <th className="px-3 py-3">카테고리</th>
                  <th className="px-3 py-3">감정태그</th>
                  <th className="px-3 py-3">상황태그</th>
                  <th className="px-3 py-3">시간대</th>
                  <th className="px-3 py-3">에너지</th>
                  <th className="px-3 py-3">상태</th>
                  <th className="px-3 py-3">Suno 프롬프트</th>
                  <th className="px-3 py-3">썸네일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tracks.map((track) => (
                  <tr key={track.id} className="align-top">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={track.selected}
                        onChange={(event) => updateTrack(track.id, { selected: event.target.checked })}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={track.title}
                        onChange={(event) => updateTrack(track.id, { title: event.target.value, slug: createSlug(event.target.value) })}
                        className="mb-2 w-56 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                      />
                      <p className="text-xs text-slate-500">{track.slug}</p>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={track.category}
                        onChange={(event) => updateTrack(track.id, { category: event.target.value })}
                        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                      >
                        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-slate-300">{track.emotionTags.join(", ")}</td>
                    <td className="px-3 py-3 text-slate-300">{track.situationTags.join(", ")}</td>
                    <td className="px-3 py-3 text-slate-300">{track.timeTags.join(", ")}</td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={track.energyScore}
                        onChange={(event) => updateTrack(track.id, { energyScore: Number(event.target.value) })}
                        className="w-20 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={track.status}
                        onChange={(event) => updateTrack(track.id, { status: event.target.value as TrackStatus })}
                        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                      >
                        <option value="published">공개</option>
                        <option value="draft">비공개</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <textarea
                        value={track.prompt}
                        onChange={(event) => updateTrack(track.id, { prompt: event.target.value })}
                        className="h-24 w-72 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-14 w-24 rounded-lg bg-gradient-to-br from-blue-600 to-violet-900 p-2 text-xs font-bold text-white">
                        {track.category}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {uploadResult && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-bold text-white">업로드 결과</h2>
          <p className="mt-2 text-sm text-slate-300">저장 완료: {uploadResult.count}개</p>
          {uploadResult.errors.length > 0 && (
            <div className="mt-4 space-y-1 text-sm text-red-300">
              {uploadResult.errors.map((error) => (
                <p key={error.fileName}>{error.fileName}: {error.error}</p>
              ))}
            </div>
          )}
          <Link href="/admin" className="mt-5 inline-block text-sm font-bold text-blue-300 hover:text-white">
            음악 관리로 돌아가기
          </Link>
        </section>
      )}
    </div>
  );
}
