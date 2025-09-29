import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DioClient {
  final Dio dio = Dio();
  final storage = const FlutterSecureStorage();

  DioClient() {
    dio.options.baseUrl = "http://10.0.2.2:8080/api";          

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // 로그인, 회원가입, 리프레시 요청은 토큰 제외
          if (!(options.path.contains("/auth/login") ||
              options.path.contains("/auth/refresh") ||
              options.path.contains("/customer/signup"))) {
            final token = await storage.read(key: "accessToken");
            if (token != null) {
              options.headers["Authorization"] = "Bearer $token";
            }
          }
          // 🔎 디버그
          // ignore: avoid_print
          print("➡️ ${options.method} ${dio.options.baseUrl}${options.path}");
          // ignore: avoid_print
          print("➡️ AUTH=${options.headers["Authorization"]}");

          return handler.next(options);
        },
        onResponse: (response, handler) {
          print("Response[${response.statusCode}] => ${response.data}");
          return handler.next(response);
        },
        onError: (DioException e, handler) async {
          // AccessToken 만료 시
          if (e.response?.statusCode == 401) {
            final refreshToken = await storage.read(key: "refreshToken");

            if (refreshToken != null) {
              try {
                final refreshDio = Dio()..options.baseUrl = dio.options.baseUrl;
                // Refresh 요청 (baseUrl이 있으므로 상대 경로 사용 가능)
                final refreshResponse = await refreshDio.post(
                  "/auth/refresh",
                  data: {"refreshToken": refreshToken},
                );

                final newAccess = refreshResponse.data["accessToken"];
                final newRefresh = refreshResponse.data["refreshToken"];

                // 새 토큰 저장
                await storage.write(key: "accessToken", value: newAccess);
                if (newRefresh != null) {
                  await storage.write(key: "refreshToken", value: newRefresh);
                }

                // 실패했던 요청에 새 토큰 붙여서 재시도
                e.requestOptions.headers["Authorization"] = "Bearer $newAccess";
                final retryResponse = await dio.fetch(e.requestOptions);

                return handler.resolve(retryResponse);
              } catch (refreshError) {
                print('Token refresh failed: $refreshError'); // Added logging
                // Refresh 실패 → 로그아웃 처리 필요
                await storage.delete(key: "accessToken");
                await storage.delete(key: "refreshToken");
                return handler.reject(e);
              }
            }
          }
          return handler.next(e);
        },
      ),
    );
  }
}
