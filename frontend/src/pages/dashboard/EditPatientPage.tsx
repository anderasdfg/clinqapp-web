import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientsStore } from '@/stores/usePatientsStore';
import PatientForm from '@/components/patients/PatientForm';

const EditPatientPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedPatient, isLoading, fetchPatientById } = usePatientsStore();

    useEffect(() => {
        if (id) {
            fetchPatientById(id);
        }
    }, [id, fetchPatientById]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!selectedPatient) {
        return (
            <div className="card p-8 text-center">
                <p className="text-[rgb(var(--text-secondary))] mb-4">
                    Paciente no encontrado
                </p>
                <button
                    onClick={() => navigate('/dashboard/patients')}
                    className="text-primary hover:text-primary-hover font-medium"
                >
                    Volver a la lista
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    Editar Paciente
                </h1>
                <p className="text-[rgb(var(--text-secondary))]">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
            </div>

            <PatientForm patient={selectedPatient} />
        </div>
    );
};

export default EditPatientPage;
