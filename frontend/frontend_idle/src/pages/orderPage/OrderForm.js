import React, { useEffect, useRef, useState,forwardRef } from "react";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OrderForm = () => {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
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
  const AVERAGE_PRICE_PER_KM = 3000;

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
    if (!window.kakao || !window.kakao.maps) return;
    if (!mapRef.current || !departure || !arrival || !weight || !vehicle || !cargoType || !cargoSize) return;

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    });

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(departure, (res1, status1) => {
      if (status1 !== window.kakao.maps.services.Status.OK) return;
      const start = new window.kakao.maps.LatLng(res1[0].y, res1[0].x);

      geocoder.addressSearch(arrival, (res2, status2) => {
        if (status2 !== window.kakao.maps.services.Status.OK) return;
        const end = new window.kakao.maps.LatLng(res2[0].y, res2[0].x);

        const pinkMarkerImage = new window.kakao.maps.MarkerImage(
          process.env.PUBLIC_URL + "/img/orderimg/marker_pink.png",
          new window.kakao.maps.Size(32, 42)
        );

        new window.kakao.maps.Marker({ map, position: start, image: pinkMarkerImage });
        new window.kakao.maps.Marker({ map, position: end, image: pinkMarkerImage });

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

        fetch(`https://apis-navi.kakaomobility.com/v1/directions?origin=${res1[0].x},${res1[0].y}&destination=${res2[0].x},${res2[0].y}`, {
          method: "GET",
          headers: {
            Authorization: `KakaoAK b3e43f89b06cecddef5afc6058545ab2`,
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            const linePath = data.routes[0].sections[0].roads.flatMap((road) =>
              road.vertexes.reduce((acc, val, idx) => {
                if (idx % 2 === 0) {
                  acc.push(new window.kakao.maps.LatLng(road.vertexes[idx + 1], road.vertexes[idx]));
                }
                return acc;
              }, [])
            );

            const polyline = new window.kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 4,
              strokeColor: "#ff006f",
              strokeOpacity: 0.8,
              strokeStyle: "solid",
            });

            polyline.setMap(map);

            const bounds = new window.kakao.maps.LatLngBounds();
            bounds.extend(start);
            bounds.extend(end);
            map.setBounds(bounds);

            const totalDistance = data.routes[0].summary.distance;
            setDistance((totalDistance / 1000).toFixed(2));
          });
      });
    });
  }, [departure, arrival, weight, vehicle, cargoType, cargoSize]);

  const togglePacking = (type) => {
    setPackingOptions((prev) => ({ ...prev, [type]: !prev[type] }));
  };

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

      <Label>포장 여부</Label>
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
              customInput={<ReadOnlyInput />}
            />
          </DatePickerWrapper>
        </>
      )}

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
  box-sizing: border-box;
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
  background-color: #ff80b7ff;
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

const ReadOnlyInput = forwardRef(({value, onClick}, ref) => (
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
