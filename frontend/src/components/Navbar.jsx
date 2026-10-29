// ==============================================================================
// FILE: frontend/src/components/Navbar.jsx (Sidebar Navigation)
// DESKRIPSI: Komponen navigasi utama aplikasi (Sidebar untuk Desktop & Drawer untuk Mobile).
// Fitur:
// 1. Profil Pengguna di Bagian Atas: Nama, avatar role, tombol ubah password, dan logout.
// 2. Menu dinamis: Menyesuaikan item menu berdasarkan peran ('owner' vs 'cashier').
// 3. Collapse Sidebar: Dapat diciutkan (mini-mode) pada layar desktop.
// 4. Responsive Drawer: Menu geser samping yang rapi pada layar smartphone/tablet.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import { LayoutDashboard, ShoppingCart, Package, ArrowDownToLine, History, Store, Users, LogOut, KeyRound, ShieldCheck, UserCheck, Menu, X, ChevronLeft, ChevronRight, Award, IndentIncrease, IndentDecrease } from 'lucide-react';

const Navbar = () => {
  // Mengambil info user yang sedang login dari AuthContext
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // === STATE KOMPONEN ===
  // 1. State modal ganti kata sandi
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 2. State drawer menu mobile (layar kecil)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 3. State ciutkan sidebar desktop (disimpan di localStorage agar tetap diingat saat refresh)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  // Fungsi untuk ciutkan / lebarkan sidebar desktop
  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  // Tutup menu drawer mobile secara otomatis jika pengguna berpindah halaman
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Fungsi saat tombol keluar diklik
  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      await logout();
      navigate('/login');
    }
  };

  // === DAFTAR MENU BERDASARKAN ROLE PENGGUNA ===
  // Jika role = 'owner', seluruh menu ditampilkan.
  // Jika role = 'cashier', menu khusus owner disembunyikan.
  const navSections = [
    {
      title: 'Menu Utama',
      items: [
        ...(role === 'owner'
          ? [
            {
              to: '/',
              end: true,
              label: 'Dashboard',
              icon: LayoutDashboard,
            },
          ]
          : []),
        {
          to: '/pos',
          end: false,
          label: 'Kasir POS',
          icon: ShoppingCart,
          badge: 'Kasir',
        },
      ],
    },
    {
      title: 'Inventori & Transaksi',
      items: [
        {
          to: '/products',
          end: false,
          label: 'Master Produk',
          icon: Package,
        },
        ...(role === 'owner'
          ? [
            {
              to: '/stock-in',
              end: false,
              label: 'Stok Masuk',
              icon: ArrowDownToLine,
            },
          ]
          : []),
        {
          to: '/members',
          end: false,
          label: 'Loyalty Member',
          icon: Award,
        },
        {
          to: '/sales-history',
          end: false,
          label: role === 'owner' ? 'Riwayat Penjualan' : 'Riwayat Hari Ini',
          icon: History,
        },
      ],
    },
    ...(role === 'owner'
      ? [
        {
          title: 'Pengaturan & Toko',
          items: [
            {
              to: '/users',
              end: false,
              label: 'Kelola Pengguna',
              icon: Users,
            },
            {
              to: '/store-profile',
              end: false,
              label: 'Profil Toko',
              icon: Store,
            },
          ],
        },
      ]
      : []),
  ];

  // Fungsi helper untuk menghasilkan class CSS link navigasi yang sedang aktif
  const getNavLinkClasses = (isCollapsedMode = false) => ({ isActive }) => {
    const base = 'flex items-center rounded-xl text-xs font-semibold transition-all group relative';
    const state = isActive
      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';

    if (isCollapsedMode) {
      return `${base} ${state} justify-center py-3 px-0`;
    }
    return `${base} ${state} px-3.5 py-2.5 space-x-3`;
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. HEADER ATAS KHUSUS MOBILE (Layar Kecil / HP)                */}
      {/* ============================================================== */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between no-print">
        <div className="flex items-center space-x-3">
          {/* Tombol Hamburger untuk membuka menu samping */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Buka Menu Navigasi"
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo & Judul Sistem */}
          <NavLink to={role === 'owner' ? '/' : '/pos'} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-sm shadow-brand-500/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                POS & Inventori
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                Sistem Kasir
              </span>
            </div>
          </NavLink>
        </div>

        {/* Badge Avatar Pengguna di Layar HP */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
            {role === 'owner' ? (
              <ShieldCheck className="w-4 h-4 text-brand-600" />
            ) : (
              <UserCheck className="w-4 h-4 text-blue-600" />
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. DRAWER MENU MOBILE (Panel Geser Samping)                     */}
      {/* ============================================================== */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden no-print">
          {/* Latar Belakang Gelap (Backdrop) */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Panel Menu Samping */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-left duration-200">
            <div className="flex flex-col h-full">
              {/* Kepala Drawer */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                      POS & Inventori
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      Sistem Kasir
                    </span>
                  </div>
                </div>

                {/* Tombol Tutup (X) */}
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Tutup Menu"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ====================================================== */}
              {/* PROFIL PENGGUNA & AKSI DI MOBILE (Pindah ke Atas)      */}
              {/* ====================================================== */}
              <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex-shrink-0">
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-2 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200 flex-shrink-0">
                    {role === 'owner' ? (
                      <ShieldCheck className="w-4 h-4 text-brand-600" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {user?.full_name || user?.username}
                    </div>
                    <span
                      className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5 ${role === 'owner'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      {role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileOpen(false);
                      setIsPasswordModalOpen(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center space-x-1 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center space-x-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>

              {/* Tautan Menu di Drawer (Scrollable) */}
              <nav className="p-3 space-y-4 overflow-y-auto flex-1">
                {navSections.map((section, sIdx) => (
                  <div key={sIdx}>
                    <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setIsMobileOpen(false)}
                            className={getNavLinkClasses(false)}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 group-hover:bg-brand-100">
                                {item.badge}
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SIDEBAR DESKTOP (Layar Komputer / Laptop)                   */}
      {/* ============================================================== */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 z-20 flex-shrink-0 transition-all duration-500 no-print ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Tombol Perluas saat Sidebar sedang diciutkan */}
        {isCollapsed && (
          <div className="pt-2 px-2 flex justify-center flex-shrink-0">
            <button type="button" onClick={toggleCollapse} title="Perluas Sidebar" className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
              <IndentIncrease className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {!isCollapsed && (
          <div className="pt-2 px-2 flex justify-end flex-shrink-0">
            <button type="button" onClick={toggleCollapse} title="Ciutkan Sidebar" className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
              <IndentDecrease className="w-4 h-4" />
            </button>
          </div>
          )}

        {/* Daftar Menu Navigasi Desktop (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              {!isCollapsed ? (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {section.title}
                </div>
              ) : (
                <div className="w-6 h-0.5 bg-slate-200 mx-auto my-2 rounded-full" />
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      title={isCollapsed ? item.label : undefined}
                      className={getNavLinkClasses(isCollapsed)}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Kepala Sidebar: Logo Toko & Tombol Ciutkan */}
        <div className="h-16 border-t border-slate-200 flex items-center justify-center gap-2 flex-shrink-0">
          {/* <NavLink to={role === 'owner' ? '/' : '/pos'} className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3 overflow-hidden'}`} title="POS & Inventori Usaha">
          </NavLink> */}
          <img src="/company_tech.jpg" alt="Logo Company" className="rounded-md w-9 h-9" />
          
          {!isCollapsed && (
            <div className="overflow-hidden">
              <span className="font-extrabold text-sm tracking-wide text-slate-900 block leading-tight truncate">
                RNZ Developer
              </span>
              <span className="text-[10px] text-slate-500 font-medium block truncate">
                POS & Inventory System V.1.0
              </span>
            </div>
          )}

        </div>
      </aside>

      {/* Modal Dialog Ganti Kata Sandi */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
export { Navbar as Sidebar };
