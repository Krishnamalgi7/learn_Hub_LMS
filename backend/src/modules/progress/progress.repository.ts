import { pool } from "../../config/db";

export interface SubjectProgressStats {
  totalVideos: number;
  completedVideos: number;
}

export interface VideoProgressRow {
  user_id: number;
  video_id: number;
  last_position_seconds: number;
  is_completed: number; // 0/1
  completed_at: Date | null;
}

export const getSubjectProgressStats = async (
  userId: number,
  subjectId: number,
): Promise<SubjectProgressStats> => {
  const [rows] = (await pool.query(
    `
      SELECT
        COUNT(*) AS totalVideos,
        SUM(
          CASE WHEN vp.is_completed = 1 THEN 1 ELSE 0 END
        ) AS completedVideos
      FROM videos v
      JOIN sections s
        ON s.id = v.section_id
      LEFT JOIN video_progress vp
        ON vp.video_id = v.id
        AND vp.user_id = :userId
      WHERE s.subject_id = :subjectId
    `,
    { userId, subjectId },
  )) as any;

  const row = rows[0];
  return {
    totalVideos: Number(row?.totalVideos ?? 0),
    completedVideos: Number(row?.completedVideos ?? 0),
  };
};

export const upsertVideoProgress = async (
  userId: number,
  videoId: number,
  lastPositionSeconds: number,
  isCompleted: boolean,
): Promise<VideoProgressRow> => {
  const completedAtExpr = isCompleted ? "NOW()" : "NULL";
  const completedInt = isCompleted ? 1 : 0;

  // Requires a unique key on (user_id, video_id) in `video_progress`.
  await pool.query(
    `
      INSERT INTO video_progress (user_id, video_id, last_position_seconds, is_completed, completed_at)
      VALUES (:userId, :videoId, :lastPositionSeconds, :completedInt, ${completedAtExpr})
      ON DUPLICATE KEY UPDATE
        last_position_seconds = VALUES(last_position_seconds),
        is_completed = VALUES(is_completed),
        completed_at = ${completedAtExpr}
    `,
    { userId, videoId, lastPositionSeconds, completedInt },
  );

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

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to upsert video_progress");
  }

  return row;
};

