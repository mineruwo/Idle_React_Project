import 'package:dio/dio.dart';

import '../network/dio_client.dart'; // ← 네가 준 DioClient

class OrderApi {
  // DioClient 의 dio를 그대로 사용 (인터셉터/토큰/리프레시 공통 적용)
  final Dio _dio = DioClient().dio;

  // baseUrl = http://10.0.2.2:8080/api  (DioClient에서 설정함)
  // 여기는 상대 경로만 쓴다.

  /// 목록: 화주는 /orders/my (인증 필요), 차주는 /orders
  Future<List<dynamic>> fetchOrders({required bool isShipper, String? q}) async {
    final path = isShipper ? '/orders/my' : '/orders';

    final res = await _dio.get(
      path,
      queryParameters: (q?.isNotEmpty ?? false) ? {'q': q} : null,
    );

    if (res.statusCode == 200 && res.data is List) {
      return res.data as List<dynamic>;
    }

    throw Exception('Failed to load orders: [${res.statusCode}] ${res.data}');
  }

  /// 단건
  Future<Map<String, dynamic>> fetchOne(String id) async {
    final res = await _dio.get('/orders/$id');
    if (res.statusCode == 200 && res.data is Map<String, dynamic>) {
      return res.data as Map<String, dynamic>;
    }
    throw Exception('Failed to load order $id: [${res.statusCode}] ${res.data}');
  }

  /// 등록 (서버 DTO payload 사용)
  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> body) async {
    final res = await _dio.post('/orders', data: body);
    if ((res.statusCode == 201 || res.statusCode == 200) &&
        res.data is Map<String, dynamic>) {
      return res.data as Map<String, dynamic>;
    }
    throw Exception('Failed to create order: [${res.statusCode}] ${res.data}');
  }

  /// 상태 업데이트 (본문에 문자열 "COMPLETED" 등)
  Future<void> updateStatus(String id, String status) async {
    final res = await _dio.put('/orders/$id/status', data: status);
    if (res.statusCode != 200) {
      throw Exception('Failed to update status: [${res.statusCode}] ${res.data}');
    }
  }

  /// 배정 정보
  Future<Map<String, dynamic>> fetchAssignment(String id) async {
    final res = await _dio.get('/orders/$id/assignment');
    if (res.statusCode == 200 && res.data is Map<String, dynamic>) {
      return res.data as Map<String, dynamic>;
    }
    throw Exception('Failed to fetch assignment: [${res.statusCode}] ${res.data}');
  }

  /// 일반 업데이트
  Future<void> updateOrder(String id, Map<String, dynamic> body) async {
    final res = await _dio.put('/orders/$id', data: body);
    if (res.statusCode != 200) {
      throw Exception('Failed to update order: [${res.statusCode}] ${res.data}');
    }
  }

  /// 세금계산서 발행
  Future<void> issueTaxInvoice(String id, Map<String, dynamic> body) async {
    final res = await _dio.put('/orders/$id/tax-invoice', data: body);
    if (res.statusCode != 200) {
      throw Exception('Failed to issue tax invoice: [${res.statusCode}] ${res.data}');
    }
  }
}
