import { HttpError } from "../../middleware/error.middleware";
import { getSubjectById, getSubjectTreeRows, listSubjects, type Subject, type SubjectTreeRow } from "./subject.repository";
import { getSubjectFullRows, type SubjectFullRow } from "./subject.repository";
import { isUserEnrolledInSubject } from "../enrollment/enrollment.repository";

export const getAllSubjects = async (): Promise<Subject[]> => {
  return listSubjects();
};

export const getSubject = async (id: number): Promise<Subject> => {
  const subject = await getSubjectById(id);
  if (!subject) {
    throw new HttpError(404, "Subject not found");
  }
  return subject;
};

export interface SubjectTree {
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
}

export const getSubjectTree = async (subjectId: number): Promise<SubjectTree> => {
  const rows: SubjectTreeRow[] = await getSubjectTreeRows(subjectId);
  if (rows.length === 0) {
    throw new HttpError(404, "Subject not found");
  }

  const subject = {
    id: rows[0].subject_id,
    title: rows[0].subject_title,
    description: rows[0].subject_description,
  };

  const sectionMap = new Map<
    number,
    { id: number; title: string; order_index: number; videos: SubjectTree["sections"][number]["videos"] }
  >();

  for (const row of rows) {
    if (row.section_id == null) continue;

    if (!sectionMap.has(row.section_id)) {
      sectionMap.set(row.section_id, {
        id: row.section_id,
        title: row.section_title ?? "",
        order_index: row.section_order_index ?? 0,
        videos: [],
      });
    }

    if (row.video_id != null) {
      const section = sectionMap.get(row.section_id)!;
      section.videos.push({
        id: row.video_id,
        title: row.video_title ?? "",
        youtube_id: row.youtube_id ?? "",
        order_index: row.video_order_index ?? 0,
        duration_seconds: row.duration_seconds ?? 0,
      });
    }
  }

  // Preserve ordering from SQL ORDER BY
  const sections = Array.from(sectionMap.values()).sort((a, b) => a.order_index - b.order_index);

  return {
    subject,
    sections: sections.map((s) => ({
      id: s.id,
      title: s.title,
      order_index: s.order_index,
      videos: s.videos,
    })),
  };
};

export interface SubjectFullResponse {
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
}

export const getSubjectFull = async (subjectId: number, userId: number): Promise<SubjectFullResponse> => {
  const subjectInfo = await getSubjectById(subjectId);
  if (!subjectInfo) {
    throw new HttpError(404, "Subject not found");
  }

  const isOwner = subjectInfo.instructor_id != null && Number(subjectInfo.instructor_id) === userId;
  if (!isOwner) {
    const enrolled = await isUserEnrolledInSubject(userId, subjectId);
    if (!enrolled) {
      throw new HttpError(403, "Enrollment required");
    }
  }

  const rows: SubjectFullRow[] = await getSubjectFullRows(subjectId, userId);
  if (rows.length === 0) {
    // Subject exists but has no sections/videos yet.
    return {
      subject: {
        id: subjectInfo.id,
        title: subjectInfo.title,
        description: subjectInfo.description,
      },
      sections: [],
      progress: { totalVideos: 0, completedVideos: 0, percentage: 0 },
    };
  }

  const subject = {
    id: rows[0].subject_id,
    title: rows[0].subject_title,
    description: rows[0].subject_description,
  };

  const sectionMap = new Map<
    number,
    { id: number; title: string; order_index: number; videos: SubjectFullResponse["sections"][number]["videos"] }
  >();

  const orderedVideoRows = rows; // already ordered by section_order_index, video_order_index

  let previousCompleted = false;
  for (let i = 0; i < orderedVideoRows.length; i++) {
    const row = orderedVideoRows[i];

    const isFirstVideo = i === 0;
    const isCompleted = row.vp_is_completed === 1;
    const is_locked = isFirstVideo ? false : !previousCompleted;
    const last_position_seconds = row.vp_last_position_seconds ?? 0;

    if (!sectionMap.has(row.section_id)) {
      sectionMap.set(row.section_id, {
        id: row.section_id,
        title: row.section_title,
        order_index: row.section_order_index,
        videos: [],
      });
    }

    sectionMap.get(row.section_id)!.videos.push({
      id: row.video_id,
      title: row.video_title,
      youtube_id: row.youtube_id,
      order_index: row.video_order_index,
      duration_seconds: row.duration_seconds,
      is_locked,
      is_completed: isCompleted,
      last_position_seconds,
    });

    previousCompleted = isCompleted;
  }

  const totalVideos = orderedVideoRows.length;
  const completedVideos = orderedVideoRows.reduce((acc, r) => acc + (r.vp_is_completed === 1 ? 1 : 0), 0);
  const percentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  const sections = Array.from(sectionMap.values()).sort((a, b) => a.order_index - b.order_index);

  return {
    subject,
    sections,
    progress: { totalVideos, completedVideos, percentage },
  };
};

