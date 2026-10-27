import type { NextFunction, Request, Response } from 'express';
import { AppError } from './errors';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function originGuard(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin;
  if (!origin) {
    next();
    return;
  }

  const allowed = process.env.WEB_ORIGIN?.trim();
  if (allowed && origin !== allowed) {
    next(new AppError(403, 'FORBIDDEN', 'Geçersiz istek kaynağı.'));
    return;
  }

  next();
}
