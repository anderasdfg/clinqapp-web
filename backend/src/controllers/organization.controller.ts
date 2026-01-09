import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { basicClinicDataSchema } from '../utils/validations';

// GET - Get organization data
export const getOrganization = async (req: AuthRequest, res: Response) => {
    try {
        const dbUser = req.dbUser;

        if (!dbUser || !dbUser.organization) {
            return res.status(404).json({ error: 'Organización no encontrada' });
        }

        res.json(dbUser.organization);
    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({ error: 'Error al obtener datos de la organización' });
    }
};

// PUT - Update organization data
export const updateOrganization = async (req: AuthRequest, res: Response) => {
    try {
        const dbUser = req.dbUser;

        if (!dbUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Only OWNER can update organization
        if (dbUser.role !== 'OWNER') {
            return res.status(403).json({ error: 'Solo el propietario puede actualizar la organización' });
        }

        const body = req.body;

        // Validate data
        const validation = basicClinicDataSchema.safeParse(body);
        if (!validation.success) {
            return res.status(400).json({ error: 'Datos inválidos', details: validation.error });
        }

        const data = validation.data;

        // Update organization
        const updatedOrg = await prisma.organization.update({
            where: { id: dbUser.organizationId },
            data: {
                name: data.name,
                ruc: data.ruc,
                address: data.address,
                phone: data.phone,
                email: data.email,
                logoUrl: data.logoUrl,
                specialty: data.specialty,
                website: data.website || null,
                instagramUrl: data.instagramUrl || null,
                facebookUrl: data.facebookUrl || null,
                tiktokUrl: data.tiktokUrl || null,
                linkedinUrl: data.linkedinUrl || null,
            },
        });

        res.json(updatedOrg);
    } catch (error) {
        console.error('Error updating organization:', error);
        res.status(500).json({ error: 'Error al actualizar la organización' });
    }
};
