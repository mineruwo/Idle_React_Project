import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;

/// ─────────────────────────────────────────────────────────────
/// 한국에서 Google Directions 가 ZERO_RESULTS 를 주면
/// Kakao 내비 REST로 대체해서 "최단 시간" 경로를 그리는 하이브리드 카드
/// - 1) Google 지오코딩 → place_id/좌표
/// - 2) Google Directions (alternatives+교통반영) 시도
/// - 3) 실패(ZERO_RESULTS 등) & 좌표가 한국권이면 Kakao 내비로 재시도
/// - 4) 최종적으로 경로 렌더링, 거리/예상시간 표시
/// ─────────────────────────────────────────────────────────────
class MapRouteHybridCard extends StatefulWidget {
  final String? originAddress;
  final String? destAddress;

  const MapRouteHybridCard({
    super.key,
    required this.originAddress,
    required this.destAddress,
  });

  @override
  State<MapRouteHybridCard> createState() => _MapRouteHybridCardState();
}

/// 지오코딩 결과 (top-level 필요)
class _Geo {
  final double lat;
  final double lng;
  final String? placeId;
  _Geo(this.lat, this.lng, [this.placeId]);
}

class _MapRouteHybridCardState extends State<MapRouteHybridCard> {
  GoogleMapController? _mapCtrl;
  Set<Polyline> _polylines = {};
  Set<Marker> _markers = {};
  String? _distanceText; // "432 km"
  String? _etaText; // "325분"
  bool _loading = false;
  String? _err;

  // REST 키: flutter run --dart-define=... 로 주입
  static const String _gKey = 'AIzaSyCAmOMlFYqF3nIaFzS-rUnxsDzu8Gyc9pQ';
  // String.fromEnvironment(
  //   'MAPS_DIRECTIONS_KEY',
  //   defaultValue: 'YOUR_GMAPS_REST_KEY',
  // );
  static const String _kakaoKey = 'b3e43f89b06cecddef5afc6058545ab2';
  // String.fromEnvironment(
  //   'KAKAO_REST_KEY',
  //   defaultValue: 'YOUR_KAKAO_REST_KEY',
  // );

  static const _kInitial = LatLng(37.5665, 126.9780); // 서울
  static const _kZoom = 11.0;

  @override
  void initState() {
    super.initState();
    _loadRoute();
  }

  @override
  void didUpdateWidget(covariant MapRouteHybridCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.originAddress != widget.originAddress ||
        oldWidget.destAddress != widget.destAddress) {
      _loadRoute();
    }
  }

  @override
  void dispose() {
    _mapCtrl?.dispose();
    super.dispose();
  }

  // ───────────── Main Flow ─────────────

  Future<void> _loadRoute() async {
    final origin = _clean(widget.originAddress);
    final dest = _clean(widget.destAddress);

    if (origin == null || dest == null) {
      setState(() {
        _polylines = {};
        _markers = {};
        _distanceText = null;
        _etaText = null;
        _err = null;
      });
      return;
    }

    setState(() {
      _loading = true;
      _err = null;
    });

    try {
      _ensureKeys();

      // 1) Google 지오코딩
      final o = await _gGeocode(origin);
      final d = await _gGeocode(dest);

      // 2) Google Directions (최단시간 경로 선택)
      final best = await _tryGoogleDirectionsBest(o, d);

      if (best != null) {
        await _applyPolylineResult(
          points: best.points,
          start: best.start,
          end: best.end,
          distanceMeters: best.distanceM,
          durationSeconds: best.durationS,
        );
        return;
      }

      // 3) 한국권이면 Kakao 내비로 폴백
      if (_isInKorea(o) && _isInKorea(d)) {
        final kBest = await _kakaoBestRoute(o, d);
        await _applyPolylineResult(
          points: kBest.points,
          start: kBest.start,
          end: kBest.end,
          distanceMeters: kBest.distanceM,
          durationSeconds: kBest.durationS,
        );
        return;
      }

      // 4) 마지막 폴백: 직선
      _drawStraight(o, d, error: '경로 API에서 결과를 찾지 못했습니다.');
    } catch (e) {
      _drawStraightError(e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ───────────── Google: Geocode ─────────────

  Future<_Geo> _gGeocode(String addr) async {
    final url = Uri.https('maps.googleapis.com', '/maps/api/geocode/json', {
      'address': addr,
      'region': 'kr',
      'language': 'ko',
      'key': _gKey,
    });
    final r = await http.get(url);
    if (r.statusCode != 200) {
      throw Exception('Geocode HTTP ${r.statusCode}');
    }
    final data = jsonDecode(r.body) as Map<String, dynamic>;
    if (data['status'] != 'OK') {
      throw Exception(
        'Geocode ${data['status']}: ${data['error_message'] ?? ''}',
      );
    }
    final first = (data['results'] as List).first as Map<String, dynamic>;
    final loc = (first['geometry'] as Map)['location'] as Map<String, dynamic>;
    return _Geo(
      (loc['lat'] as num).toDouble(),
      (loc['lng'] as num).toDouble(),
      first['place_id'] as String?,
    );
  }

  // ───────────── Google: Directions (best) ─────────────

  Future<_PolylineResult?> _tryGoogleDirectionsBest(_Geo o, _Geo d) async {
    if (!_gKey.startsWith('AIza')) return null;

    final origin = o.placeId != null
        ? 'place_id:${o.placeId}'
        : '${o.lat},${o.lng}';
    final dest = d.placeId != null
        ? 'place_id:${d.placeId}'
        : '${d.lat},${d.lng}';

    final url = Uri.https('maps.googleapis.com', '/maps/api/directions/json', {
      'origin': origin,
      'destination': dest,
      'mode': 'driving',
      'language': 'ko',
      'region': 'kr',
      'alternatives': 'true',
      'departure_time': 'now',
      'traffic_model': 'best_guess',
      'key': _gKey,
    });

    final r = await http.get(url);
    if (r.statusCode != 200) {
      throw Exception('Directions HTTP ${r.statusCode}');
    }
    final data = jsonDecode(r.body) as Map<String, dynamic>;
    final status = data['status'] as String?;
    if (status == 'OK') {
      // 최단 시간 경로 선택
      Map<String, dynamic>? bestRoute;
      int? bestSecs;
      for (final rt in (data['routes'] as List).cast<Map<String, dynamic>>()) {
        final legs = (rt['legs'] as List?)?.cast<dynamic>() ?? const [];
        if (legs.isEmpty) continue;
        final leg = legs.first as Map<String, dynamic>;
        final durT = (leg['duration_in_traffic'] as Map?)?['value'] as int?;
        final dur = (leg['duration'] as Map?)?['value'] as int?;
        final secs = durT ?? dur;
        if (secs == null) continue;
        if (bestSecs == null || secs < bestSecs) {
          bestSecs = secs;
          bestRoute = rt;
        }
      }
      if (bestRoute == null) return null;

      final leg = (bestRoute['legs'] as List).first as Map<String, dynamic>;
      final distM = (leg['distance'] as Map)['value'] as int;
      final durS =
          ((leg['duration_in_traffic'] as Map?)?['value'] ??
                  (leg['duration'] as Map)['value'])
              as int;

      final ov = bestRoute['overview_polyline'] as Map<String, dynamic>;
      final points = _decodePolyline(ov['points'] as String);

      final s = leg['start_location'] as Map<String, dynamic>;
      final e = leg['end_location'] as Map<String, dynamic>;
      final start = LatLng(
        (s['lat'] as num).toDouble(),
        (s['lng'] as num).toDouble(),
      );
      final end = LatLng(
        (e['lat'] as num).toDouble(),
        (e['lng'] as num).toDouble(),
      );

      return _PolylineResult(
        points: points,
        start: start,
        end: end,
        distanceM: distM,
        durationS: durS,
      );
    }

    // 한국에서 흔한 ZERO_RESULTS → Kakao 폴백
    if (status == 'ZERO_RESULTS') return null;

    // 기타 에러면 메시지 노출 (REQUEST_DENIED 등)
    throw Exception('Directions $status: ${data['error_message'] ?? ''}');
  }

  // ───────────── Kakao: Directions (best) ─────────────

  Future<_PolylineResult> _kakaoBestRoute(_Geo o, _Geo d) async {
    if (_kakaoKey.startsWith('YOUR_')) {
      throw Exception('카카오 REST 키가 설정되지 않았습니다.');
    }

    final url = Uri.https('apis-navi.kakaomobility.com', '/v1/directions', {
      // Kakao는 "lng,lat" 순서 주의!
      'origin': '${o.lng},${o.lat}',
      'destination': '${d.lng},${d.lat}',
      'alternatives': 'true',
      'priority': 'RECOMMEND', // FAST/SHORTEST 등으로 변경 가능
      // 필요시 회피/차종 옵션 추가: avoid=TOLL,FERRY / car_type=3(화물) 등
    });

    final r = await http.get(
      url,
      headers: {
        'Authorization': 'KakaoAK $_kakaoKey',
        'Content-Type': 'application/json',
      },
    );
    if (r.statusCode != 200) {
      throw Exception('Kakao Navi HTTP ${r.statusCode}');
    }
    final data = jsonDecode(r.body) as Map<String, dynamic>;
    final routes = (data['routes'] as List?) ?? const [];
    if (routes.isEmpty) {
      throw Exception('카카오 길찾기 결과 없음');
    }

    // 후보 중 duration 최솟값 선택
    Map<String, dynamic>? best;
    int? bestSecs;
    for (final rt in routes.cast<Map<String, dynamic>>()) {
      final summary = (rt['summary'] as Map?) ?? const {};
      final secs = (summary['duration'] as num?)?.toInt();
      if (secs == null) continue;
      if (bestSecs == null || secs < bestSecs) {
        bestSecs = secs;
        best = rt;
      }
    }
    if (best == null) throw Exception('카카오 요약값 없음');

    final sum = best['summary'] as Map<String, dynamic>;
    final distM = (sum['distance'] as num).toInt();
    final durS = (sum['duration'] as num).toInt();

    // 폴리라인 포인트 복원
    final points = <LatLng>[];
    for (final sec in ((best['sections'] as List?) ?? const [])) {
      final roads = (sec['roads'] as List?) ?? const [];
      for (final rd in roads) {
        final v = (rd['vertexes'] as List?)?.cast<num>() ?? const <num>[];
        for (int i = 0; i + 1 < v.length; i += 2) {
          final lng = v[i].toDouble();
          final lat = v[i + 1].toDouble();
          points.add(LatLng(lat, lng));
        }
      }
    }

    // 시작/끝
    final b = (best['bounds'] as Map?) ?? const {};
    final sw = (b['sw'] as Map?) ?? const {};
    final ne = (b['ne'] as Map?) ?? const {};
    // bounds가 없으면 points의 양끝으로 가도 됨
    final start = points.isNotEmpty ? points.first : LatLng(o.lat, o.lng);
    final end = points.isNotEmpty ? points.last : LatLng(d.lat, d.lng);

    return _PolylineResult(
      points: points,
      start: start,
      end: end,
      distanceM: distM,
      durationS: durS,
    );
  }

  // ───────────── 결과 반영/표시 ─────────────

  Future<void> _applyPolylineResult({
    required List<LatLng> points,
    required LatLng start,
    required LatLng end,
    required int distanceMeters,
    required int durationSeconds,
  }) async {
    final km = distanceMeters / 1000.0;
    final kmStr = km.toStringAsFixed(km < 10 ? 1 : 0);
    final minStr = (durationSeconds / 60).round();

    setState(() {
      _polylines = {
        Polyline(
          polylineId: const PolylineId('route'),
          width: 5,
          points: points,
        ),
      };
      _markers = {
        Marker(
          markerId: const MarkerId('origin'),
          position: start,
          infoWindow: const InfoWindow(title: '출발'),
        ),
        Marker(
          markerId: const MarkerId('dest'),
          position: end,
          infoWindow: const InfoWindow(title: '도착'),
        ),
      };
      _distanceText = '$kmStr km';
      _etaText = '${minStr}분';
      _err = null;
    });

    await Future.delayed(const Duration(milliseconds: 100));
    if (_mapCtrl != null && points.isNotEmpty) {
      final bounds = _boundsFrom([start, end, ...points]);
      await _mapCtrl!.animateCamera(CameraUpdate.newLatLngBounds(bounds, 60));
    }
  }

  // ───────────── UI ─────────────

  @override
  Widget build(BuildContext context) {
    return Card(
      child: SizedBox(
        height: 220,
        child: Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: GoogleMap(
                initialCameraPosition: const CameraPosition(
                  target: _kInitial,
                  zoom: _kZoom,
                ),
                polylines: _polylines,
                markers: _markers,
                onMapCreated: (c) => _mapCtrl = c,
                myLocationButtonEnabled: false,
                zoomControlsEnabled: false,
              ),
            ),
            if (_loading)
              const Positioned.fill(
                child: Center(child: CircularProgressIndicator()),
              ),
            if ((_distanceText != null || _etaText != null) && _err == null)
              Positioned(
                left: 12,
                top: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: const [
                      BoxShadow(color: Colors.black12, blurRadius: 6),
                    ],
                  ),
                  child: Text(
                    [
                      if (_distanceText != null) '거리: $_distanceText',
                      if (_etaText != null) '예상: $_etaText',
                    ].join(' · '),
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            if (_err != null)
              Positioned.fill(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      _err!,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  // ───────────── Utils ─────────────

  void _ensureKeys() {
    if (!_gKey.startsWith('AIza')) {
      throw Exception('Google REST 키(MAPS_DIRECTIONS_KEY)가 올바르지 않습니다.');
    }
    // Kakao 키는 폴백 단계에서만 검사
  }

  bool _isInKorea(_Geo g) =>
      g.lat >= 33 && g.lat <= 39 && g.lng >= 124 && g.lng <= 132;

  String? _clean(String? s) {
    if (s == null) return null;
    final t = s.replaceAll(RegExp(r'\s+'), ' ').trim();
    return t.isEmpty ? null : t;
  }

  List<LatLng> _decodePolyline(String encoded) {
    final List<LatLng> poly = [];
    int index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      int b, shift = 0, result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      final dlat = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      final dlng = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
      lng += dlng;
      poly.add(LatLng(lat / 1e5, lng / 1e5));
    }
    return poly;
  }

  LatLngBounds _boundsFrom(List<LatLng> list) {
    double? minLat, maxLat, minLng, maxLng;
    for (final p in list) {
      minLat = (minLat == null) ? p.latitude : math.min(minLat, p.latitude);
      maxLat = (maxLat == null) ? p.latitude : math.max(maxLat, p.latitude);
      minLng = (minLng == null) ? p.longitude : math.min(minLng, p.longitude);
      maxLng = (maxLng == null) ? p.longitude : math.max(maxLng, p.longitude);
    }
    return LatLngBounds(
      southwest: LatLng(minLat!, minLng!),
      northeast: LatLng(maxLat!, maxLng!),
    );
  }

  void _drawStraightError(String error) {
    setState(() => _err = '경로를 불러오지 못했습니다: $error');
  }

  void _drawStraight(_Geo o, _Geo d, {String? error}) async {
    final start = LatLng(o.lat, o.lng);
    final end = LatLng(d.lat, d.lng);
    final polyline = Polyline(
      polylineId: const PolylineId('straight'),
      width: 4,
      points: [start, end],
    );
    final km = _haversineKm(o.lat, o.lng, d.lat, d.lng);
    final kmStr = km.toStringAsFixed(km < 10 ? 1 : 0);
    setState(() {
      _polylines = {polyline};
      _markers = {
        Marker(markerId: const MarkerId('origin'), position: start),
        Marker(markerId: const MarkerId('dest'), position: end),
      };
      _distanceText = '직선: $kmStr km';
      _etaText = null;
      _err = error;
    });
    await Future.delayed(const Duration(milliseconds: 100));
    if (_mapCtrl != null) {
      final bounds = _boundsFrom([start, end]);
      await _mapCtrl!.animateCamera(CameraUpdate.newLatLngBounds(bounds, 60));
    }
  }

  double _haversineKm(double lat1, double lon1, double lat2, double lon2) {
    const R = 6371.0;
    final dLat = _deg2rad(lat2 - lat1);
    final dLon = _deg2rad(lon2 - lon1);
    final a =
        math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_deg2rad(lat1)) *
            math.cos(_deg2rad(lat2)) *
            math.sin(dLon / 2) *
            math.sin(dLon / 2);
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return R * c;
  }

  double _deg2rad(double d) => d * math.pi / 180.0;
}

/// 폴리라인 결과 패킷
class _PolylineResult {
  final List<LatLng> points;
  final LatLng start;
  final LatLng end;
  final int distanceM;
  final int durationS;
  _PolylineResult({
    required this.points,
    required this.start,
    required this.end,
    required this.distanceM,
    required this.durationS,
  });
}
