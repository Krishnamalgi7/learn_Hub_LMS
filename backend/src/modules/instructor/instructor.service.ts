import { HttpError } from "../../middleware/error.middleware";
import { findUserById } from "../auth/auth.repository";
import {
  createCourse,
  createSection,
  createVideo,
  assertSectionBelongsToInstructor,
  assertSubjectBelongsToInstructor,
  listCoursesByInstructor,
  updateCourseByInstructor,
  deleteCourseByInstructor,
  updateSectionByInstructor,
  deleteSectionByInstructor,
  updateVideoByInstructor,
  deleteVideoByInstructor,
} from "./instructor.repository";

const ensureInstructor = async (instructorId: number) => {
  const user = await findUserById(instructorId);
  if (!user) throw new HttpError(401, "Unauthorized");
  if (user.role !== "instructor") throw new HttpError(403, "Instructor only");
};

export const createInstructorCourse = async (instructorId: number, payload: {
  title: string;
  description: string;
  price: number;
  isPaid: boolean;
}): Promise<number> => {
  await ensureInstructor(instructorId);

  if (!payload.title) throw new HttpError(400, "Missing title");
  if (payload.price < 0) throw new HttpError(400, "Price must be >= 0");

  return createCourse({
    instructorId,
    title: payload.title,
    description: payload.description ?? "",
    price: payload.price,
    isPaid: payload.isPaid,
  });
};

export const createInstructorSection = async (instructorId: number, payload: {
  subjectId: number;
  title: string;
  orderIndex: number;
}): Promise<number> => {
  await ensureInstructor(instructorId);

  if (!payload.title) throw new HttpError(400, "Missing title");
  if (!Number.isFinite(payload.subjectId) || payload.subjectId <= 0) {
    throw new HttpError(400, "Missing/invalid subjectId");
  }

  await assertSubjectBelongsToInstructor(payload.subjectId, instructorId);
  return createSection({
    subjectId: payload.subjectId,
    title: payload.title,
    orderIndex: payload.orderIndex,
  });
};

export const createInstructorVideo = async (
  instructorId: number,
  payload: {
    sectionId: number;
    title: string;
    youtubeId: string;
    orderIndex: number;
    durationSeconds: number;
  },
): Promise<number> => {
  await ensureInstructor(instructorId);

  if (!payload.title) throw new HttpError(400, "Missing title");
  if (!payload.youtubeId) throw new HttpError(400, "Missing youtube_id");

  await assertSectionBelongsToInstructor(payload.sectionId, instructorId);

  return createVideo({
    sectionId: payload.sectionId,
    title: payload.title,
    youtubeId: payload.youtubeId,
    orderIndex: payload.orderIndex,
    durationSeconds: payload.durationSeconds,
  });
};

export const getInstructorCourses = async (instructorId: number) => {
  await ensureInstructor(instructorId);
  return listCoursesByInstructor(instructorId);
};

export const updateInstructorCourse = async (
  instructorId: number,
  payload: { courseId: number; title: string; description: string; price: number; isPaid: boolean },
) => {
  await ensureInstructor(instructorId);
  if (!payload.title) throw new HttpError(400, "Missing title");
  if (payload.price < 0) throw new HttpError(400, "Price must be >= 0");
  await updateCourseByInstructor({
    courseId: payload.courseId,
    instructorId,
    title: payload.title,
    description: payload.description,
    price: payload.price,
    isPaid: payload.isPaid,
  });
};

export const deleteInstructorCourse = async (instructorId: number, courseId: number) => {
  await ensureInstructor(instructorId);
  await deleteCourseByInstructor(courseId, instructorId);
};

export const updateInstructorSection = async (
  instructorId: number,
  payload: { sectionId: number; title: string; orderIndex: number },
) => {
  await ensureInstructor(instructorId);
  if (!payload.title) throw new HttpError(400, "Missing title");
  await updateSectionByInstructor({
    sectionId: payload.sectionId,
    instructorId,
    title: payload.title,
    orderIndex: payload.orderIndex,
  });
};

export const deleteInstructorSection = async (instructorId: number, sectionId: number) => {
  await ensureInstructor(instructorId);
  await deleteSectionByInstructor(sectionId, instructorId);
};

export const updateInstructorVideo = async (
  instructorId: number,
  payload: { videoId: number; title: string; youtubeId: string; orderIndex: number },
) => {
  await ensureInstructor(instructorId);
  if (!payload.title) throw new HttpError(400, "Missing title");
  if (!payload.youtubeId) throw new HttpError(400, "Missing youtube_id");
  await updateVideoByInstructor({
    videoId: payload.videoId,
    instructorId,
    title: payload.title,
    youtubeId: payload.youtubeId,
    orderIndex: payload.orderIndex,
  });
};

export const deleteInstructorVideo = async (instructorId: number, videoId: number) => {
  await ensureInstructor(instructorId);
  await deleteVideoByInstructor(videoId, instructorId);
};

