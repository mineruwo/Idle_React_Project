import 'package:application/component/signup_component/link_existing.dart';
import 'package:application/component/signup_component/sns_signup.dart';
import 'package:flutter/material.dart';

class SnsSelect extends StatelessWidget {
  const SnsSelect({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("SNS 로그인 완료")),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    "SNS 로그인 완료",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    "기존 계정과 연결하시겠습니까?",
                    style: TextStyle(fontSize: 16, color: Colors.black54),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),

                  // 👉 기존 계정과 연결 버튼
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const LinkExisting(),
                          ),
                        );
                      },
                      child: const Text("기존 계정과 연결"),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // 👉 새 계정 만들기 버튼
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const SnsSignup(),
                          ),
                        );
                      },
                      child: const Text("새 계정 만들기"),
                    ),
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
