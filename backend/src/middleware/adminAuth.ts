import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AdminJwtPayload {
  username: string;
  role: string;
}

export interface AdminRequest extends Request {
  admin?: AdminJwtPayload;
}

function getJwtSecret(): string | null {
  return process.env.ADMIN_JWT_SECRET || null;
}

/**
 * Middleware to protect admin routes with JWT (Bearer token).
 */
export const adminAuth = (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const secret = getJwtSecret();
    if (!secret) {
      console.error("ADMIN_JWT_SECRET is not configured");
      res.status(503).json({
        success: false,
        error: "Admin authentication is not configured",
      });
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const payload = jwt.verify(token, secret) as AdminJwtPayload;

      if (!payload?.username || payload.role !== "ADMIN") {
        res.status(401).json({
          success: false,
          error: "Access denied. Invalid token.",
        });
        return;
      }

      req.admin = {
        username: payload.username,
        role: payload.role,
      };

      next();
    } catch {
      res.status(401).json({
        success: false,
        error: "Access denied. Invalid or expired token.",
      });
    }
  } catch (error) {
    console.error("Error in admin auth middleware:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Optional admin auth - doesn't block if no token
 */
export const optionalAdminAuth = (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const secret = getJwtSecret();
    const authHeader = req.headers.authorization;

    if (secret && authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payload = jwt.verify(token, secret) as AdminJwtPayload;
        if (payload?.username && payload.role === "ADMIN") {
          req.admin = {
            username: payload.username,
            role: payload.role,
          };
        }
      } catch {
        // ignore invalid optional token
      }
    }

    next();
  } catch (error) {
    console.error("Error in optional admin auth middleware:", error);
    next();
  }
};
