import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../theme/CarOwner/Order.css";
import { fetchCarOwnerOrders } from "../../../../api/CarOwnerApi/CarOwnerOrdersApi";

const STATUS = {
  READY: "READY",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
};

const STATUS_LABEL = {
  READY: "READY",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
};

const BOARD_POST_URL = (orderId) => `/board/orders/${orderId}`;

const formatDate10 = (v) => {
  if (!v) return "-";
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

/** 서버 응답의 키가 제각각일 수 있으므로 안전하게 꺼내기 */
const pick = (obj, keys, def = "-") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return def;
};

export default function OrderDEliveryList() {
  const navigate = useNavigate();

  // 필터 & 페이지
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [status, setStatus] = useState("");   // "", READY, ONGOING, COMPLETED, CANCELED
  const [from, setFrom] = useState("");       // yyyy-MM-dd
  const [to, setTo] = useState("");           // yyyy-MM-dd
  const [q, setQ] = useState("");             // 검색어

  // 데이터
  const [pageData, setPageData] = useState({ content: [], number: 0, totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = async (nextPage = page) => {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchCarOwnerOrders({ page: nextPage, size, status, from, to, q });
      setPageData(data || { content: [], number: 0, totalPages: 1, totalElements: 0 });
      setPage(nextPage);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); /* 초기 1회 */ // eslint-disable-next-line
  }, []);

  const applyFilter = () => load(0);

  // 요약 집계(READY/ONGOING/COMPLETED/CANCELED 기준)
  const summary = useMemo(() => {
    const c = { READY: 0, ONGOING: 0, COMPLETED: 0, CANCELED: 0 };
    for (const it of pageData.content || []) {
      const s = String(it.status || "").toUpperCase();
      if (c[s] !== undefined) c[s]++;
    }
    return {
      done: c.COMPLETED,
      shipping: c.ONGOING,
      scheduled: c.READY,
      totalDone: c.COMPLETED, // 누적이 필요하면 백엔드 합계 내려받아 교체
    };
  }, [pageData.content]);

  const moveToOrderPost = (orderId) => {
    if (!orderId) return;
    navigate(BOARD_POST_URL(orderId));
  };

  return (
    <div className="settlement-page">
      <h2 className="summary-title">배송 요약</h2>

      {/* 필터 */}
      <div className="filter-row" style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">전체 상태</option>
          <option value={STATUS.READY}>{STATUS_LABEL.READY}</option>
          <option value={STATUS.ONGOING}>{STATUS_LABEL.ONGOING}</option>
          <option value={STATUS.COMPLETED}>{STATUS_LABEL.COMPLETED}</option>
          <option value={STATUS.CANCELED}>{STATUS_LABEL.CANCELED}</option>
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
                <th>운송번호</th>
                <th>배송 상태</th>
                <th>화물 종류</th>
                <th>출발지</th>
                <th>출발 예정일</th>
                <th>도착지</th>
                <th>최종수정일</th>
              </tr>
            </thead>
            <tbody>
              {(pageData.content || []).length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center" }}>표시할 오더리스트가 없습니다.</td></tr>
              ) : (
                pageData.content.map((item) => {
                  // 가능한 모든 키에서 안전하게 값 추출
                  const id = pick(item, ["id", "orderId", "deliveryNum"]);
                  const status = String(pick(item, ["status"], "")).toUpperCase() || "-";
                  const cargoType = pick(item, ["cargoType", "transport_type"]);
                  const fromAddr = pick(item, ["departure", "from"]);
                  const toAddr = pick(item, ["arrival", "to"]);

                  // 출발 예정일: reservedDate(문자열 yyyy-MM-dd…), scheduledDeparture, s_date …
                  const depPlanned = formatDate10(
                    pick(item, ["reservedDate", "scheduledDeparture", "s_date", "departurePlannedAt"])
                  );

                  // 최종 수정일: updatedAt 존재 시 날짜만
                  const updated = formatDate10(pick(item, ["updatedAt"], ""));

                  return (
                    <tr
                      key={id}
                      onClick={() => moveToOrderPost(id)}
                      style={{ cursor: "pointer" }}
                      title={`게시판 상세로 이동 (#${id})`}
                    >
                      <td>{id}</td>
                      <td>{STATUS_LABEL[status] || status}</td>
                      <td>{cargoType}</td>
                      <td>{fromAddr}</td>
                      <td>{depPlanned}</td>
                      <td>{toAddr}</td>
                      <td>{updated}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div className="pager" style={{ marginTop: 12 }}>
            <button disabled={page <= 0} onClick={() => load(page - 1)}>이전</button>
            <span style={{ margin: "0 8px" }}>
              {(pageData.number ?? page) + 1} / {pageData.totalPages || 1}
            </span>
            <button
              disabled={(pageData.number ?? page) + 1 >= (pageData.totalPages || 1)}
              onClick={() => load(page + 1)}
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}