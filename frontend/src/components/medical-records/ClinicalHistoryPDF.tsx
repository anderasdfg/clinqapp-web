import { useRef, type ReactNode } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Download, X } from 'lucide-react';
import { pdfGeneratorService } from '@/services/pdf-generator.service';
import { toast } from 'sonner';
import { formatDocumentNumberForDisplay } from '@/lib/utils/document-number';
import { APPOINTMENT_STATUS_LABELS } from '@/types/appointment.types';
import type { Appointment } from '@/types/appointment.types';
import type { MedicalHistory, Patient } from '@/types/patient.types';

interface ClinicalHistoryPDFProps {
  patient: Patient;
  appointments: Appointment[];
  organizationName: string;
  onClose: () => void;
}

function yesNo(value?: boolean) {
  if (value === true) return 'Sí';
  if (value === false) return 'No';
  return '—';
}

function formatDate(dateString?: string) {
  if (!dateString) return '—';
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
  } catch {
    return '—';
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800 border-b border-gray-300 pb-1 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="mb-1.5 text-xs text-gray-800">
      <span className="font-semibold text-gray-600">{label}: </span>
      <span>{value || '—'}</span>
    </div>
  );
}

function HistoryBody({ history }: { history?: MedicalHistory }) {
  if (!history) {
    return <p className="text-xs text-gray-500 italic">Sin historia clínica base registrada.</p>;
  }

  const diabetes = history.systemic?.diabetes;
  const allergies = history.allergies;
  const exam = history.podiatricExam as any;
  const systemic = history.systemic as any;

  return (
    <>
      <Section title="Antecedentes sistémicos">
        <Field
          label="Diabetes"
          value={
            diabetes?.has
              ? `Sí${diabetes.type ? ` (Tipo ${diabetes.type})` : ''}${diabetes.controlled != null ? ` — ${diabetes.controlled ? 'Controlada' : 'No controlada'}` : ''}`
              : 'No'
          }
        />
        <Field label="HTA" value={yesNo(systemic?.hta ?? systemic?.hypertension?.has)} />
        <Field label="Problemas circulatorios" value={yesNo(systemic?.circulation)} />
        {systemic?.others && <Field label="Otros" value={systemic.others} />}
      </Section>

      <Section title="Alergias">
        <Field label="Medicamentos" value={allergies?.medication || 'Ninguna'} />
        <Field label="Látex" value={yesNo(allergies?.latex)} />
        {(allergies as any)?.others && <Field label="Otras" value={(allergies as any).others} />}
      </Section>

      {exam && (
        <Section title="Exploración podológica">
          <Field
            label="Onicopatías"
            value={
              Array.isArray(exam.nails?.onychopathy) && exam.nails.onychopathy.length > 0
                ? exam.nails.onychopathy.join(', ')
                : 'Ninguna'
            }
          />
          {exam.nails?.notes && <Field label="Notas uñas" value={exam.nails.notes} />}
          <Field
            label="Piel"
            value={
              [
                exam.skin?.helomas && 'Helomas',
                exam.skin?.ipk && 'IPK',
                exam.skin?.mycosis && 'Micosis',
              ]
                .filter(Boolean)
                .join(', ') || 'Normal'
            }
          />
          {exam.skin?.others && <Field label="Otras lesiones" value={exam.skin.others} />}
          <Field
            label="Pulsos pedios"
            value={`D: ${exam.vascular?.pedalPulseRight || 'N/A'} | I: ${exam.vascular?.pedalPulseLeft || 'N/A'}`}
          />
          <Field label="Tipo de pie" value={exam.biomechanical?.footType} />
          <Field
            label="Deformidades"
            value={
              Array.isArray(exam.biomechanical?.deformities) && exam.biomechanical.deformities.length > 0
                ? exam.biomechanical.deformities.join(', ')
                : 'Ninguna'
            }
          />
          {exam.biomechanical?.notes && (
            <Field label="Notas biomecánicas" value={exam.biomechanical.notes} />
          )}
        </Section>
      )}

      {history.observations && (
        <Section title="Observaciones">
          <p className="text-xs text-gray-800 whitespace-pre-wrap">{String(history.observations)}</p>
        </Section>
      )}
    </>
  );
}

const ClinicalHistoryPDF = ({
  patient,
  appointments,
  organizationName,
  onClose,
}: ClinicalHistoryPDFProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const displayDni = formatDocumentNumberForDisplay(patient.dni);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const filename = `historia-clinica-${patient.lastName}-${patient.firstName}-${format(new Date(), 'dd-MM-yyyy')}.pdf`
        .replace(/\s+/g, '-')
        .toLowerCase();
      await pdfGeneratorService.generateSalesReportPDF(reportRef.current, filename);
      toast.success('PDF descargado correctamente');
      onClose();
    } catch (error) {
      toast.error('Error al descargar el PDF');
      console.error(error);
    }
  };

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Vista Previa — Historia Clínica</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div ref={reportRef} className="bg-white p-8">
            <div className="text-center mb-4 pb-3 border-b-2 border-gray-300">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{organizationName}</h1>
              <p className="text-sm font-semibold text-gray-700">Historia Clínica Podológica</p>
              <p className="text-xs text-gray-500 mt-1">
                Generado el {format(new Date(), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}
              </p>
            </div>

            <Section title="Datos del paciente">
              <Field label="Nombre" value={`${patient.firstName} ${patient.lastName}`} />
              {displayDni && <Field label="DNI" value={displayDni} />}
              <Field label="Teléfono" value={patient.phone} />
              {patient.email && <Field label="Email" value={patient.email} />}
              <Field label="Fecha de nacimiento" value={formatDate(patient.dateOfBirth)} />
              {patient.gender && <Field label="Género" value={patient.gender} />}
              {patient.occupation && <Field label="Ocupación" value={patient.occupation} />}
              {patient.address && <Field label="Dirección" value={patient.address} />}
              {patient.assignedProfessional && (
                <Field
                  label="Profesional responsable"
                  value={`${patient.assignedProfessional.firstName} ${patient.assignedProfessional.lastName}`}
                />
              )}
            </Section>

            <HistoryBody history={patient.medicalHistory} />

            <Section title="Evoluciones y sesiones">
              {sortedAppointments.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Sin citas registradas.</p>
              ) : (
                <div className="space-y-3">
                  {sortedAppointments.map((apt) => (
                    <div key={apt.id} className="border border-gray-200 rounded p-3 text-xs">
                      <div className="flex justify-between gap-2 mb-1">
                        <span className="font-bold text-gray-900">{formatDate(apt.startTime)}</span>
                        <span className="text-gray-600">
                          {APPOINTMENT_STATUS_LABELS[apt.status as keyof typeof APPOINTMENT_STATUS_LABELS] ||
                            apt.status}
                        </span>
                      </div>
                      <Field
                        label="Servicio"
                        value={
                          apt.services?.map((s) => s.service?.name).filter(Boolean).join(', ') ||
                          'Atención podológica'
                        }
                      />
                      {apt.professional && (
                        <Field
                          label="Profesional"
                          value={`${apt.professional.firstName} ${apt.professional.lastName}`}
                        />
                      )}
                      {apt.clinicalNotes ? (
                        <div className="mt-1">
                          <p className="font-semibold text-gray-600 mb-0.5">Evolución:</p>
                          <p className="text-gray-800 whitespace-pre-wrap">{apt.clinicalNotes}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic mt-1">Sin notas clínicas.</p>
                      )}
                      {apt.notes && <Field label="Notas internas" value={apt.notes} />}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleDownloadPDF} className="gap-2">
            <Download className="w-4 h-4" />
            Descargar PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClinicalHistoryPDF;
