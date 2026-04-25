import { useState, useEffect, useCallback, useRef } from 'react';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { staffService } from '@/services/staff.service';
import type { ReferralSource } from '@/types/patient.types';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
}

interface UsePatientsHandlersReturn {
  professionals: Professional[];
  showDeleteModal: boolean;
  patientToDelete: string | null;
  observerTarget: React.RefObject<HTMLDivElement>;
  handleDeleteClick: (id: string) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
  handleProfessionalFilterChange: (value: string) => void;
  handleReferralSourceFilterChange: (value: string) => void;
  clearFilters: () => void;
  handleRefresh: () => void;
}

export function usePatientsHandlers(): UsePatientsHandlersReturn {
  const {
    hasMore,
    isLoading,
    searchQuery,
    setSearchQuery,
    setAssignedProfessionalFilter,
    setReferralSourceFilter,
    fetchPatients,
    loadMorePatients,
    deletePatient,
  } = usePatientsStore();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load professionals on mount
  const loadProfessionals = useCallback(async () => {
    try {
      const response = await staffService.getStaff({ limit: 100 });
      setProfessionals(response.data);
    } catch (error) {
      console.error('Error loading professionals:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPatients();
    loadProfessionals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-search with debounce (skip first render)
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    const debounceTimer = setTimeout(() => {
      fetchPatients({ page: 1 }, true);
    }, 500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePatients();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMorePatients]);

  // Delete handlers
  const handleDeleteClick = useCallback((id: string) => {
    setPatientToDelete(id);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (patientToDelete) {
      try {
        await deletePatient(patientToDelete);
        setShowDeleteModal(false);
        setPatientToDelete(null);
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  }, [patientToDelete, deletePatient]);

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setPatientToDelete(null);
  }, []);

  // Filter handlers
  const handleProfessionalFilterChange = useCallback((value: string) => {
    setAssignedProfessionalFilter(value === 'all' ? null : value);
    fetchPatients({}, true);
  }, [setAssignedProfessionalFilter, fetchPatients]);

  const handleReferralSourceFilterChange = useCallback((value: string) => {
    setReferralSourceFilter(value === 'all' ? null : (value as ReferralSource));
    fetchPatients({}, true);
  }, [setReferralSourceFilter, fetchPatients]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setAssignedProfessionalFilter(null);
    setReferralSourceFilter(null);
    fetchPatients({}, true);
  }, [setSearchQuery, setAssignedProfessionalFilter, setReferralSourceFilter, fetchPatients]);

  const handleRefresh = useCallback(() => {
    fetchPatients({}, true);
  }, [fetchPatients]);

  return {
    professionals,
    showDeleteModal,
    patientToDelete,
    observerTarget,
    handleDeleteClick,
    confirmDelete,
    cancelDelete,
    handleProfessionalFilterChange,
    handleReferralSourceFilterChange,
    clearFilters,
    handleRefresh,
  };
}
