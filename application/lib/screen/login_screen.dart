import 'package:application/component/signup_component/sns_select.dart';
import 'package:application/provider/user_provider.dart';
import 'package:application/repository/auth_repository.dart';
import 'package:application/repository/oauth_repository.dart';
import 'package:application/screen/home_screen.dart';
import 'package:application/screen/signup_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _idController = TextEditingController();
  final _passwordController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  final oauthRepository = OAuthRepository();
  final authRepository = AuthRepository();
  final storage = const FlutterSecureStorage();

  Future<void> _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      try {
        final res = await authRepository.login(
          id: _idController.text,
          password: _passwordController.text,
        );
        if (!mounted) return;

        // User 상태 저장
        final userProvider = Provider.of<UserProvider>(context, listen: false);
        userProvider.setUser(res);
        // 홈 탭으로 이동
        userProvider.setIndex(0);

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("로그인 성공")));
      } catch (e) {
        if (!mounted) return;
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
                    controller: _idController,
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
                    controller: _passwordController,
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

                  // 회원가입 이동 버튼
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("아직 계정이 없으신가요?"),
                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const SignUpScreen(),
                            ),
                          );
                        },
                        child: const Text("회원가입"),
                      ),
                    ],
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
                    onPressed: () async {
                      final result = await oauthRepository.loginWithGoogle();
                      if (result.isEmpty) {
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("구글 로그인 취소")),
                        );
                        return;
                      }

                      try {
                        final user = await authRepository.snsLogin(result);
                        if (!context.mounted) return;

                        final userProvider = Provider.of<UserProvider>(
                          context,
                          listen: false,
                        );
                        userProvider.setUser(user);
                        userProvider.setIndex(0);

                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("구글 로그인 성공")),
                        );
                      } catch (e) {
                        if (!context.mounted) return;

                        // 신규 가입 분기
                        final goSignup = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text("신규 회원"),
                            content: const Text("계정이 없습니다. 회원가입 하시겠습니까?"),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: const Text("취소"),
                              ),
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, true),
                                child: const Text("회원가입"),
                              ),
                            ],
                          ),
                        );

                        if (goSignup == true && context.mounted) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => SnsSelect(snsResult: result),
                            ),
                          );
                        }
                      }
                    },
                    icon: const Icon(Icons.g_mobiledata),
                    label: const Text("구글 로그인"),
                  ),
                  const SizedBox(height: 10),
                  
                  OutlinedButton.icon(
                    onPressed: () async {
                      final result = await oauthRepository.loginWithNaver();
                      if (result.isEmpty) {
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("네이버 로그인 취소")),
                        );
                        return;
                      }

                      try {
                        final user = await authRepository.snsLogin(result);
                        if (!context.mounted) return;

                        final userProvider = Provider.of<UserProvider>(
                          context,
                          listen: false,
                        );
                        userProvider.setUser(user);
                        userProvider.setIndex(0);

                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("네이버 로그인 성공")),
                        );
                      } catch (e) {
                        if (!context.mounted) return;

                        // 신규 가입 분기
                        final goSignup = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text("신규 회원"),
                            content: const Text("계정이 없습니다. 회원가입 하시겠습니까?"),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: const Text("취소"),
                              ),
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, true),
                                child: const Text("회원가입"),
                              ),
                            ],
                          ),
                        );

                        if (goSignup == true && context.mounted) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => SnsSelect(snsResult: result),
                            ),
                          );
                        }
                      }
                    },
                    icon: const Icon(Icons.person),
                    label: const Text("네이버 로그인"),
                  ),
                  const SizedBox(height: 10),

                  OutlinedButton.icon(
                    onPressed: () async {
                      final result = await oauthRepository.loginWithKakao();
                      if (result.isEmpty) {
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("카카오 로그인 취소")),
                        );
                        return;
                      }

                      try {
                        final user = await authRepository.snsLogin(result);
                        if (!context.mounted) return;

                        final userProvider = Provider.of<UserProvider>(
                          context,
                          listen: false,
                        );
                        userProvider.setUser(user);
                        userProvider.setIndex(0);

                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("카카오 로그인 성공")),
                        );
                      } catch (e) {
                        if (!context.mounted) return;
                        
                        // 신규 가입 분기
                        final goSignup = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text("신규 회원"),
                            content: const Text("계정이 없습니다. 회원가입 하시겠습니까?"),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: const Text("취소"),
                              ),
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, true),
                                child: const Text("회원가입"),
                              ),
                            ],
                          ),
                        );

                        if (goSignup == true && context.mounted) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => SnsSelect(snsResult: result),
                            ),
                          );
                        }
                      }
                    },
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
