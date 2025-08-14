import React, { useEffect, useState } from "react";
import "../../../../theme/CarOwner/Order.css";
import { fetchCarOwnerOrders } from "../../../../api/CarOwnerApi/CarOwnerOrdersApi";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
const BOARD_POST_URL = (orderId) => `/board/orders/${orderId}`;

const moveToOrderPost = (orderId) => {
  if (!orderId) return;
  window.location.href = BOARD_POST_URL(orderId); // 내부 라우팅이면 navigate로 교체 가능
};

const formatDate = (isoOrYmd) => {
  if (!isoOrYmd) return "-";
  // '2025-08-13' 그대로면 리턴, ISO면 앞 10자리
  return isoOrYmd.length >= 10 ? isoOrYmd.slice(0, 10) : isoOrYmd;
};

const OrderDEliveryList = () => {
    const navigate = useNavigate();

  // 필터 & 페이지 상태
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [status, setStatus] = useState(""); // "", "READY", "SHIPPED", "DELIVERED", "CANCELLED"
  const [from, setFrom] = useState("");     // yyyy-MM-dd
  const [to, setTo] = useState("");         // yyyy-MM-dd
  const [q, setQ] = useState("");           // 검색어(출발/도착지 등)

  // 데이터 상태
  const [pageData, setPageData] = useState({ content: [], number: 0, totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = async (nextPage = page) => {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchCarOwnerOrders({ page: nextPage, size, status, from, to, q });
      setPageData(data);
      setPage(nextPage);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 첫 로드
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilter = () => load(0);

  // 요약 집계
  const summary = useMemo(() => {
    const counts = { READY: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
    for (const it of pageData.content || []) {
      const s = it.status;
      if (s && counts.hasOwnProperty(s)) counts[s]++;
    }
    return {
      done: counts.DELIVERED,
      shipping: counts.SHIPPED,
      scheduled: counts.READY,
      totalDone: counts.DELIVERED, // 필요에 따라 누적 완료를 백엔드에서 내려주면 그 값 사용
    };
  }, [pageData.content]);

  const moveToOrderPost = (orderId) => {
    if (!orderId) return;
    // 내부 라우팅
    navigate(`/board/orders/${orderId}`);
  };
  return (
    <div className="settlement-page">
      <h2 className="summary-title">배송 요약</h2>

      {/* 필터 */}
      <div className="filter-row" style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">전체 상태</option>
          <option value="READY">READY</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span>~</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <input
          type="text"
          placeholder="출발/도착지 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilter()}
          style={{ width: 200 }}
        />
        <button className="submit-btn" onClick={applyFilter}>검색</button>
      </div>

      {/* 요약 */}
      <div className="delivery-summary">
        <div>기간: {from || "-"} ~ {to || "-"}</div>
        <div>완료건: {summary.done}건</div>
        <div>배송중: {summary.shipping}건</div>
        <div>배송 예정: {summary.scheduled}건</div>
        <div>누적 완료 배송건: {summary.totalDone}건</div>
      </div>

      <h2>운송건</h2>

      {err && <div className="error">에러: {err}</div>}
      {loading ? (
        <div>불러오는 중...</div>
      ) : (
        <>
          <table className="delivery-table">
            <thead>
              <tr>
                <th>배송 상태</th>
                <th>출발지</th>
                <th>출발 예정일</th>
                <th>도착지</th>
                <th>예정일</th>
              </tr>
            </thead>
            <tbody>
              {(pageData.content || []).length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center" }}>표시할 오더리스트가 없습니다.</td></tr>
              ) : (
                pageData.content.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => moveToOrderPost(item.id)}
                    style={{ cursor: "pointer" }}
                    title={`게시판 상세로 이동 (#${item.id})`}
                  >
                    <td>{item.status ?? "-"}</td>
                    <td>{item.departure ?? "-"}</td>
                    <td>{formatDate(item.departurePlannedAt || item.scheduledDeparture || item.s_date)}</td>
                    <td>{item.arrival ?? "-"}</td>
                    <td>{formatDate(item.arrivalPlannedAt || item.scheduledArrival || item.d_date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div className="pager" style={{ marginTop: 12 }}>
            <button disabled={page <= 0} onClick={() => load(page - 1)}>이전</button>
            <span style={{ margin: "0 8px" }}>{(pageData.number ?? page) + 1} / {pageData.totalPages || 1}</span>
            <button disabled={(pageData.number ?? page) + 1 >= (pageData.totalPages || 1)} onClick={() => load(page + 1)}>다음</button>
          </div>
        </>
      )}
    </div>
  );
};


export default OrderDEliveryList;