import 'package:flutter/material.dart';

class PaymentSuccessScreen extends StatelessWidget {
  const PaymentSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('결제 성공'),
        automaticallyImplyLeading: false, // 뒤로가기 버튼 숨김
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.check_circle,
              color: Colors.green,
              size: 100,
            ),
            const SizedBox(height: 20),
            const Text(
              '결제가 성공적으로 완료되었습니다.',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () {
                // 앱의 메인 화면이나 주문 내역 화면으로 이동
                // Navigator.of(context).popUntil((route) => route.isFirst);
              },
              child: const Text('확인'),
            ),
          ],
        ),
      ),
    );
  }
}
