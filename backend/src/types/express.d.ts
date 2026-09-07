import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        roleId: number;
        storeId: number;
        sessionId: number;
      };
    }
  }
}

export {};