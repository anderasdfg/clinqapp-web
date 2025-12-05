import PatientForm from '@/components/patients/PatientForm';

const CreatePatientPage = () => {
    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    Nuevo Paciente
                </h1>
                <p className="text-[rgb(var(--text-secondary))]">
                    Completa el formulario para registrar un nuevo paciente
                </p>
            </div>

            <PatientForm />
        </div>
    );
};

export default CreatePatientPage;
