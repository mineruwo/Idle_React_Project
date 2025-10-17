import '../api/bid_api.dart';
import '../model/bid.dart';

class BidRepository {
  final _api = BidApi();

  Future<Bid> submitBid(String orderId, int price) async {
    final map = await _api.submit(orderId, price);
    return Bid.fromJson(map);
  }

  Future<List<Bid>> fetchBids(String orderId) async {
    final list = await _api.list(orderId);
    return list.map((e) => Bid.fromJson(e)).toList();
  }

  Future<void> acceptBid(String orderId, String bidId) async {
    await _api.accept(orderId, bidId);
  }
}
