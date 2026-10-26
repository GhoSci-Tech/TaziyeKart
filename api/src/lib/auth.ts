import { compare, hash } from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from './errors';
import { COOKIE_NAME, ROLES, SESSION_MAX_AGE_MS, type Role } from './constants';

export type SessionUser = {
  id: string;
  role: Role;
  homeId: string | null;
};

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET is required. Check api/.env.');
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export function signSession(user: SessionUser): string {
  return jwt.sign(
    { role: user.role, homeId: user.homeId },
    jwtSecret(),
    { subject: user.id, expiresIn: '7d' },
  );
}

export function verifySession(token: string): SessionUser {
  let decoded: string | JwtPayload;
  try {
    decoded = jwt.verify(token, jwtSecret());
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
  }

  if (typeof decoded === 'string' || !decoded.sub || typeof decoded.sub !== 'string') {
    throw new AppError(401, 'UNAUTHORIZED', 'Geçersiz oturum.');
  }

  const role = decoded.role;
  if (typeof role !== 'string' || !ROLES.includes(role as Role)) {
    throw new AppError(401, 'UNAUTHORIZED', 'Geçersiz oturum rolü.');
  }

  return {
    id: decoded.sub,
    role: role as Role,
    homeId: typeof decoded.homeId === 'string' ? decoded.homeId : null,
  };
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    next(new AppError(401, 'UNAUTHORIZED', 'Giriş yapmanız gerekiyor.'));
    return;
  }

  try {
    req.user = verifySession(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'UNAUTHORIZED', 'Giriş yapmanız gerekiyor.'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'FORBIDDEN', 'Bu işlem için yetkiniz yok.'));
      return;
    }
    next();
  };
}
