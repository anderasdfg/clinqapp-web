import api from "@/lib/api/axios-instance";
import type {
  Patient,
  CreatePatientDTO,
  UpdatePatientDTO,
  PatientsListResponse,
  PatientResponse,
  DeletePatientResponse,
  PatientsQueryParams,
} from "@/types/patient.types";

// Re-export types for convenience
export type { Patient, CreatePatientDTO, UpdatePatientDTO };

export const patientsService = {
  /**
   * Get list of patients with optional filters
   */
  async getPatients(
    params?: PatientsQueryParams,
  ): Promise<PatientsListResponse> {
    const response = await api.get<PatientsListResponse>("/patients", {
      params,
    });
    return response.data;
  },

  /**
   * Get patient by ID
   */
  async getPatientById(id: string): Promise<Patient> {
    const response = await api.get<PatientResponse>(`/patients/${id}`);
    return response.data.data;
  },

  /**
   * Create new patient
   */
  async createPatient(data: CreatePatientDTO): Promise<Patient> {
    const response = await api.post<PatientResponse>("/patients", data);
    return response.data.data;
  },

  /**
   * Update existing patient
   */
  async updatePatient(id: string, data: UpdatePatientDTO): Promise<Patient> {
    const response = await api.put<PatientResponse>(`/patients/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete patient (soft delete)
   */
  async deletePatient(id: string): Promise<void> {
    await api.delete<DeletePatientResponse>(`/patients/${id}`);
  },
};
