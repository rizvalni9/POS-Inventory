import '../../../core/constants/api_endpoints.dart';
import '../../../core/errors/app_exception.dart';
import '../../../core/network/api_client.dart';
import '../models/order_request_model.dart';

/// Layanan Komunikasi Jaringan Permintaan Pesanan & Tracking (Modul 4 & 5)
class OrderApiService {
  final ApiClient _apiClient;

  OrderApiService({required ApiClient apiClient}) : _apiClient = apiClient;

  /// Mengajukan Permintaan Pesanan Baru dengan Header Idempotency-Key (FR-ORD-02)
  Future<OrderRequestModel> submitOrderRequest({
    required List<Map<String, dynamic>> items,
    String? notes,
    required String idempotencyKey,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.orderRequests,
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: {
        if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
        'items': items,
      },
    );

    if (response is Map && response['success'] == true && response['data'] != null) {
      return OrderRequestModel.fromJson(response['data'] as Map<String, dynamic>);
    }

    throw ServerException(
      message: response is Map && response['message'] != null
          ? response['message'].toString()
          : 'Gagal mengajukan pesanan.',
    );
  }

  /// Memuat Riwayat Permintaan Pesanan Milik Customer (FR-TRK-01)
  Future<List<OrderRequestModel>> getMyOrderRequests({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    String url = '${ApiEndpoints.myOrderRequests}?page=$page&limit=$limit';
    if (status != null && status.isNotEmpty && status.toLowerCase() != 'semua') {
      url += '&status=${status.toLowerCase()}';
    }

    final response = await _apiClient.get(url);

    if (response is Map && response['success'] == true && response['data'] is List) {
      final list = response['data'] as List<dynamic>;
      return list
          .map((item) => OrderRequestModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    throw ServerException(
      message: response is Map && response['message'] != null
          ? response['message'].toString()
          : 'Gagal memuat riwayat pesanan.',
    );
  }

  /// Memuat Detail Pesanan Tunggal untuk Pelacakan Status (FR-TRK-02)
  Future<OrderRequestModel> getMyOrderDetail(int id) async {
    final response = await _apiClient.get(ApiEndpoints.myOrderDetail(id));

    if (response is Map && response['success'] == true && response['data'] != null) {
      return OrderRequestModel.fromJson(response['data'] as Map<String, dynamic>);
    }

    throw ServerException(
      message: response is Map && response['message'] != null
          ? response['message'].toString()
          : 'Gagal memuat rincian pesanan.',
    );
  }

  /// Simulasi Penyelesaian Pesanan oleh Kasir Toko (Helper Pengujian OJT/QA)
  Future<Map<String, dynamic>> simulateCompleteOrder(int id) async {
    final response = await _apiClient.post(
      '${ApiEndpoints.orderRequests}/$id/simulate-complete',
    );
    if (response is Map && response['success'] == true) {
      return Map<String, dynamic>.from(response['data'] ?? {});
    }
    throw ServerException(
      message: response is Map && response['message'] != null
          ? response['message'].toString()
          : 'Gagal mensimulasikan penyelesaian pesanan.',
    );
  }
}

