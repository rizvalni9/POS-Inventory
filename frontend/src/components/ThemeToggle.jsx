// ==============================================================================
// FILE: frontend/src/components/ThemeToggle.jsx
// DESKRIPSI: Tombol interaktif untuk beralih antara Mode Terang dan Mode Gelap.
// ==============================================================================

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
      title={isDark ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Dark Mode)'}
      className={`p-2 rounded-xl transition-all duration-200 border flex items-center justify-center ${
        isDark
          ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700 hover:text-amber-300'
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
};

export default ThemeToggle;