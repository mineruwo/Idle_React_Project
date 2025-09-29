import 'package:flutter/material.dart';

class LinkExisting extends StatefulWidget {
  const LinkExisting({super.key});

  @override
  State<LinkExisting> createState() => _LinkExistingState();
}

class _LinkExistingState extends State<LinkExisting> {
  final _idController = TextEditingController();
  final _pwController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _loading = false;
  String? _error;

  Future<void> _onSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      // TODO: 실제 API 호출 → linkExisting()
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("기존 계정 연결 성공")),
      );
      Navigator.pushReplacementNamed(context, "/"); // 메인으로
    } catch (e) {
      setState(() {
        _error = "연결에 실패했습니다.";
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Card(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset("assets/logo.png", height: 80),
                    const SizedBox(height: 16),
                    const Text(
                      "기존 계정 연결",
                      style:
                          TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 24),

                    // 이메일
                    TextFormField(
                      controller: _idController,
                      decoration: const InputDecoration(
                        labelText: "로그인 ID (이메일)",
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return "이메일을 입력해주세요";
                        }
                        final regex =
                            RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$');
                        if (!regex.hasMatch(value)) {
                          return "이메일 형식이 올바르지 않습니다";
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // 비밀번호
                    TextFormField(
                      controller: _pwController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: "비밀번호",
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) =>
                          value == null || value.isEmpty ? "비밀번호를 입력해주세요" : null,
                    ),

                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(_error!,
                          style: const TextStyle(color: Colors.red)),
                    ],

                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _loading ? null : _onSubmit,
                        child: Text(_loading ? "연결 중..." : "연결하기"),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}