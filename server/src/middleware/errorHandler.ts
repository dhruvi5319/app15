import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${code}] ${err.message}`, err.stack);
  }

  res.status(statusCode).json({
    error: { code, message: err.message },
  });
}
