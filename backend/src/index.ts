import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// CORS Configuration - supports both development and production
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173", // Always allow localhost for development
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { app, prisma };
