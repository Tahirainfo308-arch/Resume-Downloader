import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

export default app;

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, apiPrefix: env.API_PREFIX }, 'API server started');
});

void connectDatabase();

function shutdown(signal: string): void {
  logger.info({ signal }, 'Shutting down API server');

  server.close(() => {
    void disconnectDatabase().finally(() => process.exit(0));
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});
