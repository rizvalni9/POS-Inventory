import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../storage/secure_token_storage.dart';
import '../../features/auth/models/user_model.dart';

/// Pengelola Status Sesi Pengguna Global (Session State & Lifecycle)
class SessionManager extends ChangeNotifier {
  final SecureTokenStorage _tokenStorage;
  UserModel? _currentUser;
  bool _isLoading = true;

  SessionManager({SecureTokenStorage? tokenStorage})
      : _tokenStorage = tokenStorage ?? SecureTokenStorage() {
    initSession();
  }

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;
  UserModel? get currentUser => _currentUser;

  /// Memeriksa status login saat aplikasi pertama kali dibuka
  Future<void> initSession() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await _tokenStorage.getToken();
      final cachedProfile = await _tokenStorage.getUserProfile();

      if (token != null && token.isNotEmpty && cachedProfile != null) {
        final Map<String, dynamic> userMap = jsonDecode(cachedProfile);
        _currentUser = UserModel.fromJson(userMap);
      } else {
        _currentUser = null;
      }
    } catch (_) {
      _currentUser = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Dipanggil setelah proses login sukses
  Future<void> setSession({
    required String token,
    required UserModel user,
  }) async {
    await _tokenStorage.saveToken(token);
    await _tokenStorage.saveUserProfile(jsonEncode(user.toJson()));
    _currentUser = user;
    notifyListeners();
  }

  /// Memperbarui cache profil pengguna saat diedit
  Future<void> updateUserProfile(UserModel updatedUser) async {
    _currentUser = updatedUser;
    await _tokenStorage.saveUserProfile(jsonEncode(updatedUser.toJson()));
    notifyListeners();
  }

  /// Logout Bersih (FR-AUTH-05): Membersihkan token, cache, dan state
  Future<void> logout() async {
    await _tokenStorage.clearAll();
    _currentUser = null;
    notifyListeners();
  }

  /// Penanganan Sesi Kedaluwarsa 401 (FR-AUTH-03)
  void handleUnauthorized() {
    if (_currentUser != null) {
      _tokenStorage.clearAll();
      _currentUser = null;
      notifyListeners();
    }
  }
}

