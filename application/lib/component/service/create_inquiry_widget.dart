import 'package:flutter/material.dart';
import 'package:application/services/api_service.dart';

class CreateInquiryWidget extends StatefulWidget {
  final VoidCallback refreshInquiries;
  final VoidCallback onCancelWrite;

  const CreateInquiryWidget({
    super.key,
    required this.refreshInquiries,
    required this.onCancelWrite,
  });

  @override
  State<CreateInquiryWidget> createState() => _CreateInquiryWidgetState();
}

class _CreateInquiryWidgetState extends State<CreateInquiryWidget> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _submitInquiry() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });
      try {
        await ApiService().createInquiry(
          title: _titleController.text,
          content: _contentController.text,
        );
        widget.refreshInquiries();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('문의가 성공적으로 접수되었습니다.')),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('문의 접수 실패: ${e.toString()}')),
        );
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '문의 작성',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: '제목',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '제목을 입력해주세요.';
                }
                return null;
              },
            ),
            const SizedBox(height: 15),
            TextFormField(
              controller: _contentController,
              maxLines: 5,
              decoration: const InputDecoration(
                labelText: '내용',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '내용을 입력해주세요.';
                }
                return null;
              },
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                ElevatedButton(
                  onPressed: widget.onCancelWrite,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.grey),
                  child: const Text('취소'),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _isLoading ? null : _submitInquiry,
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('제출'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
