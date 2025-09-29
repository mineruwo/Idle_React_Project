import 'package:application/model/login_model.dart';
import 'package:application/repository/auth_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class UserProvider with ChangeNotifier {
  final storage = const FlutterSecureStorage();
  final AuthRepository authRepository = AuthRepository();

  LoginModel? _user;
  LoginModel? get user => _user;
  bool get isLoggedIn => _user != null;

  int _selectedIndex = 0;
  int get selectedIndex => _selectedIndex;

  void setUser(LoginModel user) {
    _user = user;
    notifyListeners();
  }

  void cleanUser() {
    _user = null;
    notifyListeners();
  }

  void setIndex(int index) {
    _selectedIndex = index;
    notifyListeners();
  }

  // 앱 실행 시 사용자 복구
  Future<void> restoreUser() async {
    final accessToken = await storage.read(key: "accessToken");
    final refreshToken = await storage.read(key: "refreshToken");

    if (accessToken != null) {
      try {
        final me = await authRepository.fetchMe();
        // me에는 토큰이 null이므로 → 기존 스토리지 토큰을 보존
        _user = LoginModel(
          id: me.id,
          nickname: me.nickname,
          role: me.role,
          idNum: me.idNum,
          accessToken: accessToken,
          refreshToken: refreshToken,
        );
      } catch (e) {
        // 토큰이 유효하지 않으면 초기화
        _user = null;
      }
      notifyListeners();
    }
  }
}
