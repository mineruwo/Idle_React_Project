import 'package:flutter/material.dart';
import 'package:application/component/service/faq_list_widget.dart';
import 'package:application/component/service/my_inquiries_list_widget.dart';
import 'package:application/screen/create_inquiry_screen.dart';

class ServiceScreen extends StatefulWidget {
  const ServiceScreen({super.key});

  @override
  State<ServiceScreen> createState() => _ServiceScreenState();
}

class _ServiceScreenState extends State<ServiceScreen> {
  int _inquiryListKey = 0; // MyInquiriesListWidget를 새로고침하기 위한 키

  // 문의 작성 화면으로 이동하는 함수 (showModalBottomSheet 사용)
  void _navigateToCreateInquiry() async {
    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true, // 바텀 시트가 화면 높이의 대부분을 차지하도록 설정
      builder: (BuildContext context) {
        return FractionallySizedBox( // 화면 높이의 90%를 차지하도록 설정
          heightFactor: 0.9,
          child: const CreateInquiryScreen(),
        );
      },
    );

    // 만약 문의 작성이 성공적으로 완료되었다면 (결과가 true이면), 목록을 새로고침합니다.
    if (result == true && mounted) {
      setState(() {
        _inquiryListKey++; // 키를 증가시켜 위젯을 새로 그리게 합니다.
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('고객 문의'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const FAQListWidget(),
            const Divider(height: 30, thickness: 5, color: Colors.grey),
            MyInquiriesListWidget(key: ValueKey(_inquiryListKey)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _navigateToCreateInquiry,
        icon: const Icon(Icons.edit),
        label: const Text('문의 작성'),
      ),
    );
  }
}
