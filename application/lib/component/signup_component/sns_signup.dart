import 'package:flutter/material.dart';

class SnsSignup extends StatefulWidget {
  const SnsSignup({super.key});

  @override
  State<SnsSignup> createState() => _SnsSignupState();
}

class _SnsSignupState extends State<SnsSignup> {
  final _nameController = TextEditingController();
  final _nicknameController = TextEditingController();
  String _role = "shipper";
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
      // TODO: 실제 API 호출 → snsSignup()
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("SNS 회원가입 성공")),
      );
      Navigator.pushReplacementNamed(context, "/");
    } catch (e) {
      setState(() => _error = "가입에 실패했습니다.");
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
                      "SNS 신규가입",
                      style:
                          TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 24),

                    // 이름
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: "이름",
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        final regex = RegExp(r'^[가-힣a-zA-Z]{2,20}$');
                        if (value == null || !regex.hasMatch(value)) {
                          return "이름은 한글/영문 2~20자";
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // 닉네임
                    TextFormField(
                      controller: _nicknameController,
                      decoration: const InputDecoration(
                        labelText: "닉네임",
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        final regex = RegExp(r'^[가-힣a-zA-Z0-9]{2,10}$');
                        if (value == null || !regex.hasMatch(value)) {
                          return "닉네임은 2~10자, 한영숫자";
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // 회원 유형
                    Row(
                      children: [
                        Expanded(
                          child: RadioListTile(
                            title: const Text("화주"),
                            value: "shipper",
                            groupValue: _role,
                            onChanged: (value) {
                              setState(() => _role = value.toString());
                            },
                          ),
                        ),
                        Expanded(
                          child: RadioListTile(
                            title: const Text("차주"),
                            value: "carrier",
                            groupValue: _role,
                            onChanged: (value) {
                              setState(() => _role = value.toString());
                            },
                          ),
                        ),
                      ],
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
                        child: Text(_loading ? "가입 처리 중..." : "가입 완료"),
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