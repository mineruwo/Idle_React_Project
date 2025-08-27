import React, { useEffect, useState } from "react";
import "../../../../theme/CarOwner/Settlement.css";
import {
  fetchSettlements,
  fetchSettlementSummaryCard,
  syncMonthly,
  requestPayoutBatch,
} from "../../../../api/CarOwnerApi/CarOwnerSettlementApi";

// YYYY-MM 생성
function toYearMonth(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

// 이번 달 [from,to] 기본값
function defaultMonthRange(from, to) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return {
    f: from || toISO(start),
    t: to || toISO(end),
    ym: toYearMonth(start),
  };
}

const SettlementComponent = () => {
  // 필터
  const [from, setFrom] = useState(""); // yyyy-MM-dd
  const [to, setTo] = useState("");
  const [status, setStatus] = useState(""); // READY/REQUESTED/APPROVED/PAID/CANCELED/""
  const [pageData, setPageData] = useState({ content: [], number: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // 월 정산 버튼 로딩 상태
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  const handleRequestPayoutBatch = async () => {
    const { ym } = defaultMonthRange(from, to);
    if (!card) return;

    const readyCount = card.readyCount ?? 0;
    if (readyCount === 0) {
      alert("요청할 READY 건이 없습니다.");
      return;
    }
    if (!window.confirm(`${ym} 월 정산을 요청할까요?\nREADY 건수: ${readyCount}`)) return;

    try {
      setBatchSubmitting(true);
      await requestPayoutBatch(ym);
      await load(pageData.number || 0);
      alert("정산 요청이 접수되었습니다.");
    } catch (e) {
      alert(e.message || "정산 요청 중 오류가 발생했습니다.");
    } finally {
      setBatchSubmitting(false);
    }
  };

  const load = async (page = 0) => {
    setLoading(true);
    setErr(null);
    try {
      // 1) 기간/월 확정
      const { f, t, ym } = defaultMonthRange(from, to);

      // 2) 월 동기화 (완료 주문 → 미정산 자동 생성)
      await syncMonthly(ym).catch(() => { /* 엔드포인트 없는 환경이면 무시 */ });

      // 3) 목록 + 요약카드 병렬 조회
      const [listRes, cardRes] = await Promise.all([
        fetchSettlements({ page, size: pageData.size || 10, status, from: f, to: t }),
        fetchSettlementSummaryCard({ from: f, to: t })
      ]);
      setPageData(listRes);
      setCard(cardRes);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, status]);

  const print = () => window.print();

  return (
    <div className="settlement-page">
      {/* 상단 필터/액션 */}
      <div className="actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="settlementtitle">
          <h1>정산 내역</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span>기간</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span>~</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">전체</option>
              <option value="READY">준비</option>
              <option value="REQUESTED">요청</option>
              <option value="APPROVED">승인</option>
              <option value="PAID">지급완료</option>
              <option value="CANCELED">취소</option>
            </select>
            <button onClick={() => load(0)}>조회</button>
          </div>
        </div>

        {/* 정산 인쇄 영역에 월 정산 버튼 + 인쇄 버튼 */}
        <div className="settlementprintbtn" style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleRequestPayoutBatch}
            disabled={loading || batchSubmitting || !card || (card.readyCount ?? 0) === 0}
            title={!card || (card.readyCount ?? 0) === 0 ? "요청 가능한 READY 건이 없습니다" : "선택한 기간의 월 정산을 신청합니다"}
          >
            {batchSubmitting ? "정산 신청 중..." : "정산 신청"}
          </button>
          <button onClick={print}>정산 인쇄</button>
        </div>
      </div>

      {/* 요약 카드 */}
      {card && (
        <div className="summary-section">
          <div className="box">
            <h3>📅 기간</h3>
            <p>{card.period}</p>
          </div>
          <div className="box">
            <h3>💵 총 정산금액(Brut)</h3>
            <p className="total">₩{Number(card.totalAmount ?? 0).toLocaleString()}</p>
          </div>
          <div className="box">
            <h3>🧾 수수료</h3>
            <p className="total">₩{Number(card.totalCommission ?? 0).toLocaleString()}</p>
          </div>
          <div className="box">
            <h3>✅ 순수령액(Net)</h3>
            <p className="total">₩{Number(card.netAmount ?? 0).toLocaleString()}</p>
          </div>
          <div className="box smalls">
            <div>READY: {card.readyCount ?? 0}</div>
            <div>REQUESTED: {card.requestedCount ?? 0}</div>
            <div>PAID: {card.paidCount ?? 0}</div>
          </div>
        </div>
      )}

      {/* 목록/테이블 */}
      {err && <div className="error">에러: {err}</div>}
      {loading ? (
        <div>불러오는 중...</div>
      ) : (
        <>
          <table className="delivery-table">
            <thead>
              <tr>
                <th>정산ID</th>
                <th>오더번호</th>
                <th>금액</th>
                <th>수수료</th>
                <th>순수령액</th>
                <th>상태</th>
                <th>생성일</th>
              </tr>
            </thead>
            <tbody>
              {pageData.content.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "16px" }}>
                    표시할 정산 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                pageData.content.map((it) => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{it.orderNo || it.orderId}</td>
                    <td>₩{Number(it.amount ?? 0).toLocaleString()}</td>
                    <td>₩{Number(it.commission ?? 0).toLocaleString()}</td>
                    <td>₩{Number((it.netAmount ?? 0)).toLocaleString()}</td>
                    <td>{it.status}</td>
                    <td>{(it.createdAt || "").replace("T", " ").slice(0, 16)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pager" style={{ marginTop: 12 }}>
            <button disabled={pageData.number <= 0} onClick={() => load(pageData.number - 1)}>이전</button>
            <span style={{ margin: "0 8px" }}>{(pageData.number ?? 0) + 1} / {pageData.totalPages || 1}</span>
            <button
              disabled={(pageData.number ?? 0) + 1 >= (pageData.totalPages ?? 1)}
              onClick={() => load(pageData.number + 1)}
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SettlementComponent;