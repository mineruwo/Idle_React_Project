import 'package:flutter/material.dart';
import 'package:application/model/inquiry.dart';
import 'package:application/services/api_service.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:provider/provider.dart';
import 'package:application/provider/user_provider.dart';

class MyInquiriesListWidget extends StatefulWidget {
  final int? inquiryListKey; // Used to force refresh

  const MyInquiriesListWidget({super.key, this.inquiryListKey});

  @override
  State<MyInquiriesListWidget> createState() => _MyInquiriesListWidgetState();
}

class _MyInquiriesListWidgetState extends State<MyInquiriesListWidget> {
  List<Inquiry> _inquiries = [];
  bool _isLoading = true;
  String? _error;
  String? _expandedInquiryId; // Changed from int? to String?

  @override
  void initState() {
    super.initState();
    _fetchMyInquiries();
  }

  @override
  void didUpdateWidget(covariant MyInquiriesListWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.inquiryListKey != oldWidget.inquiryListKey) {
      _fetchMyInquiries(); // Refresh when key changes
    }
  }

  Future<void> _fetchMyInquiries() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    // Access UserProvider and get the user's ID
    final userProvider = context.read<UserProvider>();
    final userId = userProvider.user?.idNum;

    if (userId == null) {
      setState(() {
        _error = "로그인이 필요합니다.";
        _isLoading = false;
      });
      return;
    }

    try {
      final apiService = ApiService();
      final fetchedInquiries = await apiService.fetchMyInquiries(userId);
      if (mounted) { // Check if the widget is still in the tree
        setState(() {
          _inquiries = fetchedInquiries;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) { // Check if the widget is still in the tree
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  void _handleInquiryTap(String id) {
    setState(() {
      if (_expandedInquiryId == id) {
        _expandedInquiryId = null;
      } else {
        _expandedInquiryId = id;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(child: Text('오류 발생: $_error'));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Text(
            '내 문의 내역',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
        _inquiries.isEmpty
            ? const Center(child: Text('작성된 문의가 없습니다.'))
            : ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _inquiries.length,
                itemBuilder: (context, index) {
                  final inquiry = _inquiries[index];
                  final isExpanded = _expandedInquiryId == inquiry.id;
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
                    elevation: 1,
                    child: InkWell(
                      onTap: () => _handleInquiryTap(inquiry.id),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    inquiry.title,
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                                  ),
                                ),
                                Text(
                                  '${inquiry.createdAt.year}-${inquiry.createdAt.month}-${inquiry.createdAt.day}',
                                  style: const TextStyle(color: Colors.grey),
                                ),
                                Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down),
                              ],
                            ),
                            const SizedBox(height: 8.0),
                            Text(
                              '상태: ${inquiry.status}',
                              style: TextStyle(color: inquiry.status == 'ANSWERED' ? Colors.green : Colors.orange),
                            ),
                            if (isExpanded)
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Divider(height: 20, thickness: 1),
                                  const Text('문의 내용:', style: TextStyle(fontWeight: FontWeight.bold)),
                                  Html(data: inquiry.content),
                                  if (inquiry.response != null && inquiry.response!.isNotEmpty)
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const SizedBox(height: 10),
                                        const Text('답변:', style: TextStyle(fontWeight: FontWeight.bold)),
                                        Html(data: inquiry.response!),
                                      ],
                                    ),
                                ],
                              ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
      ],
    );
  }
}
