import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DaumPostcode from "react-daum-postcode";

const OrderForm = () => {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [showPostcode, setShowPostcode] = useState(null); // 'departure' 또는 'arrival'
  const [distance, setDistance] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isImmediate, setIsImmediate] = useState(true);
  const [weight, setWeight] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [cargoSize, setCargoSize] = useState("");

  const [packingOptions, setPackingOptions] = useState({
    special: false,
    normal: false,
    expensive: false,
    fragile: false,
  });

  const mapRef = useRef(null);



  const handlePostcodePopup = (type) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const fullAddr = data.address;
        if (type === "departure") setDeparture(fullAddr);
        else if (type === "arrival") setArrival(fullAddr);
      },
    }).open();
  };

  useEffect(() => {
     // 카카오 맵 객체가 로드되지 않았거나, 지도 ref 또는 출발지/도착지가 없으면 함수 종료
    if (!window.kakao || !window.kakao.maps) return;
    if (!mapRef.current || !departure || !arrival) return;

    // 1. 지도를 생성 (초기 위치는 서울 시청 근처)
    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    });
    // 2. 주소 → 좌표 변환을 위한 지오코더 객체 생성  
    const geocoder = new window.kakao.maps.services.Geocoder();

     // 3. 출발지 주소를 좌표로 변환
    geocoder.addressSearch(departure, (res1, status1) => {
      if (status1 === window.kakao.maps.services.Status.OK) {
        const start = new window.kakao.maps.LatLng(res1[0].y, res1[0].x);

          // 4. 도착지 주소를 좌표로 변환
        geocoder.addressSearch(arrival, (res2, status2) => {
          if (status2 === window.kakao.maps.services.Status.OK) {
            const end = new window.kakao.maps.LatLng(res2[0].y, res2[0].x);

             // 5. 출발지와 도착지 위치에 마커 표시
            new window.kakao.maps.Marker({ map, position: start });
            new window.kakao.maps.Marker({ map, position: end });

            // Kakao Directions API 요청 (자동차 길찾기)
            const REST_API_KEY = "b3e43f89b06cecddef5afc6058545ab2";
            const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${res1[0].x},${res1[0].y}&destination=${res2[0].x},${res2[0].y}`;

            fetch(url, {
              method: "GET",
              headers: {
                Authorization: `KakaoAK ${REST_API_KEY}`,
                "Content-Type": "application/json",
              },
            })
              .then((res) => res.json())
              .then((data) => {
                // 7. 응답 받은 길찾기 데이터에서 경로 좌표들만 추출
                const linePath = data.routes[0].sections[0].roads.flatMap((road) =>
                  road.vertexes.reduce((acc, val, idx) => {
                    if (idx % 2 === 0) {
                      acc.push(
                        new window.kakao.maps.LatLng(
                          road.vertexes[idx + 1],// y값
                          road.vertexes[idx] // x값
                        )
                      );
                    }
                    return acc;
                  }, [])
                );

                // 8. 경로를 따라 선(폴리라인)을 지도에 그림
                const polyline = new window.kakao.maps.Polyline({
                  path: linePath,
                  strokeWeight: 4,
                  strokeColor: "#ff006fff",
                  strokeOpacity: 0.8,
                  strokeStyle: "solid",
                });

                  // 9. 사용자 정의 핑크색 마커 이미지 생성
                const pinkMarkerImage = new window.kakao.maps.MarkerImage(
                  process.env.PUBLIC_URL + "/img/orderimg/marker_pink.png", // 로컬 핫핑크 마커
                  new window.kakao.maps.Size(32, 42) // 🔍 적당한 크기로 조절 가능
                );

                const map = new window.kakao.maps.Map(mapRef.current, {
                  center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                  level: 5,
                });

                // 🛠 마우스 드래그 가능하게 설정 (기본은 true지만 혹시 몰라 명시적으로!)
                map.setDraggable(true);

                // 🛠 마우스 휠로 확대/축소도 가능하게 (필요 시)
                map.setZoomable(true);

                // 출발지 마커 + 라벨
                const startMarker = new window.kakao.maps.Marker({
                  map,
                  position: start,
                  image: pinkMarkerImage, // 핑크 마커 적용
                });

                const startLabel = new window.kakao.maps.CustomOverlay({
                  map,
                  position: start,
                  content: '<div style="padding:4px 8px;background:#FF80B7;color:white;border-radius:4px;font-size:13px;">출발</div>',
                  yAnchor: 1.5,
                });

                // 도착지 마커 + 라벨
                const endMarker = new window.kakao.maps.Marker({
                  map,
                  position: end,
                  image: pinkMarkerImage, // 핑크 마커 적용
                });

                const endLabel = new window.kakao.maps.CustomOverlay({
                  map,
                  position: end,
                  content: '<div style="padding:4px 8px;background:#FF80B7;color:white;border-radius:4px;font-size:13px;">도착</div>',
                  yAnchor: 1.5,
                });

                polyline.setMap(map);

                const totalDistance = data.routes[0].summary.distance;
                setDistance((totalDistance / 1000).toFixed(2));

                map.setCenter(start);
                map.setLevel(6);
              });
          }
        });
      }
    });
  }, [departure, arrival]); // 의존성 배열: 출발지 또는 도착지가 바뀔 때마다 실행

  const togglePacking = (type) => {
    setPackingOptions((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <FormContainer>
      <Title>오더 등록</Title>

      <Label>출발지</Label>
      <AddressRow>
        <Input value={departure} readOnly placeholder="출발지 주소" />
        <Button onClick={() => handlePostcodePopup("departure")}>검색</Button >
      </AddressRow>

      <Label>도착지</Label>

      <AddressRow>
        <Input value={arrival} readOnly placeholder="도착지 주소" />
        <Button onClick={() => handlePostcodePopup("arrival")}>검색</Button >
      </AddressRow>


      {distance && <Distance>예상 거리: {distance} km</Distance>}

      {departure && arrival && (
        <div
          id="map"
          ref={mapRef}
          style={{ width: "100%", height: "300px", marginTop: "20px" }}
        />
      )}

      <Label>화물 종류</Label>
      <Select value={cargoType} onChange={(e) => setCargoType(e.target.value)}>
        <option value="">선택</option>
        <option value="box">박스</option>
        <option value="pallet">파렛트</option>
        <option value="appliance">가전제품</option>
        <option value="furniture">가구</option>
        <option value="food">식품</option>
        <option value="clothing">의류</option>
        <option value="machine">기계·부품</option>
        <option value="etc">기타</option>
      </Select>

      <Label>크기</Label>
      <Select value={cargoSize} onChange={(e) => setCargoSize(e.target.value)}>
        <option value="">선택</option>
        <option value="small">소형 (1m³ 이하)</option>
        <option value="medium">중형 (1~3m³)</option>
        <option value="large">대형 (3m³ 이상)</option>
      </Select>

      <Label>무게</Label>
      <Select value={weight} onChange={(e) => setWeight(e.target.value)}>
        <option value="">선택</option>
        <option value="50kg">~50kg</option>
        <option value="100kg">50~100kg</option>
        <option value="200kg">100~200kg</option>
        <option value="300kg+">200kg 이상</option>
      </Select>

      <Label>차량 종류</Label>
      <Select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
        <option value="">선택</option>
        <option value="1ton">1톤 트럭</option>
        <option value="2.5ton">2.5톤 트럭</option>
        <option value="5ton">5톤 트럭</option>
        <option value="top">탑차</option>
        <option value="cold">냉장/냉동차</option>
      </Select>

      <Label>포장 여부</Label>
      <ToggleGroup>
        {Object.entries(packingOptions).map(([key, val]) => (
          <ToggleLabel key={key}>
            <input
              type="checkbox"
              checked={val}
              onChange={() => togglePacking(key)}
            />
            {key === "special"
              ? "특수포장"
              : key === "normal"
                ? "일반포장"
                : key === "expensive"
                  ? "고가화물"
                  : "파손위험물"}
          </ToggleLabel>
        ))}
      </ToggleGroup>

      <Label>배송 요청</Label>
      <RadioGroup>
        <label>
          <input
            type="radio"
            checked={isImmediate}
            onChange={() => setIsImmediate(true)}
          />
          즉시
        </label>
        <label>
          <input
            type="radio"
            checked={!isImmediate}
            onChange={() => setIsImmediate(false)}
          />
          예약
        </label>
      </RadioGroup>

      {!isImmediate && (
        <>
          <Label>예약 날짜 및 시간</Label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            dateFormat="yyyy-MM-dd HH:mm"
            minDate={new Date()}
            placeholderText="날짜 선택"
          />
        </>
      )}
    </FormContainer>
  );
};

export default OrderForm;

// styled-components 정의 생략하지 않고 유지
const FormContainer = styled.div`
  max-width: 600px;
  margin: auto;
  padding: 1.5rem;
  font-family: sans-serif;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  margin-top: 1.2rem;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem;
  margin-top: 0.4rem;
  box-sizing: border-box;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.7rem;
  margin-top: 0.4rem;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 0.5rem;
`;

const ToggleGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 2rem;
  margin-top: 0.5rem;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
`;

const Distance = styled.p`
  color: #ff80b7ff;
  margin-top: 0.5rem;
`;

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.4rem;
`;

const Button = styled.button`
  height: 44px; /* Input 높이에 맞춤 */
  padding: 0 1rem;
  background-color: #ff80b7ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.95rem;
`;

const PostcodeWrapper = styled.div`
  position: absolute;
  z-index: 999;
  background: white;
  border: 1px solid #ccc;
  width: 400px;
  height: 500px;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
`;

