import { Request, Response, NextFunction } from "express";

/**
 * Protects scheduler/reminder endpoints with a shared secret header.
 * Expects: X-Scheduler-Secret: <SCHEDULER_SECRET>
 */
export const schedulerAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const expected = process.env.SCHEDULER_SECRET;

  if (!expected) {
    console.error("SCHEDULER_SECRET is not configured");
    res.status(503).json({
      success: false,
      error: "Scheduler authentication is not configured",
    });
    return;
  }

  const provided = req.header("x-scheduler-secret");

  if (!provided || provided !== expected) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
    return;
  }

  next();
};
