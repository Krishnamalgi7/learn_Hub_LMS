import { apiClient } from "./client";

export type Subject = {
  id: number;
  title: string;
  description: string | null;
  created_at: string | Date;
  instructor_id?: number | null;
  is_paid?: number;
  price?: number | null;
};

export type SubjectTree = {
  subject: {
    id: number;
    title: string;
    description: string | null;
  };
  sections: Array<{
    id: number;
    title: string;
    order_index: number;
    videos: Array<{
      id: number;
      title: string;
      youtube_id: string;
      order_index: number;
      duration_seconds: number;
    }>;
  }>;
};

export type SubjectFullResponse = {
  subject: {
    id: number;
    title: string;
    description: string | null;
  };
  sections: Array<{
    id: number;
    title: string;
    order_index: number;
    videos: Array<{
      id: number;
      title: string;
      youtube_id: string;
      order_index: number;
      duration_seconds: number;
      is_locked: boolean;
      is_completed: boolean;
      last_position_seconds: number;
    }>;
  }>;
  progress: {
    totalVideos: number;
    completedVideos: number;
    percentage: number;
  };
};

export type VideoResponse = {
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
};

export type SubjectProgressResponse = {
  totalVideos: number;
  completedVideos: number;
  percentage: number;
};

export type EnrollmentWithProgress = {
  id: number;
  user_id: number;
  subject_id: number;
  title: string;
  description: string | null;
  totalVideos: number;
  completedVideos: number;
  percentage: number;
  watchedSeconds: number;
  lastPositionSeconds: number;
};

export const getSubjects = async (): Promise<Subject[]> => {
  const res = await apiClient.get("/subjects");
  // Normalize `is_paid` coming from MySQL (0/1) into a predictable field.
  return (res.data.subjects as any[]).map((s) => ({
    ...s,
    is_paid: s.is_paid,
    price: s.price ?? null,
    instructor_id: s.instructor_id ?? null,
  })) as Subject[];
};

export const getSubjectTree = async (subjectId: number): Promise<SubjectTree> => {
  const res = await apiClient.get(`/subjects/${subjectId}/tree`);
  return res.data.tree as SubjectTree;
};

export const getVideo = async (videoId: number): Promise<VideoResponse> => {
  const res = await apiClient.get(`/videos/${videoId}`);
  return res.data as VideoResponse;
};

export const getProgress = async (subjectId: number): Promise<SubjectProgressResponse> => {
  const res = await apiClient.get(`/progress/subjects/${subjectId}`);
  return res.data.progress as SubjectProgressResponse;
};

export const updateProgress = async (
  videoId: number,
  data: { last_position_seconds: number; is_completed: boolean },
): Promise<unknown> => {
  const res = await apiClient.post(`/progress/videos/${videoId}`, data);
  return res.data;
};

export const getSubjectFull = async (subjectId: number): Promise<SubjectFullResponse> => {
  const res = await apiClient.get(`/subjects/${subjectId}/full`);
  return res.data as SubjectFullResponse;
};

export const getEnrollmentsByUserId = async (userId: number): Promise<EnrollmentWithProgress[]> => {
  const res = await apiClient.get(`/enrollments/${userId}`);
  return res.data.enrollments as EnrollmentWithProgress[];
};

export const enrollInSubject = async (subjectId: number): Promise<void> => {
  await apiClient.post("/enrollments", { subject_id: subjectId });
};

export const createInstructorCourse = async (payload: {
  title: string;
  description: string;
  price: number;
  is_paid: boolean;
}): Promise<{ subjectId: number }> => {
  const res = await apiClient.post("/instructor/courses", {
    title: payload.title,
    description: payload.description,
    price: payload.price,
    is_paid: payload.is_paid,
  });
  return res.data as { subjectId: number };
};

export const createInstructorSection = async (payload: {
  subject_id: number;
  title: string;
  order_index?: number;
}): Promise<{ sectionId: number }> => {
  const res = await apiClient.post("/instructor/sections", {
    subject_id: payload.subject_id,
    title: payload.title,
    order_index: payload.order_index ?? 0,
  });
  return res.data as { sectionId: number };
};

export const createInstructorVideo = async (payload: {
  section_id: number;
  title: string;
  youtube_id: string;
  order_index?: number;
}): Promise<{ videoId: number }> => {
  const res = await apiClient.post("/instructor/videos", {
    section_id: payload.section_id,
    title: payload.title,
    youtube_id: payload.youtube_id,
    order_index: payload.order_index ?? 0,
  });
  return res.data as { videoId: number };
};

export type InstructorCourse = {
  id: number;
  title: string;
  description: string | null;
  is_paid: number;
  price: number | null;
  created_at: string | Date;
};

export const getInstructorCourses = async (): Promise<InstructorCourse[]> => {
  const res = await apiClient.get("/instructor/courses");
  return res.data.courses as InstructorCourse[];
};

export const updateInstructorCourse = async (
  courseId: number,
  payload: { title: string; description: string; price: number; is_paid: boolean },
): Promise<void> => {
  await apiClient.put(`/instructor/courses/${courseId}`, payload);
};

export const deleteInstructorCourse = async (courseId: number): Promise<void> => {
  await apiClient.delete(`/instructor/courses/${courseId}`);
};

export const updateInstructorSection = async (
  sectionId: number,
  payload: { title: string; order_index: number },
): Promise<void> => {
  await apiClient.put(`/instructor/sections/${sectionId}`, payload);
};

export const deleteInstructorSection = async (sectionId: number): Promise<void> => {
  await apiClient.delete(`/instructor/sections/${sectionId}`);
};

export const updateInstructorVideo = async (
  videoId: number,
  payload: { title: string; youtube_id: string; order_index: number },
): Promise<void> => {
  await apiClient.put(`/instructor/videos/${videoId}`, payload);
};

export const deleteInstructorVideo = async (videoId: number): Promise<void> => {
  await apiClient.delete(`/instructor/videos/${videoId}`);
};

