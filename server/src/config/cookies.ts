import type { CookieOptions } from 'express';
import { env } from './env';
import { durationToMilliseconds } from '../utils/duration';

export const ACCESS_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';
export const CSRF_COOKIE_NAME = 'csrf_token';

const domainOption = env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {};

export const accessCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE || env.isProduction,
  sameSite: env.isProduction ? 'strict' : 'lax',
  path: '/',
  maxAge: durationToMilliseconds(env.JWT_ACCESS_TTL),
  ...domainOption,
};

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE || env.isProduction,
  sameSite: 'strict',
  path: `${env.API_PREFIX}/auth`,
  maxAge: durationToMilliseconds(env.JWT_REFRESH_TTL),
  ...domainOption,
};

export const csrfCookieOptions: CookieOptions = {
  httpOnly: false,
  secure: env.COOKIE_SECURE || env.isProduction,
  sameSite: 'strict',
  path: '/',
  maxAge: durationToMilliseconds(env.JWT_ACCESS_TTL),
  ...domainOption,
};
