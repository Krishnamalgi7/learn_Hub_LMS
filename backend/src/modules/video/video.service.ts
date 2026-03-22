import { HttpError } from "../../middleware/error.middleware";
import {
  getNextVideoId,
  getPreviousVideoId,
  getUserVideoProgress,
  getVideoByIdDetailed,
  type UserVideoProgressRow,
} from "./video.repository";
import { getSubjectById } from "../subject/subject.repository";
import { isUserEnrolledInSubject } from "../enrollment/enrollment.repository";

export interface VideoResponse {
  video: {
    id: number;
    section_id: number;
    title: string;
    youtube_id: string;
    order_index: number;
    duration_seconds: number;
    subject_id: number;
    section_order_index: number;
  };
  next_video_id: number | null;
  previous_video_id: number | null;
  last_position_seconds: number;
  is_completed: boolean;
  is_locked: boolean;
}

const isCompletedRow = (row: UserVideoProgressRow | null): boolean => row?.is_completed === 1;

export const getVideoForUser = async (videoId: number, userId: number): Promise<VideoResponse> => {
  const video = await getVideoByIdDetailed(videoId);
  if (!video) {
    throw new HttpError(404, "Video not found");
  }

  const subject = await getSubjectById(video.subject_id);
  if (!subject) {
    throw new HttpError(404, "Subject not found");
  }
  const isOwner = subject.instructor_id != null && Number(subject.instructor_id) === userId;
  if (!isOwner) {
    const enrolled = await isUserEnrolledInSubject(userId, video.subject_id);
    if (!enrolled) {
      throw new HttpError(403, "Enrollment required");
    }
  }

  const [next_video_id, previous_video_id] = await Promise.all([
    getNextVideoId(video.subject_id, video.section_order_index, video.order_index),
    getPreviousVideoId(video.subject_id, video.section_order_index, video.order_index),
  ]);

  const currentProgress = await getUserVideoProgress(userId, videoId);
  const is_completed = isCompletedRow(currentProgress);
  const last_position_seconds = currentProgress?.last_position_seconds ?? 0;

  // Lesson locking:
  // - First video unlocked (no previous).
  // - Otherwise unlocked only when previous video is completed.
  let is_locked: boolean;
  if (is_completed) {
    is_locked = false;
  } else if (previous_video_id == null) {
    is_locked = false;
  } else {
    const previousProgress = await getUserVideoProgress(userId, previous_video_id);
    is_locked = !isCompletedRow(previousProgress);
  }

  return {
    video: {
      id: video.id,
      section_id: video.section_id,
      title: video.title,
      youtube_id: video.youtube_id,
      order_index: video.order_index,
      duration_seconds: video.duration_seconds,
      subject_id: video.subject_id,
      section_order_index: video.section_order_index,
    },
    next_video_id,
    previous_video_id,
    last_position_seconds,
    is_completed,
    is_locked,
  };
};

