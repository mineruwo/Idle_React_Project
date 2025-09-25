class LoginModel {
  final String id;
  final String nickname;
  final String role;
  final int idNum;
  final String? accessToken;
  final String? refreshToken;

  LoginModel({
    required this.id,
    required this.nickname,
    required this.role,
    required this.idNum,
    required this.accessToken,
    required this.refreshToken,
  });

  factory LoginModel.fromJson(Map<String, dynamic> json) {
    return LoginModel(
      id: json["id"],
      nickname: json["nickname"],
      role: json["role"],
      idNum: json["idNum"],
      accessToken: json["accessToken"],
      refreshToken: json["refreshToken"],
    );
  }
}
