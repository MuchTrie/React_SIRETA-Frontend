import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: ('admin' | 'operasional')[];
  children: React.ReactNode; 
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    // 1. Jika belum login, tendang ke /login
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // 2. Jika role tidak diizinkan, tendang ke dashboard default mereka
    const defaultDashboard = user.role === 'admin' ? '/admin' : '/operasional';
    return <Navigate to={defaultDashboard} replace />;
  }

  // 3. Jika lolos semua, tampilkan halaman yang diminta
  return <>{children}</>;
}