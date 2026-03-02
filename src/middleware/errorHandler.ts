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
  const message = err.message ?? 'Internal server error';

  console.error('[errorHandler]', code, message, err.stack);

  if (res.headersSent) return;
  try {
    res.status(statusCode).json({
      success: false,
      message,
      code,
    });
  } catch (e) {
    console.error('[errorHandler] failed to send response', e);
    try {
      res.status(500).end('Internal server error');
    } catch {
      // connection may be closed
    }
  }
}
