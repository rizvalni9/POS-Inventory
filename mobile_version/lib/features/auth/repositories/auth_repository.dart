import '../../../core/session/session_manager.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';
import '../services/auth_api_service.dart';

/// Repository Autentikasi Mengabstraksi Sumber Data & Sinkronisasi Sesi
class AuthRepository {
  final AuthApiService _apiService;
  final SessionManager _sessionManager;

  AuthRepository({
    AuthApiService? apiService,
    required SessionManager sessionManager,
  })  : _apiService = apiService ?? AuthApiService(),
        _sessionManager = sessionManager;

  /// Melakukan login dan mengikat sesi secara atomik
  Future<UserModel> login({
    required String username,
    required String password,
  }) async {
    final AuthResponseModel response = await _apiService.login(
      username: username,
      password: password,
    );

    // Pastikan akun bertipe customer (bukan cashier/owner web)
    if (response.user.role != 'customer') {
      throw Exception(
        'Akun ini bukan akun customer. Silakan login melalui web admin kasir.',
      );
    }

    // Simpan token dan profil ke session manager
    await _sessionManager.setSession(
      token: response.token,
      user: response.user,
    );

    return response.user;
  }

  /// Sinkronisasi profil terbaru dari backend database
  Future<UserModel> fetchFreshProfile() async {
    final freshUser = await _apiService.getProfile();
    await _sessionManager.updateUserProfile(freshUser);
    return freshUser;
  }

  /// Memperbarui informasi kontak mandiri customer (Hanya Telepon & Email)
  Future<UserModel> updateContact({
    required String phone,
    String? email,
  }) async {
    final updated = await _apiService.updateContact(
      phone: phone,
      email: email,
    );
    await _sessionManager.updateUserProfile(updated);
    return updated;
  }

  /// Form Terpadu: Memperbarui Pengaturan Akun & Keamanan (Username & Password)
  Future<UserModel> updateAccountSecurity({
    String? newUsername,
    required String currentPassword,
    String? newPassword,
    String? confirmPassword,
  }) async {
    final updated = await _apiService.updateAccountSecurity(
      newUsername: newUsername,
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    );
    await _sessionManager.updateUserProfile(updated);
    return updated;
  }

  /// Kompatibilitas mundur
  Future<UserModel> updateProfile({
    String? name,
    String? phone,
    String? email,
    String? address,
  }) async {
    return updateContact(phone: phone ?? '', email: email);
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    String? confirmPassword,
  }) async {
    await updateAccountSecurity(
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    );
  }

  /// Logout pengguna
  Future<void> logout() async {
    await _sessionManager.logout();
  }
}
