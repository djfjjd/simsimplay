"use client";

const playlists = [
  {
    title: "잠들기 전 마음정리",
    situation: "생각이 많아 쉽게 잠들기 어려운 밤",
    count: "12곡",
    duration: "48분",
    emotion: "수면",
  },
  {
    title: "출근길 긍정 에너지",
    situation: "하루를 시작하기 전 기분을 끌어올리고 싶을 때",
    count: "10곡",
    duration: "36분",
    emotion: "긍정",
  },
  {
    title: "불안할 때 듣는 음악",
    situation: "걱정과 초조함이 반복될 때",
    count: "14곡",
    duration: "55분",
    emotion: "불안완화",
  },
  {
    title: "우울한 날 회복 음악",
    situation: "마음이 무겁고 에너지가 낮은 날",
    count: "11곡",
    duration: "42분",
    emotion: "회복",
  },
  {
    title: "공부와 코딩 집중 음악",
    situation: "집중은 필요하지만 자극적인 소리는 피하고 싶을 때",
    count: "16곡",
    duration: "64분",
    emotion: "집중",
  },
  {
    title: "새벽 감성 명상 음악",
    situation: "조용한 새벽에 마음을 차분히 바라보고 싶을 때",
    count: "9곡",
    duration: "38분",
    emotion: "명상",
  },
];

export function PlaylistClient() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {playlists.map((playlist) => (
        <button
          key={playlist.title}
          type="button"
          onClick={() => alert("플레이리스트 상세페이지는 준비중입니다.")}
          className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 text-left shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:bg-white/[0.1]"
        >
          <span className="rounded-full bg-pink-400/10 px-3 py-1 text-xs font-bold text-pink-100">
            {playlist.emotion}
          </span>
          <h2 className="mt-4 text-2xl font-bold text-white">{playlist.title}</h2>
          <p className="mt-3 leading-7 text-slate-300">{playlist.situation}</p>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-black/25 p-4 text-sm text-slate-300">
            <span>{playlist.count}</span>
            <span>{playlist.duration}</span>
          </div>
          <span className="mt-5 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-3 text-sm font-bold text-white">
            듣기
          </span>
        </button>
      ))}
    </div>
  );
}
