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
  playTrack: (track: PlayerTrack, queue?: PlayerTrack[], index?: number) => void;
  playQueue: (queue: PlayerTrack[], index?: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
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
      setIsPlaying(stored.isPlaying);
      setVolumeValue(stored.volume);
      setCurrentTime(stored.currentTime);
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
      void audio.play().catch(() => {
        setIsPlaying(false);
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
    };

    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [currentIndex, currentTime, isPlaying, isStorageReady, queue, volumeValue]);

  const playQueue = useCallback((nextQueue: PlayerTrack[], index = 0) => {
    if (nextQueue.length === 0) return;
    const nextIndex = clamp(index, 0, nextQueue.length - 1);
    restoredTimeRef.current = 0;
    restoredTrackIdRef.current = null;
    setQueue(nextQueue);
    setCurrentIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
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
    setIsPlaying(isPlayableSrc(queue[previousIndex].src));
  }, [currentIndex, queue]);

  const togglePlay = useCallback(() => {
    if (!currentTrack || !canPlayCurrentTrack) return;
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
    playTrack,
    playQueue,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
  }), [
    canPlayCurrentTrack,
    currentIndex,
    currentTime,
    currentTrack,
    duration,
    isPlaying,
    playNext,
    playPrevious,
    playQueue,
    playTrack,
    queue,
    seek,
    setVolume,
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
        onEnded={playNext}
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
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  primary?: boolean;
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
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
  } = useMusicPlayer();

  const progressMax = duration || 0;
  const progressValue = progressMax ? Math.min(currentTime, progressMax) : 0;
  const totalTimeLabel = currentTrack?.durationLabel && currentTrack.durationLabel !== "-"
    ? currentTrack.durationLabel
    : formatTime(progressMax);

  return (
    <section
      aria-label="전역 음악 플레이어"
      className="w-full max-w-[42rem] rounded-2xl border border-white/10 bg-[#0d1020]/95 px-3 py-2 shadow-xl shadow-black/25 backdrop-blur-xl"
    >
      <div className="grid gap-2 sm:grid-cols-[minmax(7rem,1fr)_auto_minmax(7rem,0.8fr)] sm:items-center">
        <div className="min-w-0 text-center sm:text-left">
          <p className="truncate text-sm font-bold leading-5 text-white">
            {currentTrack?.title ?? "재생할 음악을 선택해주세요"}
          </p>
          <p className="truncate text-[11px] leading-4 text-slate-400">
            {currentTrack?.description || currentTrack?.artist || "SimSimPlay 전역 플레이어"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <ControlButton label="이전곡" disabled={queue.length === 0} onClick={playPrevious}>
            <span aria-hidden="true">‹‹</span>
          </ControlButton>
          <ControlButton label={isPlaying ? "일시정지" : "재생"} disabled={!canPlayCurrentTrack} onClick={togglePlay} primary>
            <span aria-hidden="true">{isPlaying ? "II" : "▶"}</span>
          </ControlButton>
          <ControlButton label="다음곡" disabled={queue.length === 0} onClick={playNext}>
            <span aria-hidden="true">››</span>
          </ControlButton>
        </div>

        <label className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-slate-400">
          <span className="shrink-0">Vol</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="h-1 w-full min-w-20 accent-pink-400"
            aria-label="볼륨"
          />
        </label>
      </div>

      <div className="mt-2 grid grid-cols-[5.5rem_minmax(0,1fr)_3rem] items-center gap-2 text-[11px] tabular-nums text-slate-400">
        <span className="whitespace-nowrap">{formatTime(progressValue)} / {totalTimeLabel}</span>
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
        <span className="text-right text-slate-600">
          {queue.length > 1 ? `${currentIndex + 1}/${queue.length}` : "1/1"}
        </span>
      </div>

      {currentTrack && !canPlayCurrentTrack ? (
        <p className="mt-1 truncate text-center text-[11px] text-amber-200">
          이 곡은 아직 재생 가능한 음원 URL이 없습니다.
        </p>
      ) : null}
    </section>
  );
}
