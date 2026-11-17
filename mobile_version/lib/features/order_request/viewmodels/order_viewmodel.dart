import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../../../core/errors/app_exception.dart';
import '../models/order_request_model.dart';
import '../repositories/order_repository.dart';

enum OrderViewState { initial, loading, success, empty, error }

/// ViewModel untuk Modul 4 (Order Request) dan Modul 5 (Tracking Status)
class OrderViewModel extends ChangeNotifier {
  final OrderRepository _repository;
  final Uuid _uuid = const Uuid();

  OrderViewModel({required OrderRepository repository}) : _repository = repository;

  OrderViewState _state = OrderViewState.initial;
  OrderViewState get state => _state;

  bool _isSubmitting = false;
  bool get isSubmitting => _isSubmitting;

  bool _isLoadingDetail = false;
  bool get isLoadingDetail => _isLoadingDetail;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  List<OrderRequestModel> _orders = [];
  List<OrderRequestModel> get orders => _orders;

  OrderRequestModel? _selectedOrder;
  OrderRequestModel? get selectedOrder => _selectedOrder;

  String _statusFilter = 'semua';
  String get statusFilter => _statusFilter;

  // Idempotency Key Manajemen (FR-ORD-02 & FR-ORD-04)
  String? _activeIdempotencyKey;
  String? get activeIdempotencyKey => _activeIdempotencyKey;
  List<Map<String, dynamic>>? _pendingItems;
  String? _pendingNotes;

  void setStatusFilter(String status) {
    if (_statusFilter == status) return;
    _statusFilter = status;
    loadOrders(refresh: true);
  }

  /// Memuat Daftar Riwayat Permintaan Pesanan (FR-TRK-01 & FR-TRK-03)
  Future<void> loadOrders({bool refresh = false}) async {
    if (_state == OrderViewState.loading && !refresh) return;

    if (!refresh) {
      _state = OrderViewState.loading;
      _errorMessage = null;
      notifyListeners();
    }

    try {
      final fetchedOrders = await _repository.getOrders(
        page: 1,
        limit: 50,
        status: _statusFilter,
      );

      _orders = fetchedOrders;
      if (_orders.isEmpty) {
        _state = OrderViewState.empty;
      } else {
        _state = OrderViewState.success;
      }
      _errorMessage = null;
    } catch (e) {
      _state = OrderViewState.error;
      if (e is AppException) {
        _errorMessage = e.message;
      } else {
        _errorMessage = 'Gagal memuat riwayat pesanan: $e';
      }
    } finally {
      notifyListeners();
    }
  }

  /// Memuat Rincian Pesanan Tunggal untuk Tracking Real-Time (FR-TRK-02 & FR-TRK-03)
  Future<void> loadOrderDetail(int id) async {
    _isLoadingDetail = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final detail = await _repository.getOrderDetail(id);
      _selectedOrder = detail;
    } catch (e) {
      if (e is AppException) {
        _errorMessage = e.message;
      } else {
        _errorMessage = 'Gagal memuat detail pesanan: $e';
      }
    } finally {
      _isLoadingDetail = false;
      notifyListeners();
    }
  }

  /// Mengajukan Pesanan Baru dengan Perlindungan Idempotency-Key (FR-ORD-01 s/d FR-ORD-06)
  Future<OrderRequestModel?> submitOrder({
    required List<Map<String, dynamic>> items,
    String? notes,
  }) async {
    // FR-ORD-01: Validasi keranjang belanja tidak kosong
    if (items.isEmpty) {
      _errorMessage = 'Keranjang belanja tidak boleh kosong.';
      notifyListeners();
      return null;
    }

    // FR-ORD-03: Kunci tombol submit dan tampilkan loading
    _isSubmitting = true;
    _errorMessage = null;
    _pendingItems = items;
    _pendingNotes = notes;

    // FR-ORD-02: Buat Idempotency-Key baru (UUID v4) jika belum ada key aktif
    _activeIdempotencyKey ??= _uuid.v4();
    notifyListeners();

    try {
      final orderResult = await _repository.submitOrder(
        items: items,
        notes: notes,
        idempotencyKey: _activeIdempotencyKey!,
      );

      // FR-ORD-06: Sukses -> Reset key dan simpan pesanan aktif
      _activeIdempotencyKey = null;
      _pendingItems = null;
      _pendingNotes = null;
      _selectedOrder = orderResult;

      // Sisipkan di baris pertama riwayat
      _orders.insert(0, orderResult);
      _state = OrderViewState.success;

      return orderResult;
    } on NetworkException catch (e) {
      // FR-ORD-04: Jika timeout atau gangguan jaringan, PERTAHANKAN idempotency key yang sama!
      _errorMessage = '${e.message} Silakan tekan "Coba Lagi" untuk memastikan transaksi Anda.';
      rethrow;
    } on ConflictException catch (e) {
      // FR-ORD-05 / R01: Harga/stok berubah di server
      _activeIdempotencyKey = null; // Reset agar dapat mengajukan ulang setelah meninjau keranjang
      _errorMessage = e.message;
      rethrow;
    } catch (e) {
      if (e is AppException) {
        _errorMessage = e.message;
      } else {
        _errorMessage = 'Gagal mengirim pesanan: $e';
      }
      rethrow;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  /// Retry Pengajuan Pesanan Menggunakan Idempotency-Key Yang Sama (FR-ORD-04 / R02)
  Future<OrderRequestModel?> retrySubmitWithSameKey() async {
    if (_pendingItems == null || _activeIdempotencyKey == null) {
      return null;
    }
    return submitOrder(
      items: _pendingItems!,
      notes: _pendingNotes,
    );
  }

  /// Simulasi Kasir Toko Memproses Pesanan Menjadi COMPLETED (Untuk Keperluan Demo / UAT)
  Future<bool> simulateCompleteOrder(int orderId) async {
    try {
      await _repository.simulateComplete(orderId);
      // Muat ulang detail terbaru
      await loadOrderDetail(orderId);
      await loadOrders(refresh: true);
      return true;
    } catch (e) {
      if (e is AppException) {
        _errorMessage = e.message;
      } else {
        _errorMessage = 'Gagal memproses simulasi: $e';
      }
      notifyListeners();
      return false;
    }
  }
}

