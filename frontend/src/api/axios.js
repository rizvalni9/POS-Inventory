// ==============================================================================
// FILE: frontend/src/api/axios.js
// DESKRIPSI: Konfigurasi Axios terpusat untuk komunikasi Frontend ke Backend API.
// Memiliki fitur:
// 1. In-Memory Token: Token disimpan di memori variabel JS (aman dari pencurian XSS di localStorage).
// 2. Request Interceptor: Otomatis menempelkan 'Authorization: Bearer <token>' ke setiap request.
// 3. Response Interceptor: Otomatis meminta token baru jika token lama habis (Silent Refresh),
//    tanpa mengganggu atau membuat kasir harus login ulang di tengah transaksi.
// ==============================================================================

import axios from 'axios';

// Alamat URL Backend API (diambil dari file .env Vite atau default localhost:5000/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Variabel penampung Access Token di dalam memori JavaScript
let inMemoryAccessToken = null;

// Fungsi untuk menyimpan token ke memori
export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

// Fungsi untuk mengambil token dari memori
export const getAccessToken = () => {
  return inMemoryAccessToken;
};

// Fungsi untuk menghapus token dari memori saat logout
export const clearAccessToken = () => {
  inMemoryAccessToken = null;
};

// Membuat instansiasi Axios khusus aplikasi kita
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // WAJIB TRUE agar browser otomatis menyertakan cookie HttpOnly (refresh token)
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // Batas waktu tunggu request maksimal 15 detik
});

// ------------------------------------------------------------------------------
// PENGENDALI ANTREAN REFRESH TOKEN (Anti-Refresh Storm)
// Jika ada 3 request bersamaan saat token habis, request ke-2 dan ke-3 mengantre
// sampai request ke-1 selesai memperbarui token.
// ------------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ------------------------------------------------------------------------------
// 1. REQUEST INTERCEPTOR
// Fungsi ini otomatis berjalan SEBELUM setiap request dikirim ke backend
// ------------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    // Jika ada token di memori dan belum terpasang di header, pasang sekarang
    if (inMemoryAccessToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------------------------------------------------------
// 2. RESPONSE INTERCEPTOR
// Fungsi ini otomatis berjalan SETELAH response diterima dari backend
// Jika server membalas dengan status 401 Unauthorized (Token Habis),
// Axios otomatis memanggil endpoint refresh token secara diam-diam (Silent Refresh).
// ------------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jangan coba refresh jika error bukan 401, atau jika request itu sendiri adalah login/refresh
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // Jika proses refresh token sedang berjalan oleh request lain, masukkan request ini ke antrean
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Tandai request ini sudah pernah dicoba ulang agar tidak looping selamanya
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Minta Access Token baru ke server menggunakan cookie HttpOnly yang tersimpan di browser
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = response.data?.data?.token;

      // Simpan token baru ke memori
      setAccessToken(newAccessToken);

      // Jalankan semua request lain yang tadi sedang mengantre
      processQueue(null, newAccessToken);

      // Ulangi request awal yang tadi sempat gagal karena token kedaluwarsa
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshErr) {
      // Jika refresh token juga gagal (misal sudah lewat 7 hari), bersihkan antrean dan token
      processQueue(refreshErr, null);
      clearAccessToken();

      // Kirim event khusus agar React AuthContext tahu dan melempar pengguna ke halaman login
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
