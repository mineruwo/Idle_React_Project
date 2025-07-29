import React, { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (
      window.kakao &&
      window.kakao.maps &&
      departure.trim() !== "" &&
      arrival.trim() !== ""
    ) {
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 5,
      };
      const map = new window.kakao.maps.Map(container, options);
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(departure, (res1, status1) => {
        if (status1 === window.kakao.maps.services.Status.OK) {
          const start = new window.kakao.maps.LatLng(res1[0].y, res1[0].x);
          geocoder.addressSearch(arrival, (res2, status2) => {
            if (status2 === window.kakao.maps.services.Status.OK) {
              const end = new window.kakao.maps.LatLng(res2[0].y, res2[0].x);

              new window.kakao.maps.Marker({ map, position: start });
              new window.kakao.maps.Marker({ map, position: end });

              const polyline = new window.kakao.maps.Polyline({
                map,
                path: [start, end],
                strokeWeight: 4,
                strokeColor: "#f00",
                strokeOpacity: 0.7,
                strokeStyle: "solid",
              });

              const dist = (polyline.getLength() / 1000).toFixed(2);
              setDistance(dist);

              map.setCenter(start);
            }
          });
        }
      });
    }
  }, [departure, arrival]);

  const togglePacking = (type) => {
    setPackingOptions((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <FormContainer>
      <Title>오더 등록</Title>

      <Label>출발지</Label>
      <Input
        value={departure}
        onChange={(e) => setDeparture(e.target.value)}
        placeholder="출발지 주소 입력"
      />

      <Label>도착지</Label>
      <Input
        value={arrival}
        onChange={(e) => setArrival(e.target.value)}
        placeholder="도착지 주소 입력"
      />

      {distance && <Distance>예상 거리: {distance} km</Distance>}

      <div
        id="map"
        ref={mapRef}
        style={{ width: "100%", height: "300px", marginTop: "20px" }}
      ></div>

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
        <ToggleLabel>
          <input
            type="checkbox"
            checked={packingOptions.special}
            onChange={() => togglePacking("special")}
          />
          특수포장(냉장/냉동)
        </ToggleLabel>
        <ToggleLabel>
          <input
            type="checkbox"
            checked={packingOptions.normal}
            onChange={() => togglePacking("normal")}
          />
          일반포장(박스)
        </ToggleLabel>
        <ToggleLabel>
          <input
            type="checkbox"
            checked={packingOptions.expensive}
            onChange={() => togglePacking("expensive")}
          />
          고가화물
        </ToggleLabel>
        <ToggleLabel>
          <input
            type="checkbox"
            checked={packingOptions.fragile}
            onChange={() => togglePacking("fragile")}
          />
          파손위험물
        </ToggleLabel>
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
  color: #f50057;
  margin-top: 0.5rem;
`;
