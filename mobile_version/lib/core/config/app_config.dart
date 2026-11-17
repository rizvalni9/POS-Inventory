/// Konfigurasi Global Aplikasi Mobile Customer Toko (M01)
class AppConfig {
  AppConfig._();

  /// Base URL Staging / Server API
  /// - Android Emulator: 'http://10.0.2.2:5000'
  /// - Real Device / Wi-Fi lokal: sesuaikan dengan IP mesin backend (misal: 'http://192.168.1.X:5000')
  /// - Staging Server: 'https://api.staging-toko.flashtech.id'
  static const String baseUrl = 'http://10.0.2.2:5000';

  /// Prefix API resmi untuk Customer Toko
  static const String apiPrefix = '/api/v1/customer';

  /// Timeout durasi untuk koneksi jaringan (10 detik sesuai PRD)
  static const Duration timeoutDuration = Duration(seconds: 10);

  /// Helper untuk mendapatkan full URL
  static String get fullApiUrl => '$baseUrl$apiPrefix';
}

