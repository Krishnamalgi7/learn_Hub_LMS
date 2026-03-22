import { pool } from "../../config/db";

export interface VideoDetailed {
  id: number;
  section_id: number;
  title: string;
  youtube_id: string;
  order_index: number;
  duration_seconds: number;
  subject_id: number;
  section_order_index: number;
}

export interface UserVideoProgressRow {
  user_id: number;
  video_id: number;
  last_position_seconds: number;
  is_completed: number; // 0/1 from MySQL
  completed_at: Date | null;
}

export const getVideoByIdDetailed = async (videoId: number): Promise<VideoDetailed | null> => {
  const [rows] = (await pool.query(
    `
      SELECT
        v.id,
        v.section_id,
        v.title,
        v.youtube_id,
        v.order_index,
        v.duration_seconds,
        s.subject_id,
        s.order_index AS section_order_index
      FROM videos v
      JOIN sections s
        ON s.id = v.section_id
      WHERE v.id = :videoId
      LIMIT 1
    `,
    { videoId },
  )) as any;
  return (rows as VideoDetailed[])[0] ?? null;
};

export const getNextVideoId = async (
  subjectId: number,
  currentSectionOrderIndex: number,
  currentVideoOrderIndex: number,
): Promise<number | null> => {
  const [rows] = (await pool.query(
    `
      SELECT v2.id
      FROM videos v2
      JOIN sections s2
        ON s2.id = v2.section_id
      WHERE s2.subject_id = :subjectId
        AND (
          s2.order_index > :currentSectionOrderIndex
          OR (s2.order_index = :currentSectionOrderIndex AND v2.order_index > :currentVideoOrderIndex)
        )
      ORDER BY s2.order_index ASC, v2.order_index ASC
      LIMIT 1
    `,
    { subjectId, currentSectionOrderIndex, currentVideoOrderIndex },
  )) as any;
  return (rows as Array<{ id: number }>)[0]?.id ?? null;
};

export const getPreviousVideoId = async (
  subjectId: number,
  currentSectionOrderIndex: number,
  currentVideoOrderIndex: number,
): Promise<number | null> => {
  const [rows] = (await pool.query(
    `
      SELECT v2.id
      FROM videos v2
      JOIN sections s2
        ON s2.id = v2.section_id
      WHERE s2.subject_id = :subjectId
        AND (
          s2.order_index < :currentSectionOrderIndex
          OR (s2.order_index = :currentSectionOrderIndex AND v2.order_index < :currentVideoOrderIndex)
        )
      ORDER BY s2.order_index DESC, v2.order_index DESC
      LIMIT 1
    `,
    { subjectId, currentSectionOrderIndex, currentVideoOrderIndex },
  )) as any;
  return (rows as Array<{ id: number }>)[0]?.id ?? null;
};

export const getUserVideoProgress = async (
  userId: number,
  videoId: number,
): Promise<UserVideoProgressRow | null> => {
  const [rows] = (await pool.query(
    `
      SELECT
        user_id,
        video_id,
        last_position_seconds,
        is_completed,
        completed_at
      FROM video_progress
      WHERE user_id = :userId
        AND video_id = :videoId
      LIMIT 1
    `,
    { userId, videoId },
  )) as any;
  return (rows as UserVideoProgressRow[])[0] ?? null;
};

