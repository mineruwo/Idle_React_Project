import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';

class EmailRepository {
  late Dio _dio;

  EmailRepository() {
    _dio = Dio(
      BaseOptions(
        baseUrl: "http://10.0.2.2:8080/api/email",
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 5),
      ),
    );

    final cookieJar = CookieJar();
    _dio.interceptors.add(CookieManager(cookieJar));
  }

  // 인증 코드 발송
  Future<bool> sendCode(String email) async {
    try {
      final res = await _dio.post(
        "/send-code",
        queryParameters: {
          "email": email,
          "purpose": "SIGNUP_VERIFY_EMAIL", // 기본값
        },
      );
      return res.statusCode == 202; // EmailController에서 accepted() 반환
    } catch (e) {
      return false;
    }
  }

  // 인증 코드 검증
  Future<bool> verifyCode(String email, String code) async {
    try {
      final res = await _dio.post(
        "/verify-code",
        queryParameters: {
          "email": email,
          "code": code,
          "purpose": "SIGNUP_VERIFY_EMAIL", // 기본값
        },
      );

      if (res.statusCode == 200) {
        final data = res.data;
        // 실패 케이스
        if (data["ok"] == false) {
          // reason 값 로그 남기기 (expired_or_missing, mismatch 등)
          print("verify failed reason: ${data["reason"]}");
          return false;
        }

        // 성공 케이스 (회원가입)
        if (data["ok"] == true && data["verified"] == true) {
          return true;
        }

        // 비밀번호 찾기 케이스 (추후 목적 바꾸면 활용 가능)
        if (data["ok"] == true && data["token"] != null) {
          print("reset token: ${data["token"]}");
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
