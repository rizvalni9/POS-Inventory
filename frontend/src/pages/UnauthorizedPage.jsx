import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">403 - Akses Ditolak</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Akun Anda dengan peran <span className="font-bold text-slate-700 uppercase">'{role}'</span> tidak memiliki izin untuk membuka halaman atau modul ini.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <button
            onClick={() => navigate(role === 'owner' ? '/' : '/pos')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-colors"
          >
            Menuju Beranda
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
