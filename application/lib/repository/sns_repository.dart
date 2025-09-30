import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SnsRepository {
  final Dio _dio = Dio();
  final storage = const FlutterSecureStorage();

  SnsRepository() {
    _dio.options.baseUrl = const String.fromEnvironment(
      "API_BASE_URL",
      defaultValue: "http://localhost:8080", // 배포 시 변경
    );
    _dio.options.headers['Content-Type'] = 'application/json';
    _dio.interceptors.add(LogInterceptor(responseBody: true));
  }

  // 기존 로컬 계정과 SNS 연결
  Future<dynamic> linkExisting({
    required String id,
    required String password,
    required String provider,
    required String providerId,
  }) async {
    final response = await _dio.post(
      "/app/auth/link-existing",
      data: {
        "id": id,
        "passwordEnc": password,
        "provider": provider,
        "providerId": providerId,
      },
    );
    return response.data;
  }

  // SNS 신규가입 완료
  Future<dynamic> snsSignup({
    required String customName,
    required String nickname,
    required String role,
    required String provider,
    required String providerId,
  }) async {
    final response = await _dio.post(
      "/app/auth/complete-signup",
      data: {
        "customName": customName,
        "nickname": nickname,
        "role": role,
        "provider": provider,
        "providerId": providerId,
      },
    );
    return response.data;
  }
}
