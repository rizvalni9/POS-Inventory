// ==============================================================================
// FILE: frontend/src/components/TopHeader.jsx
// DESKRIPSI: Header horizontal di bagian atas halaman konten utama (di samping sidebar).
// Menampilkan status sistem di sebelah kiri, serta profil pengguna (nama, avatar, role),
// tombol ubah kata sandi (Password), dan tombol Keluar (Logout) di sebelah kanan.
// ==============================================================================

import React, { useState, useEffect, useRef  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import { KeyRound, LogOut, ShieldCheck, ShoppingCart, UserCheck, ChevronDown } from 'lucide-react';
import apiClient from '../api/axios';

const TopHeader = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [storeProfile, setStoreProfile] = useState({
    store_name:"Memuat...",
    address: "..."})
  const profileRef = useRef(null);

  async function fetchStoreProfile(){
    try {
      const res = await apiClient.get('/business-profile');
      if (res.data?.success && res.data?.data) {
        setStoreProfile({
          store_name: res.data.data.store_name || 'Nama Perusahaan Anda',
          address: res.data.data.address || 'Alamat Perusahaan Anda'
        });
      }
      } catch (err) {
        console.error('Gagal mengambil data profil toko di Header:', err);
        // Fallback jika API gagal/offline
        setStoreProfile({
          store_name: 'Your Name Company Undefined',
          address: 'Your Address Undefined'
        });
      }
  }

  function handleClickOutside(event){
    if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
  }

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      await logout();
      navigate('/login',{ replace: true});
    }
  };

  // Menutup dropdown ketika pengguna mengeklik di luar menu
  useEffect(() => {

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  return (
    <>
      <header className="hidden md:flex h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-6 sm:px-8 items-center justify-between sticky top-0 z-20 no-print flex-shrink-0">
        {/* Bagian Kiri: Status & Identitas Sistem */}
        <div className="flex items-center space-x-3">
          <div className='flex items-center justify-center border bg-brand-600 border-brand-600 rounded-xl text-white w-9 h-9'>
            <ShoppingCart className="w-5 h-5"/>
          </div>

          <div className='flex flex-col'>
            <span className="font-extrabold text-sm text-slate-900 tracking-wider leading-tight truncate" title={storeProfile.store_name}>
              {storeProfile.store_name}
            </span>
            <span className="text-xs font-semibold text-slate-500" title={storeProfile.address}>
              {storeProfile.address}
            </span>
          </div>

          {/* <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online</span>
          </span> */}
        </div>

        {/* Bagian Kanan: Dropdown Profil */}
        <div className="relative flex-shrink-0" ref={profileRef}>

          {/* Tombol untuk membuka dropdown */}
          <button type="button" onClick={() => setIsProfileOpen((prev) => !prev)} aria-expanded={isProfileOpen} aria-haspopup="true" aria-label="Menu profil pengguna" title="Profil Pengguna" className="flex items-center gap-2 rounded-full p-2 hover:bg-slate-100 active:bg-slate-200 duration-150 active:scale-90">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 border border-slate-200">
              {role === 'owner' ? (
                <ShieldCheck className="w-5 h-5 text-brand-600" />
              ) : (
                <UserCheck className="w-5 h-5 text-blue-600" />
              )}
            </div>

            {/* <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}/> */}
          </button>

          {/* Isi dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">

              {/* Informasi akun */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0">
                    {role === 'owner' ? (
                      <ShieldCheck className="w-5 h-5 text-brand-600" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm font-bold text-slate-800 truncate"
                      title={user?.full_name || user?.username}
                    >
                      {user?.full_name || 'Pengguna'}
                    </div>

                    <span
                      className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        role === 'owner'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {role || 'User'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu aksi */}
              <div className="p-2">

                {/* Ubah password */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-slate-500" />
                  <span>Ubah Password</span>
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>

              </div>
            </div>
          )}
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