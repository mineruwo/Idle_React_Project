import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/order.dart';

class ApiService {
  // Android 에뮬레이터는 10.0.2.2를 통해 호스트 PC의 localhost에 접근합니다.
  // iOS 시뮬레이터나 실제 기기에서는 실제 PC의 IP 주소를 사용해야 합니다.
  static const String _baseUrl = 'http://10.0.2.2:8080/api';

  // TODO: 로그인 구현 후, 인증 토큰을 저장하고 모든 요청 헤더에 추가해야 합니다.
  Map<String, String> _getHeaders() => {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_AUTH_TOKEN', 
      };

  // 내 주문 목록 가져오기 (GET /api/orders/my)
  Future<List<Order>> fetchMyOrders() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/orders/my'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      // UTF-8로 디코딩하여 한글 깨짐 방지
      final List<dynamic> body = json.decode(utf8.decode(response.bodyBytes));
      return body.map((dynamic item) => Order.fromJson(item)).toList();
    } else {
      // 에러 처리
      throw Exception('Failed to load orders. Status code: ${response.statusCode}');
    }
  }

  // 리뷰 제출하기 (POST /api/reviews)
  Future<void> submitReview({
    required String orderId,
    required int rating,
    required String comment,
  }) async {
    final body = json.encode({
      'orderId': orderId,
      'rating': rating,
      'comment': comment,
    });

    final response = await http.post(
      Uri.parse('$_baseUrl/reviews'),
      headers: _getHeaders(),
      body: body,
    );

    if (response.statusCode != 201) { // 201 Created
      // 에러 처리
      throw Exception('Failed to submit review. Status code: ${response.statusCode}');
    }
  }
}
