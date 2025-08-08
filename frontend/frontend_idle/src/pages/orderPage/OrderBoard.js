// src/pages/orderPage/OrderBoard.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { fetchOrders } from "../../api/orderApi";

/* ========================= 라벨 매핑 ========================= */
const LABEL = {
  cargoType: {
    box: "박스",
    pallet: "파렛트",
    appliance: "가전제품",
    furniture: "가구",
    food: "식품",
    clothing: "의류",
    machine: "기계·부품",
    etc: "기타",
  },
  cargoSize: {
    small: "소형 (1m³ 이하)",
    medium: "중형 (1~3m³)",
    large: "대형 (3m³ 이상)",
  },
  weight: {
    "50kg": "50~100kg",
    "100kg": "50~100kg",
    "200kg": "100~200kg",
    "300kg+": "200~300kg",
  },
  vehicle: {
    "1ton": "1톤 트럭",
    "2.5ton": "2.5톤 트럭",
    "5ton": "5톤 트럭",
    top: "탑차",
    cold: "냉장/냉동차",
  },
};

const packingKeyToText = {
  special: "특수포장",
  normal: "일반포장",
  expensive: "고가화물",
  fragile: "파손위험물",
};

/* ========================= 날짜 유틸 ========================= */
const fmtDate = (v) => {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  } catch {
    return "-";
  }
};

const fmtDateTime = (v) => {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}.${m}.${day} ${hh}:${mm}`;
  } catch {
    return "-";
  }
};

const prettyPacking = (packingOptions) => {
  if (!packingOptions) return "-";
  const keys = Array.isArray(packingOptions)
    ? packingOptions
    : String(packingOptions)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  if (!keys.length) return "-";
  return keys.map((k) => packingKeyToText[k] || k).join(", ");
};

/* ========================= 컴포넌트 ========================= */
const OrderBoard = () => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const panelRef = useRef(null);
  const cardRefs = useRef({}); // 각 카드 dom

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchOrders();
        setOrders(data || []);
      } catch (e) {
        console.error("오더 목록 불러오기 실패:", e);
      }
    })();
  }, []);

  const handleSelect = (o) => {
    setSelected(o);
    setPanelOpen(true);

    // 선택 카드 옆으로 보이게 스크롤 보정
    requestAnimationFrame(() => {
      const el = cardRefs.current[o.id];
      if (!el || !panelRef.current) return;
      const cardRect = el.getBoundingClientRect();
      const panelRect = panelRef.current.getBoundingClientRect();
      const targetTop = window.scrollY + (cardRect.top - panelRect.top) + window.scrollY - 16;
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    });
  };

  const handleBack = () => {
    setPanelOpen(false);
    setSelected(null);
  };

  const todayStr = useMemo(() => fmtDate(new Date()), []);

  return (
    <PageWrap>
      <ListArea data-panel-open={panelOpen}>
        <Header>오더 게시판</Header>

        <CardList>
          {orders.map((o) => {
            const cargoTypeLabel = LABEL.cargoType[o.cargoType] || o.cargoType || "-";
            const sizeLabel = LABEL.cargoSize[o.cargoSize] || o.cargoSize || "-";
            const weightLabel = LABEL.weight[o.weight] || o.weight || "-";
            const vehicleLabel = LABEL.vehicle[o.vehicle] || o.vehicle || "-";

            return (
              <Card
                key={o.id}
                ref={(el) => (cardRefs.current[o.id] = el)}
                onClick={() => handleSelect(o)}
                data-selected={selected?.id === o.id}
              >
                <RowBetween>
                  <FromTo>
                    <Strong>출발</Strong> {o.departure} &nbsp;→&nbsp;
                    <Strong>도착</Strong> {o.arrival}
                  </FromTo>
                  <RightMeta>{o.status || "READY"}</RightMeta>
                </RowBetween>

                <InfoGrid>
                  <Col>
                    <SubLabel>화물 종류</SubLabel>
                    <SubValue>{cargoTypeLabel}</SubValue>
                  </Col>
                  <Col>
                    <SubLabel>크기</SubLabel>
                    <SubValue>{sizeLabel}</SubValue>
                  </Col>
                  <Col>
                    <SubLabel>무게</SubLabel>
                    <SubValue>{weightLabel}</SubValue>
                  </Col>
                  <Col>
                    <SubLabel>차량</SubLabel>
                    <SubValue>{vehicleLabel}</SubValue>
                  </Col>
                  <Col>
                    <SubLabel>포장</SubLabel>
                    <SubValue>{prettyPacking(o.packingOptions)}</SubValue>
                  </Col>
                  <Col>
                    <SubLabel>예약 시간</SubLabel>
                    <SubValue>
                      {o.isImmediate ? "즉시" : o.reservedDate ? fmtDateTime(o.reservedDate) : "-"}
                    </SubValue>
                  </Col>
                </InfoGrid>

                {/* 등록일 (카드 오른쪽 하단) */}
                <DateWrap>{o.createdAt ? fmtDate(o.createdAt) : "-"}</DateWrap>
              </Card>
            );
          })}
        </CardList>
      </ListArea>

      <DetailArea ref={panelRef} data-open={panelOpen}>
        <DetailHeader>
          <BackBtn onClick={handleBack}>← 뒤로가기</BackBtn>
          <DetailTitle>오더 게시판</DetailTitle>
          <Today>{todayStr}</Today>
        </DetailHeader>

        {selected ? (
          <>
            <Section>
              <SectionTitle>
                화물 상세 정보 <StatusTag>{selected.status || "READY"}</StatusTag>
              </SectionTitle>
              <Row>
                <Key>출발지</Key>
                <Val>{selected.departure}</Val>
              </Row>
              <Row>
                <Key>도착지</Key>
                <Val>{selected.arrival}</Val>
              </Row>
              <Row>
                <Key>화물 종류</Key>
                <Val>{LABEL.cargoType[selected.cargoType] || selected.cargoType || "-"}</Val>
              </Row>
              <Row>
                <Key>크기</Key>
                <Val>{LABEL.cargoSize[selected.cargoSize] || selected.cargoSize || "-"}</Val>
              </Row>
              <Row>
                <Key>무게</Key>
                <Val>{LABEL.weight[selected.weight] || selected.weight || "-"}</Val>
              </Row>
              <Row>
                <Key>차량 종류</Key>
                <Val>{LABEL.vehicle[selected.vehicle] || selected.vehicle || "-"}</Val>
              </Row>
              <Row>
                <Key>포장 여부</Key>
                <Val>{prettyPacking(selected.packingOptions)}</Val>
              </Row>
              <Row>
                <Key>예약시간</Key>
                <Val>
                  {selected.isImmediate
                    ? "즉시"
                    : selected.reservedDate
                    ? fmtDateTime(selected.reservedDate)
                    : "-"}
                </Val>
              </Row>
            </Section>

            <Section>
              <SectionTitle>배정된 기사</SectionTitle>
              <Muted>예시 영역 (추후 기사 정보 연동)</Muted>
            </Section>

            <Section>
              <SectionTitle>운임 정보</SectionTitle>
              <Row>
                <Key>기사 제안가</Key>
                <Val>
                  {selected.driverPrice ? `${Number(selected.driverPrice).toLocaleString()} 원` : "-"}
                </Val>
              </Row>
              <Row>
                <Key>화주 제안가</Key>
                <Val>
                  {selected.proposedPrice ? `${Number(selected.proposedPrice).toLocaleString()} 원` : "-"}
                </Val>
              </Row>
              <Row>
                <Key>평균가</Key>
                <Val>
                  {selected.avgPrice ? `${Number(selected.avgPrice).toLocaleString()} 원` : "-"}
                </Val>
              </Row>
              <RightHint>
                예상 거리 {selected.distance != null ? `${Number(selected.distance).toFixed(2)}km` : "-"}
              </RightHint>
            </Section>
          </>
        ) : null}
      </DetailArea>
    </PageWrap>
  );
};

export default OrderBoard;

/* ========================= 스타일 (핑크 테마) ========================= */

const PINK = {
  bg: "#fff7fb",
  cardBorder: "#f9d8e8",
  cardBorderHover: "#f4c1d8",
  cardShadow: "rgba(232, 90, 166, 0.08)",
  cardShadowHover: "rgba(232, 90, 166, 0.14)",
  strong: "#E85AA6",
  text: "#2b2330",
  subText: "#9b7f8c",
  label: "#b792a3",
  tagBg: "#ffe2ef",
  tagText: "#d84b95",
  panelBorder: "#f3c9db",
  panelBg: "#ffffff",
  header: "#cc3f88",
  backBg: "#ffe6f2",
  backBgHover: "#ffd9ea",
};

const PageWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 520px;
  gap: 24px;
  width: 100%;
  min-height: 100vh;
  background: ${PINK.bg};
  padding: 24px;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ListArea = styled.div`
  transition: transform 260ms ease, opacity 260ms ease;
  transform-origin: left center;

  &[data-panel-open="true"] {
    transform: translateX(0px);
  }
`;

const Header = styled.h1`
  margin: 6px 0 18px;
  font-size: 28px;
  font-weight: 800;
  color: ${PINK.header};
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid ${PINK.cardBorder};
  border-radius: 14px;
  padding: 18px 20px 14px;
  box-shadow: 0 4px 14px ${PINK.cardShadow};
  cursor: pointer;
  transition: box-shadow 180ms ease, border-color 180ms ease, transform 120ms ease;

  &:hover {
    border-color: ${PINK.cardBorderHover};
    box-shadow: 0 6px 18px ${PINK.cardShadowHover};
  }

  &[data-selected="true"] {
    border-color: ${PINK.strong};
    box-shadow: 0 8px 22px rgba(232, 90, 166, 0.2);
  }
`;

const RowBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
`;

const FromTo = styled.div`
  font-size: 18px;
  color: ${PINK.text};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Strong = styled.span`
  font-weight: 800;
  color: ${PINK.strong};
`;

const RightMeta = styled.span`
  color: ${PINK.tagText};
  font-weight: 800;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 18px;

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Col = styled.div``;

const SubLabel = styled.div`
  font-size: 12px;
  color: ${PINK.label};
  margin-bottom: 2px;
`;

const SubValue = styled.div`
  font-size: 15px;
  color: ${PINK.text};
  font-weight: 700;
`;

const DateWrap = styled.div`
  margin-top: 10px;
  text-align: right;
  font-size: 12px;
  color: ${PINK.subText};
`;

const DetailArea = styled.aside`
  position: sticky;
  top: 16px;
  height: calc(100vh - 32px);
  overflow: auto;
  background: ${PINK.panelBg};
  border: 1px solid ${PINK.panelBorder};
  border-radius: 16px;
  box-shadow: 0 8px 22px ${PINK.cardShadow};
  padding: 16px 16px 24px;
  opacity: 0;
  transform: translateX(12px);
  pointer-events: none;
  transition: transform 220ms ease, opacity 220ms ease;

  &[data-open="true"] {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }

  @media (max-width: 1200px) {
    position: static;
    height: auto;
  }
`;

const DetailHeader = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed ${PINK.panelBorder};
`;

const BackBtn = styled.button`
  border: 0;
  outline: 0;
  background: ${PINK.backBg};
  color: ${PINK.header};
  padding: 6px 10px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: ${PINK.backBgHover};
  }
`;

const DetailTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: ${PINK.text};
`;

const Today = styled.div`
  font-size: 12px;
  color: ${PINK.subText};
`;

const Section = styled.section`
  margin: 16px 6px 0;
  padding: 12px 12px 8px;
  border: 1px solid ${PINK.panelBorder};
  border-radius: 14px;
  background: #fffafd;
`;

const SectionTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 16px;
  color: ${PINK.header};
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${PINK.tagBg};
  color: ${PINK.tagText};
  font-size: 11px;
  font-weight: 900;
  vertical-align: middle;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 8px 12px;
  align-items: baseline;
  padding: 4px 0;
`;

const Key = styled.div`
  font-size: 13px;
  color: ${PINK.label};
`;

const Val = styled.div`
  font-size: 14px;
  color: ${PINK.text};
  font-weight: 700;
`;

const Muted = styled.div`
  font-size: 13px;
  color: ${PINK.subText};
`;

const RightHint = styled.div`
  text-align: right;
  color: ${PINK.subText};
  font-size: 12px;
  margin-top: 6px;
`;
