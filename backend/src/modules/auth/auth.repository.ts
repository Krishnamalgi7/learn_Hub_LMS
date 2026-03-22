import { pool } from "../../config/db";

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: "learner" | "instructor";
  password_hash: string;
  created_at: Date;
}

export const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const [rows] = (await pool.query(
    "SELECT id, name, email, role, password_hash, created_at FROM users WHERE email = :email LIMIT 1",
    { email },
  )) as any;
  return (rows as UserRecord[])[0] ?? null;
};

export const findUserById = async (userId: number): Promise<UserRecord | null> => {
  const [rows] = (await pool.query(
    "SELECT id, name, email, role, password_hash, created_at FROM users WHERE id = :userId LIMIT 1",
    { userId },
  )) as any;
  return (rows as UserRecord[])[0] ?? null;
};

export const createUser = async (
  name: string,
  email: string,
  role: "learner" | "instructor",
  passwordHash: string,
): Promise<UserRecord> => {
  const [result] = (await pool.query(
    "INSERT INTO users (name, email, role, password_hash) VALUES (:name, :email, :role, :password_hash)",
    { name, email, role, password_hash: passwordHash },
  )) as any;

  const [rows] = (await pool.query(
    "SELECT id, name, email, role, password_hash, created_at FROM users WHERE id = :id",
    { id: result.insertId as number },
  )) as any;

  const userRow = (rows as UserRecord[])[0];
  if (!userRow) {
    throw new Error("Failed to load created user");
  }
  return userRow;
};

export interface RefreshTokenRecord {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export const saveRefreshToken = async (userId: number, token: string, expiresAt: Date): Promise<void> => {
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)",
    { user_id: userId, token, expires_at: expiresAt },
  );
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await pool.query("DELETE FROM refresh_tokens WHERE token = :token", { token });
};

export const findValidRefreshToken = async (token: string): Promise<RefreshTokenRecord | null> => {
  const [rows] = (await pool.query(
    "SELECT id, user_id, token, expires_at, created_at FROM refresh_tokens WHERE token = :token AND expires_at > NOW() LIMIT 1",
    { token },
  )) as any;

  return (rows as RefreshTokenRecord[])[0] ?? null;
};

