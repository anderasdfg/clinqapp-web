import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { prisma } from "./lib/prisma";

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Log environment check
console.log("🚀 Starting ClinqApp Backend...");
console.log("📍 Environment:", process.env.NODE_ENV || "development");
console.log("🔌 Port:", process.env.PORT || 3001);

// Check critical environment variables
const requiredEnvVars = ["DATABASE_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars);
  console.error("⚠️  Application may not function correctly!");
}

const app = express();
const port = Number(process.env.PORT) || 3001;

// CORS Configuration - must use specific origins with credentials
const allowedOrigins = [
  process.env.FRONTEND_URL, // Production frontend URL from environment
  "http://localhost:5173",
  "http://localhost:3000",
  "https://clinqapp-web.vercel.app",
].filter(Boolean); // Remove undefined values

console.log("🔒 CORS allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) {
        console.log("✅ CORS: Allowing request with no origin");
        return callback(null, true);
      }

      // Check if origin is allowed or is a Vercel preview deployment
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        console.log(`✅ CORS: Allowing origin: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`❌ CORS: Blocking origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

import onboardingRoutes from "./routes/onboarding.routes";
import organizationRoutes from "./routes/organization.routes";
import patientsRoutes from "./routes/patients.routes";
import appointmentsRoutes from "./routes/appointments.routes";
import staffRoutes from "./routes/staff.routes";
import servicesRoutes from "./routes/services.routes";

app.use("/api/onboarding", onboardingRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/services", servicesRoutes);

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🚀 Ready to accept connections!`);
});

export { app, prisma };
