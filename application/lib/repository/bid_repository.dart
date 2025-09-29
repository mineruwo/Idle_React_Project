import '../api/bid_api.dart';
import '../model/bid.dart';

class BidRepository {
  final BidApi _api = BidApi();

  Future<Bid> submitBid(String orderId, int price) => _api.submit(orderId, price);

  Future<List<Bid>> fetchBids(String orderId) => _api.list(orderId);

  /// ✅ orderId 필요 없음. bidId만 서버로 보냄
  Future<void> acceptBid(String bidId) => _api.accept(bidId);
}
