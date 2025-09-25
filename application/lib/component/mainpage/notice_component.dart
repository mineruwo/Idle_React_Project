import 'package:flutter/material.dart';
import 'package:application/model/notice.dart';
import 'package:application/services/api_service.dart';
import 'package:flutter_html/flutter_html.dart';

class NoticeComponent extends StatefulWidget {
  const NoticeComponent({super.key});

  @override
  State<NoticeComponent> createState() => _NoticeComponentState();
}

class _NoticeComponentState extends State<NoticeComponent> {
  List<Notice> _notices = [];
  bool _isLoading = true;
  String? _error;
  int? _expandedNoticeId;

  @override
  void initState() {
    super.initState();
    _fetchNotices();
  }

  Future<void> _fetchNotices() async {
    try {
      final apiService = ApiService();
      final fetchedNotices = await apiService.fetchNotices();
      setState(() {
        _notices = fetchedNotices.where((notice) => !(notice.isDel ?? false)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _handleNoticeTap(int id) {
    setState(() {
      if (_expandedNoticeId == id) {
        _expandedNoticeId = null;
      } else {
        _expandedNoticeId = id;
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

    if (_notices.isEmpty) {
      return const Center(child: Text('등록된 공지사항이 없습니다.'));
    }

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '공지사항',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _notices.length,
            itemBuilder: (context, index) {
              final notice = _notices[index];
              final isExpanded = _expandedNoticeId == notice.id;
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                elevation: 2,
                child: InkWell(
                  onTap: () => _handleNoticeTap(notice.id),
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
                                notice.title,
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                            ),
                            Text(
                              '${notice.createdAt.year}-${notice.createdAt.month}-${notice.createdAt.day}',
                              style: const TextStyle(color: Colors.grey),
                            ),
                            Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down),
                          ],
                        ),
                        if (isExpanded)
                          Padding(
                            padding: const EdgeInsets.only(top: 10),
                            child: Html(data: notice.content),
                          ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
