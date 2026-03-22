import { create } from "zustand";
import type { SubjectFullResponse, SubjectProgressResponse } from "../api/lms";
import { getSubjectFull, updateProgress } from "../api/lms";

export type VideoStatus = {
  video: {
    id: number;
    title: string;
    youtube_id: string;
    order_index: number;
    duration_seconds: number;
  };
  is_locked: boolean;
  is_completed: boolean;
  last_position_seconds: number;
};

export type PlayerStatusByVideoId = Record<number, VideoStatus>;

type PlayerStore = {
  // Required fields
  currentVideo: VideoStatus | null;
  subjectTree: SubjectFullResponse | null;
  progress: SubjectProgressResponse | null;
  lastPosition: number;
  completedVideos: number[];

  // Helpful derived state
  activeSubjectId: number | null;
  videoStatusesById: PlayerStatusByVideoId;

  // Actions
  loadSubject: (subjectId: number) => Promise<void>;
  loadVideo: (videoId: number) => Promise<void>;
  refreshVideoStatuses: () => Promise<void>;
  trackAndUpdateProgress: (videoId: number, lastPositionSeconds: number, isCompleted: boolean) => Promise<void>;
  markPlaybackCompletedAndRefresh: () => Promise<void>;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentVideo: null,
  subjectTree: null,
  progress: null,
  lastPosition: 0,
  completedVideos: [],

  activeSubjectId: null,
  videoStatusesById: {},

  loadSubject: async (subjectId: number) => {
    const full = await getSubjectFull(subjectId);

    const orderedVideos = full.sections.flatMap((s) => s.videos);
    const statuses: PlayerStatusByVideoId = {};
    for (const v of orderedVideos) {
      statuses[v.id] = {
        video: {
          id: v.id,
          title: v.title,
          youtube_id: v.youtube_id,
          order_index: v.order_index,
          duration_seconds: v.duration_seconds,
        },
        is_locked: v.is_locked,
        is_completed: v.is_completed,
        last_position_seconds: v.last_position_seconds,
      };
    }

    const completedVideos = orderedVideos.filter((v) => v.is_completed).map((v) => v.id);

    const unlockedNotCompleted = orderedVideos.filter((v) => !v.is_locked && !v.is_completed);
    const resumeCandidates = unlockedNotCompleted.filter((v) => v.last_position_seconds > 0);
    const initialVideoId =
      resumeCandidates.sort((a, b) => b.last_position_seconds - a.last_position_seconds)[0]?.id ??
      unlockedNotCompleted[0]?.id ??
      orderedVideos[0]?.id ??
      null;

    const currentVideo = initialVideoId ? statuses[initialVideoId] : null;

    set({
      activeSubjectId: subjectId,
      subjectTree: full,
      progress: full.progress,
      videoStatusesById: statuses,
      completedVideos,
      currentVideo,
      lastPosition: currentVideo?.last_position_seconds ?? 0,
    });
  },

  refreshVideoStatuses: async () => {
    const { activeSubjectId, currentVideo } = get();
    if (!activeSubjectId) return;

    const full = await getSubjectFull(activeSubjectId);
    const orderedVideos = full.sections.flatMap((s) => s.videos);

    const statuses: PlayerStatusByVideoId = {};
    for (const v of orderedVideos) {
      statuses[v.id] = {
        video: {
          id: v.id,
          title: v.title,
          youtube_id: v.youtube_id,
          order_index: v.order_index,
          duration_seconds: v.duration_seconds,
        },
        is_locked: v.is_locked,
        is_completed: v.is_completed,
        last_position_seconds: v.last_position_seconds,
      };
    }

    const completedVideos = orderedVideos.filter((v) => v.is_completed).map((v) => v.id);

    const currentId = currentVideo?.video.id ?? null;
    const updatedCurrent = currentId ? statuses[currentId] ?? null : null;

    set({
      subjectTree: full,
      progress: full.progress,
      videoStatusesById: statuses,
      completedVideos,
      currentVideo: updatedCurrent,
      lastPosition: updatedCurrent?.last_position_seconds ?? get().lastPosition,
    });
  },

  loadVideo: async (videoId: number) => {
    const { videoStatusesById } = get();
    const status = videoStatusesById[videoId];
    if (!status) return;

    set({
      currentVideo: status,
      lastPosition: status.last_position_seconds,
    });
  },

  trackAndUpdateProgress: async (videoId: number, lastPositionSeconds: number, isCompleted: boolean) => {
    await updateProgress(videoId, {
      last_position_seconds: Math.floor(lastPositionSeconds),
      is_completed: isCompleted,
    });

    set((state) => {
      const current = state.currentVideo;
      const existing = state.videoStatusesById[videoId];
      const updatedStatus = existing
        ? {
            ...existing,
            is_completed: isCompleted,
            last_position_seconds: Math.floor(lastPositionSeconds),
          }
        : null;

      return {
        lastPosition: Math.floor(lastPositionSeconds),
        currentVideo: current && current.video.id === videoId && updatedStatus ? updatedStatus : current,
        videoStatusesById: updatedStatus
          ? {
              ...state.videoStatusesById,
              [videoId]: updatedStatus,
            }
          : state.videoStatusesById,
        completedVideos: isCompleted
          ? [...new Set([...(state.completedVideos ?? []), videoId])]
          : state.completedVideos.filter((id) => id !== videoId),
      };
    });

    // Refresh locks/resume state only when we mark completion.
    if (isCompleted) {
      await get().markPlaybackCompletedAndRefresh();
    }
  },

  markPlaybackCompletedAndRefresh: async () => {
    await get().refreshVideoStatuses();
  },
}));

