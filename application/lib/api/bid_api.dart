import 'dart:convert';
import 'package:dio/dio.dart';
import '../network/dio_client.dart';

class BidApi {
  final Dio _dio = DioClient().dio;

  // 입찰 등록
  Future<Map<String, dynamic>> submit(String orderId, int price) async {
    final res = await _dio.post(
      '/offers/add',
      data: {
        'orderId': int.tryParse(orderId) ?? orderId, // 서버 타입에 맞춰 전달
        'price': price,
      },
    );
    final data = res.data;
    if (data is Map<String, dynamic>) return data;
    if (data is String && data.isNotEmpty) return jsonDecode(data);
    return <String, dynamic>{};
  }

  // 오더별 입찰 목록
  Future<List<Map<String, dynamic>>> list(String orderId) async {
    final res = await _dio.get('/offers/order/$orderId');
    final data = res.data;
    if (data is List) {
      return data.map<Map<String, dynamic>>((e) {
        if (e is Map<String, dynamic>) return e;
        if (e is String && e.isNotEmpty) return jsonDecode(e);
        return <String, dynamic>{};
      }).toList();
    }
    return <Map<String, dynamic>>[];
  }

  // 입찰 수락
  Future<void> accept(String orderId, String bidId) async {
    await _dio.post('/offers/$bidId/accept');
  }
}
