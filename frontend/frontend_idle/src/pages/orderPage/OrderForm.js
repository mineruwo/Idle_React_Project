// src/pages/orderPage/OrderForm.jsx
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarInput from "./CalendarInput";
import { useNavigate } from "react-router-dom";
import { saveOrder } from "../../api/orderApi";

const AVERAGE_PRICE_PER_KM = 3000; // km당 평균 운임(원)
const PACK_LABELS = {
  special: "특수포장",
  normal: "일반포장",
  expensive: "고가화물",
  fragile: "파손위험물",
};

const OrderForm = () => {
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // 상태
  const [proposedPrice, setProposedPrice] = useState(""); // 표시용(천단위 콤마)
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [distance, setDistance] = useState(null); // "10.76" 같은 문자열(km)
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

  // 다음(카카오) 주소 검색 팝업
  const handlePostcodePopup = (type) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const fullAddr = data.address;
        if (type === "departure") setDeparture(fullAddr);
        else if (type === "arrival") setArrival(fullAddr);
      },
    }).open();
  };

  // 제안가 입력(숫자만 + 콤마 표시)
  const handleProposedPriceChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, "");
    const formatted = onlyNums ? Number(onlyNums).toLocaleString("ko-KR") : "";
    setProposedPrice(formatted);
  };
  const parseProposedPriceNumber = () => {
    const onlyNums = (proposedPrice || "").replace(/[^0-9]/g, "");
    return onlyNums ? Number(onlyNums) : null;
  };

  // 포장 토글
  const togglePacking = (key) =>
    setPackingOptions((prev) => ({ ...prev, [key]: !prev[key] }));

  // 포장 요약 텍스트
  const getPackingSummary = (options) =>
    Object.entries(options)
      .filter(([_, v]) => v)
      .map(([k]) => PACK_LABELS[k])
      .join(", ");

  // 지도 & 거리 계산
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;
    if (!mapRef.current) return;
    if (!departure || !arrival || !weight || !vehicle || !cargoType || !cargoSize) return;

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    });

    const geocoder = new window.kakao.maps.services.Geocoder();

    // 출발지
    geocoder.addressSearch(departure, (res1, status1) => {
      if (status1 !== window.kakao.maps.services.Status.OK) return;
      const start = new window.kakao.maps.LatLng(res1[0].y, res1[0].x);

      // 도착지
      geocoder.addressSearch(arrival, (res2, status2) => {
        if (status2 !== window.kakao.maps.services.Status.OK) return;
        const end = new window.kakao.maps.LatLng(res2[0].y, res2[0].x);

        // 마커 + 라벨
        const markerImg = new window.kakao.maps.MarkerImage(
          process.env.PUBLIC_URL + "/img/orderimg/marker_pink.png",
          new window.kakao.maps.Size(32, 42)
        );
        new window.kakao.maps.Marker({ map, position: start, image: markerImg });
        new window.kakao.maps.Marker({ map, position: end, image: markerImg });

        new window.kakao.maps.CustomOverlay({
          map,
          position: start,
          content:
            '<div style="padding:4px 8px;background:#FF80B7;color:white;border-radius:4px;font-size:13px;">출발</div>',
          yAnchor: 1.5,
        });
        new window.kakao.maps.CustomOverlay({
          map,
          position: end,
          content:
            '<div style="padding:4px 8px;background:#FF80B7;color:white;border-radius:4px;font-size:13px;">도착</div>',
          yAnchor: 1.5,
        });

        // Kakao 길찾기 API
        const REST_KEY =
          process.env.REACT_APP_KAKAO_REST_KEY ||
          "b3e43f89b06cecddef5afc6058545ab2"; // ⚠️ 임시 폴백(개발 편의). 배포 전 .env에 반드시 설정!

        fetch(
          `https://apis-navi.kakaomobility.com/v1/directions?origin=${res1[0].x},${res1[0].y}&destination=${res2[0].x},${res2[0].y}`,
          {
            method: "GET",
            headers: {
              Authorization: `KakaoAK ${REST_KEY}`,
              "Content-Type": "application/json",
            },
          }
        )
          .then((r) => r.json())
          .then((data) => {
            const route = data?.routes?.[0];
            const section = route?.sections?.[0];
            if (!section) return;

            // 경로 폴리라인
            const linePath = section.roads.flatMap((road) =>
              road.vertexes.reduce((acc, _, idx) => {
                if (idx % 2 === 0) {
                  acc.push(
                    new window.kakao.maps.LatLng(
                      road.vertexes[idx + 1],
                      road.vertexes[idx]
                    )
                  );
                }
                return acc;
              }, [])
            );

            new window.kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 4,
              strokeColor: "#ff006f",
              strokeOpacity: 0.8,
              strokeStyle: "solid",
              map,
            });

            // 범위
            const bounds = new window.kakao.maps.LatLngBounds();
            bounds.extend(start);
            bounds.extend(end);
            map.setBounds(bounds);

            // 거리(km)
            const totalDistanceM = route.summary.distance; // meters
            setDistance((totalDistanceM / 1000).toFixed(2));
          })
          .catch((e) => {
            console.error("kakao directions error:", e);
            setDistance(null);
          });
      });
    });
  }, [departure, arrival, weight, vehicle, cargoType, cargoSize]);

  // 제출
  const handleSubmit = async () => {
    try {
      const payload = {
        // 금액
        proposedPrice: parseProposedPriceNumber(),
        driverPrice: null,
        avgPrice: distance ? Math.round(Number(distance) * AVERAGE_PRICE_PER_KM) : null,

        // 포장
        packingOptions: JSON.stringify(packingOptions),
        packingOption: getPackingSummary(packingOptions),

        // 경로
        departure,
        arrival,
        distance: distance ? Number(distance) : 0,

        // createdAt(등록일)은 백엔드 @CreationTimestamp로 자동 기록
        reservedDate: isImmediate ? null : (selectedDate ? selectedDate.toISOString() : null),
        isImmediate: !!isImmediate,

        // 옵션
        weight,
        vehicle,
        cargoType,
        cargoSize,

        status: "CREATED",
      };

      const saved = await saveOrder(payload); // 저장된 Order( id 포함 ) 반환 가정
      alert("운송이 등록되었습니다\n(게시판에서 확인가능)");
      navigate("/board", { state: { justCreatedId: saved?.id } }); // 방금 등록된 카드 포커스용
    } catch (error) {
      console.error("오더 등록 오류:", error);
      alert("오더 등록에 실패했습니다.");
    }
  };

  const ready =
    departure && arrival && weight && cargoType && cargoSize && vehicle;

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

      <Label>포장 여부 (복수선택)</Label>
      <ToggleGroup>
        {Object.entries(packingOptions).map(([key, val]) => (
          <ToggleLabel key={key}>
            <input type="checkbox" checked={val} onChange={() => togglePacking(key)} /> {PACK_LABELS[key]}
          </ToggleLabel>
        ))}
      </ToggleGroup>

      <Label>배송 요청</Label>
      <RadioGroup>
        <label>
          <input type="radio" checked={isImmediate} onChange={() => setIsImmediate(true)} /> 즉시
        </label>
        <label>
          <input type="radio" checked={!isImmediate} onChange={() => setIsImmediate(false)} /> 예약
        </label>
      </RadioGroup>

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

      {ready && (
        <>
          <MapContainer ref={mapRef} />

          <SummaryBox>
            <div>
              <LineLabel>예상 거리:</LineLabel>
              <LineValue>{distance ? `${distance} km` : "-"}</LineValue>
            </div>
            <div>
              <LineLabel>평균가:</LineLabel>
              <LineValue>{`${AVERAGE_PRICE_PER_KM.toLocaleString("ko-KR")}원/km`}</LineValue>
            </div>

            <Divider />

            <div>
              <LineLabel>총 예상 운임:</LineLabel>
              <LineValue>
                {distance
                  ? `${(Number(distance) * AVERAGE_PRICE_PER_KM).toLocaleString("ko-KR")}원`
                  : "-"}
              </LineValue>
            </div>

            <div>
              <LineLabel>가격 제안:</LineLabel>
              <div style={{ marginTop: "8px" }}>
                <ProposalInput
                  type="text"
                  placeholder="직접 제안할 금액 입력"
                  value={proposedPrice}
                  onChange={handleProposedPriceChange}
                />
              </div>
            </div>
          </SummaryBox>

          <ButtonRow>
            <BackButton onClick={() => navigate(-1)}>뒤로가기</BackButton>
            <SubmitButton onClick={handleSubmit} disabled={!distance}>
              오더 등록
            </SubmitButton>
          </ButtonRow>
        </>
      )}
    </FormContainer>
  );
};

export default OrderForm;

/* ======================== 스타일 ======================== */
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
  &:focus { background-color: #ffffff; }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.7rem;
  margin-top: 0.4rem;
  background-color: ${(props) => (props.value && props.value !== "" ? "#ffffff" : "#f5f5f5")};
  color: ${(props) => (props.value && props.value !== "" ? "#333" : "#999")};
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 15px;
  appearance: none;
  &:focus { outline: none; }
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

const Divider = styled.hr`
  border: none;
  border-top: 2px solid #f48fb1;
  margin: 12px 0;
`;

const ProposalInput = styled.input`
  width: 100%;
  padding: 0.7rem 1rem;
  font-size: 15px;
  border: 1px solid #c1c1c1ff;
  border-radius: 12px;
  box-sizing: border-box;
  color: #444;
  &:focus {
    outline: none;
    border-color: #e08cab;
    box-shadow: 0 0 0 2px rgba(224, 140, 171, 0.2);
  }
  &::placeholder { color: #888; }
`;

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
  &:hover { background-color: #fff0f5; }
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
  &:hover { background-color: #f48fb1; }
`;
