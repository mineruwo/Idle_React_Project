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
  ReviewFilter _selectedFilter = ReviewFilter.pending;

  late Future<Map<String, dynamic>> _reviewDataFuture; // Changed to dynamic
  final ApiService _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _reviewDataFuture = _loadReviewData();
  }

  Future<Map<String, dynamic>> _loadReviewData() async {
    // Changed to dynamic
    try {
      final List<Order> allOrders = await _apiService.fetchMyOrders();
      final List<Review> myReviews = await _apiService.getMyReviews();
      final Map<String, Review> reviewMap = {
        for (var review in myReviews) review.orderId: review,
      };

      final List<Order> completedOrders = allOrders
          .where((order) => order.status.toUpperCase() == 'COMPLETED')
          .toList();

      final List<Order> pendingOrders = completedOrders
          .where((order) =>
              !reviewMap.containsKey(order.id) && order.targetId != null)
          .toList();

      // Create a list of maps, each containing an order and its review
      final List<Map<String, dynamic>> reviewedItems = completedOrders
          .where((order) => reviewMap.containsKey(order.id))
          .map((order) => {'order': order, 'review': reviewMap[order.id]!})
          .toList();

      // Sort reviewed items by review creation date in descending order
      reviewedItems.sort((a, b) {
        final reviewA = a['review'] as Review;
        final reviewB = b['review'] as Review;
        return reviewB.createdAt.compareTo(reviewA.createdAt);
      });

      return {'pending': pendingOrders, 'reviewed': reviewedItems};
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

  Future<void> _submitReview(
    Order order,
    int rating,
    String comment,
    int? targetId,
  ) async {
    try {
      if (targetId == null) {
        throw Exception('리뷰 대상 ID가 존재하지 않습니다.');
      }
      await _apiService.submitReview(
        orderId: order.id,
        rating: rating,
        comment: comment,
        targetId: targetId,
      );

      if (!mounted) return;

      Navigator.of(context).pop();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('리뷰가 성공적으로 제출되었습니다.')));
      _refreshReviewData();
    } catch (e) {
      if (!mounted) return;
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
                    print(
                      'Submitting review for order.targetId: ${order.targetId}',
                    );
                    _submitReview(
                      order,
                      rating,
                      commentController.text,
                      order.targetId,
                    );
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
      body: FutureBuilder<Map<String, dynamic>>(
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
          final List<Map<String, dynamic>> reviewedItems =
              snapshot.data!['reviewed']!;

          final List<dynamic> displayList = // Changed to dynamic list
          _selectedFilter == ReviewFilter.pending
              ? pendingOrders
              : reviewedItems;

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
                  child: Row(
                    children: [
                      Expanded(
                        child: SegmentedButton<ReviewFilter>(
                          segments: <ButtonSegment<ReviewFilter>>[
                            ButtonSegment<ReviewFilter>(
                              value: ReviewFilter.pending,
                              label: Text('리뷰 대기 (${pendingOrders.length})'),
                            ),
                            ButtonSegment<ReviewFilter>(
                              value: ReviewFilter.reviewed,
                              label: Text('리뷰 완료 (${reviewedItems.length})'),
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
                    ],
                  ),
                ),
                const SizedBox(height: 10), // Add some spacing
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    itemCount: displayList.length,
                    itemBuilder: (context, index) {
                      if (_selectedFilter == ReviewFilter.pending) {
                        final order = displayList[index] as Order;
                        return Card(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 8.0,
                            vertical: 4.0,
                          ),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                              vertical: 12.0,
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '주문번호: ${order.orderNo}',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Text(
                                        '${order.departure} → ${order.arrival}',
                                      ),
                                      if (order.completedAt != null) ...[
                                        Text(
                                          '완료일: ${_formatDate(order.completedAt!)}',
                                          style: const TextStyle(
                                            color: Colors.grey,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    ElevatedButton(
                                      onPressed: () => _showReviewDialog(order),
                                      child: const Text('후기 작성'),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      } else {
                        // Reviewed items
                        final item = displayList[index] as Map<String, dynamic>;
                        final review = item['review'] as Review;
                        return Card(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 8.0,
                            vertical: 4.0,
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        'To: ${review.targetNickname}',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Row(
                                      children: List.generate(5, (i) {
                                        return Icon(
                                          i < review.rating
                                              ? Icons.star
                                              : Icons.star_border,
                                          color: Colors.amber,
                                          size: 20,
                                        );
                                      }),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  review.content,
                                  style: const TextStyle(fontSize: 14),
                                ),
                              ],
                            ),
                          ),
                        );
                      }
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
