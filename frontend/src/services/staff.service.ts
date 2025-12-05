import axios from 'axios';
import { createClient } from '@/lib/supabase/client';
import type { StaffListResponse, StaffResponse, StaffFormData } from '@/types/staff.types';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
});

// Add auth interceptor
api.interceptors.request.use(async (config) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

export const staffService = {
    // Get all staff members
    async getStaff(params?: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
    }): Promise<StaffListResponse> {
        const response = await api.get('/staff', { params });
        return response.data;
    },

    // Get staff member by ID
    async getStaffById(id: string): Promise<StaffResponse> {
        const response = await api.get(`/staff/${id}`);
        return response.data;
    },

    // Create staff member (currently not implemented in backend)
    async createStaff(data: StaffFormData): Promise<StaffResponse> {
        const response = await api.post('/staff', data);
        return response.data;
    },

    // Update staff member
    async updateStaff(id: string, data: Partial<StaffFormData>): Promise<StaffResponse> {
        const response = await api.put(`/staff/${id}`, data);
        return response.data;
    },

    // Delete staff member (soft delete)
    async deleteStaff(id: string): Promise<{ success: boolean; message: string }> {
        const response = await api.delete(`/staff/${id}`);
        return response.data;
    },
};
