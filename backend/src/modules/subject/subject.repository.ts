import { pool } from "../../config/db";

export interface Subject {
  id: number;
  title: string;
  description: string | null;
  created_at: Date;
  instructor_id: number | null;
  is_paid: number; // 0/1
  price: number | null;
}

export interface SubjectTreeRow {
  subject_id: number;
  subject_title: string;
  subject_description: string | null;
  section_id: number | null;
  section_title: string | null;
  section_order_index: number | null;
  video_id: number | null;
  video_title: string | null;
  youtube_id: string | null;
  video_order_index: number | null;
  duration_seconds: number | null;
}

export interface SubjectFullRow {
  subject_id: number;
  subject_title: string;
  subject_description: string | null;

  section_id: number;
  section_title: string;
  section_order_index: number;

  video_id: number;
  video_title: string;
  youtube_id: string;
  video_order_index: number;
  duration_seconds: number;

  vp_last_position_seconds: number | null;
  vp_is_completed: number | null;
}

export const listSubjects = async (): Promise<Subject[]> => {
  const [rows] = (await pool.query(
    "SELECT id, title, description, created_at, instructor_id, is_paid, price FROM subjects ORDER BY created_at DESC",
  )) as any;
  return rows as Subject[];
};

export const getSubjectById = async (id: number): Promise<Subject | null> => {
  const [rows] = (await pool.query(
    "SELECT id, title, description, created_at, instructor_id, is_paid, price FROM subjects WHERE id = :id LIMIT 1",
    { id },
  )) as any;
  return (rows as Subject[])[0] ?? null;
};

export const getSubjectTreeRows = async (subjectId: number): Promise<SubjectTreeRow[]> => {
  const [rows] = (await pool.query(
    `
      SELECT
        subj.id AS subject_id,
        subj.title AS subject_title,
        subj.description AS subject_description,
        sec.id AS section_id,
        sec.title AS section_title,
        sec.order_index AS section_order_index,
        vid.id AS video_id,
        vid.title AS video_title,
        vid.youtube_id AS youtube_id,
        vid.order_index AS video_order_index,
        vid.duration_seconds AS duration_seconds
      FROM subjects subj
      LEFT JOIN sections sec
        ON sec.subject_id = subj.id
      LEFT JOIN videos vid
        ON vid.section_id = sec.id
      WHERE subj.id = :subjectId
      ORDER BY
        sec.order_index ASC,
        vid.order_index ASC
    `,
    { subjectId },
  )) as any;

  return rows as SubjectTreeRow[];
};

export const getSubjectFullRows = async (subjectId: number, userId: number): Promise<SubjectFullRow[]> => {
  const [rows] = (await pool.query(
    `
      SELECT
        subj.id AS subject_id,
        subj.title AS subject_title,
        subj.description AS subject_description,

        sec.id AS section_id,
        sec.title AS section_title,
        sec.order_index AS section_order_index,

        vid.id AS video_id,
        vid.title AS video_title,
        vid.youtube_id AS youtube_id,
        vid.order_index AS video_order_index,
        vid.duration_seconds AS duration_seconds,

        vp.last_position_seconds AS vp_last_position_seconds,
        vp.is_completed AS vp_is_completed
      FROM subjects subj
      JOIN sections sec
        ON sec.subject_id = subj.id
      JOIN videos vid
        ON vid.section_id = sec.id
      LEFT JOIN video_progress vp
        ON vp.video_id = vid.id
        AND vp.user_id = :userId
      WHERE subj.id = :subjectId
      ORDER BY
        sec.order_index ASC,
        vid.order_index ASC
    `,
    { subjectId, userId },
  )) as any;

  return rows as SubjectFullRow[];
};

