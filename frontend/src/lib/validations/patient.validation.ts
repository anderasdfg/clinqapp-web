import { z } from "zod";
import { GENDER } from "@/types/dto/patient.dto";

// Regex for names: only letters (including ñ, Ñ), spaces, and accented characters
const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

// Regex for Peruvian phone: 9 digits starting with 9
const phoneRegex = /^9\d{8}$/;

export const patientSchema = z.object({
  firstName: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(
      nameRegex,
      "El nombre solo puede contener letras, espacios y tildes",
    ),

  lastName: z
    .string()
    .min(1, "El apellido es requerido")
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres")
    .regex(
      nameRegex,
      "El apellido solo puede contener letras, espacios y tildes",
    ),

  dni: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        return /^\d{8}$/.test(val) || /^\d{10}$/.test(val);
      },
      {
        message: "Ingrese un DNI válido (8 dígitos) o CE válido (10 dígitos)",
      },
    ),

  phone: z
    .string()
    .min(1, "El teléfono es requerido")
    .regex(
      phoneRegex,
      "Ingrese un número de celular peruano válido (9 dígitos, comenzando con 9)",
    )
    .refine(
      (val) => {
        // Rechazar números con todos los dígitos iguales (ej: 999999999)
        if (/^(\d)\1{8}$/.test(val)) return false;
        
        // Rechazar secuencias ascendentes (ej: 987654321)
        const isDescending = val.split('').every((digit, i) => {
          if (i === 0) return true;
          return parseInt(digit) === parseInt(val[i - 1]) - 1;
        });
        if (isDescending) return false;
        
        // Rechazar secuencias ascendentes (ej: 912345678)
        const isAscending = val.split('').every((digit, i) => {
          if (i === 0) return true;
          return parseInt(digit) === parseInt(val[i - 1]) + 1;
        });
        if (isAscending) return false;
        
        return true;
      },
      {
        message: "Debe ser un número de teléfono válido",
      },
    ),

  email: z
    .union([z.literal(""), z.string().email("Ingrese un email válido")])
    .optional(),

  dateOfBirth: z.string().optional(),

  gender: z.enum([GENDER.MALE, GENDER.FEMALE, GENDER.OTHER]).optional(),

  address: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        return val.length >= 5;
      },
      {
        message: "La dirección debe tener al menos 5 caracteres",
      },
    ),

  occupation: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        return nameRegex.test(val);
      },
      {
        message: "La ocupación solo puede contener letras, espacios y tildes",
      },
    ),

  emergencyContact: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        return nameRegex.test(val);
      },
      {
        message:
          "El nombre del contacto solo puede contener letras, espacios y tildes",
      },
    ),

  emergencyPhone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        return phoneRegex.test(val);
      },
      {
        message:
          "Ingrese un número de celular peruano válido (9 dígitos, comenzando con 9)",
      },
    )
    .refine(
      (val) => {
        if (!val || val === "") return true;
        
        // Rechazar números con todos los dígitos iguales
        if (/^(\d)\1{8}$/.test(val)) return false;
        
        // Rechazar secuencias descendentes
        const isDescending = val.split('').every((digit, i) => {
          if (i === 0) return true;
          return parseInt(digit) === parseInt(val[i - 1]) - 1;
        });
        if (isDescending) return false;
        
        // Rechazar secuencias ascendentes
        const isAscending = val.split('').every((digit, i) => {
          if (i === 0) return true;
          return parseInt(digit) === parseInt(val[i - 1]) + 1;
        });
        if (isAscending) return false;
        
        return true;
      },
      {
        message: "Debe ser un número de teléfono válido",
      },
    ),

  referralSource: z
    .enum([
      "WEBSITE",
      "INSTAGRAM",
      "TIKTOK",
      "FACEBOOK",
      "GOOGLE",
      "WORD_OF_MOUTH",
      "OTHER",
    ])
    .optional(),

  assignedProfessionalId: z
    .string()
    .uuid("ID de profesional inválido")
    .optional()
    .or(z.literal("")),
});

export type PatientFormData = z.infer<typeof patientSchema>;
