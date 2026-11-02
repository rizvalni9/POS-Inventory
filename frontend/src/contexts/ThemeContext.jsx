// ==============================================================================
// FILE: frontend/src/contexts/ThemeContext.jsx
// DESKRIPSI: Global context untuk manajemen Tema Gelap (Dark) dan Terang (Light).
// Menyimpan preferensi di localStorage dan menyinkronkan class "dark" pada tag <html>.
// ==============================================================================

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Ambil tema awal dari localStorage, atau deteksi preferensi OS jika belum pernah memilih
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('pos_app_theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Jika belum ada di localStorage, cek preferensi sistem operasi
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Efek samping: Setiap kali state "theme" berubah, sinkronkan ke elemen <html> dan simpan ke localStorage
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('pos_app_theme', theme);
  }, [theme]);

  // Fungsi toggle sederhana (ganti antara dark <-> light)
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook agar mudah dipanggil di komponen lain
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme harus digunakan di dalam ThemeProvider');
  }
  return context;
};