/**
 * Service DTOs
 * Based on backend validation schemas from services.controller.ts
 */

export type ServiceCategory = "DIAGNOSTIC" | "TREATMENT" | "FOLLOWUP" | "OTHER";

/**
 * DTO for creating a new service
 * Matches backend createServiceSchema
 */
export interface CreateServiceDTO {
  name: string;
  description?: string;
  duration: number; // Duration in minutes, must be positive integer
  basePrice: number; // Must be positive
  category?: ServiceCategory;
  isActive?: boolean; // Defaults to true
}

/**
 * DTO for updating an existing service
 * All fields are optional (partial update)
 */
export interface UpdateServiceDTO extends Partial<CreateServiceDTO> {}

/**
 * Query parameters for fetching services
 */
export interface ServicesQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
