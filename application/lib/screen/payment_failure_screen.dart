import 'package:flutter/material.dart';

class PaymentFailureScreen extends StatelessWidget {
  final String? errorMessage;

  const PaymentFailureScreen({super.key, this.errorMessage});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('결제 실패'),
        automaticallyImplyLeading: false, // 뒤로가기 버튼 숨김
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error,
              color: Colors.red,
              size: 100,
            ),
            const SizedBox(height: 20),
            const Text(
              '결제에 실패했습니다.',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Text(errorMessage ?? '다시 시도해주세요.'),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () {
                // 결제를 시도했던 화면으로 다시 돌아감
                Navigator.of(context).pop();
              },
              child: const Text('다시 시도'),
            ),
          ],
        ),
      ),
    );
  }
}
