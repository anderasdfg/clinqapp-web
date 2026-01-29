import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * User data stored in the global state
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dni?: string;
  avatarUrl?: string;
  role: string;
  organizationId: string;
  emailVerified: boolean;
}

/**
 * Organization data
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  isTemporary: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

interface UserState {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setOrganization: (organization: Organization | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
}

/**
 * Global user store using Zustand
 * Persisted to localStorage for better UX
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      isLoading: false,

      setUser: (user) => set({ user, isLoading: false }),

      setOrganization: (organization) => set({ organization }),

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      clearUser: () =>
        set({
          user: null,
          organization: null,
          isLoading: false,
        }),
    }),
    {
      name: "clinq-user-storage", // localStorage key
      // Only persist user and organization, not loading state
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
      }),
    },
  ),
);
