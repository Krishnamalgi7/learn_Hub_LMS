import { pool } from "../../config/db";

export interface EnrollmentRow {
  id: number;
  user_id: number;
  subject_id: number;
}

export interface EnrollmentWithSubject {
  id: number;
  user_id: number;
  subject_id: number;
  title: string;
  description: string | null;
}

export interface EnrollmentWithProgress extends EnrollmentWithSubject {
  totalVideos: number;
  completedVideos: number;
  percentage: number;
  watchedSeconds: number;
  lastPositionSeconds: number;
}

export const subjectExists = async (subjectId: number): Promise<boolean> => {
  const [rows] = (await pool.query(
    `
      SELECT 1 AS subject_exists
      FROM subjects
      WHERE id = :subjectId
      LIMIT 1
    `,
    { subjectId },
  )) as any;

  return (rows as Array<{ subject_exists: number }>).length > 0;
};

export const upsertEnrollment = async (userId: number, subjectId: number): Promise<EnrollmentRow> => {
  await pool.query(
    `
      INSERT INTO enrollments (user_id, subject_id)
      VALUES (:userId, :subjectId)
      ON DUPLICATE KEY UPDATE
        subject_id = VALUES(subject_id)
    `,
    { userId, subjectId },
  );

  const [rows] = (await pool.query(
    `
      SELECT id, user_id, subject_id
      FROM enrollments
      WHERE user_id = :userId
        AND subject_id = :subjectId
      LIMIT 1
    `,
    { userId, subjectId },
  )) as any;

  const row = (rows as EnrollmentRow[])[0];
  if (!row) {
    throw new Error("Failed to load enrollment after upsert");
  }

  return row;
};

export const listEnrollmentsByUser = async (userId: number): Promise<EnrollmentWithSubject[]> => {
  const [rows] = (await pool.query(
    `
      SELECT
        e.id,
        e.user_id,
        e.subject_id,
        s.title,
        s.description
      FROM enrollments e
      JOIN subjects s
        ON s.id = e.subject_id
      WHERE e.user_id = :userId
      ORDER BY e.id DESC
    `,
    { userId },
  )) as any;

  return rows as EnrollmentWithSubject[];
};

export const listEnrollmentsByUserWithProgress = async (
  userId: number,
): Promise<EnrollmentWithProgress[]> => {
  const [rows] = (await pool.query(
    `
      SELECT
        e.id,
        e.user_id,
        e.subject_id,
        s.title,
        s.description,

        COUNT(v.id) AS total_videos,
        SUM(CASE WHEN vp.is_completed = 1 THEN 1 ELSE 0 END) AS completed_videos,

        SUM(COALESCE(vp.last_position_seconds, 0)) AS watched_seconds,
        MAX(COALESCE(vp.last_position_seconds, 0)) AS last_position_seconds,

        CASE
          WHEN COUNT(v.id) = 0 THEN 0
          ELSE ROUND(
            SUM(CASE WHEN vp.is_completed = 1 THEN 1 ELSE 0 END) / COUNT(v.id) * 100
          )
        END AS percentage

      FROM enrollments e
      JOIN subjects s
        ON s.id = e.subject_id
      LEFT JOIN sections sec
        ON sec.subject_id = s.id
      LEFT JOIN videos v
        ON v.section_id = sec.id
      LEFT JOIN video_progress vp
        ON vp.video_id = v.id
        AND vp.user_id = :userId
      WHERE e.user_id = :userId
      GROUP BY
        e.id,
        e.user_id,
        e.subject_id,
        s.title,
        s.description
      ORDER BY e.id DESC
    `,
    { userId },
  )) as any;

  return (rows as any[]).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    subject_id: r.subject_id,
    title: r.title,
    description: r.description,
    totalVideos: Number(r.total_videos ?? 0),
    completedVideos: Number(r.completed_videos ?? 0),
    percentage: Number(r.percentage ?? 0),
    watchedSeconds: Number(r.watched_seconds ?? 0),
    lastPositionSeconds: Number(r.last_position_seconds ?? 0),
  })) as EnrollmentWithProgress[];
};

export const isUserEnrolledInSubject = async (userId: number, subjectId: number): Promise<boolean> => {
  const [rows] = (await pool.query(
    `
      SELECT 1 AS enrolled
      FROM enrollments
      WHERE user_id = :userId
        AND subject_id = :subjectId
      LIMIT 1
    `,
    { userId, subjectId },
  )) as any;
  return (rows as Array<{ enrolled: number }>).length > 0;
};

