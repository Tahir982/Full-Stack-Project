import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { User, UserRole } from '../types';

interface ProtectedRouteProps {
  user: User | null;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, allowedRoles }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;