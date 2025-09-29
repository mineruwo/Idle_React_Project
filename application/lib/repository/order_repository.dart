import '../api/order_api.dart';
import '../model/order.dart';

class OrderRepository {
  final OrderApi _api = OrderApi();

  Future<List<Order>> fetchOrders({required bool isShipper, String? q}) async {
    final data = await _api.fetchOrders(isShipper: isShipper, q: q);
    return data.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Order> fetchOne(String id) async {
    final data = await _api.fetchOne(id);
    return Order.fromJson(data);
  }

  Future<Order> createOrderFromPayload(Map<String, dynamic> body) async {
    final res = await _api.createOrder(body);
    return Order.fromJson(res);
  }

  Future<Order> createOrder(Order draft) async {
    final res = await _api.createOrder(draft.toJson());
    return Order.fromJson(res);
  }

  Future<void> updateStatus(String id, String s) async {
    await _api.updateStatus(id, s);
  }

  Future<Map<String, dynamic>> fetchAssignment(String id) async {
    return _api.fetchAssignment(id);
  }

  Future<void> updateOrder(String id, Map<String, dynamic> body) async {
    await _api.updateOrder(id, body);
  }

  Future<void> issueTaxInvoice(String id, Map<String, dynamic> body) async {
    await _api.issueTaxInvoice(id, body);
  }
}
