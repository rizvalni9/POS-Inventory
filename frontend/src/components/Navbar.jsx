import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ArrowDownToLine,
  History,
  Store,
  Users,
  LogOut,
  KeyRound,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      await logout();
      navigate('/login');
    }
  };

  const navLinkClasses = ({ isActive }) =>
    `inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-8">
              <NavLink to={role === 'owner' ? '/' : '/pos'} className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                    POS Toko & Stok
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    P01 • Sistem Kasir Terpadu
                  </span>
                </div>
              </NavLink>

              {/* Navigation Links based on RBAC */}
              <nav className="hidden md:flex items-center space-x-1.5">
                {role === 'owner' && (
                  <NavLink to="/" end className={navLinkClasses}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </NavLink>
                )}

                <NavLink to="/pos" className={navLinkClasses}>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Kasir POS</span>
                </NavLink>

                {role === 'owner' && (
                  <>
                    <NavLink to="/products" className={navLinkClasses}>
                      <Package className="w-4 h-4" />
                      <span>Master Produk</span>
                    </NavLink>

                    <NavLink to="/stock-in" className={navLinkClasses}>
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>Stok Masuk</span>
                    </NavLink>
                  </>
                )}

                <NavLink to="/sales-history" className={navLinkClasses}>
                  <History className="w-4 h-4" />
                  <span>{role === 'owner' ? 'Riwayat Penjualan' : 'Riwayat Hari Ini'}</span>
                </NavLink>

                {role === 'owner' && (
                  <>
                    <NavLink to="/users" className={navLinkClasses}>
                      <Users className="w-4 h-4" />
                      <span>Kelola Pengguna</span>
                    </NavLink>

                    <NavLink to="/store-profile" className={navLinkClasses}>
                      <Store className="w-4 h-4" />
                      <span>Profil Toko</span>
                    </NavLink>
                  </>
                )}
              </nav>
            </div>

            {/* User Profile Badge & Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2.5 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                  {role === 'owner' ? <ShieldCheck className="w-4 h-4 text-brand-600" /> : <UserCheck className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.full_name || user?.username}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      role === 'owner' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  title="Ganti Password"
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar dari Sistem"
                  className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto px-4 py-2 space-x-2 border-t border-slate-100 bg-slate-50">
          {role === 'owner' && (
            <NavLink to="/" end className={navLinkClasses}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </NavLink>
          )}
          <NavLink to="/pos" className={navLinkClasses}>
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Kasir</span>
          </NavLink>
          {role === 'owner' && (
            <>
              <NavLink to="/products" className={navLinkClasses}>
                <Package className="w-3.5 h-3.5" />
                <span>Produk</span>
              </NavLink>
              <NavLink to="/stock-in" className={navLinkClasses}>
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Stok</span>
              </NavLink>
            </>
          )}
          <NavLink to="/sales-history" className={navLinkClasses}>
            <History className="w-3.5 h-3.5" />
            <span>Riwayat</span>
          </NavLink>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
