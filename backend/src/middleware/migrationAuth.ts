import { Request, Response, NextFunction } from "express";

/**
 * Migration HTTP endpoints are blocked in production.
 * In non-production, requires header: X-Migration-Secret === MIGRATION_SECRET
 */
export const migrationAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({
      success: false,
      error: "Migration endpoints are disabled in production",
    });
    return;
  }

  const expected = process.env.MIGRATION_SECRET;

  if (!expected) {
    console.error("MIGRATION_SECRET is not configured");
    res.status(503).json({
      success: false,
      error: "Migration authentication is not configured",
    });
    return;
  }

  const provided = req.header("x-migration-secret");

  if (!provided || provided !== expected) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
    return;
  }

  next();
};
