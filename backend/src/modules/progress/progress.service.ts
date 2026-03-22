import { HttpError } from "../../middleware/error.middleware";
import {
  getSubjectProgressStats,
  upsertVideoProgress,
  type SubjectProgressStats,
  type VideoProgressRow,
} from "./progress.repository";
import { getSubjectById } from "../subject/subject.repository";
import { isUserEnrolledInSubject } from "../enrollment/enrollment.repository";
import { getVideoByIdDetailed } from "../video/video.repository";

export interface SubjectProgressResponse {
  totalVideos: number;
  completedVideos: number;
  percentage: number;
}

export const getSubjectProgress = async (
  userId: number,
  subjectId: number,
): Promise<SubjectProgressResponse> => {
  const subject = await getSubjectById(subjectId);
  if (!subject) {
    throw new HttpError(404, "Subject not found");
  }
  const isOwner = subject.instructor_id != null && Number(subject.instructor_id) === userId;
  if (!isOwner) {
    const enrolled = await isUserEnrolledInSubject(userId, subjectId);
    if (!enrolled) {
      throw new HttpError(403, "Enrollment required");
    }
  }

  const stats: SubjectProgressStats = await getSubjectProgressStats(userId, subjectId);
  const total = stats.totalVideos;
  const completed = stats.completedVideos;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { totalVideos: total, completedVideos: completed, percentage };
};

export const upsertVideoProgressForUser = async (
  userId: number,
  videoId: number,
  lastPositionSeconds: number,
  isCompleted: boolean,
): Promise<VideoProgressRow> => {
  if (!Number.isFinite(lastPositionSeconds) || lastPositionSeconds < 0) {
    throw new HttpError(400, "Invalid last_position_seconds");
  }

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

  return upsertVideoProgress(userId, videoId, lastPositionSeconds, isCompleted);
};

