import '../../../core/constants/api_endpoints.dart';
import '../../../core/errors/app_exception.dart';
import '../../../core/network/api_client.dart';
import '../models/receipt_model.dart';

/// Layanan Komunikasi Jaringan Nota Penjualan Resmi (Modul 6)
class ReceiptApiService {
  final ApiClient _apiClient;

  ReceiptApiService({required ApiClient apiClient}) : _apiClient = apiClient;

  /// Memuat Nota Digital Resmi Berdasarkan ID Penjualan (FR-RCP-01 & FR-RCP-02)
  Future<ReceiptModel> getMyReceipt(int saleId) async {
    final response = await _apiClient.get(ApiEndpoints.myReceipt(saleId));

    if (response is Map && response['success'] == true && response['data'] != null) {
      return ReceiptModel.fromJson(response['data'] as Map<String, dynamic>);
    }

    throw ServerException(
      message: response is Map && response['message'] != null
          ? response['message'].toString()
          : 'Gagal memuat nota penjualan.',
    );
  }
}

