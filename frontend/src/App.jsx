// ==============================================================================
// FILE: frontend/src/App.jsx
// DESKRIPSI: Peta routing utama aplikasi menggunakan React Router DOM.
// Fitur:
// 1. AppLayout: Struktur pembungkus halaman (Sidebar Navbar di kiri + Konten di kanan).
// 2. PublicOnlyRoute: Mencegah pengguna yang sudah login untuk membuka halaman login lagi.
// 3. ProtectedRoute: Menjaga halaman agar hanya bisa dibuka sesuai peran ('owner' atau 'cashier').
// ==============================================================================

import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Komponen Pembungkus & Navigasi
import Navbar from './components/Navbar';
import TopHeader from './components/TopHeader';
import ProtectedRoute from './components/ProtectedRoute';

// Halaman-halaman Aplikasi
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CashierPage from './pages/CashierPage';
import ProductsPage from './pages/ProductsPage';
import StockInPage from './pages/StockInPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import StoreProfilePage from './pages/StoreProfilePage';
import UsersManagementPage from './pages/UsersManagementPage';
import MembersPage from './pages/MembersPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout Utama: Sidebar di sebelah kiri, Header profil di atas kanan, dan area konten
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Pembungkus Halaman Publik (Login):
// Jika pengguna sudah login, otomatis dialihkan ke Dashboard (owner) atau Kasir POS (cashier)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, role, isInitializing } = useAuth();

  if (isInitializing) return null;

  if (isAuthenticated) {
    return <Navigate to={role === 'owner' ? '/' : '/pos'} replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* 1. Halaman Login (Publik) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* 2. Halaman 403 Forbidden (Akses Ditolak jika peran tidak cocok) */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Navbar />
            <div className="flex-1 flex flex-col min-w-0">
              <TopHeader />
              <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <UnauthorizedPage />
              </main>
            </div>
          </div>
        }
      />

      {/* 3. Halaman Terproteksi (Wajib Login) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* === RUTE KHUSUS PEMILIK TOKO (OWNER ONLY) === */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-in"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <StockInPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-profile"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <StoreProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <UsersManagementPage />
            </ProtectedRoute>
          }
        />

        {/* === RUTE BERSAMA (BISA DIAKSES OWNER & CASHIER) === */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={['owner', 'cashier']}>
              <CashierPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={['owner', 'cashier']}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-history"
          element={
            <ProtectedRoute allowedRoles={['owner', 'cashier']}>
              <SalesHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute allowedRoles={['owner', 'cashier']}>
              <MembersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 4. Halaman 404 (URL Tidak Ditemukan) */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
