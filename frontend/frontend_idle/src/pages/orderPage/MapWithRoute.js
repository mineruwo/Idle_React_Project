import { useEffect, useRef, useState } from 'react';

const MapWithRoute = () => {
  const mapRef = useRef(null);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');

  useEffect(() => {
    // 지도 초기화
    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    };
    const map = new window.kakao.maps.Map(container, options);
    mapRef.current.map = map;
  }, []);

  const drawRoute = () => {
    const map = mapRef.current.map;
    const geocoder = new window.kakao.maps.services.Geocoder();

    // 출발지 주소 → 좌표
    geocoder.addressSearch(startAddress, function (result1, status1) {
      if (status1 === window.kakao.maps.services.Status.OK) {
        const startLatLng = new window.kakao.maps.LatLng(result1[0].y, result1[0].x);

        // 도착지 주소 → 좌표
        geocoder.addressSearch(endAddress, function (result2, status2) {
          if (status2 === window.kakao.maps.services.Status.OK) {
            const endLatLng = new window.kakao.maps.LatLng(result2[0].y, result2[0].x);

            // 지도 중심 재설정
            map.setCenter(startLatLng);

            // 마커 찍기
            new window.kakao.maps.Marker({ map, position: startLatLng });
            new window.kakao.maps.Marker({ map, position: endLatLng });

            // 경로 선 긋기
            const polyline = new window.kakao.maps.Polyline({
              path: [startLatLng, endLatLng],
              strokeWeight: 4,
              strokeColor: '#ff0055',
              strokeOpacity: 0.8,
              strokeStyle: 'solid',
            });

            polyline.setMap(map);

            // 거리 계산
            const distance = polyline.getLength(); // meter
            const km = (distance / 1000).toFixed(2);
            console.log(`거리: ${km} km`);

            alert(`예상 거리: ${km} km`);
          } else {
            alert('도착지 주소를 다시 확인해주세요.');
          }
        });
      } else {
        alert('출발지 주소를 다시 확인해주세요.');
      }
    });
  };

  return (
    <div>
      <h2>출발지 ~ 도착지 경로 표시</h2>
      <input
        type="text"
        placeholder="출발지 입력"
        value={startAddress}
        onChange={(e) => setStartAddress(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <input
        type="text"
        placeholder="도착지 입력"
        value={endAddress}
        onChange={(e) => setEndAddress(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <button onClick={drawRoute}>경로 보기</button>

      <div
        id="map"
        ref={mapRef}
        style={{ width: '100%', height: '400px', marginTop: '20px' }}
      ></div>
    </div>
  );
};

export default MapWithRoute;
