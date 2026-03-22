import { pool } from "../../config/db";

export interface Section {
  id: number;
  subject_id: number;
  title: string;
  order_index: number;
}

export const listSectionsBySubject = async (subjectId: number): Promise<Section[]> => {
  const [rows] = (await pool.query(
    `
      SELECT id, subject_id, title, order_index
      FROM sections
      WHERE subject_id = :subjectId
      ORDER BY order_index ASC
    `,
    { subjectId },
  )) as any;
  return rows as Section[];
};

export const getSectionById = async (id: number): Promise<Section | null> => {
  const [rows] = (await pool.query(
    `
      SELECT id, subject_id, title, order_index
      FROM sections
      WHERE id = :id
      LIMIT 1
    `,
    { id },
  )) as any;
  return (rows as Section[])[0] ?? null;
};

