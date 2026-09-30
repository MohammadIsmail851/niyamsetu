import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

// Public pages
import LandingPage           from '@/pages/LandingPage';
import LoginPage             from '@/pages/auth/LoginPage';
import RegisterPage          from '@/pages/auth/RegisterPage';
import CertificateVerifyPage from '@/pages/public/CertificateVerifyPage';

// Owner pages
import OwnerDashboard            from '@/pages/owner/OwnerDashboard';
import InstrumentsListPage       from '@/pages/owner/InstrumentsListPage';
import InstrumentRegistrationPage from '@/pages/owner/InstrumentRegistrationPage';
import ApplicationsListPage      from '@/pages/owner/ApplicationsListPage';
import NewApplicationPage        from '@/pages/owner/NewApplicationPage';
import CertificatesPage          from '@/pages/owner/CertificatesPage';

// LMO pages
import LMODashboard              from '@/pages/lmo/LMODashboard';
import InspectionFormPage        from '@/pages/lmo/InspectionFormPage';

// GATC pages
import GATCDashboard             from '@/pages/gatc/GATCDashboard';
import GATCTestsPage             from '@/pages/gatc/GATCTestsPage';
import GATCInspectionPage        from '@/pages/gatc/GATCInspectionPage';
import GATCReportsPage           from '@/pages/gatc/GATCReportsPage';

// Admin pages
import AdminDashboard            from '@/pages/admin/AdminDashboard';
import AdminApplicationsPage     from '@/pages/admin/AdminApplicationsPage';
import AdminUsersPage            from '@/pages/admin/AdminUsersPage';

// Shared
import SearchPage                from '@/pages/SearchPage';
import ProfilePage               from '@/pages/ProfilePage';
import SettingsPage              from '@/pages/SettingsPage';
import { ProtectedRoute, PublicOnlyRoute } from '@/routes/guards';

function App() {
  // Initialize auth listener — must be at top level
  useAuth();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: 10, fontSize: 14, fontFamily: 'Inter' },
        }}
      />

    <Routes>
        {/* ── Public ───────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify/:certificateId" element={<CertificateVerifyPage />} />

        <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* ── Business Owner ───────────────────────────────────── */}
        <Route path="/owner" element={
          <ProtectedRoute allowedRoles={['business_owner']}>
            <Navigate to="/owner/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/owner/dashboard"             element={<ProtectedRoute allowedRoles={['business_owner']}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/owner/instruments"           element={<ProtectedRoute allowedRoles={['business_owner']}><InstrumentsListPage /></ProtectedRoute>} />
        <Route path="/owner/instruments/register"  element={<ProtectedRoute allowedRoles={['business_owner']}><InstrumentRegistrationPage /></ProtectedRoute>} />
        <Route path="/owner/applications"          element={<ProtectedRoute allowedRoles={['business_owner']}><ApplicationsListPage /></ProtectedRoute>} />
        <Route path="/owner/applications/new"      element={<ProtectedRoute allowedRoles={['business_owner']}><NewApplicationPage /></ProtectedRoute>} />
        <Route path="/owner/certificates"          element={<ProtectedRoute allowedRoles={['business_owner']}><CertificatesPage /></ProtectedRoute>} />
        <Route path="/owner/search"                element={<ProtectedRoute allowedRoles={['business_owner']}><SearchPage /></ProtectedRoute>} />

        {/* ── LMO (Legal Metrology Officer) ────────────────────── */}
        <Route path="/lmo/dashboard"               element={<ProtectedRoute allowedRoles={['lmo']}><LMODashboard /></ProtectedRoute>} />
        <Route path="/lmo/applications"            element={<ProtectedRoute allowedRoles={['lmo']}><LMODashboard /></ProtectedRoute>} />
        <Route path="/lmo/applications/:id"        element={<ProtectedRoute allowedRoles={['lmo']}><InspectionFormPage /></ProtectedRoute>} />
        <Route path="/lmo/inspections"             element={<ProtectedRoute allowedRoles={['lmo']}><LMODashboard /></ProtectedRoute>} />
        <Route path="/lmo/certificates"            element={<ProtectedRoute allowedRoles={['lmo']}><CertificatesPage /></ProtectedRoute>} />
        <Route path="/lmo/profile"                 element={<ProtectedRoute allowedRoles={['lmo']}><LMODashboard /></ProtectedRoute>} />
        <Route path="/lmo/search"                  element={<ProtectedRoute allowedRoles={['lmo']}><SearchPage /></ProtectedRoute>} />

        {/* ── GATC ─────────────────────────────────────────────── */}
        <Route path="/gatc/dashboard"              element={<ProtectedRoute allowedRoles={['gatc']}><GATCDashboard /></ProtectedRoute>} />
        <Route path="/gatc/tests"                  element={<ProtectedRoute allowedRoles={['gatc']}><GATCTestsPage /></ProtectedRoute>} />
        <Route path="/gatc/tests/:id"              element={<ProtectedRoute allowedRoles={['gatc']}><GATCInspectionPage /></ProtectedRoute>} />
        <Route path="/gatc/reports"                element={<ProtectedRoute allowedRoles={['gatc']}><GATCReportsPage /></ProtectedRoute>} />
        <Route path="/gatc/profile"                element={<ProtectedRoute allowedRoles={['gatc']}><ProfilePage /></ProtectedRoute>} />

        {/* ── Admin ────────────────────────────────────────────── */}
        <Route path="/admin/dashboard"             element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/applications"          element={<ProtectedRoute allowedRoles={['admin']}><AdminApplicationsPage /></ProtectedRoute>} />
        <Route path="/admin/officers"              element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/users"                 element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/analytics"             element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/settings"              element={<ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>} />
        <Route path="/admin/search"                element={<ProtectedRoute allowedRoles={['admin']}><SearchPage /></ProtectedRoute>} />

        {/* ── Shared Authenticated ──────────────────────────────── */}
        <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* ── Fallback ─────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
