import { HttpError } from "../../middleware/error.middleware";
import {
  subjectExists,
  upsertEnrollment,
  listEnrollmentsByUserWithProgress,
  type EnrollmentRow,
  type EnrollmentWithSubject,
} from "./enrollment.repository";

export const enrollInSubject = async (userId: number, subjectId: number): Promise<EnrollmentRow> => {
  const exists = await subjectExists(subjectId);
  if (!exists) {
    throw new HttpError(404, "Subject not found");
  }

  return upsertEnrollment(userId, subjectId);
};

export type EnrollmentWithProgress = Omit<EnrollmentWithSubject, "id"> & {
  id: number;
  totalVideos: number;
  completedVideos: number;
  percentage: number;
  watchedSeconds: number;
  lastPositionSeconds: number;
};

export const getEnrollments = async (userId: number): Promise<EnrollmentWithProgress[]> => {
  return listEnrollmentsByUserWithProgress(userId);
};

