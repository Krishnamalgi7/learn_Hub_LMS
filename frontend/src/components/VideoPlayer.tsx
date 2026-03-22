import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<void> | null = null;

const ensureYouTubeApi = async (): Promise<void> => {
  if (typeof window === "undefined") return;
  if (window.YT?.Player) return;

  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const existing = document.getElementById("youtube-iframe-api");
    if (existing) {
      window.onYouTubeIframeAPIReady = () => resolve();
      return;
    }

    window.onYouTubeIframeAPIReady = () => resolve();

    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
  });

  return ytApiPromise;
};

export function VideoPlayer({
  youtubeId,
  startSeconds = 0,
  autoplay = true,
  onProgress,
  updateIntervalMs = 8000,
  completedThresholdSeconds = 2,
}: {
  youtubeId: string;
  startSeconds?: number;
  autoplay?: boolean;
  onProgress?: (currentSeconds: number, isCompleted: boolean) => Promise<void> | void;
  updateIntervalMs?: number;
  completedThresholdSeconds?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const durationRef = useRef<number>(0);
  const tickIntervalRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const commit = async (seconds: number, isCompleted: boolean) => {
    try {
      await onProgress?.(seconds, isCompleted);
    } catch {
      // UI should not crash on tracking failures.
    }
  };

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      setIsLoading(true);
      await ensureYouTubeApi();
      if (cancelled) return;
      if (!containerRef.current) return;

      // Destroy previous player (if any).
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
      playerRef.current = null;

      const start = Math.max(0, Math.floor(startSeconds));
      playerRef.current = new window.YT!.Player(containerRef.current, {
        videoId: youtubeId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          autoplay: autoplay ? 1 : 0,
          start,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            durationRef.current = playerRef.current.getDuration?.() ?? 0;
            setIsLoading(false);
          },
          onStateChange: (evt: any) => {
            if (cancelled) return;
            const state = evt?.data;

            const YT = window.YT;
            const PLAYING = YT?.PlayerState?.PLAYING;
            const PAUSED = YT?.PlayerState?.PAUSED;
            const ENDED = YT?.PlayerState?.ENDED;

            if (state === PLAYING) {
              if (tickIntervalRef.current) return;
              tickIntervalRef.current = window.setInterval(() => {
                const p = playerRef.current;
                if (!p) return;
                const current = p.getCurrentTime?.() ?? 0;
                const duration = durationRef.current || p.getDuration?.() || 0;
                const completed = duration > 0 && current >= duration - completedThresholdSeconds;
                commit(current, completed);
              }, updateIntervalMs);
            } else if (state === PAUSED) {
              if (tickIntervalRef.current) window.clearInterval(tickIntervalRef.current);
              tickIntervalRef.current = null;
              const current = playerRef.current?.getCurrentTime?.() ?? 0;
              commit(current, false);
            } else if (state === ENDED) {
              if (tickIntervalRef.current) window.clearInterval(tickIntervalRef.current);
              tickIntervalRef.current = null;
              const duration = durationRef.current || playerRef.current?.getDuration?.() || 0;
              commit(duration > 0 ? duration : playerRef.current?.getCurrentTime?.() ?? 0, true);
            }
          },
        },
      });
    };

    setup();

    return () => {
      cancelled = true;
      if (tickIntervalRef.current) window.clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = null;
    };
  }, [youtubeId, startSeconds, autoplay, updateIntervalMs, completedThresholdSeconds]);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-secondary">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary">
          <div className="space-y-4 w-full p-8">
            <div className="h-full w-full rounded-lg bg-muted animate-pulse" style={{ minHeight: 200 }} />
            <div className="flex gap-3">
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
              <div className="h-3 w-16 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: isLoading ? 0 : 1 }} transition={{ duration: 0.3 }} className="w-full h-full">
        <div ref={containerRef} className="w-full h-full" />
      </motion.div>
    </div>
  );
}
