// src/types/express.d.ts

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        clerkId: string;
      };
    }
  }
}

export {};
