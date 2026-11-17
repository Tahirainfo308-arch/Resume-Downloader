import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { AppError } from '../utils/errors';
import { errorEnvelope } from '../utils/response';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMongoDuplicateKeyError(
  error: unknown,
): error is { code: number; keyValue?: Record<string, unknown> } {
  return isRecord(error) && error.code === 11000;
}

function isSyntaxErrorWithBody(error: unknown): error is SyntaxError & { body: unknown } {
  return error instanceof SyntaxError && isRecord(error) && 'body' in error;
}

export const notFoundHandler: RequestHandler = (req, res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} was not found`));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next): void => {
  if (res.headersSent) {
    return;
  }

  const requestId = String(req.id ?? 'unknown');
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  let details: unknown;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request data';
    details = error.flatten();
  } else if (isMongoDuplicateKeyError(error)) {
    statusCode = 409;
    code = 'CONFLICT';
    message = 'A record with this value already exists';
    details = error.keyValue;
  } else if (isSyntaxErrorWithBody(error)) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Request body must contain valid JSON';
  }

  if (statusCode >= 500) {
    logger.error({ err: error, requestId }, 'Request failed');
  } else {
    logger.warn({ err: error, requestId, statusCode, code }, 'Request rejected');
  }

  const publicDetails = statusCode >= 500 && env.isProduction ? undefined : details;

  res.status(statusCode).json(errorEnvelope(code, message, publicDetails, requestId));
};
