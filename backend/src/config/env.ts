import dotenv from "dotenv";

dotenv.config();

const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  db: {
    host: required(process.env.DB_HOST, "DB_HOST"),
    port: Number(process.env.DB_PORT ?? 3306),
    user: required(process.env.DB_USER, "DB_USER"),
    password: required(process.env.DB_PASSWORD, "DB_PASSWORD"),
    database: required(process.env.DB_NAME, "DB_NAME"),
    /** Aiven / most cloud MySQL require TLS (set DB_SSL=true). */
    ssl: process.env.DB_SSL === "true",
  },
  jwt: {
    accessSecret: required(process.env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET"),
    refreshSecret: required(process.env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  },
  cookies: {
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.COOKIE_SECURE === "true",
  },
};

