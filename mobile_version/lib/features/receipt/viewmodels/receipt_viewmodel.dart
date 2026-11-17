import 'package:flutter/foundation.dart';
import '../../../core/errors/app_exception.dart';
import '../models/receipt_model.dart';
import '../repositories/receipt_repository.dart';

enum ReceiptViewState { initial, loading, success, error }

/// ViewModel untuk Modul 6 (Arsip & Nota Penjualan Resmi)
class ReceiptViewModel extends ChangeNotifier {
  final ReceiptRepository _repository;

  ReceiptViewModel({required ReceiptRepository repository}) : _repository = repository;

  ReceiptViewState _state = ReceiptViewState.initial;
  ReceiptViewState get state => _state;

  ReceiptModel? _receipt;
  ReceiptModel? get receipt => _receipt;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  /// Memuat Nota Digital Resmi dari Server (FR-RCP-01 & FR-RCP-02)
  Future<void> loadReceipt(int saleId) async {
    _state = ReceiptViewState.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final data = await _repository.getReceipt(saleId);
      _receipt = data;
      _state = ReceiptViewState.success;
    } catch (e) {
      _state = ReceiptViewState.error;
      if (e is AppException) {
        _errorMessage = e.message;
      } else {
        _errorMessage = 'Gagal memuat nota penjualan: $e';
      }
    } finally {
      notifyListeners();
    }
  }
}

