import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading spinner or skeleton screen
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // User doesn't have the required role, redirect to home or unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Usage example:
// <Route path="/dashboard" element={
//   <ProtectedRoute>
//     <Dashboard />
//   </ProtectedRoute>
// } />
