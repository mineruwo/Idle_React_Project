import 'package:application/model/login_model.dart';
import 'package:flutter/material.dart';

class UserProvider with ChangeNotifier {
  LoginModel? _user;

  LoginModel? get user => _user;

  bool get isLoggedIn => _user != null;

  void setUser(LoginModel user) {
    _user = user;
    notifyListeners();
  }

  void cleanUser() {
    _user = null;
    notifyListeners();
  }
}