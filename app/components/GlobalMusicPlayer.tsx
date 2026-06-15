"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type PlayerTrack = {
  id: string;
  title: string;
  description?: string;
  artist?: string;
  src: string;
  durationLabel?: string;
};

type StoredPlayerState = {
  queue: PlayerTrack[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  repeatQueue: boolean;
};

type MusicPlayerContextValue = {
  queue: PlayerTrack[];
  currentTrack: PlayerTrack | null;
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  duration: number;
  currentTime: number;
  canPlayCurrentTrack: boolean;
  isPlaybackBlocked: boolean;
  repeatQueue: boolean;
  playTrack: (track: PlayerTrack, queue?: PlayerTrack[], index?: number) => void;
  playQueue: (queue: PlayerTrack[], index?: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleRepeatQueue: () => void;
};

const storageKey = "simsimplay.musicPlayer.v1";
const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

function isPlayableSrc(src: string) {
  const value = src.trim();
  return Boolean(value) && value !== "#" && !value.startsWith("blob:");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function readStoredState(): StoredPlayerState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredPlayerState>;
    const queue = Array.isArray(parsed.queue) ? parsed.queue.filter((track) => {
      return (
        track &&
        typeof track.id === "string" &&
        typeof track.title === "string" &&
        typeof track.src === "string"
      );
    }) : [];

    if (queue.length === 0) return null;

    return {
      queue,
      currentIndex: clamp(Number(parsed.currentIndex) || 0, 0, queue.length - 1),
      isPlaying: Boolean(parsed.isPlaying),
      volume: clamp(Number(parsed.volume) || 0.75, 0, 1),
      currentTime: Math.max(Number(parsed.currentTime) || 0, 0),
      repeatQueue: parsed.repeatQueue !== false,
    };
  } catch {
    return null;
  }
}

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const restoredTimeRef = useRef(0);
  const restoredTrackIdRef = useRef<string | null>(null);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumeValue, setVolumeValue] = useState(0.75);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isPlaybackBlocked, setIsPlaybackBlocked] = useState(false);
  const [repeatQueue, setRepeatQueue] = useState(true);

  const currentTrack = queue[currentIndex] ?? null;
  const canPlayCurrentTrack = currentTrack ? isPlayableSrc(currentTrack.src) : false;

  useEffect(() => {
    queueMicrotask(() => {
      const stored = readStoredState();
      if (!stored) {
        setIsStorageReady(true);
        return;
      }

      setQueue(stored.queue);
      setCurrentIndex(stored.currentIndex);
      setIsPlaying(false);
      setVolumeValue(stored.volume);
      setCurrentTime(stored.currentTime);
      setRepeatQueue(stored.repeatQueue);
      restoredTimeRef.current = stored.currentTime;
      restoredTrackIdRef.current = stored.queue[stored.currentIndex]?.id ?? null;
      setIsStorageReady(true);
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volumeValue;
  }, [volumeValue]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (audio.src !== new URL(currentTrack.src, window.location.href).href) {
      audio.src = currentTrack.src;
      setDuration(0);
    }

    if (!canPlayCurrentTrack) {
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    if (isPlaying) {
      void audio.play()
        .then(() => {
          setIsPlaybackBlocked(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsPlaybackBlocked(true);
        });
    } else {
      audio.pause();
    }
  }, [canPlayCurrentTrack, currentTrack, isPlaying]);

  useEffect(() => {
    if (!isStorageReady) return;

    const state: StoredPlayerState = {
      queue,
      currentIndex,
      isPlaying,
      volume: volumeValue,
      currentTime,
      repeatQueue,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [currentIndex, currentTime, isPlaying, isStorageReady, queue, repeatQueue, volumeValue]);

  const playQueue = useCallback((nextQueue: PlayerTrack[], index = 0) => {
    if (nextQueue.length === 0) return;
    const nextIndex = clamp(index, 0, nextQueue.length - 1);
    restoredTimeRef.current = 0;
    restoredTrackIdRef.current = null;
    setQueue(nextQueue);
    setCurrentIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaybackBlocked(false);
    setIsPlaying(isPlayableSrc(nextQueue[nextIndex].src));
  }, []);

  const playTrack = useCallback((track: PlayerTrack, nextQueue?: PlayerTrack[], index = 0) => {
    playQueue(nextQueue?.length ? nextQueue : [track], nextQueue?.length ? index : 0);
  }, [playQueue]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
    restoredTimeRef.current = 0;
    restoredTrackIdRef.current = null;
    setCurrentIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaybackBlocked(false);
    setIsPlaying(isPlayableSrc(queue[nextIndex].src));
  }, [currentIndex, queue]);

  const playPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    restoredTimeRef.current = 0;
    restoredTrackIdRef.current = null;
    setCurrentIndex(previousIndex);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaybackBlocked(false);
    setIsPlaying(isPlayableSrc(queue[previousIndex].src));
  }, [currentIndex, queue]);

  const togglePlay = useCallback(() => {
    if (!currentTrack || !canPlayCurrentTrack) return;
    setIsPlaybackBlocked(false);
    setIsPlaying((value) => !value);
  }, [canPlayCurrentTrack, currentTrack]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = clamp(time, 0, Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    setVolumeValue(clamp(nextVolume, 0, 1));
  }, []);

  const toggleRepeatQueue = useCallback(() => {
    setRepeatQueue((value) => !value);
  }, []);

  const handleEnded = useCallback(() => {
    if (queue.length === 0) return;

    if (currentIndex < queue.length - 1) {
      playNext();
      return;
    }

    if (repeatQueue) {
      playNext();
      return;
    }

    restoredTimeRef.current = 0;
    restoredTrackIdRef.current = null;
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [currentIndex, playNext, queue.length, repeatQueue]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    if (restoredTrackIdRef.current === currentTrack.id && restoredTimeRef.current > 0) {
      audio.currentTime = Math.min(restoredTimeRef.current, audio.duration || restoredTimeRef.current);
      restoredTimeRef.current = 0;
      restoredTrackIdRef.current = null;
    }
  }, [currentTrack]);

  const value = useMemo<MusicPlayerContextValue>(() => ({
    queue,
    currentTrack,
    currentIndex,
    isPlaying,
    volume: volumeValue,
    duration,
    currentTime,
    canPlayCurrentTrack,
    isPlaybackBlocked,
    repeatQueue,
    playTrack,
    playQueue,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleRepeatQueue,
  }), [
    canPlayCurrentTrack,
    currentIndex,
    currentTime,
    currentTrack,
    duration,
    isPlaybackBlocked,
    isPlaying,
    playNext,
    playPrevious,
    playQueue,
    playTrack,
    queue,
    repeatQueue,
    seek,
    setVolume,
    toggleRepeatQueue,
    togglePlay,
    volumeValue,
  ]);

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onEnded={handleEnded}
      />
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const value = useContext(MusicPlayerContext);
  if (!value) {
    throw new Error("useMusicPlayer must be used inside MusicPlayerProvider");
  }
  return value;
}

function ControlButton({
  label,
  disabled,
  onClick,
  children,
  primary = false,
  attention = false,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  primary?: boolean;
  attention?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black transition",
        primary ? "bg-white text-slate-950 hover:bg-pink-100" : "border border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/10",
        attention ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-[#0d1020]" : "",
        disabled ? "cursor-not-allowed opacity-40" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function GlobalMiniPlayer() {
  const {
    currentTrack,
    currentIndex,
    queue,
    isPlaying,
    volume,
    duration,
    currentTime,
    canPlayCurrentTrack,
    isPlaybackBlocked,
    togglePlay,
    playNext,
    playPrevious,
    playQueue,
    seek,
    setVolume,
  } = useMusicPlayer();
  const playerRef = useRef<HTMLElement | null>(null);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const progressMax = duration || 0;
  const progressValue = progressMax ? Math.min(currentTime, progressMax) : 0;
  const totalTimeLabel = currentTrack?.durationLabel && currentTrack.durationLabel !== "-"
    ? currentTrack.durationLabel
    : formatTime(progressMax);
  const queueLabel = queue.length > 0 ? `${currentIndex + 1}/${queue.length}` : "0/0";

  useEffect(() => {
    if (!isQueueOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (playerRef.current?.contains(target)) return;
      setIsQueueOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isQueueOpen]);

  return (
    <section
      ref={playerRef}
      aria-label="전역 음악 플레이어"
      className="relative mx-auto w-[calc(100vw-32px)] max-w-[420px] rounded-xl border border-white/10 bg-[#0d1020]/95 px-2.5 py-1.5 shadow-xl shadow-black/25 backdrop-blur-xl md:w-full md:max-w-[22rem] md:px-3"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="min-w-0 text-left">
          <p className="truncate text-xs font-bold leading-4 text-white md:text-sm">
            {currentTrack?.title ?? "재생할 음악을 선택해주세요"}
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="hidden items-center justify-center gap-2 md:flex">
            <ControlButton label="이전곡" disabled={queue.length === 0} onClick={playPrevious}>
              <span aria-hidden="true">‹‹</span>
            </ControlButton>
            <ControlButton label={isPlaying ? "일시정지" : "재생"} disabled={!canPlayCurrentTrack} onClick={togglePlay} primary attention={isPlaybackBlocked}>
              <span aria-hidden="true">{isPlaying ? "II" : "▶"}</span>
            </ControlButton>
            <ControlButton label="다음곡" disabled={queue.length === 0} onClick={playNext}>
              <span aria-hidden="true">››</span>
            </ControlButton>
          </div>
          <span className="md:hidden">
            <ControlButton label={isPlaying ? "일시정지" : "재생"} disabled={!canPlayCurrentTrack} onClick={togglePlay} primary attention={isPlaybackBlocked}>
              <span aria-hidden="true">{isPlaying ? "II" : "▶"}</span>
            </ControlButton>
          </span>
        </div>

        <div className="relative hidden justify-center md:flex md:justify-end">
          <button
            type="button"
            aria-label="볼륨 조절 열기"
            aria-expanded={isVolumeOpen}
            title="볼륨"
            onClick={() => setIsVolumeOpen((value) => !value)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition hover:bg-white/10"
          >
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 9v6h4l5 4V5L8 9H4Zm11.5-.8v7.6a4 4 0 0 0 0-7.6Zm0-3.2v2.1a6 6 0 0 1 0 9.8V19a8 8 0 0 0 0-14Z" />
            </svg>
          </button>

          {isVolumeOpen ? (
            <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-white/10 bg-[#111426] p-3 shadow-xl shadow-black/30">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <span className="tabular-nums">{Math.round(volume * 100)}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="h-1 w-full accent-pink-400"
                  aria-label="볼륨"
                />
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-1 grid grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-2 text-[10px] tabular-nums text-slate-400 md:mt-1.5 md:grid-cols-[5.5rem_minmax(0,1fr)_4.25rem] md:text-[11px]">
        <span className="hidden whitespace-nowrap md:inline">{formatTime(progressValue)} / {totalTimeLabel}</span>
        <input
          type="range"
          min="0"
          max={progressMax || 0}
          step="0.1"
          value={progressValue}
          disabled={!canPlayCurrentTrack || progressMax === 0}
          onChange={(event) => seek(Number(event.target.value))}
          className="h-1 w-full accent-pink-400 disabled:opacity-40"
          aria-label="재생 위치"
        />
        <button
          type="button"
          aria-label="재생목록 열기"
          aria-expanded={isQueueOpen}
          disabled={queue.length === 0}
          onClick={() => setIsQueueOpen((value) => !value)}
          className="flex items-center justify-center gap-1 rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-center font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span>{queueLabel}</span>
          <span aria-hidden="true" className={isQueueOpen ? "text-[10px] leading-none" : "rotate-180 text-[10px] leading-none"}>
            ▴
          </span>
        </button>
      </div>

      <div className="mt-1 flex items-center justify-center gap-1.5 md:hidden">
        <ControlButton label="이전곡" disabled={queue.length === 0} onClick={playPrevious}>
          <span aria-hidden="true">‹‹</span>
        </ControlButton>
        <ControlButton label="다음곡" disabled={queue.length === 0} onClick={playNext}>
          <span aria-hidden="true">››</span>
        </ControlButton>
        <button
          type="button"
          aria-label="볼륨 조절 열기"
          aria-expanded={isVolumeOpen}
          title="볼륨"
          onClick={() => setIsVolumeOpen((value) => !value)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition hover:bg-white/10"
        >
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 9v6h4l5 4V5L8 9H4Zm11.5-.8v7.6a4 4 0 0 0 0-7.6Zm0-3.2v2.1a6 6 0 0 1 0 9.8V19a8 8 0 0 0 0-14Z" />
          </svg>
        </button>

        {isVolumeOpen ? (
          <div className="absolute right-2 top-[calc(100%+0.5rem)] z-20 w-36 rounded-xl border border-white/10 bg-[#111426] p-3 shadow-xl shadow-black/30">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
              <span className="tabular-nums">{Math.round(volume * 100)}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="h-1 w-full accent-pink-400"
                aria-label="볼륨"
              />
            </label>
          </div>
        ) : null}
      </div>

      {isQueueOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-[#111426]/98 p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {queue.map((track, index) => (
            <button
              key={`${track.id}-${index}`}
              type="button"
              onClick={() => {
                playQueue(queue, index);
                setIsQueueOpen(false);
              }}
              className={[
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition",
                index === currentIndex ? "bg-pink-400/15 text-pink-100" : "text-slate-300 hover:bg-white/[0.06]",
              ].join(" ")}
            >
              <span className="w-5 shrink-0 text-[10px] tabular-nums text-slate-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 truncate font-semibold">{track.title}</span>
              {index === currentIndex ? (
                <span className="ml-auto shrink-0 text-[10px] text-pink-200">재생중</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {currentTrack && !canPlayCurrentTrack ? (
        <p className="mt-1 truncate text-center text-[11px] text-amber-200">
          이 곡은 아직 재생 가능한 음원 URL이 없습니다.
        </p>
      ) : null}
    </section>
  );
}
