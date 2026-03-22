import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Lock, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ProgressBar } from "@/components/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function LearningPage() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id);

  const {
    subjectTree,
    currentVideo,
    progress,
    completedVideos,
    videoStatusesById,
    loadSubject,
    loadVideo,
    trackAndUpdateProgress,
  } = usePlayerStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [playerStartSeconds, setPlayerStartSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoItemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const isLoadingSubject = !subjectTree;
  const isLoadingVideo = subjectTree && !currentVideo;

  const activeVideoId = currentVideo?.video.id ?? null;

  useEffect(() => {
    if (!Number.isFinite(subjectId)) return;
    let alive = true;
    (async () => {
      try {
        setError(null);
        await loadSubject(subjectId);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load course");
      }
    })();
    return () => {
      alive = false;
    };
  }, [subjectId, loadSubject]);

  useEffect(() => {
    if (!activeVideoId) return;
    const el = videoItemRefs.current[activeVideoId];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeVideoId]);

  useEffect(() => {
    if (!currentVideo) return;
    setPlayerStartSeconds(currentVideo.last_position_seconds ?? 0);
  }, [currentVideo?.video.id]);

  const handlePlayerProgress = async (currentSeconds: number, isCompleted: boolean) => {
    if (!currentVideo) return;
    if (currentVideo.is_locked) return;
    await trackAndUpdateProgress(currentVideo.video.id, currentSeconds, isCompleted);
  };

  const sidebar = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-display font-semibold text-foreground text-sm truncate">{subjectTree?.subject.title ?? "Loading..."}</h3>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progress ? `${progress.percentage}%` : "—"}</span>
          </div>
          <ProgressBar value={progress?.percentage ?? 0} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
        {subjectTree ? (
          subjectTree.sections.map((section) => (
            <div key={section.id}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">{section.title}</h4>
              <div className="space-y-0.5">
                {section.videos.map((video) => {
                  const status = videoStatusesById[video.id];
                  const isLocked = status ? status.is_locked : true;
                  const isCompleted = status ? status.is_completed : completedVideos.includes(video.id);
                  const isActive = activeVideoId === video.id;

                  return (
                    <div
                      key={video.id}
                      ref={(node) => {
                        videoItemRefs.current[video.id] = node;
                      }}
                    >
                      <motion.button
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        disabled={isLocked}
                        onClick={() => {
                          if (isLocked) return;
                          loadVideo(video.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={[
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
                          isActive
                            ? "bg-primary/10 border border-primary/20 text-foreground ring-1 ring-primary/20 shadow-card"
                            : "",
                          isLocked
                            ? "opacity-50 cursor-not-allowed text-muted-foreground blur-sm"
                            : isCompleted
                              ? "text-foreground"
                              : "hover:bg-secondary text-foreground",
                        ].join(" ")}
                      >
                        <div className="flex-shrink-0">
                          {isLocked ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald" />
                          ) : isActive ? (
                            <div className="h-4 w-4 rounded-full gradient-primary animate-pulse-glow" />
                          ) : (
                            <Play className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}>{video.title}</p>
                        </div>

                        <span className="text-xs text-muted-foreground flex-shrink-0">{video.duration_seconds ? `${video.duration_seconds}s` : ""}</span>
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const { nextId, prevId, nextIsLocked, prevIsLocked } = (() => {
    const ids: number[] =
      subjectTree?.sections.flatMap((s) => s.videos.map((v) => v.id)) ?? [];
    const activeId = currentVideo?.video.id ?? null;
    const idx = activeId != null ? ids.indexOf(activeId) : -1;

    const prev = idx > 0 ? ids[idx - 1] : null;
    const next = idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null;

    const pLocked = prev != null ? videoStatusesById[prev]?.is_locked ?? false : true;
    const nLocked = next != null ? videoStatusesById[next]?.is_locked ?? false : true;

    return { prevId: prev, nextId: next, prevIsLocked: pLocked, nextIsLocked: nLocked };
  })();

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      <ProgressBar value={progress?.percentage ?? 0} className="rounded-none h-1" />

      <div className="flex-1 flex relative">
        {error ? (
          <div className="absolute left-0 right-0 top-16 z-50 mx-auto max-w-3xl px-4 w-full">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">{error}</div>
          </div>
        ) : null}

        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="hidden md:block border-r border-border overflow-hidden bg-card flex-shrink-0"
            >
              {sidebar}
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden fixed inset-0 bg-background/80 z-40"
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="md:hidden fixed left-0 top-16 bottom-0 w-80 bg-card border-r border-border z-50"
              >
                {sidebar}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
              >
                Menu
              </button>
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
              >
                Menu Lessons
              </button>
            </div>

            {isLoadingVideo ? (
              <div className="space-y-4">
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ) : (
              <>
                <motion.div key={currentVideo?.video.id ?? "loading"} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                  {currentVideo ? (
                    <VideoPlayer
                      youtubeId={currentVideo.video.youtube_id}
                      startSeconds={playerStartSeconds}
                      onProgress={handlePlayerProgress}
                      updateIntervalMs={8000}
                      completedThresholdSeconds={2}
                    />
                  ) : (
                    <Skeleton className="h-72 w-full" />
                  )}
                </motion.div>

                <div className="space-y-2">
                  <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">{currentVideo?.video.title ?? "Loading..."}</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentVideo ? `${currentVideo.video.duration_seconds}s • ${currentVideo.is_completed ? "Completed" : "In progress"}` : ""}
                  </p>
                  {currentVideo?.is_locked ? <p className="text-sm text-destructive">This lesson is locked.</p> : null}
                </div>

                <div className="flex items-center gap-3">
                <button
                  onClick={() => prevId && loadVideo(prevId)}
                  disabled={!prevId || prevIsLocked || !!currentVideo?.is_locked}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  onClick={() => nextId && loadVideo(nextId)}
                  disabled={!nextId || nextIsLocked || !!currentVideo?.is_locked}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
                </div>
              </>
            )}

            {isLoadingSubject && (
              <div className="hidden" aria-hidden="true">
                Loading subject...
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

