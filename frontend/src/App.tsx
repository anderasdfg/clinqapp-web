import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/dashboard/DashboardHome';
import PatientsPage from './pages/dashboard/PatientsPage';
import CreatePatientPage from './pages/dashboard/CreatePatientPage';
import EditPatientPage from './pages/dashboard/EditPatientPage';
import AgendaPage from './pages/dashboard/AgendaPage';
import NotFound from './pages/NotFound';
import PatientDetailPage from './pages/dashboard/PatientDetailPage';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/onboarding/*"
                        element={
                            <ProtectedRoute>
                                <Onboarding />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
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
                        <Route path="medical-records" element={<PatientsPage />} /> {/* Placeholder */}
                        <Route path="services" element={<PatientsPage />} /> {/* Placeholder */}
                        <Route path="payment-methods" element={<PatientsPage />} /> {/* Placeholder */}
                        <Route path="staff" element={<PatientsPage />} /> {/* Placeholder */}
                        <Route path="settings" element={<PatientsPage />} /> {/* Placeholder */}
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
