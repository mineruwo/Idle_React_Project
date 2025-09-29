import 'package:application/network/dio_client.dart';
import '../model/order.dart';
import '../model/review.dart'; // Import the new Review model
import '../model/notice.dart'; // Import the Notice model
import '../model/inquiry.dart'; // Import the Inquiry model
import '../model/faq.dart'; // Import the FAQ model

class ApiService {
  final DioClient _dioClient = DioClient();

  // Singleton instance
  static final ApiService _instance = ApiService._internal();

  // Private internal constructor
  ApiService._internal();

  // Factory constructor to return the singleton instance
  factory ApiService() {
    return _instance;
  }

  // 공지사항 목록 가져오기 (GET /api/public/notices)
  Future<List<Notice>> fetchNotices() async {
    try {
      final response = await _dioClient.dio.get('/public/notices');
      final List<dynamic> body = response.data;
      return body.map((dynamic item) => Notice.fromJson(item)).toList();
    } catch (e) {
      print('Error in fetchNotices: $e');
      throw Exception('Failed to load notices: $e');
    }
  }

  // FAQ 목록 가져오기 (GET /api/public/faqs)
  Future<List<FAQ>> fetchFAQs() async {
    try {
      final response = await _dioClient.dio.get('/public/faqs');
      final List<dynamic> body = response.data;
      return body.map((dynamic item) => FAQ.fromJson(item)).toList();
    } catch (e) {
      print('Error in fetchFAQs: $e');
      throw Exception('Failed to load FAQs: $e');
    }
  }

  // 내 문의 목록 가져오기 (GET /api/inquiries/customer/{id})
  Future<List<Inquiry>> fetchMyInquiries(int userId) async {
    try {
      final response = await _dioClient.dio.get('/inquiries/customer/$userId');
      // The backend returns a Page object, so we need to access the 'content' field.
      final List<dynamic> body = response.data['content'];
      return body.map((dynamic item) => Inquiry.fromJson(item)).toList();
    } catch (e) {
      print('Error in fetchMyInquiries: $e');
      throw Exception('Failed to load my inquiries: $e');
    }
  }

  // 문의 생성 (POST /api/inquiries)
  Future<void> createInquiry({
    required String title,
    required String content,
  }) async {
    try {
      final body = {'title': title, 'content': content};
      await _dioClient.dio.post('/inquiries', data: body);
    } catch (e) {
      print('Error in createInquiry: $e');
      throw Exception('Failed to create inquiry: $e');
    }
  }

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
