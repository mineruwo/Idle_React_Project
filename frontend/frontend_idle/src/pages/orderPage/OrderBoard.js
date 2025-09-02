import React, { useEffect, useMemo, useRef, useState } from "react";
import useCustomMove from "../../hooks/useCustomMove";
import { useAuth } from "../../auth/AuthProvider";

import { fetchMyOrders, fetchOrders } from "../../api/orderApi";
import {
    fetchOffersByOrder,
    acceptOffer,
    fetchAssignment,
    createOffer,
} from "../../api/offerApi";

import BidDialog from "./BidDialog";

// CSS 연결
import "../../orderCss/OrderBoard.css";

/* ================== 상수/유틸 ================== */
const AVERAGE_PRICE_PER_KM = 3000; // OrderForm과 동일
const MIN_BID_RATE = 0.6;

const _num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const basePriceFor = (o) =>
    _num(o?.avgPrice) ||
    (o?.distance ? Math.round(_num(o.distance) * AVERAGE_PRICE_PER_KM) : 0) ||
    _num(o?.proposedPrice);

const minDriverBid = (o) =>
    Math.max(0, Math.floor(basePriceFor(o) * MIN_BID_RATE));

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

const PACK_TEXT = {
    special: "특수포장",
    normal: "일반포장",
    expensive: "고가화물",
    fragile: "파손위험물",
};

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
                .map(([k]) => PACK_TEXT[k] || k);
            return keys.length ? keys.join(", ") : "-";
        }
    } catch {}
    const arr = Array.isArray(val)
        ? val
        : String(val)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
    return arr.length ? arr.map((k) => PACK_TEXT[k] || k).join(", ") : "-";
};
const n = (v, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);
const isImmediateOf = (o) => (o?.isImmediate ?? o?.immediate) === true;

const isAssigned = (order, assign) =>
    Boolean(
        (assign && assign.assignedDriverId != null) ||
            (order && order.assignedDriverId != null)
    );

const statusK = (order, assign) => {
    if (isAssigned(order, assign)) return "완료";
    const s = String(order?.status || "").toUpperCase();
    if (s === "PAYMENT_PENDING" || s === "CREATED") return "결제대기";
    return "입찰중";
};
const offerStatusK = (s) => {
    const t = String(s || "").toUpperCase();
    switch (t) {
        case "PENDING":
            return "대기";
        case "ACCEPTED":
        case "CONFIRMED":
            return "확정";
        case "REJECTED":
            return "거절";
        case "CANCELLED":
        case "CANCELED":
            return "취소";
        default:
            return "대기";
    }
};
const canBid = (order, assign) => {
    const orderStatus = String(order?.status || "").toUpperCase();
    const assignStatus = String(assign?.status || "").toUpperCase();
    const orderLocked = [
        "PAYMENT_PENDING",
        "READY",
        "ONGOING",
        "COMPLETED",
    ].includes(orderStatus);
    const assignLocked = ["ASSIGNED", "CONFIRMED"].includes(assignStatus);
    return !(orderLocked || assignLocked);
};

/* ================== 메인 컴포넌트 ================== */
const OrderBoard = () => {
    const { shipperMoveToPayment } = useCustomMove();
    const { authenticated, profile } = useAuth();

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

    // 모달(캐리어용 입찰 등록)
    const [bidOpen, setBidOpen] = useState(false);

    // 검색/필터/정렬/페이지
    const [q, setQ] = useState("");
    const [immediateFilter, setImmediateFilter] = useState("all");
    const [vehicleFilter, setVehicleFilter] = useState("");
    const [sortKey, setSortKey] = useState("latest"); // latest | distance | avgPrice
    const [sortDir, setSortDir] = useState("asc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const panelRef = useRef(null);
    const cardRefs = useRef({});

    const userRole = profile?.role?.toUpperCase();

    /* 목록 로드 */
    useEffect(() => {
        if (!authenticated || !profile?.role) {
            setOrders([]);
            return;
        }
        const run = async () => {
            try {
                let data;
                if (userRole === "CARRIER") data = await fetchOrders();
                else data = await fetchMyOrders();
                setOrders(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("fetch orders fail:", e);
                setOrders([]);
            }
        };
        run();
    }, [authenticated, profile, userRole]);

    /* 카드 선택 → 패널 열기 + 오퍼/배정 로드 */
    const loadOfferAndAssignment = async (orderId) => {
        setLoadingOffers(true);
        try {
            const [offersRes, assignRes] = await Promise.all([
                fetchOffersByOrder(orderId),
                fetchAssignment(orderId),
            ]);
            const newOffers = Array.isArray(offersRes.data)
                ? offersRes.data
                : [];
            const newAssignment = assignRes.data || {
                assignedDriverId: null,
                driverPrice: null,
                status: null,
            };
            setOffers(newOffers);
            setAssignment(newAssignment);
            return { newOffers, newAssignment };
        } catch (e) {
            console.error("load offer/assign fail:", e);
            setOffers([]);
            setAssignment({
                assignedDriverId: null,
                driverPrice: null,
                status: null,
            });
            return { newOffers: [], newAssignment: null };
        } finally {
            setLoadingOffers(false);
        }
    };

    const handleSelect = async (o) => {
        setSelected(o);
        setPanelOpen(true);
        await loadOfferAndAssignment(o.id);

        // 선택 카드와 패널 위치 보정(부드럽게)
        requestAnimationFrame(() => {
            const el = cardRefs.current[o.id];
            if (!el || !panelRef.current) return;
            const cardRect = el.getBoundingClientRect();
            const panelRect = panelRef.current.getBoundingClientRect();
            const targetTop =
                window.scrollY + (cardRect.top - panelRect.top) - 16;
            window.scrollTo({ top: targetTop, behavior: "smooth" });
        });
    };

    const handleBack = () => {
        setPanelOpen(false);
        setSelected(null);
        setOffers([]);
        setAssignment({
            assignedDriverId: null,
            driverPrice: null,
            status: null,
        });
    };

    const handleAccept = async (offerId) => {
        if (!selected) return;
        try {
            await acceptOffer(offerId);
            alert("입찰 확정 완료");

            const { newAssignment } = await loadOfferAndAssignment(selected.id);

            if (newAssignment) {
                const updatedOrderProps = {
                    status: "PAYMENT_PENDING",
                    driverPrice: newAssignment.driverPrice,
                };
                setSelected((prev) =>
                    prev ? { ...prev, ...updatedOrderProps } : null
                );
                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === selected.id
                            ? { ...o, ...updatedOrderProps }
                            : o
                    )
                );
            }
        } catch (e) {
            console.error("accept fail:", e);
            alert("입찰 확정에 실패했습니다.");
        }
    };

    const handleBidSubmit = async ({
        price,
        memo,
        vehicleName,
        ton,
        cargoType,
    }) => {
        if (!selected) return;
        try {
            await createOffer({
                orderId: selected.id,
                price,
                memo: memo || "",
                vehicleName,
                ton,
                cargoType,
            });
            setBidOpen(false);
            await loadOfferAndAssignment(selected.id);
            alert("입찰이 등록되었습니다.");
        } catch (e) {
            console.error("create offer fail:", e);
            alert("입찰 등록에 실패했습니다.");
        }
    };

    const todayStr = useMemo(() => fmtDate(new Date()), []);

    /* 검색/필터 */
    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        const match = (t) =>
            String(t || "")
                .toLowerCase()
                .includes(needle);

        return orders.filter((o) => {
            if (o.status === "COMPLETED") return false;
            const immediate = isImmediateOf(o);

            if (immediateFilter === "immediate" && !immediate) return false;
            if (immediateFilter === "reserved" && immediate) return false;
            if (vehicleFilter && o.vehicle !== vehicleFilter) return false;

            if (!needle) return true;

            const cargoTypeLabel =
                LABEL.cargoType[o.cargoType] || o.cargoType || "";
            const sizeLabel = LABEL.cargoSize[o.cargoSize] || o.cargoSize || "";
            const weightLabel = LABEL.weight[o.weight] || o.weight || "";
            const vehicleLabel = LABEL.vehicle[o.vehicle] || o.vehicle || "";
            const packingText = prettyPacking(
                o.packingOptions ?? o.packingOption
            );

            return (
                match(o.orderNo) ||
                match(o.departure) ||
                match(o.arrival) ||
                match(o.status) ||
                match(packingText) ||
                match(cargoTypeLabel) ||
                match(sizeLabel) ||
                match(weightLabel) ||
                match(vehicleLabel)
            );
        });
    }, [orders, q, immediateFilter, vehicleFilter]);

    /* 정렬 */
    const sorted = useMemo(() => {
        const arr = [...filtered];
        if (sortKey === "latest") {
            arr.sort((a, b) => {
                const ta = new Date(a.createdAt || 0).getTime();
                const tb = new Date(b.createdAt || 0).getTime();
                return tb - ta; // 최신순 (desc)
            });
            return arr;
        }
        if (sortKey === "distance") {
            arr.sort((a, b) =>
                sortDir === "asc"
                    ? n(a.distance) - n(b.distance)
                    : n(b.distance) - n(a.distance)
            );
            return arr;
        }
        if (sortKey === "avgPrice") {
            const getP = (o) =>
                n(o.avgPrice, n(o.proposedPrice, n(o.driverPrice, 0)));
            arr.sort((a, b) =>
                sortDir === "asc" ? getP(a) - getP(b) : getP(b) - getP(a)
            );
            return arr;
        }
        return arr;
    }, [filtered, sortKey, sortDir]);

    /* 페이지네이션 */
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    useEffect(
        () => setPage(1),
        [q, immediateFilter, vehicleFilter, sortKey, sortDir, pageSize]
    );

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, page, pageSize]);

    const resetFilters = () => {
        setQ("");
        setImmediateFilter("all");
        setVehicleFilter("");
    };

    /* 파생 값 */
    const currentStatus = String(
        assignment?.status ?? selected?.status ?? ""
    ).toUpperCase();
    const confirmedPrice = assignment?.driverPrice ?? selected?.driverPrice;
    const assignedDriver =
        assignment?.assignedDriverId ?? selected?.assignedDriverId;

    return (
        <div className="page-wrap">
            {/* 왼쪽: 리스트 */}
            <div className="list-area" data-panel-open={panelOpen}>
                <h1 className="header">오더 게시판</h1>

                {/* 검색/필터 */}
                <div className="filter-bar">
                    <input
                        className="search-input"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="주문번호/출발/도착/화물/차량/포장/상태 검색..."
                    />

                    <select
                        className="select-box"
                        value={immediateFilter}
                        onChange={(e) => setImmediateFilter(e.target.value)}
                    >
                        <option value="all">전체(즉시+예약)</option>
                        <option value="immediate">즉시</option>
                        <option value="reserved">예약</option>
                    </select>

                    <select
                        className="select-box"
                        value={vehicleFilter}
                        onChange={(e) => setVehicleFilter(e.target.value)}
                    >
                        <option value="">차량 전체</option>
                        <option value="1ton">1톤 트럭</option>
                        <option value="2.5ton">2.5톤 트럭</option>
                        <option value="5ton">5톤 트럭</option>
                        <option value="top">탑차</option>
                        <option value="cold">냉장/냉동차</option>
                    </select>

                    <button className="reset-btn" onClick={resetFilters}>
                        초기화
                    </button>
                </div>

                {/* 정렬/페이지 */}
                <div className="controls-row">
                    <div className="sort-group">
                        <span className="sort-label">정렬</span>
                        <select
                            className="select-box"
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value)}
                        >
                            <option value="latest">최신순</option>
                            <option value="distance">거리</option>
                            <option value="avgPrice">평균가</option>
                        </select>

                        {sortKey !== "latest" && (
                            <select
                                className="select-box"
                                value={sortDir}
                                onChange={(e) => setSortDir(e.target.value)}
                            >
                                <option value="asc">오름차순</option>
                                <option value="desc">내림차순</option>
                            </select>
                        )}
                    </div>

                    <div className="sort-group page-size-group">
                        <span className="sort-label">페이지 당</span>
                        <select
                            className="select-box"
                            value={pageSize}
                            onChange={(e) =>
                                setPageSize(Number(e.target.value))
                            }
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                </div>

                <div className="result-meta">
                    총 {orders.length}건 중 <strong>{filtered.length}</strong>
                    건(필터) → <strong>{total}</strong>건(정렬) 중{" "}
                    <strong>{paged.length}</strong>건 표시 (페이지 {page}/
                    {totalPages})
                </div>

                {/* 카드 목록 */}
                <div className="card-list">
                    {paged.map((o) => {
                        const cargoTypeLabel =
                            LABEL.cargoType[o.cargoType] || o.cargoType || "-";
                        const sizeLabel =
                            LABEL.cargoSize[o.cargoSize] || o.cargoSize || "-";
                        const weightLabel =
                            LABEL.weight[o.weight] || o.weight || "-";
                        const vehicleLabel =
                            LABEL.vehicle[o.vehicle] || o.vehicle || "-";
                        const immediate = isImmediateOf(o);

                        return (
                            <div
                                key={o.id}
                                ref={(el) => (cardRefs.current[o.id] = el)}
                                className={`card ${
                                    selected?.id === o.id ? "selected" : ""
                                }`}
                                onClick={() => handleSelect(o)}
                            >
                                <div className="row-between">
                                    <div className="from-to">
                                        <span className="strong">출발</span>{" "}
                                        {o.departure} &nbsp;→&nbsp;
                                        <span className="strong">
                                            도착
                                        </span>{" "}
                                        {o.arrival}
                                    </div>
                                    <span className="right-meta">
                                        {o.status || "READY"}
                                    </span>
                                </div>

                                {/* 주문번호 배지 : 글자 길이에 맞춰 자동폭 */}
                                <div
                                    className="order-no-badge"
                                    title={o.orderNo || ""}
                                >
                                    {o.orderNo || "-"}
                                </div>

                                <div className="info-grid">
                                    <div>
                                        <div className="sub-label">
                                            화물 종류
                                        </div>
                                        <div className="sub-value">
                                            {cargoTypeLabel}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="sub-label">크기</div>
                                        <div className="sub-value">
                                            {sizeLabel}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="sub-label">무게</div>
                                        <div className="sub-value">
                                            {weightLabel}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="sub-label">차량</div>
                                        <div className="sub-value">
                                            {vehicleLabel}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="sub-label">포장</div>
                                        <div className="sub-value">
                                            {prettyPacking(
                                                o.packingOptions ??
                                                    o.packingOption
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="sub-label">
                                            예약 시간
                                        </div>
                                        <div className="sub-value">
                                            {immediate
                                                ? "즉시"
                                                : o.reservedDate
                                                ? fmtDateTime(o.reservedDate)
                                                : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 페이지네이션 */}
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        ← 이전
                    </button>

                    <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .slice(
                                Math.max(0, page - 3),
                                Math.max(0, page - 3) + 5
                            )
                            .map((p) => (
                                <button
                                    key={p}
                                    className={`page-number ${
                                        p === page ? "active" : ""
                                    }`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                    </div>

                    <button
                        className="page-btn"
                        disabled={page === totalPages}
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                    >
                        다음 →
                    </button>
                </div>
            </div>

            {/* 오른쪽: 상세 패널 */}
            <aside
                ref={panelRef}
                className={`detail-area ${panelOpen && selected ? "open" : ""}`}
            >
                <div className="detail-header">
                    <button className="btn-back" onClick={handleBack}>
                        ← 뒤로가기
                    </button>
                    <h2 className="detail-title">오더 게시판</h2>
                    <div className="today">{todayStr}</div>
                </div>

                {selected && (
                    <>
                        <div className="badge-row">
                            {isAssigned(selected, assignment) ? (
                                <span className="badge">
                                    배정:{" "}
                                    {selected?.assignedDriverNickname ||
                                        `Driver #${assignedDriver}`}{" "}
                                    /{" "}
                                    {Number(
                                        confirmedPrice ?? 0
                                    ).toLocaleString()}
                                    원
                                </span>
                            ) : (
                                <span className="badge-gray">미배정</span>
                            )}
                        </div>

                        <section className="section">
                            <h3 className="section-title">
                                화물 상세 정보{" "}
                                <span className="status-tag">
                                    {statusK(selected, assignment)}
                                </span>
                            </h3>

                            <div className="row">
                                <div className="key">주문번호</div>
                                <div className="val">
                                    {selected.orderNo || "-"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="key">출발지</div>
                                <div className="val">{selected.departure}</div>
                            </div>
                            <div className="row">
                                <div className="key">도착지</div>
                                <div className="val">{selected.arrival}</div>
                            </div>
                            <div className="row">
                                <div className="key">화물 종류</div>
                                <div className="val">
                                    {LABEL.cargoType[selected.cargoType] ||
                                        selected.cargoType ||
                                        "-"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="key">크기</div>
                                <div className="val">
                                    {LABEL.cargoSize[selected.cargoSize] ||
                                        selected.cargoSize ||
                                        "-"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="key">무게</div>
                                <div className="val">
                                    {LABEL.weight[selected.weight] ||
                                        selected.weight ||
                                        "-"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="key">차량 종류</div>
                                <div className="val">
                                    {LABEL.vehicle[selected.vehicle] ||
                                        selected.vehicle ||
                                        "-"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="key">포장 여부</div>
                                <div className="val">
                                    {prettyPacking(
                                        selected.packingOptions ??
                                            selected.packingOption
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="key">예약시간</div>
                                <div className="val">
                                    {isImmediateOf(selected)
                                        ? "즉시"
                                        : selected.reservedDate
                                        ? fmtDateTime(selected.reservedDate)
                                        : "-"}
                                </div>
                            </div>
                        </section>

                        <section className="section">
                            <h3 className="section-title">배정된 기사</h3>
                            {isAssigned(selected, assignment) ? (
                                <>
                                    <div className="row">
                                        <div className="key">기사 닉네임</div>
                                        <div className="val">
                                            {selected?.assignedDriverNickname ||
                                                "-"}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="key">확정가</div>
                                        <div className="val">
                                            {confirmedPrice != null
                                                ? `${Number(
                                                      confirmedPrice
                                                  ).toLocaleString()} 원`
                                                : "-"}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="muted">
                                    아직 배정되지 않았습니다. 아래 입찰에서
                                    확정하세요.
                                </div>
                            )}
                        </section>

                        <section className="section">
                            <h3 className="section-title">입찰 목록</h3>
                            {loadingOffers ? (
                                <div>불러오는 중...</div>
                            ) : offers.length === 0 ? (
                                <div className="muted">
                                    입찰이 아직 없습니다.
                                </div>
                            ) : (
                                <div className="offer-list">
                                    {offers.map((o) => {
                                        const driverDisplay =
                                            o.driverNickname ||
                                            `기사 #${o.driverIdNum}`;

                                        return (
                                            <div
                                                key={o.id}
                                                className="offer-item"
                                            >
                                                <div>
                                                    <b>{driverDisplay}</b> ·{" "}
                                                    {Number(
                                                        o.price ?? 0
                                                    ).toLocaleString()}
                                                    원
                                                    <small
                                                        style={{
                                                            marginLeft: 8,
                                                            opacity: 0.7,
                                                        }}
                                                    >
                                                        (
                                                        {offerStatusK(o.status)}
                                                        )
                                                    </small>
                                                </div>
                                                <div>
                                                    {userRole === "SHIPPER" && (
                                                        <button
                                                            className="accept-btn"
                                                            disabled={
                                                                !canBid(
                                                                    selected,
                                                                    assignment
                                                                ) ||
                                                                o.status !==
                                                                    "PENDING"
                                                            }
                                                            onClick={() =>
                                                                handleAccept(
                                                                    o.id
                                                                )
                                                            }
                                                        >
                                                            입찰 확정
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* 캐리어: 입찰 등록 버튼 + 모달 */}
                            {userRole === "CARRIER" &&
                                canBid(selected, assignment) && (
                                    <>
                                        <div
                                            style={{
                                                marginTop: 10,
                                                paddingTop: 10,
                                                borderTop: "1px solid #eee",
                                                display: "flex",
                                                justifyContent: "flex-end",
                                            }}
                                        >
                                            <button
                                                className="accept-btn"
                                                onClick={() => setBidOpen(true)}
                                            >
                                                입찰 등록
                                            </button>
                                        </div>

                                        <BidDialog
                                            open={bidOpen}
                                            onClose={() => setBidOpen(false)}
                                            onSubmit={handleBidSubmit}
                                            minBid={minDriverBid(selected)}
                                            defaultVehicle={undefined}
                                            defaultTon={"1t"}
                                            defaultCargoType={
                                                selected.cargoType || "box"
                                            }
                                        />
                                    </>
                                )}
                        </section>

                        <section className="section">
                            <h3 className="section-title">운임 정보</h3>
                            <div className="row">
                                <div className="key">기사 제안가</div>
                                <div className="val">
                                    {assignment?.driverPrice != null
                                        ? `${Number(
                                              assignment.driverPrice
                                          ).toLocaleString()} 원`
                                        : selected?.driverPrice != null
                                        ? `${Number(
                                              selected.driverPrice
                                          ).toLocaleString()} 원`
                                        : "-"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="key">화주 제안가</div>
                                <div className="val">
                                    {selected?.proposedPrice != null
                                        ? `${Number(
                                              selected.proposedPrice
                                          ).toLocaleString()} 원`
                                        : "-"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="key">평균가</div>
                                <div className="val">
                                    {selected?.avgPrice != null
                                        ? `${Number(
                                              selected.avgPrice
                                          ).toLocaleString()} 원`
                                        : "-"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="key">예상 거리</div>
                                <div className="val">
                                    {selected?.distance != null
                                        ? `${Number(selected.distance).toFixed(
                                              2
                                          )}km`
                                        : "-"}
                                </div>
                            </div>
                        </section>

                        {userRole === "SHIPPER" &&
                            selected?.status === "PAYMENT_PENDING" &&
                            selected?.driverPrice != null && (
                                <section
                                    className="section"
                                    style={{ marginTop: 16 }}
                                >
                                    <button
                                        className="accept-btn"
                                        onClick={() =>
                                            shipperMoveToPayment(selected)
                                        }
                                    >
                                        {Number(
                                            selected.driverPrice
                                        ).toLocaleString()}
                                        원 결제하기
                                    </button>
                                </section>
                            )}
                    </>
                )}
            </aside>
        </div>
    );
};

export default OrderBoard;
