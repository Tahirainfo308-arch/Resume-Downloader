import type { AccessTokenPayload } from '../utils/tokens';

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: AccessTokenPayload;
    }
  }
}

export {};
