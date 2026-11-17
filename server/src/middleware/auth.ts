import type { NextFunction, Request, Response } from 'express';
import { ACCESS_COOKIE_NAME } from '../config/cookies';
import { AppError } from '../utils/errors';
import { verifyAccessToken, type UserRole } from '../utils/tokens';

function getCookies(req: Request): Record<string, string | undefined> {
  return (req.cookies ?? {}) as Record<string, string | undefined>;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = getCookies(req)[ACCESS_COOKIE_NAME];

  if (!token) {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, 'SESSION_EXPIRED', 'Session is invalid or expired'));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = getCookies(req)[ACCESS_COOKIE_NAME];

  if (!token) {
    next();
    return;
  }

  try {
    req.user = verifyAccessToken(token);
  } catch {
    delete req.user;
  }

  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
      return;
    }

    next();
  };
}
