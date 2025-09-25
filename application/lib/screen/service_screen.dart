import 'package:flutter/material.dart';
import 'package:application/repository/auth_repository.dart';
import 'package:application/model/login_model.dart';
import 'package:application/component/service/create_inquiry_widget.dart';
import 'package:application/component/service/faq_list_widget.dart';
import 'package:application/component/service/my_inquiries_list_widget.dart';

class ServiceScreen extends StatefulWidget {
  const ServiceScreen({super.key});

  @override
  State<ServiceScreen> createState() => _ServiceScreenState();
}

class _ServiceScreenState extends State<ServiceScreen> {
  LoginModel? _currentUser;
  bool _isLoading = true;
  String? _error;
  bool _showWriteForm = false;
  int _inquiryListKey = 0; // Used to force refresh MyInquiriesListWidget

  @override
  void initState() {
    super.initState();
    _fetchUser();
  }

  Future<void> _fetchUser() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final authRepository = AuthRepository();
      final user = await authRepository.fetchMe();
      setState(() {
        _currentUser = user;
      });
    } catch (e) {
      setState(() {
        _error = '사용자 정보를 불러오는데 실패했습니다: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _handleInquiryCreated() {
    setState(() {
      _inquiryListKey++; // Increment key to force refresh
      _showWriteForm = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_error != null) {
      return Scaffold(body: Center(child: Text(_error!)));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('고객 문의'),
        actions: [
          if (!_showWriteForm)
            TextButton.icon(
              onPressed: () {
                setState(() {
                  _showWriteForm = true;
                });
              },
              icon: const Icon(Icons.edit, color: Colors.white),
              label: const Text('문의 작성', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: SingleChildScrollView(
        child: _showWriteForm
            ? CreateInquiryWidget(
                refreshInquiries: _handleInquiryCreated,
                onCancelWrite: () {
                  setState(() {
                    _showWriteForm = false;
                  });
                },
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const FAQListWidget(),
                  const Divider(height: 30, thickness: 5, color: Colors.grey),
                  MyInquiriesListWidget(key: ValueKey(_inquiryListKey)),
                ],
              ),
      ),
    );
  }
}