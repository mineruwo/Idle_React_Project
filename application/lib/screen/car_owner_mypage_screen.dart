import 'dart:ui';

import 'package:application/provider/user_provider.dart';
import 'package:application/screen/main_screen.dart';
import 'package:flutter/material.dart';
import 'package:application/component/car_owner.dart/widgets/delivery_list.dart';
import 'package:application/component/car_owner.dart/widgets/settlement_card_from_summary.dart';
import 'package:application/component/car_owner.dart/widgets/status_chips_from_summary.dart';
import 'package:application/component/car_owner.dart/widgets/warmth_card_from_api.dart';
import 'package:application/component/car_owner.dart/widgets/section_title.dart';
import 'package:application/services/car_owner_dashboard_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';

class MyPageScreen extends StatefulWidget {
  const MyPageScreen({super.key});

  @override
  State<MyPageScreen> createState() => _MyPageScreenState();
}

class _MyPageScreenState extends State<MyPageScreen>
    with SingleTickerProviderStateMixin {
  final _svc = CarOwnerDashboardService();

  bool _isLoading = true;
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _loadAllDashboardData();
  }

  Future<void> _loadAllDashboardData() async {
    try {
      // 🟡 병렬로 모든 데이터 로딩 시작
      await Future.wait([
        _svc.getSummary(),
        _svc.getDeliveries(),
        _svc.getSalesChart(),
        _svc.getWarmth(),
      ]);

      // 로딩 완료 후 Fade-in
      setState(() => _isLoading = false);
      _controller.forward();
    } catch (e) {
      // ⚠️ 에러 처리 로직 (예: Snackbar, Alert 등)
      print('대시보드 로딩 실패: $e');
      // 선택적으로 _isLoading을 false로 바꿔서 에러 UI를 보여줄 수도 있음
    }
  }

  Future<void> _handleLogout() async {
    // Show confirmation dialog
    final bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('로그아웃'),
          content: const Text('정말 로그아웃 하시겠습니까?'),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('취소'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('확인'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      if (!mounted) return;
      const storage = FlutterSecureStorage();
      await storage.deleteAll();
      Provider.of<UserProvider>(context, listen: false).cleanUser();
      Navigator.of(context, rootNavigator: true).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const MainScreen()),
        (route) => false,
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : FadeTransition(
                opacity: _controller,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 50),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '마이 페이지',
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                          IconButton(
                            icon: const Icon(Icons.logout),
                            onPressed: _handleLogout,
                            tooltip: '로그아웃',
                          ),
                        ],
                      ),

                      StatusChipsFromSummary(svc: _svc, period: 'month'),

                      const SizedBox(height: 12),

                      SizedBox(
                        height: 200,
                        child: Row(
                          children: [
                            Expanded(
                              child: Card(
                                clipBehavior: Clip.antiAlias,
                                child: SettlementCardFromSummary(
                                  svc: _svc,
                                  period: 'month',
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Card(
                                clipBehavior: Clip.antiAlias,
                                child: WarmthCardFromApi(svc: _svc),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),
                      const SectionTitle('운송중'),
                      const DeliveryList(),
                    ],
                  ),
                ),
              ),
      ),
    );
  }
}
