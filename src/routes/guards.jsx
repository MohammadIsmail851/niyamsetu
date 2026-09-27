import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin" />
          <p className="text-slate text-sm">Loading NIYAMSETU...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to role-appropriate home
    const roleHome = {
      business_owner: '/owner/dashboard',
      lmo: '/lmo/dashboard',
      gatc: '/gatc/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={roleHome[profile.role] || '/login'} replace />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { user, profile, loading } = useAuthStore();

  if (loading) return null;

  if (user && profile) {
    const roleHome = {
      business_owner: '/owner/dashboard',
      lmo: '/lmo/dashboard',
      gatc: '/gatc/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={roleHome[profile.role] || '/'} replace />;
  }

  return children;
};
