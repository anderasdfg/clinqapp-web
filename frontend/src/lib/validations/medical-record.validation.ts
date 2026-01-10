import { z } from "zod";

export const podiatryHistorySchema = z.object({
  // Antecedentes Sistémicos
  systemic: z.object({
    diabetes: z.object({
      has: z.boolean().default(false),
      type: z.enum(["I", "II", "GESTACIONAL"]).optional().or(z.literal("")),
      controlled: z.boolean().optional(),
      notes: z.string().optional(),
    }),
    hta: z.boolean().default(false),
    circulation: z.boolean().default(false),
    others: z.string().optional(),
  }),

  // Alergias
  allergies: z.object({
    medication: z.string().optional(),
    latex: z.boolean().default(false),
    others: z.string().optional(),
  }),

  // Exploración Podológica
  podiatricExam: z.object({
    nails: z.object({
      onychopathy: z.array(z.string()).default([]),
      notes: z.string().optional(),
    }),
    skin: z.object({
      helomas: z.boolean().default(false),
      ipk: z.boolean().default(false),
      mycosis: z.boolean().default(false),
      others: z.string().optional(),
    }),
    vascular: z.object({
      pedalPulseRight: z
        .enum(["PRESENTE", "AUSENTE", "DISMINUIDO"])
        .default("PRESENTE"),
      pedalPulseLeft: z
        .enum(["PRESENTE", "AUSENTE", "DISMINUIDO"])
        .default("PRESENTE"),
      notes: z.string().optional(),
    }),
    biomechanical: z.object({
      footType: z
        .enum(["PLANO", "CAVO", "NEUTRO"])
        .optional()
        .or(z.literal("")),
      deformities: z.array(z.string()).default([]),
      notes: z.string().optional(),
    }),
  }),
});

export type PodiatryHistoryData = z.infer<typeof podiatryHistorySchema>;
