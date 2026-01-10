import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { podiatryHistorySchema, type PodiatryHistoryData } from '@/lib/validations/medical-record.validation';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Activity, 
    Stethoscope, 
    ShieldAlert, 
    Footprints, 
    Save,
    RotateCcw
} from 'lucide-react';

interface PodiatryHistoryFormProps {
    patientId: string;
    initialData?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const PodiatryHistoryForm = ({ patientId, initialData, onSuccess, onCancel }: PodiatryHistoryFormProps) => {
    const { updatePatient, isUpdating } = usePatientsStore();

    const {
        register,
        handleSubmit,
        control,
        formState: {  },
    } = useForm<PodiatryHistoryData>({
        resolver: zodResolver(podiatryHistorySchema),
        defaultValues: initialData || {
            systemic: {
                diabetes: { has: false, type: "", controlled: true },
                hta: false,
                circulation: false,
            },
            allergies: { latex: false },
            podiatricExam: {
                nails: { onychopathy: [] },
                skin: {},
                vascular: { pedalPulseRight: "PRESENTE", pedalPulseLeft: "PRESENTE" },
                biomechanical: { deformities: [] },
            },
        },
    });

    const onSubmit = async (data: PodiatryHistoryData) => {
        try {
            await updatePatient(patientId, { medicalHistory: data });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error updating medical history:', error);
        }
    };

    const commonOnychopathies = ["Onicocriptosis", "Onicomicosis", "Onicogrifosis", "Onicodistrofia"];
    const commonDeformities = ["Hallux Valgus", "Dedos en Garra", "Pie Plano", "Pie Cavo"];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ANTECEDENTES SISTÉMICOS */}
            <Card className="border border-blue-500 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-blue-700">
                        <Activity className="w-5 h-5" />
                        Antecedentes Sistémicos
                    </CardTitle>
                    <CardDescription>Condiciones médicas generales que afectan la salud del pie</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Diabetes Section */}
                        <div className="space-y-4 p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="diabetes" className="font-bold text-blue-900">¿Padece Diabetes?</Label>
                                <Controller
                                    name="systemic.diabetes.has"
                                    control={control}
                                    render={({ field }) => (
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            id="diabetes"
                                        />
                                    )}
                                />
                            </div>
                            
                            <Controller
                                name="systemic.diabetes.has"
                                control={control}
                                render={({ field: diabetesHas }) => 
                                    (diabetesHas.value ? (
                                        <div className="space-y-4 animate-in zoom-in-95 duration-200">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase font-bold text-blue-800">Tipo</Label>
                                                    <Controller
                                                        name="systemic.diabetes.type"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <RadioGroup
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                                className="flex gap-4"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="I" id="d-tip-1" />
                                                                    <Label htmlFor="d-tip-1" className="text-sm">Tipo I</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="II" id="d-tip-2" />
                                                                    <Label htmlFor="d-tip-2" className="text-sm">Tipo II</Label>
                                                                </div>
                                                            </RadioGroup>
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs uppercase font-bold text-blue-800">¿Controlado?</Label>
                                                    <Controller
                                                        name="systemic.diabetes.controlled"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase font-bold text-blue-800">Notas de Control</Label>
                                                <Input 
                                                    {...register('systemic.diabetes.notes')} 
                                                    placeholder="Ej: HbA1c 6.5%, última revisión oct."
                                                    className="bg-white border-blue-200"
                                                />
                                            </div>
                                        </div>
                                    ) : null) as any
                                }
                            />
                        </div>

                        {/* Other Systemic Fields */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                                    <Label htmlFor="hta" className="cursor-pointer font-medium">HTA</Label>
                                    <Controller
                                        name="systemic.hta"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch checked={field.value} onCheckedChange={field.onChange} id="hta" />
                                        )}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                                    <Label htmlFor="circ" className="cursor-pointer font-medium">Mala Circulación</Label>
                                    <Controller
                                        name="systemic.circulation"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch checked={field.value} onCheckedChange={field.onChange} id="circ" />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-medium">Otras Patologías Sistémicas</Label>
                                <Textarea 
                                    {...register('systemic.others')} 
                                    placeholder="Indique cualquier otra condición relevante..."
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ALERGIAS */}
            <Card className="border border-red-500 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-red-700">
                        <ShieldAlert className="w-5 h-5" />
                        Alergias e Intolerancias
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="font-medium">Medicamentos</Label>
                            <Input {...register('allergies.medication')} placeholder="Ej: Penicilina, AINES" />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-md bg-red-50/30">
                            <Label htmlFor="latex" className="cursor-pointer font-medium text-red-900">Alergia al Látex</Label>
                            <Controller
                                name="allergies.latex"
                                control={control}
                                render={({ field }) => (
                                    <Switch checked={field.value} onCheckedChange={field.onChange} id="latex" />
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-medium">Otras Alergias</Label>
                            <Input {...register('allergies.others')} placeholder="Ej: Esparadrapo, yodo" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* EXPLORACIÓN PODOLÓGICA */}
            <Card className="border border-emerald-500 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-emerald-700">
                        <Footprints className="w-5 h-5" />
                        Exploración Clínica Específica
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-10 pt-4">
                    {/* Uñas */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold border-b pb-2">
                            <Stethoscope className="w-4 h-4" />
                            Estado de Uñas (Onicopatías)
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {commonOnychopathies.map((onic) => (
                                <div key={onic} className="flex items-center space-x-2">
                                    <Controller
                                        name="podiatricExam.nails.onychopathy"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id={`onic-${onic}`}
                                                checked={field.value.includes(onic)}
                                                onCheckedChange={(checked) => {
                                                    const newValue = checked 
                                                        ? [...field.value, onic]
                                                        : field.value.filter((v: string) => v !== onic);
                                                    field.onChange(newValue);
                                                }}
                                            />
                                        )}
                                    />
                                    <Label htmlFor={`onic-${onic}`} className="text-sm cursor-pointer">{onic}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vascular */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold border-b pb-2">
                            <Activity className="w-4 h-4" />
                            Exploración Vascular (Pulsos Pedios)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Pie Derecho</Label>
                                <Controller
                                    name="podiatricExam.vascular.pedalPulseRight"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                                            {["PRESENTE", "AUSENTE", "DISMINUIDO"].map(p => (
                                                <div key={p} className="flex items-center space-x-1">
                                                    <RadioGroupItem value={p} id={`v-r-${p}`} />
                                                    <Label htmlFor={`v-r-${p}`} className="text-xs cursor-pointer">{p}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Pie Izquierdo</Label>
                                <Controller
                                    name="podiatricExam.vascular.pedalPulseLeft"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                                            {["PRESENTE", "AUSENTE", "DISMINUIDO"].map(p => (
                                                <div key={p} className="flex items-center space-x-1">
                                                    <RadioGroupItem value={p} id={`v-l-${p}`} />
                                                    <Label htmlFor={`v-l-${p}`} className="text-xs cursor-pointer">{p}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Biomecánico */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold border-b pb-2">
                            <Activity className="w-4 h-4" />
                            Biometría y Deformidades
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Tipo de Pie</Label>
                                <Controller
                                    name="podiatricExam.biomechanical.footType"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                                            {["PLANO", "CAVO", "NEUTRO"].map(p => (
                                                <div key={p} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={p} id={`f-t-${p}`} />
                                                    <Label htmlFor={`f-t-${p}`} className="cursor-pointer">{p}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Deformidades Digitales</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {commonDeformities.map(def => (
                                        <div key={def} className="flex items-center space-x-2">
                                            <Controller
                                                name="podiatricExam.biomechanical.deformities"
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        id={`def-${def}`}
                                                        checked={field.value.includes(def)}
                                                        onCheckedChange={(checked) => {
                                                            const newValue = checked 
                                                                ? [...field.value, def]
                                                                : field.value.filter((v: string) => v !== def);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                )}
                                            />
                                            <Label htmlFor={`def-${def}`} className="text-sm cursor-pointer">{def}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ACTIONS */}
            <div className="flex items-center justify-between sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 border rounded-xl shadow-lg z-10 transition-all duration-300">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onCancel}
                    className="gap-2 text-muted-foreground hover:text-red-600"
                >
                    <RotateCcw className="w-4 h-4" /> Descargar cambios
                </Button>
                <div className="flex gap-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                    <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="gap-2 min-w-[150px] bg-primary hover:bg-primary/90 shadow-md transform active:scale-95 transition-all"
                    >
                        {isUpdating ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Guardar Historia
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default PodiatryHistoryForm;
