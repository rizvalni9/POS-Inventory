import 'package:flutter/foundation.dart';
import '../../../core/errors/app_exception.dart';
import '../../auth/repositories/auth_repository.dart';

enum ProfileViewState { initial, loading, success, error }

/// ViewModel untuk Layar Profil & Keanggotaan Member Customer
class ProfileViewModel extends ChangeNotifier {
  final AuthRepository _repository;

  ProfileViewState _state = ProfileViewState.initial;
  String? _errorMessage;
  bool _isUpdating = false;

  ProfileViewModel({required AuthRepository repository}) : _repository = repository;

  ProfileViewState get state => _state;
  bool get isLoading => _state == ProfileViewState.loading;
  bool get isUpdating => _isUpdating;
  String? get errorMessage => _errorMessage;

  /// Memuat profil customer terbaru dari backend database
  Future<void> loadProfile() async {
    _state = ProfileViewState.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      await _repository.fetchFreshProfile();
      _state = ProfileViewState.success;
      notifyListeners();
    } on AppException catch (e) {
      _state = ProfileViewState.error;
      _errorMessage = e.message;
      notifyListeners();
    } catch (e) {
      _state = ProfileViewState.error;
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
    }
  }

  /// Memperbarui informasi kontak mandiri (hanya nomor telepon & email)
  Future<bool> updateContact({
    required String phone,
    String? email,
  }) async {
    _isUpdating = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _repository.updateContact(
        phone: phone,
        email: email,
      );
      _isUpdating = false;
      notifyListeners();
      return true;
    } on AppException catch (e) {
      _isUpdating = false;
      _errorMessage = e.message;
      notifyListeners();
      return false;
    } catch (e) {
      _isUpdating = false;
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  /// Form Terpadu: Memperbarui Pengaturan Akun & Keamanan (Username & Password)
  Future<bool> updateAccountSecurity({
    String? newUsername,
    required String currentPassword,
    String? newPassword,
    String? confirmPassword,
  }) async {
    _isUpdating = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _repository.updateAccountSecurity(
        newUsername: newUsername,
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      );
      _isUpdating = false;
      notifyListeners();
      return true;
    } on AppException catch (e) {
      _isUpdating = false;
      _errorMessage = e.message;
      notifyListeners();
      return false;
    } catch (e) {
      _isUpdating = false;
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  /// Kompatibilitas mundur
  Future<bool> updateProfile({
    String? name,
    String? phone,
    String? email,
    String? address,
  }) async {
    return updateContact(phone: phone ?? '', email: email);
  }

  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
    String? confirmPassword,
  }) async {
    return updateAccountSecurity(
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    );
  }

  /// Logout dari aplikasi
  Future<void> logout() async {
    await _repository.logout();
  }
}
