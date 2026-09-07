import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import {AppDataSource} from "../datasource.js";
import {User} from "../entity/TransactionsUser.js";
import {Session} from "../entity/TransactionsSession.js";

interface TokenPayload {
  userId: number;
  roleId: number;
  storeId: number;
  sessionId?: number;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Bearer token is required."
      });
      return;
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Bearer token is required."
      });
      return;
    }

    const payload = verifyToken(token) as TokenPayload;

    if (
      !payload ||
      !Number.isInteger(payload.userId) ||
      !Number.isInteger(payload.roleId) ||
      !Number.isInteger(payload.storeId)
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid token payload."
      });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: {
        user_id: payload.userId,
        is_active: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User account is inactive or no longer exists."
      });
      return;
    }

    if (
      user.role_id !== payload.roleId ||
      user.store_id !== payload.storeId
    ) {
      res.status(401).json({
        success: false,
        message: "Token is no longer valid for this user."
      });
      return;
    }

    if (payload.sessionId) {
      const sessionRepo = AppDataSource.getRepository(Session);

      const session = await sessionRepo.findOne({
        where: {
          session_id: payload.sessionId,
          user_id: payload.userId,
          is_active: true
        }
      });

      if (!session || !session.expires_at ||  session.expires_at <= new Date()) {
        res.status(401).json({
          success: false,
          message: "Session has expired or has been logged out."
        });
        return;
      }
    }

    req.auth = {
      userId: payload.userId,
      roleId: payload.roleId,
      storeId: payload.storeId,
      sessionId: Number(payload.sessionId)
    };

    next();
  } catch (error: any) {
    const isJwtError =
      error?.name === "JsonWebTokenError" ||
      error?.name === "TokenExpiredError";

    res.status(isJwtError ? 401 : 500).json({
      success: false,
      message: isJwtError
        ? "Invalid or expired token."
        : "Authentication failed."
    });
  }
}