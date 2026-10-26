import type { Role } from '../lib/constants';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        homeId: string | null;
      };
    }
  }
}

export {};
