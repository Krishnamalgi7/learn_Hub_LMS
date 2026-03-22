import type { NextFunction, Request, Response } from "express";

// Simple typed error with HTTP status
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  return res.status(500).json({ error: "Internal server error" });
};

