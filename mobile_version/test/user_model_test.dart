import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_version/features/auth/models/user_model.dart';
import 'package:mobile_version/features/auth/models/auth_response_model.dart';

void main() {
  group('UserModel Unit Tests', () {
    test('Berhasil melakukan parsing UserModel dari JSON backend', () {
      final json = {
        'id': 12,
        'member_id': 5,
        'member_code': 'MBR-0005',
        'name': 'Budi Santoso',
        'username': 'customer_budi',
        'phone': '081234567890',
        'email': 'budi@example.com',
        'address': 'Jl. Sudirman No. 45, Padang',
        'tier': 'Silver',
        'points': 150,
        'role': 'customer',
      };

      final user = UserModel.fromJson(json);

      expect(user.id, 12);
      expect(user.memberId, 5);
      expect(user.memberCode, 'MBR-0005');
      expect(user.name, 'Budi Santoso');
      expect(user.phone, '081234567890');
      expect(user.tier, 'Silver');
      expect(user.points, 150);
      expect(user.role, 'customer');
    });

    test('Berhasil melakukan serialisasi UserModel ke JSON', () {
      final user = UserModel(
        id: 12,
        memberId: 5,
        memberCode: 'MBR-0005',
        name: 'Budi Santoso',
        phone: '081234567890',
        tier: 'Silver',
        points: 150,
      );

      final json = user.toJson();

      expect(json['id'], 12);
      expect(json['member_code'], 'MBR-0005');
      expect(json['points'], 150);
    });

    test('Berhasil melakukan parsing AuthResponseModel', () {
      final json = {
        'success': true,
        'message': 'Login berhasil',
        'data': {
          'token': 'jwt_dummy_token_123',
          'token_type': 'Bearer',
          'expires_in': 86400,
          'user': {
            'id': 12,
            'member_id': 5,
            'member_code': 'MBR-0005',
            'name': 'Budi Santoso',
            'phone': '081234567890',
            'tier': 'Silver',
            'points': 150,
            'role': 'customer',
          }
        }
      };

      final authResponse = AuthResponseModel.fromJson(json);

      expect(authResponse.success, true);
      expect(authResponse.token, 'jwt_dummy_token_123');
      expect(authResponse.user.name, 'Budi Santoso');
      expect(authResponse.user.memberCode, 'MBR-0005');
    });
  });
}

