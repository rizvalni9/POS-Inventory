import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';

/// Service untuk Komunikasi Jaringan Modul Autentikasi & Profil Customer
class AuthApiService {
  final ApiClient _apiClient;

  AuthApiService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Login Akun Customer (FR-AUTH-01) - Murni terkoneksi ke database backend
  Future<AuthResponseModel> login({
    required String username,
    required String password,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.login,
      body: {
        'username': username.trim(),
        'password': password,
      },
    );

    return AuthResponseModel.fromJson(response as Map<String, dynamic>);
  }

  /// Ambil Profil Mandiri Customer dari Database (FR-AUTH-04)
  Future<UserModel> getProfile() async {
    final response = await _apiClient.get(ApiEndpoints.me);
    final data = (response as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return UserModel.fromJson(data);
  }

  /// Perbarui Informasi Kontak Terbatas (Hanya Nomor Telepon dan Email)
  Future<UserModel> updateContact({
    required String phone,
    String? email,
  }) async {
    final body = <String, dynamic>{
      'phone': phone.trim(),
      'email': email != null && email.trim().isNotEmpty ? email.trim() : null,
    };

    final response = await _apiClient.patch(
      ApiEndpoints.me,
      body: body,
    );

    final data = (response as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return UserModel.fromJson(data);
  }

  /// Form Terpadu: Pembaruan Akun & Keamanan (Username dan/atau Kata Sandi)
  Future<UserModel> updateAccountSecurity({
    String? newUsername,
    required String currentPassword,
    String? newPassword,
    String? confirmPassword,
  }) async {
    final body = <String, dynamic>{
      'current_password': currentPassword,
    };

    if (newUsername != null && newUsername.trim().isNotEmpty) {
      body['new_username'] = newUsername.trim();
    }
    if (newPassword != null && newPassword.trim().isNotEmpty) {
      body['new_password'] = newPassword;
      if (confirmPassword != null && confirmPassword.trim().isNotEmpty) {
        body['confirm_password'] = confirmPassword;
      }
    }

    final response = await _apiClient.patch(
      ApiEndpoints.changePassword,
      body: body,
    );

    final data = (response as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return UserModel.fromJson(data);
  }

  /// Aliases untuk kompatibilitas
  Future<UserModel> updateProfile({
    String? name,
    String? phone,
    String? email,
    String? address,
  }) async {
    return updateContact(
      phone: phone ?? '',
      email: email,
    );
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
}
