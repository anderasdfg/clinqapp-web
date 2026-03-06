import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";

// Validation schemas
const createPaymentMethodSchema = z
  .object({
    type: z.enum([
      "CASH",
      "CREDIT_CARD",
      "DEBIT_CARD",
      "BANK_TRANSFER",
      "MOBILE_PAYMENT",
      "BANK_DEPOSIT",
      "OTHER",
    ]),
    isActive: z.boolean().default(true),
    otherName: z.string().optional(),
  })
  .refine(
    (data) => {
      // If type is OTHER, otherName is required
      if (data.type === "OTHER" && !data.otherName) {
        return false;
      }
      return true;
    },
    {
      message: "otherName is required when type is OTHER",
      path: ["otherName"],
    },
  );

const updatePaymentMethodSchema = z.object({
  type: z
    .enum([
      "CASH",
      "CREDIT_CARD",
      "DEBIT_CARD",
      "BANK_TRANSFER",
      "MOBILE_PAYMENT",
      "BANK_DEPOSIT",
      "OTHER",
    ])
    .optional(),
  isActive: z.boolean().optional(),
  otherName: z.string().optional(),
});

// GET /api/payment-methods - List all payment methods
export const getPaymentMethods = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser?.organizationId) {
      return res.status(401).json({ error: "Organization ID not found" });
    }

    const organizationId = dbUser.organizationId;

    const paymentMethods = await prisma.paymentMethodConfig.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(paymentMethods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: "Error al obtener métodos de pago" });
  }
};

// POST /api/payment-methods - Create payment method
export const createPaymentMethod = async (req: AuthRequest, res: Response) => {
  try {
    const dbUser = req.dbUser;

    if (!dbUser?.organizationId) {
      return res.status(401).json({ error: "Organization ID not found" });
    }

    const organizationId = dbUser.organizationId;

    const validatedData = createPaymentMethodSchema.parse(req.body);

    // Check if this payment method type already exists for this organization
    const existing = await prisma.paymentMethodConfig.findFirst({
      where: {
        organizationId,
        type: validatedData.type,
        ...(validatedData.type === "OTHER" && validatedData.otherName
          ? { otherName: validatedData.otherName }
          : {}),
      },
    });

    if (existing) {
      return res.status(400).json({
        error: "Este método de pago ya existe",
      });
    }

    const paymentMethod = await prisma.paymentMethodConfig.create({
      data: {
        organizationId,
        type: validatedData.type,
        isActive: validatedData.isActive,
        otherName: validatedData.otherName,
      },
    });

    res.status(201).json(paymentMethod);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error("Error creating payment method:", error);
    res.status(500).json({ error: "Error al crear método de pago" });
  }
};

// PUT /api/payment-methods/:id - Update payment method
export const updatePaymentMethod = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dbUser = req.dbUser;

    if (!dbUser?.organizationId) {
      return res.status(401).json({ error: "Organization ID not found" });
    }

    const organizationId = dbUser.organizationId;

    const validatedData = updatePaymentMethodSchema.parse(req.body);

    // Verify payment method exists and belongs to organization
    const existing = await prisma.paymentMethodConfig.findFirst({
      where: {
        id: id as string,
        organizationId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Método de pago no encontrado" });
    }

    const paymentMethod = await prisma.paymentMethodConfig.update({
      where: { id: id as string },
      data: {
        ...(validatedData.type !== undefined && { type: validatedData.type }),
        ...(validatedData.isActive !== undefined && {
          isActive: validatedData.isActive,
        }),
        ...(validatedData.otherName !== undefined && {
          otherName: validatedData.otherName,
        }),
      },
    });

    res.json(paymentMethod);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error("Error updating payment method:", error);
    res.status(500).json({ error: "Error al actualizar método de pago" });
  }
};

// DELETE /api/payment-methods/:id - Delete payment method
export const deletePaymentMethod = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dbUser = req.dbUser;

    if (!dbUser?.organizationId) {
      return res.status(401).json({ error: "Organization ID not found" });
    }

    const organizationId = dbUser.organizationId;

    // Verify payment method exists and belongs to organization
    const existing = await prisma.paymentMethodConfig.findFirst({
      where: {
        id: id as string,
        organizationId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Método de pago no encontrado" });
    }

    await prisma.paymentMethodConfig.delete({
      where: { id: id as string },
    });

    res.json({ message: "Método de pago eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({ error: "Error al eliminar método de pago" });
  }
};
