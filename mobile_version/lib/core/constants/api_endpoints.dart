import '../config/app_config.dart';

/// Daftar Endpoint REST API Customer Toko (Prefix: /api/v1/customer)
class ApiEndpoints {
  ApiEndpoints._();

  static String get _base => AppConfig.fullApiUrl;

  // 1. Autentikasi & Profil Customer
  static String get login => '$_base/auth/login';
  static String get me => '$_base/me';
  static String get changePassword => '$_base/change-password';

  // 2. Katalog Produk
  static String get products => '$_base/products';
  static String productDetail(dynamic id) => '$_base/products/$id';

  // 3. Permintaan Pesanan (Order Requests)
  static String get orderRequests => '$_base/order-requests';
  static String get myOrderRequests => '$_base/me/order-requests';
  static String myOrderDetail(dynamic id) => '$_base/me/order-requests/$id';

  // 4. Nota Penjualan Resmi (Receipts)
  static String myReceipt(dynamic id) => '$_base/me/receipts/$id';
}

