import 'package:application/provider/user_provider.dart';
import 'package:application/screen/main_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import 'package:application/model/order.dart';
import 'package:application/services/api_service.dart';
import 'package:application/model/review.dart';

enum ReviewFilter { pending, reviewed }

class ShipperMypage extends StatefulWidget {
  const ShipperMypage({super.key});

  @override
  State<ShipperMypage> createState() => _ShipperMypageState();
}

class _ShipperMypageState extends State<ShipperMypage> {
  ReviewFilter _selectedFilter =
      ReviewFilter.pending; // Default to showing pending reviews

  late Future<Map<String, List<Order>>>
  _reviewDataFuture; // pendingOrders와 reviewedOrders를 담을 Future
  final ApiService _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _reviewDataFuture = _loadReviewData();
  }

  Future<Map<String, List<Order>>> _loadReviewData() async {
    try {
      final List<Order> allOrders = await _apiService.fetchMyOrders();
      final List<Review> myReviews = await _apiService.getMyReviews();

      final Set<String> reviewedOrderIds = myReviews
          .map((review) => review.orderId)
          .toSet();

      final List<Order> completedOrders = allOrders
          .where((order) => order.status == 'COMPLETED')
          .toList();

      final List<Order> pendingOrders = completedOrders
          .where((order) => !reviewedOrderIds.contains(order.id))
          .toList();

      final List<Order> reviewedOrders = completedOrders
          .where((order) => reviewedOrderIds.contains(order.id))
          .toList();

      return {'pending': pendingOrders, 'reviewed': reviewedOrders};
    } catch (e) {
      print('Error loading review data: $e');
      throw Exception('Failed to load review data: $e');
    }
  }

  void _refreshReviewData() {
    setState(() {
      _reviewDataFuture = _loadReviewData();
    });
  }

  String _formatDate(DateTime dt) {
    return DateFormat('yyyy.MM.dd').format(dt);
  }

  Future<void> _submitReview(Order order, int rating, String comment) async {
    try {
      await _apiService.submitReview(
        orderId: order.id,
        rating: rating,
        comment: comment,
        targetId: order.targetId,
      );

      if (!mounted) return;

      Navigator.of(context).pop(); // 다이얼로그 닫기
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('리뷰가 성공적으로 제출되었습니다.')));
      _refreshReviewData(); // 리뷰 제출 후 목록 새로고침
    } catch (e) {
      if (!mounted) return;
      // 에러 처리
      Navigator.of(context).pop();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('리뷰 제출에 실패했습니다: $e')));
    }
  }

  Future<void> _showReviewDialog(Order order) async {
    int rating = 5;
    final commentController = TextEditingController();

    return showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('리뷰 작성'),
              content: SingleChildScrollView(
                child: ListBody(
                  children: <Widget>[
                    Text('주문번호: ${order.orderNo}'),
                    const SizedBox(height: 20),
                    const Text('별점'),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        return IconButton(
                          icon: Icon(
                            index < rating ? Icons.star : Icons.star_border,
                            color: Colors.amber,
                          ),
                          onPressed: () {
                            setDialogState(() {
                              rating = index + 1;
                            });
                          },
                        );
                      }),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: commentController,
                      decoration: const InputDecoration(
                        hintText: '한줄평을 남겨주세요.',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 4,
                    ),
                  ],
                ),
              ),
              actions: <Widget>[
                TextButton(
                  child: const Text('취소'),
                  onPressed: () => Navigator.of(context).pop(),
                ),
                ElevatedButton(
                  child: const Text('제출'),
                  onPressed: () {
                    _submitReview(order, rating, commentController.text);
                  },
                ),
              ],
            );
          },
        );
      },
    );
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
  Widget build(BuildContext context) {
    return Scaffold(
      body: FutureBuilder<Map<String, List<Order>>>(
        future: _reviewDataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text("오류가 발생했습니다: ${snapshot.error}"));
          }
          if (!snapshot.hasData ||
              snapshot.data!['pending'] == null ||
              snapshot.data!['reviewed'] == null) {
            return const Center(child: Text("데이터를 불러오지 못했습니다."));
          }

          final List<Order> pendingOrders = snapshot.data!['pending']!;
          final List<Order> reviewedOrders = snapshot.data!['reviewed']!;

          final List<Order> displayOrders =
              _selectedFilter == ReviewFilter.pending
              ? pendingOrders
              : reviewedOrders;

          if (displayOrders.isEmpty) {
            return Center(
              child: Text(
                _selectedFilter == ReviewFilter.pending
                    ? "작성할 후기가 없습니다."
                    : "내가 작성한 후기가 없습니다.",
              ),
            );
          }

          return Padding(
            padding: const EdgeInsets.only(top: 50),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '오더 내역',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      IconButton(
                        icon: const Icon(Icons.logout),
                        onPressed: _handleLogout,
                        tooltip: '로그아웃',
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: SegmentedButton<ReviewFilter>(
                    segments: <ButtonSegment<ReviewFilter>>[
                      ButtonSegment<ReviewFilter>(
                        value: ReviewFilter.pending,
                        label: Text('리뷰 대기 (${pendingOrders.length})'),
                      ),
                      ButtonSegment<ReviewFilter>(
                        value: ReviewFilter.reviewed,
                        label: Text('리뷰 완료 (${reviewedOrders.length})'),
                      ),
                    ],
                    selected: <ReviewFilter>{_selectedFilter},
                    onSelectionChanged: (Set<ReviewFilter> newSelection) {
                      setState(() {
                        _selectedFilter = newSelection.first;
                      });
                    },
                  ),
                ),
                const SizedBox(height: 10), // Add some spacing
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    itemCount: displayOrders.length,
                    itemBuilder: (context, index) {
                      final order = displayOrders[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 8.0,
                          vertical: 4.0,
                        ),
                        child: ListTile(
                          title: Text('주문번호: ${order.orderNo}'),
                          subtitle: Text(
                            '${order.departure} → ${order.arrival}${order.completedAt != null ? '\n완료일: ${_formatDate(order.completedAt!)}' : ''}',
                          ),
                          isThreeLine: true,
                          trailing:
                              order
                                  .hasReview // hasReview는 이제 백엔드에서 오는 값 그대로 사용
                              ? const Chip(
                                  label: Text('작성 완료'),
                                  backgroundColor: Colors.grey,
                                )
                              : ElevatedButton(
                                  onPressed: () => _showReviewDialog(order),
                                  child: const Text('후기 작성'),
                                ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
