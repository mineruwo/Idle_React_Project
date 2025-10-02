import 'package:flutter/material.dart';
import 'package:flutter_quill/flutter_quill.dart' as quill;
import 'package:application/services/api_service.dart';

class CreateInquiryScreen extends StatefulWidget {
  const CreateInquiryScreen({super.key});

  @override
  State<CreateInquiryScreen> createState() => _CreateInquiryScreenState();
}

class _CreateInquiryScreenState extends State<CreateInquiryScreen> {
  final _titleController = TextEditingController();
  final quill.QuillController _contentController = quill.QuillController.basic();
  final ApiService _apiService = ApiService();
  bool _isSubmitting = false;
  final FocusNode _editorFocusNode = FocusNode();
  final ScrollController _editorScrollController = ScrollController();

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _editorFocusNode.dispose();
    _editorScrollController.dispose();
    super.dispose();
  }

  Future<void> _submitInquiry() async {
    if (_titleController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('제목을 입력해주세요.')),
      );
      return;
    }
    if (_contentController.document.isEmpty()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('내용을 입력해주세요.')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final plainText = _contentController.document.toPlainText();
      final htmlContent = "<p>${plainText.replaceAll('\n', '<br>')}</p>";

      await _apiService.createInquiry(
        title: _titleController.text,
        content: htmlContent,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('문의가 성공적으로 접수되었습니다.')),
        );
        Navigator.of(context).pop(true);
      }

    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('문의 접수 중 오류가 발생했습니다: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('문의 작성'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: _isSubmitting
                ? const CircularProgressIndicator(color: Colors.white)
                : IconButton(
                    icon: const Icon(Icons.check),
                    onPressed: _submitInquiry,
                  ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: '제목',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: quill.QuillProvider(
                configurations: quill.QuillConfigurations(
                  controller: _contentController,
                  sharedConfigurations: const quill.QuillSharedConfigurations(
                    locale: Locale('ko'),
                  ),
                ),
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(4.0),
                  ),
                  child: quill.QuillEditor.basic(
                    configurations: const quill.QuillEditorConfigurations(
                      readOnly: false,
                      scrollable: true,
                      padding: EdgeInsets.all(8.0),
                      expands: false,
                    ),
                    focusNode: _editorFocusNode,
                    scrollController: _editorScrollController,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
