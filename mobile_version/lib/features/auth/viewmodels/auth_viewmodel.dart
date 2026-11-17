import 'package:flutter/foundation.dart';
import '../../../core/errors/app_exception.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

enum AuthViewState { initial, loading, success, error }

/// ViewModel untuk Layar Autentikasi Customer (ChangeNotifier)
class AuthViewModel extends ChangeNotifier {
  final AuthRepository _repository;

  AuthViewState _state = AuthViewState.initial;
  String? _errorMessage;
  Map<String, dynamic>? _fieldErrors;
  bool _isPasswordVisible = false;

  AuthViewModel({required AuthRepository repository}) : _repository = repository;

  AuthViewState get state => _state;
  bool get isLoading => _state == AuthViewState.loading;
  String? get errorMessage => _errorMessage;
  Map<String, dynamic>? get fieldErrors => _fieldErrors;
  bool get isPasswordVisible => _isPasswordVisible;

  void togglePasswordVisibility() {
    _isPasswordVisible = !_isPasswordVisible;
    notifyListeners();
  }

  void clearError() {
    if (_errorMessage != null || _fieldErrors != null) {
      _errorMessage = null;
      _fieldErrors = null;
      _state = AuthViewState.initial;
      notifyListeners();
    }
  }

  /// Eksekusi Proses Login
  Future<UserModel?> login({
    required String username,
    required String password,
  }) async {
    _state = AuthViewState.loading;
    _errorMessage = null;
    _fieldErrors = null;
    notifyListeners();

    try {
      final user = await _repository.login(
        username: username.trim(),
        password: password,
      );
      _state = AuthViewState.success;
      notifyListeners();
      return user;
    } on AppException catch (e) {
      _state = AuthViewState.error;
      _errorMessage = e.message;
      _fieldErrors = e.fieldErrors;
      notifyListeners();
      return null;
    } catch (e) {
      _state = AuthViewState.error;
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return null;
    }
  }
}

