// ==============================================================================
// FILE: frontend/src/components/ProtectedRoute.jsx
// DESKRIPSI: Komponen penjaga rute (Route Guard).
// Tugasnya:
// 1. Jika masih memeriksa sesi awal (isInitializing), tampilkan animasi loading.
// 2. Jika pengguna belum login (isAuthenticated = false), arahkan otomatis ke halaman /login.
// 3. Jika pengguna tidak memiliki peran yang diizinkan (misal kasir mencoba buka menu owner),
//    arahkan otomatis ke halaman /unauthorized (403 Forbidden).
// ==============================================================================

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, isInitializing, hasRole } = useAuth();
  const location = useLocation();

  // 1. Tampilkan layar loading saat sesi pertama kali dicek dari cookie browser
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 animate-pulse">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-600">Memverifikasi sesi keamanan...</p>
        </div>
      </div>
    );
  }

  // 2. Jika belum login sama sekali, redirect ke /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Jika login tapi role tidak memenuhi syarat, redirect ke /unauthorized
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Jika lolos seluruh syarat, render halaman yang dituju
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
