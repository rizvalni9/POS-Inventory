import '../models/order_request_model.dart';
import '../services/order_api_service.dart';

/// Repository untuk Mengelola Permintaan Pesanan & Tracking (Modul 4 & 5)
class OrderRepository {
  final OrderApiService _apiService;

  OrderRepository({required OrderApiService apiService}) : _apiService = apiService;

  Future<OrderRequestModel> submitOrder({
    required List<Map<String, dynamic>> items,
    String? notes,
    required String idempotencyKey,
  }) {
    return _apiService.submitOrderRequest(
      items: items,
      notes: notes,
      idempotencyKey: idempotencyKey,
    );
  }

  Future<List<OrderRequestModel>> getOrders({
    int page = 1,
    int limit = 20,
    String? status,
  }) {
    return _apiService.getMyOrderRequests(
      page: page,
      limit: limit,
      status: status,
    );
  }

  Future<OrderRequestModel> getOrderDetail(int id) {
    return _apiService.getMyOrderDetail(id);
  }

  Future<Map<String, dynamic>> simulateComplete(int id) {
    return _apiService.simulateCompleteOrder(id);
  }
}

