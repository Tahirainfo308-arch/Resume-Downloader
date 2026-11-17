import { randomUUID } from 'node:crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { durationToSeconds } from './duration';

export type UserRole = 'user' | 'admin';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: UserRole;
  tokenVersion: number;
  jti: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  tokenVersion: number;
  familyId: string;
  jti: string;
}

type NewAccessToken = Omit<AccessTokenPayload, 'iat' | 'exp'>;
type NewRefreshToken = Omit<RefreshTokenPayload, 'iat' | 'exp'>;

export function newTokenId(): string {
  return randomUUID();
}

export function signAccessToken(payload: NewAccessToken): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: durationToSeconds(env.JWT_ACCESS_TTL),
  });
}

export function signRefreshToken(payload: NewRefreshToken): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: durationToSeconds(env.JWT_REFRESH_TTL),
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

  if (typeof decoded === 'string') {
    throw new Error('Invalid access token payload');
  }

  return decoded as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

  if (typeof decoded === 'string') {
    throw new Error('Invalid refresh token payload');
  }

  return decoded as RefreshTokenPayload;
}
