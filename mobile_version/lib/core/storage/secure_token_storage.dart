import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Service Penyimpanan Token Terenkripsi Menggunakan flutter_secure_storage
class SecureTokenStorage {
  static const String _keyToken = 'auth_token_jwt';
  static const String _keyUserJson = 'cached_user_profile';

  final FlutterSecureStorage _storage;

  SecureTokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
              ),
            );

  /// Menyimpan token autentikasi JWT
  Future<void> saveToken(String token) async {
    await _storage.write(key: _keyToken, value: token);
  }

  /// Mengambil token autentikasi JWT
  Future<String?> getToken() async {
    return await _storage.read(key: _keyToken);
  }

  /// Memeriksa apakah token ada
  Future<bool> hasToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  /// Menyimpan cache data profil pengguna
  Future<void> saveUserProfile(String userJson) async {
    await _storage.write(key: _keyUserJson, value: userJson);
  }

  /// Mengambil cache data profil pengguna
  Future<String?> getUserProfile() async {
    return await _storage.read(key: _keyUserJson);
  }

  /// Menghapus seluruh data sesi saat logout (Clean Logout)
  Future<void> clearAll() async {
    await _storage.delete(key: _keyToken);
    await _storage.delete(key: _keyUserJson);
  }
}

