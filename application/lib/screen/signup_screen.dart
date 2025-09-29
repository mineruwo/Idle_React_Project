import 'package:application/component/signup_component/email_verification.dart';
import 'package:application/provider/user_provider.dart';
import 'package:application/repository/auth_repository.dart';
import 'package:application/repository/email_repository.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  // 입력 컨트롤러
  final _nameController = TextEditingController();
  final _idController = TextEditingController();
  final _passwordController = TextEditingController();
  final _passwordCheckController = TextEditingController();
  final _nicknameController = TextEditingController();
  final _phoneController = TextEditingController();

  final emailRepository = EmailRepository();
  final authRepository = AuthRepository();

  String _role = "shipper"; // 기본: 화주

  final _formKey = GlobalKey<FormState>();

  void _submit() {
    if (_formKey.currentState!.validate()) {
      // 회원가입 API 호출
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("회원가입 요청됨")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("회원가입")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: Image.asset("assets/logo.png", height: 80),
              ),

              const SizedBox(height: 16),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: "이름",
                  hintText: "홍길동",
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) return "이름을 입력하세요";
                  if (value.length < 2) return "이름은 2자 이상이어야 합니다";
                  return null;
                },
              ),

              const SizedBox(height: 12),
              TextFormField(
                controller: _idController,
                decoration: const InputDecoration(
                  labelText: "ID (이메일)",
                  hintText: "your@email.com",
                ),
                validator: (value) {
                  if (value == null || !value.contains("@")) {
                    return "올바른 이메일을 입력하세요";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 12),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: "비밀번호",
                  hintText: "••••••••",
                ),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.length < 8) {
                    return "비밀번호는 8자 이상이어야 합니다";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 12),
              TextFormField(
                controller: _passwordCheckController,
                decoration: const InputDecoration(
                  labelText: "비밀번호 확인",
                  hintText: "••••••••",
                ),
                obscureText: true,
                validator: (value) {
                  if (value != _passwordController.text) {
                    return "비밀번호가 일치하지 않습니다";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 12),
              TextFormField(
                controller: _nicknameController,
                decoration: const InputDecoration(
                  labelText: "닉네임",
                  hintText: "idle",
                ),
                validator: (value) {
                  if (value == null || value.length < 2) {
                    return "닉네임은 2자 이상이어야 합니다";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(
                  labelText: "전화번호",
                  hintText: "010-1234-5678",
                ),
                validator: (value) {
                  if (value == null || value.length < 10) {
                    return "전화번호 형식에 맞게 입력하세요";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),
              const Text("회원 유형"),
              Row(
                children: [
                  Expanded(
                    child: RadioMenuButton<String>(
                      value: "shipper",
                      groupValue: _role,
                      onChanged: (value) {
                        setState(() => _role = value!);
                      },
                      child: const Text("화주"),
                    ),
                  ),
                  Expanded(
                    child: RadioMenuButton<String>(
                      value: "carrier",
                      groupValue: _role,
                      onChanged: (value) {
                        setState(() => _role = value!);
                      },
                      child: const Text("차주"),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              ElevatedButton(
                onPressed: () async {
                  if (!_formKey.currentState!.validate()) return;

                  final isIdDuplicate = await authRepository.checkIdDuplicate(
                    _idController.text,
                  );
                  if (!context.mounted) return;

                  if (isIdDuplicate) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("이미 사용 중인 ID입니다")),
                    );
                    return;
                  }

                  final isNicknameDuplicate = await authRepository
                      .checkNicknameDuplicate(_nicknameController.text);
                  if (!context.mounted) return;
                  
                  if (isNicknameDuplicate) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("이미 사용 중인 닉네임입니다")),
                    );
                    return;
                  }

                  if (!context.mounted) return;
                  await showEmailVerification(
                    context: context,
                    email: _idController.text,
                    onSendCode: emailRepository.sendCode,
                    onVerifyCode: emailRepository.verifyCode,
                    onVerified: () async {
                      final payload = {
                        "id": _idController.text,
                        "passwordEnc": _passwordController.text,
                        "nickname": _nicknameController.text,
                        "customName": _nameController.text,
                        "phone": _phoneController.text,
                        "role": _role,
                      };

                      final messenger = ScaffoldMessenger.of(context);

                      try {
                        await authRepository.signUp(payload);
                        if (!context.mounted) return;

                        messenger.showSnackBar(
                          const SnackBar(content: Text("회원가입 성공")),
                        );

                        // 마이페이지 탭으로 이동
                        Navigator.pop(context);
                        final userProvider = Provider.of<UserProvider>(
                          context,
                          listen: false,
                        );
                        userProvider.setIndex(4);
                      } catch (e) {
                        if (!mounted) return;
                        messenger.showSnackBar(
                          SnackBar(content: Text("회원가입 실패: $e")),
                        );
                      }
                    },
                  );
                },
                child: const Text("회원가입"),
              ),
              const SizedBox(height: 30),
              Row(
                children: const [
                  Expanded(child: Divider()),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8.0),
                    child: Text("SNS 회원가입"),
                  ),
                  Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: 20),

              OutlinedButton.icon(
                onPressed: () {
                  // 구글 OAuth
                },
                icon: const Icon(Icons.g_mobiledata),
                label: const Text("구글 가입"),
              ),
              const SizedBox(height: 10),

              OutlinedButton.icon(
                onPressed: () {
                  // 네이버 OAuth
                },
                icon: const Icon(Icons.language),
                label: const Text("네이버 가입"),
              ),
              const SizedBox(height: 10),

              OutlinedButton.icon(
                onPressed: () {
                  // 카카오 OAuth
                },
                icon: const Icon(Icons.chat),
                label: const Text("카카오 가입"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
