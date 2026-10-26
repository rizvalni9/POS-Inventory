import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CashierPage from './pages/CashierPage';
import ProductsPage from './pages/ProductsPage';
import StockInPage from './pages/StockInPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import StoreProfilePage from './pages/StoreProfilePage';
import UsersManagementPage from './pages/UsersManagementPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout with Sidebar and Container
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Route wrapper for Login: redirect if already authenticated
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
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* 403 Forbidden Route */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Navbar />
            <div className="flex-1 flex flex-col min-w-0">
              <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <UnauthorizedPage />
              </main>
            </div>
          </div>
        }
      />

      {/* Protected Routes inside AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Owner-Only Routes */}
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

        {/* Both Owner & Cashier Routes */}
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
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
