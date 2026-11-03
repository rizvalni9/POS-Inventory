// ==============================================================================
// FILE: frontend/src/components/TopHeader.jsx
// DESKRIPSI: Header horizontal di bagian atas halaman aplikasi (Mobile & Desktop).
// Menampilkan tombol hamburger (mobile), identitas toko, serta profil pengguna
// (nama, avatar, role), tombol ubah kata sandi (Password), dan tombol Keluar (Logout).
// ==============================================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import ThemeToggle from './ThemeToggle';
import { KeyRound, LogOut, ShieldCheck, ShoppingCart, UserCheck, Menu } from 'lucide-react';
import apiClient from '../api/axios';

const TopHeader = ({ onOpenMobileMenu }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [storeProfile, setStoreProfile] = useState({
    store_name: 'Memuat...',
    address: '...',
  });
  const profileRef = useRef(null);

  // Ambil data profil toko dari database (cukup 1x di TopHeader untuk seluruh layar)
  async function fetchStoreProfile() {
    try {
      const res = await apiClient.get('/business-profile');
      if (res.data?.success && res.data?.data) {
        setStoreProfile({
          store_name: res.data.data.store_name || 'Nama Perusahaan Anda',
          address: res.data.data.address || 'Alamat Perusahaan Anda',
        });
      }
    } catch (err) {
      console.error('Gagal mengambil data profil toko di Header:', err);
      // Fallback jika API gagal/offline
      setStoreProfile({
        store_name: 'Your Name Company Undefined',
        address: 'Your Address Undefined',
      });
    }
  }

  // Alasan membuat fungsi untuk tombol ubah password dan keluar yang disatukan pada tombol memunculkan menu dropdown icon pengguna dikanan yang tidak langsung ke dalam return kelas ini,  karena menurut saya mudah dibaca dan sesuai dengan kerangka berpikir awal saya jadi ketika diletakkan kode 2 button langsung di dalam return kelas ini akan membuat saya bigung, hal ini kebiasaan saya saat membangun aplikasi desktop dengan Java
  function passBCOnly(){
    if(role==='cashier'){
      return (
        <>
        <button type="button" onClick={() => { setIsProfileOpen(false); setIsPasswordModalOpen(true)}} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <KeyRound className="w-4 h-4 text-slate-500" />
          <span>Ubah Password</span>
        </button>
        
        <button type="button" onClick={() => { setIsProfileOpen(false); handleLogout(); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
        </>
      )
    }else{
      return (
        <button type="button" onClick={() => { setIsProfileOpen(false); handleLogout(); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      );
    }
  }//Jika fungsi tidak digunakan maka buat langsung 2 button ini di dalam, di sana sudah ada saya sediakan kodenya dan hapus passBCOnly() disana

  // Menutup dropdown profil ketika mengeklik di luar menu
  function handleClickOutside(event) {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setIsProfileOpen(false);
    }
  }

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  // Event listener untuk klik di luar dropdown profil
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Tutup dropdown profil otomatis jika pengguna berpindah halaman
  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      await logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      <header className="flex h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 items-center justify-between sticky top-0 z-30 no-print transition-colors duration-200">
        {/* Bagian Kiri: Tombol Hamburger (Mobile) & Identitas Toko */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          {/* Tombol Hamburger Khusus Mobile */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Buka Menu Navigasi"
            className="md:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo & Judul Sistem */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="flex items-center justify-center border bg-brand-600 border-brand-600 rounded-xl text-white w-8 h-8 sm:w-9 sm:h-9 shadow-sm shadow-brand-500/20 flex-shrink-0">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="flex flex-col min-w-0">
              <span
                className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight sm:tracking-wider leading-tight truncate"
                title={storeProfile.store_name}
              >
                {storeProfile.store_name}
              </span>
              <span
                className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate"
                title={storeProfile.address}
              >
                {storeProfile.address}
              </span>
            </div>
          </div>
        </div>

        {/* Bagian Kanan: Dropdown Profil */}
        <div className="flex items-center space-x-3">
          {/* Tombol Dark/Light Mode */}
          <ThemeToggle />
          {/* Dropdown Profil Pengguna yang sudah ada */}
          <div className="relative flex-shrink-0" ref={profileRef}>
            {/* Tombol untuk membuka dropdown */}
            <button type="button" onClick={() => setIsProfileOpen((prev) => !prev)} aria-expanded={isProfileOpen} aria-haspopup="true" aria-label="Menu profil pengguna" title="Profil Pengguna" className="flex items-center rounded-full p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 duration-150 active:scale-90">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {role === 'owner' ? (
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
                ) : (
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                )}
              </div>
            </button>

            {/* Isi dropdown dengan animasi */}
            <div
              className={`absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 transition-all duration-200 ease-out ${
                isProfileOpen
                  ? 'opacity-100 translate-y-0 scale-100 visible'
                  : 'opacity-0 -translate-y-2 scale-95 invisible pointer-events-none'
              }`}>
              {/* Informasi akun */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    {role === 'owner' ? (
                      <ShieldCheck className="w-5 h-5 text-brand-600" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate"
                      title={user?.full_name || user?.username}
                    >
                      {user?.full_name || 'Pengguna'}
                    </div>

                    <span
                      className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        role === 'owner'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {role || 'User'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu aksi */}
              <div className="p-2">
                {/* Ubah password*/}
                {/* NOTE: Jika menggunakan kode ini, hapus atau nonaktifkan method passBCOnly() */}
                {/* {role === 'cashier' && (
                  <button type="button" onClick={() => { 
                      setIsProfileOpen(false);
                      setIsPasswordModalOpen(true);
                    }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    <span>Ubah Password</span>
                  </button>
                )} */}

                {/* Logout
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button> */}

                {/* NOTE: Jika menggunakan tidak menggunakan kode diatas, hapus atau nonaktifkan 2 button diatas */}
                {passBCOnly()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal Dialog Ganti Kata Sandi */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default TopHeader;