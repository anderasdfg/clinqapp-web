import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/dashboard/DashboardHome';
import PatientsPage from './pages/dashboard/PatientsPage';
import CreatePatientPage from './pages/dashboard/CreatePatientPage';
import EditPatientPage from './pages/dashboard/EditPatientPage';
import AgendaPage from './pages/dashboard/AgendaPage';
import StaffPage from './pages/dashboard/StaffPage';
import CreateStaffPage from './pages/dashboard/CreateStaffPage';
import EditStaffPage from './pages/dashboard/EditStaffPage';
import ServicesPage from './pages/dashboard/ServicesPage';
import CreateServicePage from './pages/dashboard/CreateServicePage';
import EditServicePage from './pages/dashboard/EditServicePage';
import MedicalRecordsPage from './pages/dashboard/MedicalRecordsPage';
import NotFound from './pages/NotFound';
import PatientDetailPage from './pages/dashboard/PatientDetailPage';

function App() {
    return (
        <ThemeProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    {/* Landing Page */}
                    <Route path="/" element={<Landing />} />
                    
                    {/* App Routes */}
                    <Route path="/app/login" element={<Login />} />
                    <Route path="/app/register" element={<Register />} />
                    <Route
                        path="/app/onboarding/*"
                        element={
                            <ProtectedRoute>
                                <Onboarding />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/app/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="home" replace />} />
                        <Route path="home" element={<DashboardHome />} />
                        <Route path="patients" element={<PatientsPage />} />
                        <Route path="patients/new" element={<CreatePatientPage />} />
                        <Route path="patients/:id" element={<PatientDetailPage />} />
                        <Route path="patients/:id/edit" element={<EditPatientPage />} />
                        <Route path="agenda" element={<AgendaPage />} />
                        <Route path="staff" element={<StaffPage />} />
                        <Route path="staff/new" element={<CreateStaffPage />} />
                        <Route path="staff/:id/edit" element={<EditStaffPage />} />
                        <Route path="services" element={<ServicesPage />} />
                        <Route path="services/new" element={<CreateServicePage />} />
                        <Route path="services/:id/edit" element={<EditServicePage />} />
                        <Route path="medical-records" element={<MedicalRecordsPage />} />
                        <Route path="payment-methods" element={<PatientsPage />} /> {/* Placeholder */}
                        <Route path="settings" element={<PatientsPage />} /> {/* Placeholder */}
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
