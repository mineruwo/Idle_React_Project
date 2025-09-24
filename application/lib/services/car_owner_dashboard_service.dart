import 'package:dio/dio.dart';
import 'package:application/network/dio_client.dart';
import '../model/car_owner_dashboard_models.dart';

class CarOwnerDashboardService {
  CarOwnerDashboardService({DioClient? dioClient})
    : _dioClient = dioClient ?? DioClient();

  final DioClient _dioClient;

  /// GET /api/car-owner/dashboard/summary?period=month
  Future<DashboardSummaryDTO> getSummary({String period = 'month'}) async {
    try {
      final Response res = await _dioClient.dio.get(
        '/car-owner/dashboard/summary',
        queryParameters: {'period': period},
      );
      return DashboardSummaryDTO.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('getSummary failed: $e');
    }
  }

  /// GET /api/car-owner/dashboard/deliveries
  Future<List<DeliveryItemDTO>> getDeliveries() async {
    try {
      final Response res = await _dioClient.dio.get(
        '/car-owner/dashboard/deliveries',
      );
      final list = (res.data as List).cast<dynamic>();
      return list
          .map((e) => DeliveryItemDTO.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('getDeliveries failed: $e');
    }
  }

  /// GET /api/car-owner/dashboard/sales-chart?period=month
  Future<List<SalesChartDTO>> getSalesChart({String period = 'month'}) async {
    try {
      final Response res = await _dioClient.dio.get(
        '/car-owner/dashboard/sales-chart',
        queryParameters: {'period': period},
      );
      final list = (res.data as List).cast<dynamic>();
      return list
          .map((e) => SalesChartDTO.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('getSalesChart failed: $e');
    }
  }

  /// GET /api/car-owner/dashboard/warmth
  Future<WarmthDTO> getWarmth() async {
    try {
      final Response res = await _dioClient.dio.get(
        '/car-owner/dashboard/warmth',
      );
      return WarmthDTO.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('getWarmth failed: $e');
    }
  }
}
