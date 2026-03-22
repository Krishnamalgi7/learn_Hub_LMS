import { pool } from "../../config/db";
import { HttpError } from "../../middleware/error.middleware";

export const assertSubjectBelongsToInstructor = async (subjectId: number, instructorId: number): Promise<void> => {
  const [rows] = (await pool.query(
    `
      SELECT 1
      FROM subjects
      WHERE id = :subjectId
        AND instructor_id = :instructorId
      LIMIT 1
    `,
    { subjectId, instructorId },
  )) as any;

  const ok = (rows as Array<{ 1: number }>).length > 0;
  if (!ok) {
    throw new HttpError(403, "Forbidden");
  }
};

export const assertSectionBelongsToInstructor = async (sectionId: number, instructorId: number): Promise<void> => {
  const [rows] = (await pool.query(
    `
      SELECT 1
      FROM sections sec
      JOIN subjects subj
        ON subj.id = sec.subject_id
      WHERE sec.id = :sectionId
        AND subj.instructor_id = :instructorId
      LIMIT 1
    `,
    { sectionId, instructorId },
  )) as any;

  const ok = (rows as any[]).length > 0;
  if (!ok) {
    throw new HttpError(403, "Forbidden");
  }
};

export const createCourse = async (params: {
  instructorId: number;
  title: string;
  description: string;
  price: number;
  isPaid: boolean;
}): Promise<number> => {
  const { instructorId, title, description, price, isPaid } = params;

  const [result] = (await pool.query(
    `
      INSERT INTO subjects (title, description, instructor_id, price, is_paid, created_at)
      VALUES (:title, :description, :instructor_id, :price, :is_paid, NOW())
    `,
    {
      title,
      description,
      instructor_id: instructorId,
      price,
      is_paid: isPaid ? 1 : 0,
    },
  )) as any;

  return result.insertId as number;
};

export const createSection = async (params: {
  subjectId: number;
  title: string;
  orderIndex: number;
}): Promise<number> => {
  const { subjectId, title, orderIndex } = params;

  const [result] = (await pool.query(
    `
      INSERT INTO sections (subject_id, title, order_index)
      VALUES (:subject_id, :title, :order_index)
    `,
    { subject_id: subjectId, title, order_index: orderIndex },
  )) as any;

  return result.insertId as number;
};

export const createVideo = async (params: {
  sectionId: number;
  title: string;
  youtubeId: string;
  orderIndex: number;
  durationSeconds: number;
}): Promise<number> => {
  const { sectionId, title, youtubeId, orderIndex, durationSeconds } = params;

  const [result] = (await pool.query(
    `
      INSERT INTO videos (section_id, title, youtube_id, order_index, duration_seconds)
      VALUES (:section_id, :title, :youtube_id, :order_index, :duration_seconds)
    `,
    {
      section_id: sectionId,
      title,
      youtube_id: youtubeId,
      order_index: orderIndex,
      duration_seconds: durationSeconds,
    },
  )) as any;

  return result.insertId as number;
};

export interface InstructorCourseRow {
  id: number;
  title: string;
  description: string | null;
  is_paid: number; // 0/1 from MySQL
  price: number | null;
  created_at: Date;
}

export const listCoursesByInstructor = async (instructorId: number): Promise<InstructorCourseRow[]> => {
  const [rows] = (await pool.query(
    `
      SELECT
        id,
        title,
        description,
        is_paid,
        price,
        created_at
      FROM subjects
      WHERE instructor_id = :instructorId
      ORDER BY created_at DESC
    `,
    { instructorId },
  )) as any;

  return rows as InstructorCourseRow[];
};

export const updateCourseByInstructor = async (params: {
  courseId: number;
  instructorId: number;
  title: string;
  description: string;
  isPaid: boolean;
  price: number;
}): Promise<void> => {
  const { courseId, instructorId, title, description, isPaid, price } = params;
  const [result] = (await pool.query(
    `
      UPDATE subjects
      SET
        title = :title,
        description = :description,
        is_paid = :is_paid,
        price = :price
      WHERE id = :courseId
        AND instructor_id = :instructorId
      LIMIT 1
    `,
    {
      title,
      description,
      is_paid: isPaid ? 1 : 0,
      price,
      courseId,
      instructorId,
    },
  )) as any;

  if ((result.affectedRows as number) === 0) {
    throw new HttpError(403, "Forbidden");
  }
};

export const deleteCourseByInstructor = async (courseId: number, instructorId: number): Promise<void> => {
  // Defensive transaction-based delete to work even without ON DELETE CASCADE.
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [ownershipRows] = (await conn.query(
      `
        SELECT id
        FROM subjects
        WHERE id = :courseId
          AND instructor_id = :instructorId
        LIMIT 1
      `,
      { courseId, instructorId },
    )) as any;

    if ((ownershipRows as any[]).length === 0) {
      throw new HttpError(403, "Forbidden");
    }

    await conn.query(
      `
        DELETE vp
        FROM video_progress vp
        JOIN videos v
          ON v.id = vp.video_id
        JOIN sections s
          ON s.id = v.section_id
        WHERE s.subject_id = :courseId
      `,
      { courseId },
    );

    await conn.query(
      `
        DELETE v
        FROM videos v
        JOIN sections s
          ON s.id = v.section_id
        WHERE s.subject_id = :courseId
      `,
      { courseId },
    );

    await conn.query("DELETE FROM sections WHERE subject_id = :courseId", { courseId });
    await conn.query("DELETE FROM enrollments WHERE subject_id = :courseId", { courseId });
    await conn.query("DELETE FROM subjects WHERE id = :courseId", { courseId });

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const updateSectionByInstructor = async (params: {
  sectionId: number;
  instructorId: number;
  title: string;
  orderIndex: number;
}): Promise<void> => {
  const { sectionId, instructorId, title, orderIndex } = params;
  await assertSectionBelongsToInstructor(sectionId, instructorId);
  await pool.query(
    `
      UPDATE sections
      SET title = :title, order_index = :orderIndex
      WHERE id = :sectionId
      LIMIT 1
    `,
    { sectionId, title, orderIndex },
  );
};

export const deleteSectionByInstructor = async (sectionId: number, instructorId: number): Promise<void> => {
  await assertSectionBelongsToInstructor(sectionId, instructorId);

  await pool.query(
    `
      DELETE vp
      FROM video_progress vp
      JOIN videos v
        ON v.id = vp.video_id
      WHERE v.section_id = :sectionId
    `,
    { sectionId },
  );
  await pool.query("DELETE FROM videos WHERE section_id = :sectionId", { sectionId });
  await pool.query("DELETE FROM sections WHERE id = :sectionId LIMIT 1", { sectionId });
};

export const updateVideoByInstructor = async (params: {
  videoId: number;
  instructorId: number;
  title: string;
  youtubeId: string;
  orderIndex: number;
}): Promise<void> => {
  const { videoId, instructorId, title, youtubeId, orderIndex } = params;
  const [rows] = (await pool.query(
    `
      SELECT 1
      FROM videos v
      JOIN sections s
        ON s.id = v.section_id
      JOIN subjects subj
        ON subj.id = s.subject_id
      WHERE v.id = :videoId
        AND subj.instructor_id = :instructorId
      LIMIT 1
    `,
    { videoId, instructorId },
  )) as any;
  if ((rows as any[]).length === 0) {
    throw new HttpError(403, "Forbidden");
  }

  await pool.query(
    `
      UPDATE videos
      SET
        title = :title,
        youtube_id = :youtubeId,
        order_index = :orderIndex
      WHERE id = :videoId
      LIMIT 1
    `,
    { videoId, title, youtubeId, orderIndex },
  );
};

export const deleteVideoByInstructor = async (videoId: number, instructorId: number): Promise<void> => {
  const [rows] = (await pool.query(
    `
      SELECT 1
      FROM videos v
      JOIN sections s
        ON s.id = v.section_id
      JOIN subjects subj
        ON subj.id = s.subject_id
      WHERE v.id = :videoId
        AND subj.instructor_id = :instructorId
      LIMIT 1
    `,
    { videoId, instructorId },
  )) as any;
  if ((rows as any[]).length === 0) {
    throw new HttpError(403, "Forbidden");
  }

  await pool.query("DELETE FROM video_progress WHERE video_id = :videoId", { videoId });
  await pool.query("DELETE FROM videos WHERE id = :videoId LIMIT 1", { videoId });
};

