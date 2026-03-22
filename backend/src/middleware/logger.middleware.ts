import type { Request, Response, NextFunction } from "express";

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    // Basic structured log
    console.log(
      JSON.stringify({
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: duration,
      }),
    );
  });
  next();
};

