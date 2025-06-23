import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from '@/pages/AuthPage';
import { Navigate, useLocation } from 'react-router-dom'; // <-- Import Navigate and useLocation

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation(); // <-- Get current location to pass to AuthPage

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 bat-glow animate-glow-pulse">
            <span className="text-primary-foreground font-bold text-2xl font-orbitron">B</span>
          </div>
          <p className="text-muted-foreground font-orbitron uppercase tracking-wider">
            INITIALIZING BATWAVE...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;