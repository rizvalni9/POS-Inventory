import '../models/receipt_model.dart';
import '../services/receipt_api_service.dart';

/// Repository untuk Nota Penjualan Resmi (Modul 6)
class ReceiptRepository {
  final ReceiptApiService _apiService;

  ReceiptRepository({required ReceiptApiService apiService}) : _apiService = apiService;

  Future<ReceiptModel> getReceipt(int saleId) {
    return _apiService.getMyReceipt(saleId);
  }
}

