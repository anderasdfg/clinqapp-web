import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../index";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export interface AuthRequest extends Request {
  user?: any;
  dbUser?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;

    // Fetch user from DB
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: { organization: true },
    });

    if (!dbUser) {
      // Optional: Create user if not exists (depending on flow)
      // For now, return 404 or just proceed with auth user only
      // But legacy code expects dbUser
      return res.status(404).json({ error: "User not found in database" });
    }

    req.dbUser = dbUser;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
};
