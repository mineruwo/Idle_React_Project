// src/pages/orderPage/OrderBoard.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import useCustomMove from "../../hooks/useCustomMove";
import styled from "styled-components";
import { fetchOrders } from "../../api/orderApi";
import {
  fetchOffersByOrder,
  acceptOffer,
  fetchAssignment,
  createOffer,
} from "../../api/offerApi";

/* ===== 라벨 매핑 ===== */
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
    "50kg": "~50kg",
    "100kg": "50~100kg",
    "200kg": "100~200kg",
    "300kg+": "200kg 이상",
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

/* ===== 유틸 ===== */
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

const prettyPacking = (val) => {
  if (!val) return "-";
  try {
    if (typeof val === "string" && val.trim().startsWith("{")) {
      const obj = JSON.parse(val);
      const keys = Object.entries(obj)
        .filter(([, v]) => !!v)
        .map(([k]) => packingKeyToText[k] || k);
      return keys.length ? keys.join(", ") : "-";
    }
  } catch {}
  const keys = Array.isArray(val)
    ? val
    : String(val)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  return keys.length ? keys.map((k) => packingKeyToText[k] || k).join(", ") : "-";
};

const n = (v, def = 0) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : def;
};

const isImmediateOf = (o) => (o?.isImmediate ?? o?.immediate) === true;

/** 배정 여부(아이디 기준) */
const isAssigned = (order, assign) =>
  Boolean(
    (assign && assign.assignedDriverId != null) ||
    (order && order.assignedDriverId != null)
  );

/** 카드 우측에 보이는 상태 라벨(한글) */
const statusLabelK = (s) => {
  const t = String(s || "").toUpperCase();
  switch (t) {
    case "READY":            return "대기";
    case "CREATED":          return "대기";
    case "PAYMENT_PENDING":  return "결제대기";
    case "ASSIGNED":         return "배정완료";
    case "ONGOING":          return "진행중";
    case "COMPLETED":        return "완료";
    case "CANCELLED":
    case "CANCELED":         return "취소";
    default:                 return "대기";
  }
};

/** 상세 패널 제목 옆의 태그(우선순위 반영) */
const statusK = (order, assign) => {
  const s = String(order?.status || "").toUpperCase();
  if (s === "COMPLETED")        return "완료";
  if (s === "PAYMENT_PENDING")  return "결제대기";
  if (s === "ONGOING")          return "진행중";
  const hasDriver = (assign?.assignedDriverId ?? order?.assignedDriverId) != null;
  if (hasDriver)                return "배정완료";
  return "입찰중";
};

/** 입찰 상태 한글 매핑 (✅ 새로 추가) */
const offerStatusLabelK = (s) => {
  const t = String(s || "").toUpperCase();
  switch (t) {
    case "PENDING":   return "대기";
    case "ACCEPTED":
    case "CONFIRMED": return "확정";
    case "REJECTED":  return "거절";
    case "CANCELLED":
    case "CANCELED":  return "취소";
    default:          return "대기";
  }
};

/** 입찰 가능 여부: 결제대기/완료/배정확정만 차단 */
const canBid = (order, assign) => {
  const orderStatus = String(order?.status || "").toUpperCase();
  const assignStatus = String(assign?.status || "").toUpperCase();
  const orderLocked = ["PAYMENT_PENDING", "COMPLETED"].includes(orderStatus);
  const assignLocked = ["ASSIGNED", "CONFIRMED"].includes(assignStatus);
  return !(orderLocked || assignLocked);
};

/* ===== 컴포넌트 ===== */
const OrderBoard = () => {
  const { shipperMoveToPayment } = useCustomMove();

  // 목록/선택
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // 입찰/배정
  const [offers, setOffers] = useState([]);
  const [assignment, setAssignment] = useState({
    assignedDriverId: null,
    driverPrice: null,
    status: null,
  });
  const [loadingOffers, setLoadingOffers] = useState(false);

  // 입찰 입력
  const [bidPrice, setBidPrice] = useState("");
  const [bidMemo, setBidMemo] = useState("");

  // 검색/필터
  const [q, setQ] = useState("");
  const [immediateFilter, setImmediateFilter] = useState("all"); // all | immediate | reserved
  const [vehicleFilter, setVehicleFilter] = useState(""); // '', '1ton', ...

  // 정렬
  const [sortKey, setSortKey] = useState("latest"); // latest | distance | avgPrice
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  // 페이지네이션
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const panelRef = useRef(null);
  const cardRefs = useRef({});

  /* ====== 목록 로드 ====== */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchOrders();
        const list = Array.isArray(res?.data) ? res.data : res || [];
        setOrders(list);
      } catch (e) {
        console.error("오더 목록 불러오기 실패:", e);
      }
    })();
  }, []);

  /* ====== 선택 시 입찰/배정 로드 ====== */
  const loadOfferAndAssignment = async (orderId) => {
    if (!orderId) {
      setOffers([]);
      setAssignment({ assignedDriverId: null, driverPrice: null, status: null });
      return;
    }
    setLoadingOffers(true);
    try {
      const [offersRes, assignRes] = await Promise.all([
        fetchOffersByOrder(orderId),
        fetchAssignment(orderId),
      ]);
      setOffers(Array.isArray(offersRes?.data) ? offersRes.data : offersRes || []);
      const assign = assignRes?.data || assignRes || null;
      setAssignment({
        assignedDriverId: assign?.assignedDriverId ?? null,
        driverPrice: assign?.driverPrice ?? null,
        status: assign?.status ?? null,
      });
    } catch (e) {
      console.error("오퍼/배정 로드 실패:", e);
      setOffers([]);
      setAssignment({ assignedDriverId: null, driverPrice: null, status: null });
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleSelect = async (o) => {
    setSelected(o);
    setPanelOpen(true);

    // 패널 위치 스크롤 보정
    requestAnimationFrame(() => {
      const el = cardRefs.current[o.id];
      if (!el || !panelRef.current) return;
      const cardRect = el.getBoundingClientRect();
      const panelRect = panelRef.current.getBoundingClientRect();
      const targetTop =
        window.scrollY + (cardRect.top - panelRect.top) + window.scrollY - 16;
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    });

    await loadOfferAndAssignment(o.id);
  };

  const handleBack = () => {
    setPanelOpen(false);
    setSelected(null);
    setOffers([]);
    setAssignment({ assignedDriverId: null, driverPrice: null, status: null });
    setBidPrice("");
    setBidMemo("");
  };

  // 입찰 확정
  const handleAccept = async (offerId) => {
    if (!selected) return;
    try {
      await acceptOffer(selected.id, offerId);
      // 낙관적 갱신
      setSelected((prev) => (prev ? { ...prev, status: "PAYMENT_PENDING" } : prev));
      await loadOfferAndAssignment(selected.id);
      alert("입찰 확정 완료");
    } catch (e) {
      console.error("입찰 확정 실패:", e);
      alert("입찰 확정에 실패했습니다.");
    }
  };

  // 입찰 등록
  const handleBid = async () => {
    if (!selected) return;
    const priceNum = Number(bidPrice);
    if (!priceNum || priceNum <= 0) {
      alert("유효한 제안가를 입력하세요.");
      return;
    }
    try {
      await createOffer(selected.id, { price: priceNum, memo: bidMemo || "" });
      setBidPrice("");
      setBidMemo("");
      await loadOfferAndAssignment(selected.id);
      alert("입찰이 등록되었습니다.");
    } catch (e) {
      console.error("입찰 등록 실패:", e);
      alert("입찰 등록에 실패했습니다.");
    }
  };

  const todayStr = useMemo(() => fmtDate(new Date()), []);

  // 검색/필터
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const matchText = (text) => String(text || "").toLowerCase().includes(needle);

    return orders.filter((o) => {
      const immediate = isImmediateOf(o);

      if (immediateFilter === "immediate" && !immediate) return false;
      if (immediateFilter === "reserved" && immediate) return false;
      if (vehicleFilter && o.vehicle !== vehicleFilter) return false;

      if (!needle) return true;

      const cargoTypeLabel = LABEL.cargoType[o.cargoType] || o.cargoType || "";
      const sizeLabel = LABEL.cargoSize[o.cargoSize] || o.cargoSize || "";
      const weightLabel = LABEL.weight[o.weight] || o.weight || "";
      const vehicleLabel = LABEL.vehicle[o.vehicle] || o.vehicle || "";
      const packingText = prettyPacking(o.packingOptions ?? o.packingOption);

      return (
        matchText(o.orderNo) ||
        matchText(o.departure) ||
        matchText(o.arrival) ||
        matchText(o.status) ||
        matchText(packingText) ||
        matchText(cargoTypeLabel) ||
        matchText(sizeLabel) ||
        matchText(weightLabel) ||
        matchText(vehicleLabel)
      );
    });
  }, [orders, q, immediateFilter, vehicleFilter]);

  // 정렬
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortKey === "latest") {
      arr.sort((a, b) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return tb - ta; // desc
      });
      return arr;
    }

    if (sortKey === "distance") {
      arr.sort((a, b) =>
        sortDir === "asc" ? n(a.distance) - n(b.distance) : n(b.distance) - n(a.distance)
      );
      return arr;
    }

    if (sortKey === "avgPrice") {
      const getPrice = (o) => n(o.avgPrice, n(o.proposedPrice, n(o.driverPrice, 0)));
      arr.sort((a, b) => (sortDir === "asc" ? getPrice(a) - getPrice(b) : getPrice(b) - getPrice(a)));
      return arr;
    }
    return arr;
  }, [filtered, sortKey, sortDir]);

  // 페이지네이션
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // 보드 진입 시 최상단
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  // 필터/정렬 변경 시 1페이지
  useEffect(() => {
    setPage(1);
  }, [q, immediateFilter, vehicleFilter, sortKey, sortDir, pageSize]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const resetFilters = () => {
    setQ("");
    setImmediateFilter("all");
    setVehicleFilter("");
  };

  /* 파생값 (우측 패널 재사용) */
  const confirmedPrice = assignment?.driverPrice ?? selected?.driverPrice;
  const assignedDriver = assignment?.assignedDriverId ?? selected?.assignedDriverId;

  return (
    <PageWrap>
      <ListArea data-panel-open={panelOpen}>
        <Header>오더 게시판</Header>

        {/* ===== 검색/필터 바 ===== */}
        <FilterBar>
          <SearchInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="주문번호/출발/도착/화물/차량/포장/상태 검색..."
          />

          <SelectBox value={immediateFilter} onChange={(e) => setImmediateFilter(e.target.value)}>
            <option value="all">전체(즉시+예약)</option>
            <option value="immediate">즉시</option>
            <option value="reserved">예약</option>
          </SelectBox>

          <SelectBox value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
            <option value="">차량 전체</option>
            <option value="1ton">1톤 트럭</option>
            <option value="2.5ton">2.5톤 트럭</option>
            <option value="5ton">5톤 트럭</option>
            <option value="top">탑차</option>
            <option value="cold">냉장/냉동차</option>
          </SelectBox>

          <ResetBtn onClick={resetFilters}>초기화</ResetBtn>
        </FilterBar>

        {/* ===== 정렬/페이지 ===== */}
        <ControlsRow>
          <SortGroup>
            <SortLabel>정렬</SortLabel>
            <SelectBox value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <option value="latest">최신순</option>
              <option value="distance">거리</option>
              <option value="avgPrice">평균가</option>
            </SelectBox>

            {sortKey !== "latest" && (
              <SelectBox value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
                <option value="asc">오름차순</option>
                <option value="desc">내림차순</option>
              </SelectBox>
            )}
          </SortGroup>

          <PageSizeGroup>
            <SortLabel>페이지 당</SortLabel>
            <SelectBox value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </SelectBox>
          </PageSizeGroup>
        </ControlsRow>

        <ResultMeta>
          총 {orders.length}건 중 <strong>{filtered.length}</strong>
          건(필터) → <strong>{total}</strong>건(정렬) 중 <strong>{paged.length}</strong>건 표시 (페이지 {page}/
          {totalPages})
        </ResultMeta>

        <CardList>
          {paged.map((o) => {
            const cargoTypeLabel = LABEL.cargoType[o.cargoType] || o.cargoType || "-";
            const sizeLabel = LABEL.cargoSize[o.cargoSize] || o.cargoSize || "-";
            const weightLabel = LABEL.weight[o.weight] || o.weight || "-";
            const vehicleLabel = LABEL.vehicle[o.vehicle] || o.vehicle || "-";
            const immediate = isImmediateOf(o);

            return (
              <Card
                key={o.id}
                ref={(el) => (cardRefs.current[o.id] = el)}
                onClick={() => handleSelect(o)}
                data-selected={selected?.id === o.id}
              >
                {/* 1행: 출발 → 도착 + 상태 */}
                <RowBetween>
                  <FromTo>
                    <Strong>출발</Strong> {o.departure} &nbsp;→&nbsp;
                    <Strong>도착</Strong> {o.arrival}
                  </FromTo>
                  <RightMeta>{statusLabelK(o.status)}</RightMeta>
                </RowBetween>

                {/* 2행: 주문번호 배지 */}
                <OrderNoBadge title={o.orderNo || ""}>{o.orderNo || "-"}</OrderNoBadge>

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
                    <SubValue>{prettyPacking(o.packingOptions ?? o.packingOption)}</SubValue>
                  </Col>
                  <Col>
                    <SubLabel>예약 시간</SubLabel>
                    <SubValue>
                      {immediate ? "즉시" : o.reservedDate ? fmtDateTime(o.reservedDate) : "-"}
                    </SubValue>
                  </Col>
                </InfoGrid>
              </Card>
            );
          })}
        </CardList>

        {/* ===== 페이지네이션 ===== */}
        <Pagination>
          <PageBtn disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ← 이전
          </PageBtn>

          <PageNumbers>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
              .map((p) => (
                <PageNumber key={p} data-active={p === page} onClick={() => setPage(p)}>
                  {p}
                </PageNumber>
              ))}
          </PageNumbers>

          <PageBtn disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            다음 →
          </PageBtn>
        </Pagination>
      </ListArea>

      <DetailArea ref={panelRef} data-open={panelOpen}>
        <DetailHeader>
          <BackBtn onClick={handleBack}>← 뒤로가기</BackBtn>
          <DetailTitle>오더 게시판</DetailTitle>
          <Today>{todayStr}</Today>
        </DetailHeader>

        {selected ? (
          <>
            {/* ===== 배정 뱃지 헤더 ===== */}
            <BadgeRow>
              {canBid(selected, assignment) ? (
                <BadgeGray>미배정</BadgeGray>
              ) : (
                <Badge>
                  배정: 기사 #{assignment.assignedDriverId} /{" "}
                  {Number(assignment.driverPrice ?? 0).toLocaleString()}원
                </Badge>
              )}
            </BadgeRow>

            <Section>
              <SectionTitle>
                화물 상세 정보 <StatusTag>{statusK(selected, assignment)}</StatusTag>
              </SectionTitle>
              <Row>
                <Key>주문번호</Key>
                <Val>{selected.orderNo || "-"}</Val>
              </Row>
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
                <Val>{prettyPacking(selected.packingOptions ?? selected.packingOption)}</Val>
              </Row>
              <Row>
                <Key>예약시간</Key>
                <Val>
                  {isImmediateOf(selected)
                    ? "즉시"
                    : selected.reservedDate
                    ? fmtDateTime(selected.reservedDate)
                    : "-"}
                </Val>
              </Row>
            </Section>

            <Section>
              <SectionTitle>배정된 기사</SectionTitle>
              {!canBid(selected, assignment) ? (
                <div>
                  <Row>
                    <Key>기사 ID</Key>
                    <Val>{assignedDriver}</Val>
                  </Row>
                  <Row>
                    <Key>확정가</Key>
                    <Val>
                      {confirmedPrice != null
                        ? `${Number(confirmedPrice).toLocaleString()} 원`
                        : "-"}
                    </Val>
                  </Row>
                </div>
              ) : (
                <Muted>아직 배정되지 않았습니다. 아래 입찰에서 확정하세요.</Muted>
              )}
            </Section>

            <Section>
              <SectionTitle>입찰 목록</SectionTitle>

              {loadingOffers ? (
                <Muted>불러오는 중...</Muted>
              ) : offers.length === 0 ? (
                <Muted>입찰이 아직 없습니다.</Muted>
              ) : (
                <OfferList>
                  {offers.map((o) => (
                    <OfferItem key={o.id}>
                      <div>
                        <b>{o.driverNick ? o.driverNick : `기사 #${o.driverId}`}</b> ·{" "}
                        {Number(o.price ?? 0).toLocaleString()}원
                        <small style={{ marginLeft: 8, opacity: 0.7 }}>
                          ({offerStatusLabelK(o.status)})
                        </small>
                      </div>
                      <AcceptBtn
                        disabled={!canBid(selected, assignment) || o.status !== "PENDING"}
                        onClick={() => handleAccept(o.id)}
                      >
                        입찰 확정
                      </AcceptBtn>
                    </OfferItem>
                  ))}
                </OfferList>
              )}

              {/* 입찰 등록 */}
              {canBid(selected, assignment) && (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Muted>입찰 등록:</Muted>
                  <input
                    type="number"
                    placeholder="제안가"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    style={{
                      width: 120,
                      padding: "6px 8px",
                      borderRadius: 8,
                      border: "1px solid #e5e9f2",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="메모(선택)"
                    value={bidMemo}
                    onChange={(e) => setBidMemo(e.target.value)}
                    style={{
                      width: 260,
                      padding: "6px 8px",
                      borderRadius: 8,
                      border: "1px solid #e5e9f2",
                    }}
                  />
                  <AcceptBtn onClick={handleBid}>등록</AcceptBtn>
                </div>
              )}
            </Section>

            <Section>
              <SectionTitle>운임 정보</SectionTitle>
              <Row>
                <Key>기사 제안가</Key>
                <Val>
                  {assignment?.driverPrice != null
                    ? `${Number(assignment.driverPrice).toLocaleString()} 원`
                    : selected.driverPrice
                    ? `${Number(selected.driverPrice).toLocaleString()} 원`
                    : "-"}
                </Val>
              </Row>
              <Row>
                <Key>화주 제안가</Key>
                <Val>
                  {selected.proposedPrice
                    ? `${Number(selected.proposedPrice).toLocaleString()} 원`
                    : "-"}
                </Val>
              </Row>
              <Row>
                <Key>평균가</Key>
                <Val>
                  {selected.avgPrice
                    ? `${Number(selected.avgPrice).toLocaleString()} 원`
                    : "-"}
                </Val>
              </Row>
              <RightHint>
                예상 거리{" "}
                {selected.distance != null
                  ? `${Number(selected.distance).toFixed(2)}km`
                  : "-"}
              </RightHint>
            </Section>

            {selected?.status === "PAYMENT_PENDING" && selected?.driverPrice != null && (
              <Section style={{ marginTop: 16 }}>
                <AcceptBtn onClick={() => shipperMoveToPayment(selected)}>
                  {Number(selected.driverPrice).toLocaleString()}원 결제하기
                </AcceptBtn>
              </Section>
            )}
          </>
        ) : null}
      </DetailArea>
    </PageWrap>
  );
};

export default OrderBoard;

/* ===== 스타일 ===== */
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
  @media (max-width: 600px) {
    padding: 16px;
    gap: 16px;
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
  margin: 6px 0 12px;
  font-size: clamp(22px, 2.4vw, 28px);
  font-weight: 800;
  color: ${PINK.header};
`;

const FilterBar = styled.div`
  display: grid;
  grid-template-columns: 1fr 160px 160px auto;
  gap: 10px;
  margin: 8px 0 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const SearchInput = styled.input`
  height: 42px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${PINK.cardBorder};
  background: #fff;
  font-size: 16px;
  box-shadow: 0 2px 8px ${PINK.cardShadow};
  outline: none;

  &:focus {
    border-color: ${PINK.cardBorderHover};
  }
`;

const SelectBox = styled.select`
  height: 42px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${PINK.cardBorder};
  background: #fff;
  font-size: 16px;
  box-shadow: 0 2px 8px ${PINK.cardShadow};
  outline: none;

  &:focus {
    border-color: ${PINK.cardBorderHover};
  }
`;

const ResetBtn = styled.button`
  height: 42px;
  padding: 0 14px;
  border-radius: 10px;
  border: 0;
  background: ${PINK.backBg};
  color: ${PINK.header};
  font-weight: 800;
  cursor: pointer;
  &:hover {
    background: ${PINK.backBgHover};
  }
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 8px;
  flex-wrap: wrap;
`;

const SortGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PageSizeGroup = styled(SortGroup)``;

const SortLabel = styled.span`
  font-size: 13px;
  color: ${PINK.label};
  font-weight: 700;
`;

const ResultMeta = styled.div`
  margin: -2px 0 10px;
  font-size: 13px;
  color: ${PINK.subText};
  strong {
    color: ${PINK.header};
  }
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
  margin-bottom: 10px;
  gap: 8px;
  flex-wrap: wrap;
`;

const FromTo = styled.div`
  font-size: 18px;
  color: ${PINK.text};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  @media (max-width: 520px) {
    white-space: normal;
    line-height: 1.35;
  }
`;

const Strong = styled.span`
  font-weight: 800;
  color: ${PINK.strong};
`;

const RightMeta = styled.span`
  color: ${PINK.tagText};
  font-weight: 800;
`;

const OrderNoBadge = styled.div`
  display: inline-block;
  margin: 2px 0 10px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef3ff;
  color: #3b5bcc;
  font-weight: 900;
  font-size: 12px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 18px;

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
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

const Pagination = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin: 18px 0 8px;
  flex-wrap: wrap;
`;

const PageBtn = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 0;
  background: ${PINK.backBg};
  color: ${PINK.header};
  font-weight: 800;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const PageNumber = styled.button`
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${PINK.cardBorder};
  background: #fff;
  color: ${PINK.text};
  font-weight: 800;
  cursor: pointer;
  &[data-active="true"] {
    background: ${PINK.tagBg};
    color: ${PINK.tagText};
    border-color: ${PINK.tagText};
  }
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
    margin-top: 8px;
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

const BadgeRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 10px 6px 0;
`;
const Badge = styled.span`
  background: #113f67;
  color: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 900;
`;
const BadgeGray = styled(Badge)`
  background: #c4cbd6;
`;

const OfferList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const OfferItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid ${PINK.panelBorder};
  border-radius: 10px;
  background: #fff;
`;
const AcceptBtn = styled.button`
  border: 0;
  outline: 0;
  padding: 6px 10px;
  border-radius: 8px;
  background: ${PINK.tagBg};
  color: ${PINK.tagText};
  font-weight: 900;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const RightHint = styled.div`
  text-align: right;
  color: ${PINK.subText};
  font-size: 12px;
  margin-top: 6px;
`;
