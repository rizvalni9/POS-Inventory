// ==============================================================================
// FILE: frontend/src/contexts/AuthContext.jsx
// DESKRIPSI: Tempat penyimpanan (State Global) status login dan informasi user.
// Dengan React Context, komponen mana saja di aplikasi bisa mengetahui:
// - Siapa yang sedang login (user)
// - Apa peran akunnya (role: 'owner' atau 'cashier')
// - Memanggil fungsi login, logout, atau cek hak akses (hasRole)
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient, { setAccessToken, clearAccessToken } from '../api/axios';

// Membuat objek context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // State data user yang sedang login (null jika belum login)
  const [user, setUser] = useState(null);
  
  // State penanda apakah aplikasi sedang memeriksa sesi awal (saat F5 / refresh halaman)
  const [isInitializing, setIsInitializing] = useState(true);

  // Fungsi inisialisasi: memeriksa apakah browser memiliki cookie sesi aktif
  const initializeAuth = useCallback(async () => {
    try {
      // Coba panggil silent refresh ke backend
      const res = await apiClient.post('/auth/refresh');
      if (res.data?.success && res.data?.data) {
        // Jika cookie valid, simpan token baru dan data user
        setAccessToken(res.data.data.token);
        setUser(res.data.data.user);
      }
    } catch (err) {
      // Jika belum login atau sesi habis, kosongkan token
      clearAccessToken();
      setUser(null);
    } finally {
      // Selesai memeriksa sesi awal
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    // Jalankan pemeriksaan sesi saat pertama kali website dibuka
    initializeAuth();

    // Dengarkan event 'auth:session-expired' jika sewaktu-waktu sesi habis di tengah jalan
    const handleSessionExpired = () => {
      setUser(null);
      clearAccessToken();
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [initializeAuth]);

  // Fungsi untuk login
  const login = async (username, password) => {
    const res = await apiClient.post('/auth/login', { username, password });
    if (res.data?.success && res.data?.data) {
      setAccessToken(res.data.data.token);
      setUser(res.data.data.user);
    }
    return res.data;
  };

  // Fungsi untuk logout
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  // Fungsi pembantu untuk mengecek apakah user memiliki role tertentu
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (!Array.isArray(allowedRoles)) return user.role === allowedRoles;
    return allowedRoles.includes(user.role);
  };

  // Nilai-nilai yang dibagikan ke seluruh komponen anak
  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isInitializing,
    login,
    logout,
    hasRole,
    refreshSession: initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook agar komponen lain cukup memanggil: const { user, role, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam komponen AuthProvider!');
  }
  return context;
};
