import 'package:application/network/dio_client.dart';
import '../model/order.dart';
import '../model/review.dart'; // Import the new Review model

class ApiService {
  final DioClient _dioClient = DioClient();

  // 내 주문 목록 가져오기 (GET /api/orders/my)
  Future<List<Order>> fetchMyOrders() async {
    try {
      // DioClient의 baseUrl이 이미 설정되어 있으므로 상대 경로만 사용합니다.
      final response = await _dioClient.dio.get('/orders/my');

      // Dio는 응답을 자동으로 Map/List<dynamic>으로 변환해줍니다.
      final List<dynamic> body = response.data;
      return body.map((dynamic item) => Order.fromJson(item)).toList();
    } catch (e) {
      // 더 자세한 오류를 확인하기 위해 콘솔에 오류를 출력합니다.
      print('Error in fetchMyOrders: $e');
      // DioError 등 Dio 관련 예외 처리
      throw Exception('Failed to load orders: $e');
    }
  }

  // 리뷰 제출하기 (POST /api/reviews)
  Future<void> submitReview({
    required String orderId,
    required int rating,
    required String comment,
    required String targetId,
  }) async {
    try {
      final body = {
        'orderId': orderId,
        'rating': rating,
        'content': comment, // Changed 'comment' to 'content'
        'targetId': targetId,
      };

      // Dio는 Map을 자동으로 JSON 문자열로 변환하여 전송합니다.
      await _dioClient.dio.post('/reviews', data: body);
      // 성공적인 응답 (e.g., 201 Created)은 예외를 발생시키지 않습니다.
    } catch (e) {
      throw Exception('Failed to submit review: $e');
    }
  }

  // 내 리뷰 목록 가져오기 (GET /api/reviews/my-reviews)
  Future<List<Review>> getMyReviews() async {
    try {
      final response = await _dioClient.dio.get('/reviews/my-reviews');
      final List<dynamic> body = response.data;
      return body.map((dynamic item) => Review.fromJson(item)).toList();
    } catch (e) {
      print('Error in getMyReviews: $e');
      throw Exception('Failed to load my reviews: $e');
    }
  }
}
