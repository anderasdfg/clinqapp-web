import { useUserStore } from "@/stores/useUserStore";
import { useAppointmentsStore } from "@/stores/useAppointmentsStore";
import { usePatientsStore } from "@/stores/usePatientsStore";
import { useServicesStore } from "@/stores/useServicesStore";
import { useStaffStore } from "@/stores/useStaffStore";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { logger } from "./logger";

/**
 * Resets all global stores to their initial states.
 * Used during logout to ensure no sensitive data persists in memory.
 */
export const resetAllStores = () => {
  try {
    useUserStore.getState().clearUser();

    // These stores need a reset() method implemented
    if ("reset" in useAppointmentsStore.getState()) {
      (useAppointmentsStore.getState() as any).reset();
    }

    if ("reset" in usePatientsStore.getState()) {
      (usePatientsStore.getState() as any).reset();
    }

    if ("reset" in useServicesStore.getState()) {
      (useServicesStore.getState() as any).reset();
    }

    if ("reset" in useStaffStore.getState()) {
      (useStaffStore.getState() as any).reset();
    }

    // useOnboardingStore already has a reset method
    useOnboardingStore.getState().reset();

    logger.info("All stores have been reset");
  } catch (error) {
    logger.error("Error resetting stores", { error });
  }
};
