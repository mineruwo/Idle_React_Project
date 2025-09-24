import 'package:application/repository/auth_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController idController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  final AuthRepository authRepository = AuthRepository();
  final storage = const FlutterSecureStorage();

  Future<void> _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      try {
        // 임시용임
        // 로그인 시 이전 토큰 제거
        await storage.delete(key: "accessToken");
        await storage.delete(key: "refreshToken");

        final res = await authRepository.login(
          id: idController.text,
          password: passwordController.text,
        );

        final accessToken = res["accessToken"];
        final refreshToken = res["refreshToken"];
        final role = res["role"];

        // 토큰 저장
        await storage.write(key: "accessToken", value: accessToken);
        await storage.write(key: "refreshToken", value: refreshToken);

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("$role 로그인 성공")));

        // TODO: 로그인 성공 후 화면 이동
        // Navigator.pushReplacement(...);
      } catch (e) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text("로그인 실패")));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.only(top: 150, left: 24, right: 24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 로고
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Image.asset("assets/logo.png", height: 80),
                  ),
                  const SizedBox(height: 10),

                  // 제목
                  const Text(
                    "로그인",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 30),

                  // 이메일 입력
                  TextFormField(
                    controller: idController,
                    decoration: const InputDecoration(
                      labelText: "이메일",
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return "이메일을 입력하세요";
                      }
                      final regex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$');
                      if (!regex.hasMatch(value)) {
                        return "이메일 형식이 올바르지 않습니다";
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),

                  // 비밀번호 입력
                  TextFormField(
                    controller: passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: "비밀번호",
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return "비밀번호를 입력하세요";
                      }
                      if (value.length < 8) {
                        return "비밀번호는 8자 이상이어야 합니다";
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),

                  // 로그인 버튼
                  ElevatedButton(
                    onPressed: _handleLogin,
                    child: const Text("로그인"),
                  ),

                  const SizedBox(height: 30),

                  // Divider
                  Row(
                    children: const [
                      Expanded(child: Divider()),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8.0),
                        child: Text("SNS 로그인"),
                      ),
                      Expanded(child: Divider()),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // SNS 로그인
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.g_mobiledata),
                    label: const Text("구글 로그인"),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.person),
                    label: const Text("네이버 로그인"),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.chat),
                    label: const Text("카카오 로그인"),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
