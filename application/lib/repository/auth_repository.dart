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

  // ID 중복검사 (회원가입)
  Future<bool> checkIdDuplicate(String id) async {
    try {
      final res = await dioClient.dio.get(
        "/customer/check-id",
        queryParameters: {"id": id},
      );
      return res.data as bool; // 서버에서 true/false 반환한다고 가정
    } on DioException catch (e) {
      throw Exception(e.response?.data["message"] ?? "아이디 중복 확인 실패");
    }
  }

  // 닉네임 중복검사 (회원가입)
  Future<bool> checkNicknameDuplicate(String nickname) async {
    try {
      final res = await dioClient.dio.get(
        "/customer/check-nickname",
        queryParameters: {"nickname": nickname},
      );
      return res.data as bool;
    } on DioException catch (e) {
      throw Exception(e.response?.data["message"] ?? "닉네임 중복 확인 실패");
    }
  }

  // SNS 로그인
  Future<LoginModel> snsLogin(Map<String, String?> payload) async {
    try {
      final res = await dioClient.dio.post("/auth/app-sns", data: payload);

      final model = LoginModel.fromJson(res.data);
      // 토큰 저장
      await storage.write(key: "accessToken", value: model.accessToken);
      await storage.write(key: "refreshToken", value: model.refreshToken);
      
      return model;

    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response?.data["message"] ?? "SNS 로그인 실패");
      } else {
        throw Exception("서버와 연결할 수 없습니다");
      }
    }
  }
}
