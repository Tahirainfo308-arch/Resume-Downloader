import { Router } from 'express';
import { z } from 'zod';
import { getDatabaseName, getDatabaseState } from '../../config/database';
import { env } from '../../config/env';
import { validate } from '../../middleware/validate';
import { successEnvelope } from '../../utils/response';

export const healthRouter = Router();

const healthQuerySchema = z.object({
  verbose: z.enum(['true', 'false']).optional(),
});

healthRouter.get('/', validate({ query: healthQuerySchema }), (_req, res) => {
  const databaseState = getDatabaseState();

  res.status(200).json(
    successEnvelope({
      status: databaseState === 'connected' ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: {
        status: databaseState,
        name: getDatabaseName(),
      },
    }),
  );
});

healthRouter.get('/live', (_req, res) => {
  res.status(200).json(
    successEnvelope({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    }),
  );
});

healthRouter.get('/ready', (_req, res) => {
  const databaseState = getDatabaseState();
  const ready = databaseState === 'connected';

  res.status(ready ? 200 : 503).json(
    successEnvelope({
      status: ready ? 'ok' : 'degraded',
      database: {
        status: databaseState,
        name: getDatabaseName(),
      },
    }),
  );
});
