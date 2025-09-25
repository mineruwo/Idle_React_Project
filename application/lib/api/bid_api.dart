import '../network/dio_client.dart';
import '../model/bid.dart';

class BidApi {
  final _dio = DioClient().dio;

  /// (차주) 입찰 등록
  Future<Bid> submit(String orderId, int price) async {
    final res = await _dio.post(
      "/offers/add",
      data: {
        "orderId": orderId,
        "price": price,
      },
    );
    return Bid.fromJson(res.data as Map<String, dynamic>);
  }

  /// (공통) 오더별 입찰 목록
  Future<List<Bid>> list(String orderId) async {
    final res = await _dio.get("/offers/order/$orderId");
    final data = res.data as List;
    return data.map((e) => Bid.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// (화주) 입찰 수락 — ✅ bidId(=offerId)만 path에, Body 없음
  Future<void> accept(String bidId) async {
    final id = Uri.encodeComponent(bidId);
    await _dio.post("/offers/$id/accept");
  }
}
