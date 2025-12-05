import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

import onboardingRoutes from './routes/onboarding.routes';
import organizationRoutes from './routes/organization.routes';
import patientsRoutes from './routes/patients.routes';

app.use('/api/onboarding', onboardingRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/patients', patientsRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export { app, prisma };
