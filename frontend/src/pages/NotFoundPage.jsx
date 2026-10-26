import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">404 - Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Rute yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Ke Halaman Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
