// ==============================================================================
// FILE: frontend/src/components/Navbar.jsx (Sidebar Navigation)
// DESKRIPSI: Komponen navigasi utama aplikasi (Sidebar untuk Desktop & Drawer untuk Mobile).
// Fitur:
// 1. Menu dinamis: Menyesuaikan item menu berdasarkan peran ('owner' vs 'cashier').
// 2. Collapse Sidebar: Dapat diciutkan (mini-mode) pada layar desktop.
// 3. Responsive Drawer: Menu geser samping yang rapi pada layar smartphone/tablet.
// ==============================================================================

import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, ShoppingCart, Package, ArrowDownToLine, History, Store, Users, Award, X, IndentIncrease, IndentDecrease, Phone } from 'lucide-react';

const Navbar = ({ isMobileOpen = false, setIsMobileOpen = () => {} }) => {
  const { role } = useAuth();
  const location = useLocation();

  // State ciutkan sidebar desktop (disimpan di localStorage agar tetap diingat saat refresh)
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

  // Helper untuk menutup drawer mobile
  const closeMobile = () => {
    if (typeof setIsMobileOpen === 'function') {
      setIsMobileOpen(false);
    }
  };

  // Tutup menu drawer mobile secara otomatis jika pengguna berpindah halaman
  useEffect(() => {
    closeMobile();
  }, [location.pathname]);

  // === DAFTAR MENU BERDASARKAN ROLE PENGGUNA ===
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

  // Helper untuk styling link navigasi
  const getNavLinkClasses = (isCollapsedMode = false) => ({ isActive }) => {
    const base = 'flex items-center rounded-xl text-xs font-semibold transition-all group relative';
    const state = isActive
      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60';

    if (isCollapsedMode) {
      return `${base} ${state} justify-center py-3 px-0`;
    }
    return `${base} ${state} px-3.5 py-2.5 space-x-3`;
  };

  function handleWhatsapp(){
    let numPhone = "6281268170410";
    let textEncode= "Halo tim RNZ Developer, saya ingin berkonsultasi terkait pembuatan aplikasi baru, atau melaporkan kendala teknis pada aplikasi saya.";
    let linkAPIwa = `https://wa.me/${numPhone}?text=${encodeURIComponent(textEncode)}`;
    window.open(linkAPIwa, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      {/* ============================================================== */}
      {/* 1. DRAWER MENU MOBILE (Panel Geser Samping)                     */}
      {/* ============================================================== */}
      <div className={`fixed inset-0 z-40 md:hidden no-print transition-all duration-300 ease-in-out ${
        isMobileOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}
      >
        {/* Latar Belakang Gelap (Backdrop) */}
        <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isMobileOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeMobile}
        />

        {/* Panel Menu Samping */}
        <div className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex flex-col h-full">
            {/* Kepala Drawer */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <img src="/company_tech.jpg" alt="Logo Company" className="rounded-md w-9 h-9" />
                <div>
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
                    RNZ Developer
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                    POS & Inventory System V.1.0
                  </span>
                </div>
                <button
                  type="button"
                  onClick={()=>handleWhatsapp()}
                  title="Hubungi Developer"
                  aria-label="Hubungi Developer"
                  className="p-1.5 bg-brand-600 text-white rounded-full shadow-md shadow-brand-600/20 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center shrink-0 ml-1"
                >
                  <Phone className="w-4 h-4 phone-ring-icon" />
                </button>
              </div>

              {/* Tombol Tutup (X) */}
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Tutup Menu"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tautan Menu di Drawer (Scrollable) */}
            <nav className="p-3 space-y-4 overflow-y-auto flex-1">
              {navSections.map((section, sIdx) => (
                <div key={sIdx}>
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
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
                          onClick={closeMobile}
                          className={getNavLinkClasses(false)}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 group-hover:bg-brand-100">
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

      {/* ============================================================== */}
      {/* 2. SIDEBAR DESKTOP (Layar Komputer / Laptop)                   */}
      {/* ============================================================== */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 z-20 flex-shrink-0 transition-all duration-300 no-print ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Tombol Perluas saat Sidebar sedang diciutkan */}
        {isCollapsed && (
          <div className="pt-2 px-2 flex justify-center flex-shrink-0">
            <button
              type="button"
              onClick={toggleCollapse}
              title="Perluas Sidebar"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <IndentIncrease className="w-4 h-4" />
            </button>
          </div>
        )}

        {!isCollapsed && (
          <div className="pt-2 px-2 flex justify-end flex-shrink-0">
            <button type="button" onClick={toggleCollapse} title="Ciutkan Sidebar" className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <IndentDecrease className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Daftar Menu Navigasi Desktop (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              {!isCollapsed ? (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  {section.title}
                </div>
              ) : (
                <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-800 mx-auto my-2 rounded-full" />
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} end={item.end} title={isCollapsed ? item.label : undefined} className={getNavLinkClasses(isCollapsed)}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
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

        {/* Footer Sidebar: Logo Toko / Developer */}
        <div className={`h-16 border-t border-slate-200 dark:border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3.5'} flex-shrink-0 transition-colors`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src="/company_tech.jpg" alt="Logo Company" className="rounded-md w-9 h-9 shrink-0" />

            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="font-extrabold text-sm tracking-wide text-slate-900 dark:text-slate-100 block leading-tight truncate">
                  RNZ Developer
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">
                  POS & Inventory System V.1.0
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={()=>handleWhatsapp()}
              title="Hubungi Developer"
              aria-label="Hubungi Developer"
              className="p-2 bg-brand-600 text-white rounded-full shadow-md shadow-brand-600/20 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center shrink-0"
            >
              <Phone className="w-4 h-4 phone-ring-icon" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
export { Navbar as Sidebar };
