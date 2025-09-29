import 'package:application/model/login_model.dart';
import 'package:application/network/dio_client.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthRepository {
  final DioClient dioClient = DioClient();
  final storage = const FlutterSecureStorage();

  Future<LoginModel> login({
    required String id,
    required String password,
  }) async {
    final response = await dioClient.dio.post(
      "/auth/login",
      data: {"id": id, "passwordEnc": password},
    );

    final model = LoginModel.fromJson(response.data);

    // 토큰 저장
    await storage.write(key: "accessToken", value: model.accessToken);
    await storage.write(key: "refreshToken", value: model.refreshToken);

    return model;
  }

  Future<Map<String, dynamic>> signUp(Map<String, dynamic> payload) async {
    try {
      final res = await dioClient.dio.post("/customer/signup", data: payload);
      return res.data;
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response?.data["message"] ?? "회원가입 실패");
      } else {
        throw Exception("서버와 연결할 수 없습니다");
      }
    }
  }

  // 토큰 기반 사용자 정보 복구
  Future<LoginModel> fetchMe() async {
    final response = await dioClient.dio.get("/auth/me");
    return LoginModel.fromJson(response.data);
  }
}
