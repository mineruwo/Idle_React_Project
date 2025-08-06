import { useEffect, useRef, useState, forwardRef } from "react";
import styled from "styled-components"; // 스타일 컴포넌트 사용
import DatePicker from "react-datepicker"; // 날짜 선택 컴포넌트
import "react-datepicker/dist/react-datepicker.css";
import CalendarInput from "./CalendarInput";
import { useNavigate } from "react-router-dom";
import { default as axios } from "axios";
import { saveOrder } from "../../api/orderApi";

const OrderForm = () => {
  // 지도 참조를 위한 ref
  const mapRef = useRef(null);
  // 기본 상태값들 정의 (출발지, 도착지, 거리, 예약일 등)
  const navigate = useNavigate();
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [distance, setDistance] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isImmediate, setIsImmediate] = useState(true); // 즉시배송 여부
  const [weight, setWeight] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [cargoSize, setCargoSize] = useState("");
  const [packingOptions, setPackingOptions] = useState({
    special: false,
    normal: false,
    expensive: false,
    fragile: false
  });



  // 예상 요금 계산에 사용할 km당 평균 운임
  const AVERAGE_PRICE_PER_KM = 3000;

  // 주소 검색 팝업 (다음 API)
  const handlePostcodePopup = (type) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const fullAddr = data.address;
        if (type === "departure") setDeparture(fullAddr);
        else if (type === "arrival") setArrival(fullAddr);
      },
    }).open();
  };

  const ReadOnlyInput = forwardRef(({ value, onClick }, ref) => (
    <input
      type="text"
      readOnly
      ref={ref}
      value={value}
      onClick={onClick}
      placeholder="날짜 선택"
      style={{
        width: "100%",
        padding: "0.7rem",
        borderRadius: "4px",
        border: "1px solid #ccc",
        fontSize: "15px",
        cursor: "pointer",
      }}
    />
  ));

  // 지도 및 거리 계산 useEffect
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;
    if (!mapRef.current || !departure || !arrival || !weight || !vehicle || !cargoType || !cargoSize) return;

    // 지도 생성 (초기 중심은 서울 시청 기준)
    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    });

    const geocoder = new window.kakao.maps.services.Geocoder();

    // 출발지 주소 -> 좌표 변환
    geocoder.addressSearch(departure, (res1, status1) => {
      if (status1 !== window.kakao.maps.services.Status.OK) return;
      const start = new window.kakao.maps.LatLng(res1[0].y, res1[0].x);

      // 도착지 주소 -> 좌표 변환
      geocoder.addressSearch(arrival, (res2, status2) => {
        if (status2 !== window.kakao.maps.services.Status.OK) return;
        const end = new window.kakao.maps.LatLng(res2[0].y, res2[0].x);

        // 마커 이미지 설정
        const pinkMarkerImage = new window.kakao.maps.MarkerImage(
          process.env.PUBLIC_URL + "/img/orderimg/marker_pink.png",
          new window.kakao.maps.Size(32, 42)
        );

        // 출발지, 도착지 마커 표시
        new window.kakao.maps.Marker({ map, position: start, image: pinkMarkerImage });
        new window.kakao.maps.Marker({ map, position: end, image: pinkMarkerImage });

        // 출발/도착 라벨 표시
        new window.kakao.maps.CustomOverlay({
          map,
          position: start,
          content: '<div style="padding:4px 8px;background:#FF80B7;color:white;border-radius:4px;font-size:13px;">출발</div>',
          yAnchor: 1.5,
        });

        new window.kakao.maps.CustomOverlay({
          map,
          position: end,
          content: '<div style="padding:4px 8px;background:#FF80B7;color:white;border-radius:4px;font-size:13px;">도착</div>',
          yAnchor: 1.5,
        });

        // Kakao 길찾기 API 호출
        fetch(`https://apis-navi.kakaomobility.com/v1/directions?origin=${res1[0].x},${res1[0].y}&destination=${res2[0].x},${res2[0].y}`, {
          method: "GET",
          headers: {
            Authorization: `KakaoAK b3e43f89b06cecddef5afc6058545ab2`, // 네비 API 인증 키
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            // 좌표 배열 만들어 폴리라인 경로 생성
            const linePath = data.routes[0].sections[0].roads.flatMap((road) =>
              road.vertexes.reduce((acc, val, idx) => {
                if (idx % 2 === 0) {
                  acc.push(new window.kakao.maps.LatLng(road.vertexes[idx + 1], road.vertexes[idx]));
                }
                return acc;
              }, [])
            );

            // 지도에 선(경로) 표시
            const polyline = new window.kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 4,
              strokeColor: "#ff006f",
              strokeOpacity: 0.8,
              strokeStyle: "solid",
            });
            polyline.setMap(map);

            // 지도 범위를 출발~도착지 기준으로 조정
            const bounds = new window.kakao.maps.LatLngBounds();
            bounds.extend(start);
            bounds.extend(end);
            map.setBounds(bounds);

            // 총 거리(m)를 km 단위로 변환해서 저장
            const totalDistance = data.routes[0].summary.distance;
            setDistance((totalDistance / 1000).toFixed(2));
          });
      });
    });
  }, [departure, arrival, weight, vehicle, cargoType, cargoSize]); // 의존성: 조건 만족 시 재계산

  // 포장 옵션 토글 함수
  const togglePacking = (type) => {
    setPackingOptions((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  let orderData;

  const handleSubmit = async () => {
    try {
      const orderData = {
        departure,
        arrival,
        distance: distance ?? 0,
        date: selectedDate,
        isImmediate,
        weight,
        vehicle,
        cargoType,
        cargoSize,
        packingOptions: Object.keys(packingOptions)
          .filter((key) => packingOptions[key])
          .join(","), // ✅ "special,fragile" 이런 문자열로 변환ons,
      };

      await saveOrder(orderData);

      alert("운송이 등록되었습니다\n(게시판에서 확인가능)");
      navigate("/board");
    } catch (error) {
      console.error("오더 등록 오류:", error);
      alert("오더 등록에 실패했습니다.");
    }
  };




  // UI 반환 부분 (JSX)
  return (
    <FormContainer>
      <Title>오더 등록</Title>

      <Label>출발지</Label>
      <AddressRow>
        <Input value={departure} readOnly placeholder="출발지 주소" />
        <Button onClick={() => handlePostcodePopup("departure")}>검색</Button>
      </AddressRow>

      <Label>도착지</Label>
      <AddressRow>
        <Input value={arrival} readOnly placeholder="도착지 주소" />
        <Button onClick={() => handlePostcodePopup("arrival")}>검색</Button>
      </AddressRow>

      <Label>화물 종류</Label>
      <Select value={cargoType} onChange={(e) => setCargoType(e.target.value)} onKeyDown={(e) => e.preventDefault()}>
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
      <Select value={cargoSize} onChange={(e) => setCargoSize(e.target.value)} onKeyDown={(e) => e.preventDefault()}>
        <option value="">선택</option>
        <option value="small">소형 (1m³ 이하)</option>
        <option value="medium">중형 (1~3m³)</option>
        <option value="large">대형 (3m³ 이상)</option>
      </Select>

      <Label>무게</Label>
      <Select value={weight} onChange={(e) => setWeight(e.target.value)} onKeyDown={(e) => e.preventDefault()}>
        <option value="">선택</option>
        <option value="50kg">~50kg</option>
        <option value="100kg">50~100kg</option>
        <option value="200kg">100~200kg</option>
        <option value="300kg+">200kg 이상</option>
      </Select>

      <Label>차량 종류</Label>
      <Select value={vehicle} onChange={(e) => setVehicle(e.target.value)} onKeyDown={(e) => e.preventDefault()}>
        <option value="">선택</option>
        <option value="1ton">1톤 트럭</option>
        <option value="2.5ton">2.5톤 트럭</option>
        <option value="5ton">5톤 트럭</option>
        <option value="top">탑차</option>
        <option value="cold">냉장/냉동차</option>
      </Select>

      <Label>포장 여부 (필수)</Label>
      <ToggleGroup>
        {Object.entries(packingOptions).map(([key, val]) => (
          <ToggleLabel key={key}>
            <input type="checkbox" checked={val} onChange={() => togglePacking(key)} />
            {key === "special" ? "특수포장" : key === "normal" ? "일반포장" : key === "expensive" ? "고가화물" : "파손위험물"}
          </ToggleLabel>
        ))}
      </ToggleGroup>

      <Label>배송 요청</Label>
      <RadioGroup>
        <label>
          <input type="radio" checked={isImmediate} onChange={() => setIsImmediate(true)} />
          즉시
        </label>
        <label>
          <input type="radio" checked={!isImmediate} onChange={() => setIsImmediate(false)} />
          예약
        </label>
      </RadioGroup>

      {/* 예약 시간 선택 (예약 배송일 경우만 보임) */}
      {!isImmediate && (
        <>
          <Label>예약 날짜 및 시간</Label>
          <DatePickerWrapper>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              minDate={new Date()}
              customInput={<CalendarInput />}
            />
          </DatePickerWrapper>
        </>
      )}

      {/* 필수 조건이 모두 입력되었을 때만 지도 및 거리/금액 출력 */}
      {departure && arrival && weight && cargoType && cargoSize && vehicle && (
        <>
          <MapContainer ref={mapRef} />

          <SummaryBox>
            <div>
              <LineLabel>예상 거리:</LineLabel>
              <LineValue>{distance ? `${distance} km` : "-"}</LineValue>
            </div>
            <div>
              <LineLabel>총 예상 운임:</LineLabel>
              <LineValue>{distance ? `${(distance * AVERAGE_PRICE_PER_KM).toLocaleString("ko-KR")}원` : "-"}</LineValue>
            </div>
          </SummaryBox>

          <ButtonRow>
            <BackButton onClick={() => navigate(-1)}>뒤로가기</BackButton>
            <SubmitButton onClick={handleSubmit}>오더 등록</SubmitButton>
          </ButtonRow>
        </>
      )}
    </FormContainer>
  );
};

export default OrderForm;


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
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: ${(props) => (props.value && props.value !== "" ? "#ffffff" : "#f5f5f5")};
  outline: none;

  &:focus {
    background-color: #ffffff;
  }
`;


const StyledInput = styled.input`
  width: 100%;
  padding: 0.7rem;
  margin-top: 0.4rem;
  box-sizing: border-box;
  background: white;
  cursor: pointer;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.7rem;
  margin-top: 0.4rem;
  background-color: #f5f5f5;
  color: #999;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 15px;
  appearance: none;

    background-color: ${(props) => (props.value && props.value !== "" ? "#ffffff" : "#f5f5f5")};
  color: ${(props) => (props.value && props.value !== "" ? "#333" : "#999")};

  &:focus {
    outline: none;
  }
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

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.4rem;
`;

const Button = styled.button`
  height: 44px;
  padding: 0 1rem;
  background-color: #ffb1d3ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.95rem;
`;

const DatePickerWrapper = styled.div`
  position: relative;
  z-index: 999;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 30px;
  border-radius: 20px;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const SummaryBox = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #f48fb1;
  line-height: 1.6;
`;

const LineLabel = styled.span`
  font-weight: 600;
  margin-right: 8px;
`;

const LineValue = styled.span``;


const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 320px;
  margin: 32px auto 0;
`;

const BackButton = styled.button`
  padding: 0.6rem 1.6rem;
  font-size: 0.95rem;
  background-color: white;
  color: #f48fb1;
  border: 2px solid #f48fb1;
  border-radius: 8px;
  cursor: pointer;
  min-width: 120px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #fff0f5;
  }
`;

const SubmitButton = styled.button`
  padding: 0.6rem 1.6rem;
  font-size: 0.95rem;
  background-color: #f48fb1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-width: 120px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #f48fb1;
  }
`;





