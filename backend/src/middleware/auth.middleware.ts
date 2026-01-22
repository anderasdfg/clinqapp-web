import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../lib/prisma";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export interface AuthRequest extends Request {
  user?: any;
  dbUser?: any;
}

// Simple in-memory cache for Supabase sessions and DB users
const supabaseSessionCache = new Map<
  string,
  { data: any; timestamp: number; duration?: number }
>();
const dbUserCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache TTL
const SESSION_CACHE_TTL = 1000 * 60 * 2; // 2 minutes for session data

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const start = Date.now();
    let user;

    // Check session cache first
    const cachedSession = supabaseSessionCache.get(token);
    if (
      cachedSession &&
      Date.now() - cachedSession.timestamp < SESSION_CACHE_TTL
    ) {
      console.log(
        `🚀 Auth: Supabase Session HIT (saved ~${cachedSession.duration || 300}ms)`,
      );
      user = cachedSession.data;
    } else {
      console.log(`🔍 Auth: Supabase Session MISS`);
      const {
        data: { user: supabaseUser },
        error,
      } = await supabase.auth.getUser(token);
      const afterSupabase = Date.now();
      const duration = afterSupabase - start;
      console.log(`⏱️ Auth: Supabase getUser took ${duration}ms`);

      if (error || !supabaseUser) {
        return res.status(401).json({ error: "Invalid token" });
      }

      user = supabaseUser;
      supabaseSessionCache.set(token, {
        data: user,
        timestamp: Date.now(),
        duration,
      });
    }

    req.user = user;

    // Check cache first
    const cachedEntry = dbUserCache.get(user.id);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log(`🚀 Auth: Cache HIT for user ${user.id}`);
      req.dbUser = cachedEntry.data;
      return next();
    }

    console.log(`🔍 Auth: Cache MISS for user ${user.id}`);

    // Fetch user from DB (optimized: only select needed fields)
    const dbStart = Date.now();
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: {
        id: true,
        authId: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationId: true,
        role: true,
        specialty: true,
        licenseNumber: true,
      },
    });
    const dbEnd = Date.now();
    console.log(`⏱️ Auth: Prisma findUnique took ${dbEnd - dbStart}ms`);

    if (!dbUser) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Update cache
    dbUserCache.set(user.id, { data: dbUser, timestamp: Date.now() });

    req.dbUser = dbUser;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
};
