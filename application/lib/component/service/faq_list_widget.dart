import 'package:flutter/material.dart';
import 'package:application/model/faq.dart';
import 'package:application/services/api_service.dart';
import 'package:flutter_html/flutter_html.dart';

class FAQListWidget extends StatefulWidget {
  const FAQListWidget({super.key});

  @override
  State<FAQListWidget> createState() => _FAQListWidgetState();
}

class _FAQListWidgetState extends State<FAQListWidget> {
  List<FAQ> _faqs = [];
  bool _isLoading = true;
  String? _error;
  int? _expandedFAQId;

  @override
  void initState() {
    super.initState();
    _fetchFAQs();
  }

  Future<void> _fetchFAQs() async {
    try {
      final apiService = ApiService();
      final fetchedFAQs = await apiService.fetchFAQs();
      setState(() {
        _faqs = fetchedFAQs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _handleFAQTap(int id) {
    setState(() {
      if (_expandedFAQId == id) {
        _expandedFAQId = null;
      } else {
        _expandedFAQId = id;
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

    if (_faqs.isEmpty) {
      return const Center(child: Text('등록된 FAQ가 없습니다.'));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Text(
            '자주 묻는 질문',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _faqs.length,
          itemBuilder: (context, index) {
            final faq = _faqs[index];
            final isExpanded = _expandedFAQId == faq.id;
            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
              elevation: 1,
              child: InkWell(
                onTap: () => _handleFAQTap(faq.id),
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
                              faq.question,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                            ),
                          ),
                          Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down),
                        ],
                      ),
                      if (isExpanded)
                        Padding(
                          padding: const EdgeInsets.only(top: 10),
                          child: Html(data: faq.answer),
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
