import type { ZodTypeAny } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        Object.assign(req.query, schemas.query.parse(req.query));
      }

      if (schemas.params) {
        Object.assign(req.params, schemas.params.parse(req.params));
      }

      next();
    } catch (error) {
      next(new AppError(400, 'VALIDATION_ERROR', 'Invalid request data', error));
    }
  };
}
