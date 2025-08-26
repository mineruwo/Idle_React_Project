// src/pages/orderPage/OrderBoard.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import useCustomMove from "../../hooks/useCustomMove";
import { fetchOrders } from "../../api/orderApi";
import styled from "styled-components";
import {
  fetchOffersByOrder,
  acceptOffer,
  fetchAssignment,
  createOffer,
} from "../../api/offerApi";

// ===== 입찰 하한가 설정 =====
const AVERAGE_PRICE_PER_KM = 3000;    // OrderForm과 동일
const MIN_BID_RATE = 0.6;             // 평균가의 60% 하한

const _num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const basePriceFor = (o) =>
  _num(o?.avgPrice) ||
  (o?.distance ? Math.round(_num(o.distance) * AVERAGE_PRICE_PER_KM) : 0) ||
  _num(o?.proposedPrice);

const minDriverBid = (o) => Math.max(0, Math.floor(basePriceFor(o) * MIN_BID_RATE));

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

/** 배정 여부 */
const isAssigned = (order, assign) =>
  Boolean(
    (assign && assign.assignedDriverId != null) ||
      (order && order.assignedDriverId != null)
  );

/** 카드 상태 라벨 */
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

/** 상세 패널 상태 라벨 */
const statusK = (order, assign) => {
  const s = String(order?.status || "").toUpperCase();
  if (s === "COMPLETED")        return "완료";
  if (s === "PAYMENT_PENDING")  return "결제대기";
  if (s === "ONGOING")          return "진행중";
  const hasDriver = (assign?.assignedDriverId ?? order?.assignedDriverId) != null;
  if (hasDriver)                return "배정완료";
  return "입찰중";
};

/** 입찰 상태 라벨 */
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

/** 입찰 가능 여부 */
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

  // 검색/필터/정렬/페이지
  const [q, setQ] = useState("");
  const [immediateFilter, setImmediateFilter] = useState("all"); // all | immediate | reserved
  const [vehicleFilter, setVehicleFilter] = useState("");        // '', '1ton', ...
  const [sortKey, setSortKey] = useState("latest");              // latest | distance | avgPrice
  const [sortDir, setSortDir] = useState("asc");                 // asc | desc
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const cardRefs = useRef({});

  /* 목록 로드 */
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

  /* 선택 시 입찰/배정 로드 */
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
    // 스크롤 살짝 보정
    requestAnimationFrame(() => {
      const el = cardRefs.current[o.id];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - 20), behavior: "smooth" });
    });
    await loadOfferAndAssignment(o.id);
  };

  const handleBack = () => {
    setSelected(null);
    setOffers([]);
    setAssignment({ assignedDriverId: null, driverPrice: null, status: null });
    setBidPrice("");
    setBidMemo("");
  };

  const handleAccept = async (offerId) => {
    if (!selected) return;
    try {
      await acceptOffer(selected.id, offerId);
      setSelected((prev) => (prev ? { ...prev, status: "PAYMENT_PENDING" } : prev));
      await loadOfferAndAssignment(selected.id);
      alert("입찰 확정 완료");
    } catch (e) {
      console.error("입찰 확정 실패:", e);
      alert("입찰 확정에 실패했습니다.");
    }
  };

  const handleBid = async () => {
    if (!selected) return;
    const priceNum = Number(bidPrice);
    if (!priceNum || priceNum <= 0) {
      alert("유효한 제안가를 입력하세요.");
      return;
    }
    const floor = minDriverBid(selected);
    if (priceNum < floor) {
      alert(`최소 제안가는 ${floor.toLocaleString()}원 입니다.`);
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
  useEffect(() => setPage(1), [q, immediateFilter, vehicleFilter, sortKey, sortDir, pageSize]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const resetFilters = () => {
    setQ("");
    setImmediateFilter("all");
    setVehicleFilter("");
  };

  // 파생값
  const confirmedPrice = assignment?.driverPrice ?? selected?.driverPrice;
  const assignedDriver = assignment?.assignedDriverId ?? selected?.assignedDriverId;

  return (
    <div style={{ padding: 16 }}>
      <h1>오더 게시판</h1>

      {/* 검색/필터 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px auto", gap: 8, maxWidth: 980 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="주문번호/출발/도착/화물/차량/포장/상태 검색..."
        />
        <select value={immediateFilter} onChange={(e) => setImmediateFilter(e.target.value)}>
          <option value="all">전체(즉시+예약)</option>
          <option value="immediate">즉시</option>
          <option value="reserved">예약</option>
        </select>
        <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
          <option value="">차량 전체</option>
          <option value="1ton">1톤 트럭</option>
          <option value="2.5ton">2.5톤 트럭</option>
          <option value="5ton">5톤 트럭</option>
          <option value="top">탑차</option>
          <option value="cold">냉장/냉동차</option>
        </select>
        <button onClick={resetFilters}>초기화</button>
      </div>

      {/* 정렬/페이지 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
        <span>정렬</span>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
          <option value="latest">최신순</option>
          <option value="distance">거리</option>
          <option value="avgPrice">평균가</option>
        </select>
        {sortKey !== "latest" && (
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
            <option value="asc">오름차순</option>
            <option value="desc">내림차순</option>
          </select>
        )}

        <span style={{ marginLeft: 16 }}>페이지 당</span>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      <div style={{ marginTop: 6, fontSize: 12 }}>
        총 {orders.length}건 중 <b>{filtered.length}</b>건(필터) → <b>{total}</b>건(정렬) 중{" "}
        <b>{paged.length}</b>건 표기 (페이지 {page}/{totalPages})
      </div>

      {/* 카드 리스트 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
        {paged.map((o) => {
          const cargoTypeLabel = LABEL.cargoType[o.cargoType] || o.cargoType || "-";
          const sizeLabel = LABEL.cargoSize[o.cargoSize] || o.cargoSize || "-";
          const weightLabel = LABEL.weight[o.weight] || o.weight || "-";
          const vehicleLabel = LABEL.vehicle[o.vehicle] || o.vehicle || "-";
          const immediate = isImmediateOf(o);

          return (
            <div
              key={o.id}
              ref={(el) => (cardRefs.current[o.id] = el)}
              onClick={() => handleSelect(o)}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <b>출발</b> {o.departure} &nbsp;→&nbsp; <b>도착</b> {o.arrival}
                </div>
                <div>{statusLabelK(o.status)}</div>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#555" }}>주문번호: {o.orderNo || "-"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 8 }}>
                <div>화물: {cargoTypeLabel}</div>
                <div>크기: {sizeLabel}</div>
                <div>무게: {weightLabel}</div>
                <div>차량: {vehicleLabel}</div>
                <div>포장: {prettyPacking(o.packingOptions ?? o.packingOption)}</div>
                <div>예약: {immediate ? "즉시" : o.reservedDate ? fmtDateTime(o.reservedDate) : "-"}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 페이지네이션 */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", margin: 12 }}>
        <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          ← 이전
        </button>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
            .map((p) => (
              <button key={p} onClick={() => setPage(p)} disabled={p === page}>
                {p}
              </button>
            ))}
        </div>
        <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          다음 →
        </button>
      </div>

      {/* 상세 패널 */}
      {selected && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={handleBack}>← 뒤로가기</button>
            <h2 style={{ margin: 0 }}>
              화물 상세 정보 <span style={{ fontSize: 14 }}>({statusK(selected, assignment)})</span>
            </h2>
            <div style={{ fontSize: 12, color: "#666" }}>{todayStr}</div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div>주문번호: {selected.orderNo || "-"}</div>
            <div>출발지: {selected.departure}</div>
            <div>도착지: {selected.arrival}</div>
            <div>화물: {LABEL.cargoType[selected.cargoType] || selected.cargoType || "-"}</div>
            <div>크기: {LABEL.cargoSize[selected.cargoSize] || selected.cargoSize || "-"}</div>
            <div>무게: {LABEL.weight[selected.weight] || selected.weight || "-"}</div>
            <div>차량: {LABEL.vehicle[selected.vehicle] || selected.vehicle || "-"}</div>
            <div>포장: {prettyPacking(selected.packingOptions ?? selected.packingOption)}</div>
            <div>
              예약시간:{" "}
              {isImmediateOf(selected) ? "즉시" : selected.reservedDate ? fmtDateTime(selected.reservedDate) : "-"}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <h3 style={{ margin: "8px 0" }}>배정 상태</h3>
            {!canBid(selected, assignment) ? (
              <>
                <div>기사 ID: {assignedDriver}</div>
                <div>
                  확정가:{" "}
                  {confirmedPrice != null ? `${Number(confirmedPrice).toLocaleString()} 원` : "-"}
                </div>
              </>
            ) : (
              <div>아직 배정되지 않았습니다. 아래 입찰에서 확정하세요.</div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <h3 style={{ margin: "8px 0" }}>입찰 목록</h3>
            {loadingOffers ? (
              <div>불러오는 중...</div>
            ) : offers.length === 0 ? (
              <div>입찰이 아직 없습니다.</div>
            ) : (
              offers.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: 8,
                    border: "1px solid #eee",
                    borderRadius: 6,
                    marginTop: 6,
                  }}
                >
                  <div>
                    <b>{o.driverNick ? o.driverNick : `기사 #${o.driverId}`}</b> ·{" "}
                    {Number(o.price ?? 0).toLocaleString()}원
                    <small style={{ marginLeft: 8, opacity: 0.7 }}>
                      ({offerStatusLabelK(o.status)})
                    </small>
                  </div>
                  <div>
                    <button
                      disabled={!canBid(selected, assignment) || o.status !== "PENDING"}
                      onClick={() => handleAccept(o.id)}
                    >
                      입찰 확정
                    </button>
                  </div>
                </div>
              ))
            )}

            {canBid(selected, assignment) && (
              <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <span>입찰 등록:</span>
                <input
                  type="number"
                  placeholder={`제안가 (최소 ${minDriverBid(selected).toLocaleString()}원)`}
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  style={{ width: 140 }}
                />
                <input
                  type="text"
                  placeholder="메모(선택)"
                  value={bidMemo}
                  onChange={(e) => setBidMemo(e.target.value)}
                  style={{ width: 260 }}
                />
                <button onClick={handleBid}>등록</button>
                <div style={{ fontSize: 12, color: "#666" }}>
                  최소 제안가: {minDriverBid(selected).toLocaleString()}원
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <h3 style={{ margin: "8px 0" }}>운임 정보</h3>
            <div>
              기사 제안가:{" "}
              {assignment?.driverPrice != null
                ? `${Number(assignment.driverPrice).toLocaleString()} 원`
                : selected.driverPrice
                ? `${Number(selected.driverPrice).toLocaleString()} 원`
                : "-"}
            </div>
            <div>
              화주 제안가:{" "}
              {selected.proposedPrice ? `${Number(selected.proposedPrice).toLocaleString()} 원` : "-"}
            </div>
            <div>평균가: {selected.avgPrice ? `${Number(selected.avgPrice).toLocaleString()} 원` : "-"}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              예상 거리 {selected.distance != null ? `${Number(selected.distance).toFixed(2)}km` : "-"}
            </div>
          </div>

          {selected?.status === "PAYMENT_PENDING" && selected?.driverPrice != null && (
            <div style={{ marginTop: 16 }}>
              <button onClick={() => shipperMoveToPayment(selected)}>
                {Number(selected.driverPrice).toLocaleString()}원 결제하기
              </button>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button onClick={handleBack}>← 목록으로</button>
          </div>
        </div>
      )}
    </div>
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

// ===== 하한가 표시용 CSS =====
const MinBidHint = styled.div`
  font-size: 12px;
  color: #9b7f8c;   /* 기존 서브 텍스트 색상 톤 */
  margin-left: 6px;
`;

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
