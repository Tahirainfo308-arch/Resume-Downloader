import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export type DatabaseState = 'connecting' | 'connected' | 'disconnected';

let state: DatabaseState = 'disconnected';
let listenersRegistered = false;

function registerListeners(): void {
  if (listenersRegistered) {
    return;
  }

  mongoose.connection.on('connected', () => {
    state = 'connected';
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('disconnected', () => {
    state = 'disconnected';
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (error: unknown) => {
    state = 'disconnected';
    logger.error({ err: error }, 'MongoDB connection error');
  });

  listenersRegistered = true;
}

export function getDatabaseState(): DatabaseState {
  if (state === 'disconnected' && mongoose.connection.readyState === 1) {
    state = 'connected';
  }

  return state;
}

export function getDatabaseName(): string {
  const segment = env.MONGODB_URI.split('/').pop()?.split('?')[0];
  return mongoose.connection.name || segment || 'unknown';
}

export async function connectDatabase(): Promise<void> {
  registerListeners();

  if (mongoose.connection.readyState === 1) {
    state = 'connected';
    return;
  }

  state = 'connecting';

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    state = 'connected';
  } catch (error) {
    state = 'disconnected';
    logger.error({ err: error }, 'MongoDB connection failed');
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    state = 'disconnected';
    return;
  }

  await mongoose.disconnect();
  state = 'disconnected';
}
