import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // 이게 뭐임
  final TextEditingController idController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  // 이건 뭐임
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView( // 이건 뭐임
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 로고
                Image.asset(
                  "assets/logo.png",
                  height: 100,
                ),
                const SizedBox(height: 20),

                // 제목
                const Text(
                  "로그인",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
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
                    final regex =
                        RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$');
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
                const SizedBox(height: 10),

                // 로그인 버튼
                ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      // TODO: 로그인 API 연결
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("로그인 시도")),
                      );
                    }
                  },
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
              ]
            )
          )
        )
      )
    );
  }
}