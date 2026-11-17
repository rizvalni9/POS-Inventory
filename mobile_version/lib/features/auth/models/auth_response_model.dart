import 'user_model.dart';

/// Model Respon Login dari Endpoint /api/v1/customer/auth/login
class AuthResponseModel {
  final bool success;
  final String message;
  final String token;
  final String tokenType;
  final int expiresIn;
  final UserModel user;

  AuthResponseModel({
    required this.success,
    required this.message,
    required this.token,
    required this.tokenType,
    required this.expiresIn,
    required this.user,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? {};
    final userData = data['user'] as Map<String, dynamic>? ?? {};

    return AuthResponseModel(
      success: json['success'] == true,
      message: json['message']?.toString() ?? 'Login berhasil',
      token: data['token']?.toString() ?? '',
      tokenType: data['token_type']?.toString() ?? 'Bearer',
      expiresIn: data['expires_in'] is int
          ? data['expires_in']
          : int.tryParse(data['expires_in']?.toString() ?? '86400') ?? 86400,
      user: UserModel.fromJson(userData),
    );
  }
}

