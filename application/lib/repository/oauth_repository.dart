import 'package:flutter_naver_login/flutter_naver_login.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:kakao_flutter_sdk_user/kakao_flutter_sdk_user.dart';

class OAuthRepository {
  // Google
   Future<Map<String, String?>> loginWithGoogle() async {
    final GoogleSignIn googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);

    final account = await googleSignIn.signIn();
    if (account == null) return {};

    final auth = await account.authentication;
    return {
      "provider": "google",
      "idToken": auth.idToken,
      "accessToken": auth.accessToken,
      "email": account.email,
    };
  }

  // Kakao
  Future<Map<String, String?>> loginWithKakao() async {
    OAuthToken token = await UserApi.instance.loginWithKakaoAccount();
    final user = await UserApi.instance.me();

    return {
      "provider": "kakao",
      "accessToken": token.accessToken,
      "refreshToken": token.refreshToken,
      "id": user.id.toString(),
      "email": user.kakaoAccount?.email,
    };
  }

  // Naver
   Future<Map<String, String?>> loginWithNaver() async {
    final result = await FlutterNaverLogin.logIn();

    return {
      "provider": "naver",
      "accessToken": result.accessToken?.accessToken,
      "id": result.account?.id,
      "email": result.account?.email,
    };
  }
}