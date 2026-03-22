import { hashPassword, verifyPassword } from "../../utils/password";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";
import {
  createUser,
  findUserByEmail,
  findValidRefreshToken,
  revokeRefreshToken,
  saveRefreshToken,
} from "./auth.repository";
import { HttpError } from "../../middleware/error.middleware";
import { env } from "../../config/env";

export const signup = async (
  name: string,
  email: string,
  password: string,
  role: "learner" | "instructor",
) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new HttpError(400, "Email already in use");
  }
  if (!name || !email || !password) {
    throw new HttpError(400, "Name, email, and password are required");
  }
  if (role !== "learner" && role !== "instructor") {
    throw new HttpError(400, "Role must be 'learner' or 'instructor'");
  }
  const passwordHash = await hashPassword(password);
  const user = await createUser(name, email, role, passwordHash);
  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

export const login = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    throw new HttpError(401, "Invalid credentials");
  }

  const accessToken = signAccessToken({ sub: String(user.id) });
  const refreshToken = signRefreshToken({ sub: String(user.id) });

  const refreshExpires = new Date(Date.now() + parseRefreshExpiryMs(env.jwt.refreshExpiresIn));
  await saveRefreshToken(user.id, refreshToken, refreshExpires);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

export const refreshTokens = async (token: string) => {
  const record = await findValidRefreshToken(token);
  if (!record) {
    throw new HttpError(401, "Invalid refresh token");
  }
  const userId = String(record.user_id);
  const accessToken = signAccessToken({ sub: userId });
  const refreshToken = signRefreshToken({ sub: userId });
  const refreshExpires = new Date(Date.now() + parseRefreshExpiryMs(env.jwt.refreshExpiresIn));
  await saveRefreshToken(record.user_id, refreshToken, refreshExpires);
  await revokeRefreshToken(token);
  return { accessToken, refreshToken };
};

export const logout = async (token: string) => {
  if (!token) return;
  await revokeRefreshToken(token);
};

const parseRefreshExpiryMs = (value: string): number => {
  // naive parser for values like "30d"
  if (value.endsWith("d")) {
    const days = Number(value.slice(0, -1));
    return days * 24 * 60 * 60 * 1000;
  }
  if (value.endsWith("h")) {
    const hours = Number(value.slice(0, -1));
    return hours * 60 * 60 * 1000;
  }
  if (value.endsWith("m")) {
    const mins = Number(value.slice(0, -1));
    return mins * 60 * 1000;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : 30 * 24 * 60 * 60 * 1000;
};

