import 'package:flutter/material.dart';

Future<void> showEmailVerification({
  required BuildContext context,
  required String email,
  required Future<bool> Function(String email) onSendCode,
  required Future<bool> Function(String email, String code) onVerifyCode,
  required VoidCallback onVerified,
}) async {
  final TextEditingController codeController = TextEditingController();
  bool sent = false;
  bool sending = false;
  bool verifying = false;
  String message = "";

  await showDialog(
    context: context,
    barrierDismissible: false,
    builder: (ctx) {
      return StatefulBuilder(builder: (ctx, setState) {
        return AlertDialog(
          title: const Text("이메일 인증"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("입력한 이메일로 인증 코드를 전송합니다."),
              const SizedBox(height: 8),
              Text(
                email,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.blueAccent,
                ),
              ),
              const SizedBox(height: 16),

              // 인증코드 발송 버튼
              if (!sent)
                ElevatedButton(
                  onPressed: sending
                      ? null
                      : () async {
                          setState(() {
                            sending = true;
                            message = "";
                          });
                          final ok = await onSendCode(email);
                          setState(() {
                            sent = ok;
                            sending = false;
                            message =
                                ok ? "인증 코드가 전송되었습니다." : "코드 전송에 실패했습니다.";
                          });
                        },
                  child: sending
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text("인증 코드 발송"),
                ),

              // 코드 입력 + 인증하기
              if (sent) ...[
                TextField(
                  controller: codeController,
                  decoration: const InputDecoration(
                    labelText: "인증 코드",
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 10),
                ElevatedButton(
                  onPressed: verifying
                      ? null
                      : () async {
                          setState(() {
                            verifying = true;
                            message = "";
                          });
                          final ok =
                              await onVerifyCode(email, codeController.text);
                          setState(() {
                            verifying = false;
                            message = ok
                                ? "인증이 완료되었습니다."
                                : "인증 코드가 올바르지 않거나 만료되었습니다.";
                          });
                          if (ok) {
                            onVerified();
                            Navigator.of(ctx).pop();
                          }
                        },
                  child: verifying
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text("인증하기"),
                ),
                TextButton(
                  onPressed: sending
                      ? null
                      : () async {
                          setState(() {
                            sending = true;
                            message = "";
                          });
                          final ok = await onSendCode(email);
                          setState(() {
                            sending = false;
                            message = ok ? "코드가 재전송되었습니다." : "재전송 실패";
                          });
                        },
                  child: const Text("코드 재전송"),
                ),
              ],

              if (message.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  message,
                  style: TextStyle(
                    color: message.contains("완료")
                        ? Colors.green
                        : Colors.redAccent,
                  ),
                )
              ]
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text("닫기"),
            )
          ],
        );
      });
    },
  );
}