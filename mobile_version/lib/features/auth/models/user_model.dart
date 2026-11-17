/// Model Data Pengguna & Member Customer Toko
class UserModel {
  final int id;
  final int memberId;
  final String memberCode;
  final String name;
  final String? username;
  final String phone;
  final String? email;
  final String? address;
  final String tier;
  final int points;
  final String role;

  UserModel({
    required this.id,
    required this.memberId,
    required this.memberCode,
    required this.name,
    this.username,
    required this.phone,
    this.email,
    this.address,
    required this.tier,
    required this.points,
    this.role = 'customer',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      memberId: json['member_id'] is int
          ? json['member_id']
          : int.tryParse(json['member_id']?.toString() ?? '0') ?? 0,
      memberCode: json['member_code']?.toString() ?? '-',
      name: json['name']?.toString() ?? '',
      username: json['username']?.toString(),
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString(),
      address: json['address']?.toString(),
      tier: json['tier']?.toString() ?? 'Bronze',
      points: json['points'] is int
          ? json['points']
          : int.tryParse(json['points']?.toString() ?? '0') ?? 0,
      role: json['role']?.toString() ?? 'customer',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'member_id': memberId,
      'member_code': memberCode,
      'name': name,
      'username': username,
      'phone': phone,
      'email': email,
      'address': address,
      'tier': tier,
      'points': points,
      'role': role,
    };
  }

  UserModel copyWith({
    String? name,
    String? username,
    String? phone,
    String? email,
    String? address,
    String? tier,
    int? points,
  }) {
    return UserModel(
      id: id,
      memberId: memberId,
      memberCode: memberCode,
      name: name ?? this.name,
      username: username ?? this.username,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      address: address ?? this.address,
      tier: tier ?? this.tier,
      points: points ?? this.points,
      role: role,
    );
  }
}

