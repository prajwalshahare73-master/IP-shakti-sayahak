import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'user' | 'expert' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const location = useLocation();
  const { user, authInitialized } = useAppStore();

  // If session is still being retrieved from Supabase on initial load or refresh
  if (!authInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          fontFamily: 'inherit',
          color: '#0f3d5c'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            className="login-spinner"
            style={{
              width: 32,
              height: 32,
              borderColor: '#0f3d5c',
              borderTopColor: 'transparent',
              margin: '0 auto 12px auto'
            }}
          />
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  // If no authenticated user session
  if (!user) {
    const redirectTarget = requiredRole === 'expert' ? '/expert/login' : '/login';
    return <Navigate to={redirectTarget} state={{ from: location }} replace />;
  }

  // If a specific role is required (e.g. expert)
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    if (requiredRole === 'expert') {
      return <Navigate to="/expert/login" state={{ from: location, roleMismatch: true }} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
