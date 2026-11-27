import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Spinner from './components/common/Spinner';

// Layouts
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

// Protected Route Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';

// Route-level code splitting (Batch 4 Performance)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const FacilitiesPage = lazy(() => import('./pages/FacilitiesPage'));
const FacilityDetailPage = lazy(() => import('./pages/FacilityDetailPage'));
const CampusMapPage = lazy(() => import('./pages/CampusMapPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));

const ReportIssuePage = lazy(() => import('./pages/ReportIssuePage'));
const StudentReportsPage = lazy(() => import('./pages/StudentReportsPage'));
const ReportDetailPage = lazy(() => import('./pages/ReportDetailPage'));

const DashboardRedirect = lazy(() => import('./pages/dashboards/DashboardRedirect'));
const StudentDashboard = lazy(() => import('./pages/dashboards/StudentDashboard'));
const FacultyDashboard = lazy(() => import('./pages/dashboards/FacultyDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-3">
      <Spinner size="lg" />
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading view...</p>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Authentication Layout (Login / Register) */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Route>

                  {/* Main Application Layout */}
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* Authenticated Campus Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/facilities" element={<FacilitiesPage />} />
                      <Route path="/facilities/:id" element={<FacilityDetailPage />} />
                      <Route path="/map" element={<CampusMapPage />} />
                      <Route path="/bookings" element={<BookingsPage />} />
                      <Route path="/reports/new" element={<ReportIssuePage />} />
                      <Route path="/reports" element={<StudentReportsPage />} />
                      <Route path="/reports/:id" element={<ReportDetailPage />} />
                      <Route path="/dashboard" element={<DashboardRedirect />} />
                    </Route>

                    {/* Role-Specific Guarded Portals */}
                    <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
                      <Route path="/student/dashboard" element={<StudentDashboard />} />
                    </Route>

                    <Route element={<RoleRoute allowedRoles={['FACULTY']} />}>
                      <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                    </Route>

                    <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    </Route>

                    {/* 404 Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
