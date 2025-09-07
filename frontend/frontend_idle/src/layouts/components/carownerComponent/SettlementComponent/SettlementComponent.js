import React, { useEffect, useState } from "react";
import "../../../../theme/CarOwner/Settlement.css";
import {
  fetchSettlements,
  fetchSettlementSummaryCard,
  requestPayoutBatch,
} from "../../../../api/CarOwnerApi/CarOwnerSettlementApi";
import BankAccountModalPortal from "./BankAccountmodalPortal"; // 포탈 컴포넌트

// YYYY-MM 생성
function toYearMonth(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

// 이번 달 [from,to] 기본값 (한 번만 초기화용)
function defaultMonthRange(from, to) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { f: from || toISO(start), t: to || toISO(end), ym: toYearMonth(start) };
}

const SettlementComponent = () => {
  // 필터 상태 (⛳ 최초 1회만 이번 달로 자동 세팅)
  const init = defaultMonthRange();
  const [from, setFrom] = useState(() => init.f);
  const [to, setTo] = useState(() => init.t);
  const [status, setStatus] = useState("");

  // 데이터 상태
  const [pageData, setPageData] = useState({
    content: [],
    number: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // 월 정산 버튼/모달 상태
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // 월 단위 빠른 선택 (선택 사항이었는데 포함해 드림)
  const handleMonthChange = (value) => {
    if (!value) return;
    const [y, m] = value.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    const pad = (n) => String(n).padStart(2, "0");
    const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    setFrom(toISO(start));
    setTo(toISO(end));
  };

  // 모달 열기 (READY 없으면 경고)
  const handleRequestPayoutBatch = () => {
    if (!card || (card.readyCount ?? 0) === 0) {
      alert("요청할 READY 건이 없습니다.");
      return;
    }
    setModalOpen(true);
  };

  // 모달 제출 → API → 리프레시
  const submitBankInfo = async ({ bankCode, accountNo }) => {
    const { ym } = defaultMonthRange(from, to);
    setBatchSubmitting(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      await requestPayoutBatch(ym, bankCode, accountNo, token);
      await load(pageData.number || 0);
      setModalOpen(false);
      alert("정산 요청이 접수되었습니다.");
    } catch (e) {
      alert(e.message || "알 수 없는 오류로 정산 요청에 실패했습니다.");
    } finally {
      setBatchSubmitting(false);
    }
  };

  // 목록/요약 조회
  const load = async (page = 0) => {
    setLoading(true);
    setErr(null);
    try {
      // ⛳ 현재 상태 우선, 비어 있으면 이번 달로 안전 폴백
      const base = defaultMonthRange();
      const f = from || base.f;
      const t = to || base.t;

      const [listRes, cardRes] = await Promise.all([
        fetchSettlements({ page, size: pageData.size || 10, status, from: f, to: t }),
        fetchSettlementSummaryCard({ from: f, to: t }),
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
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span>기간</span>
            {/* 월 빠른 선택 */}
            <input
              type="month"
              value={(from || init.f).slice(0, 7)}
              onChange={(e) => handleMonthChange(e.target.value)}
              title="월 선택 (자동으로 시작~말일 설정)"
            />
            {/* 날짜 범위 직접 입력 */}
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

        {/* 정산 버튼 → 모달 오픈 */}
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
            <h3> 기간</h3>
            <p>{card.period}</p>
          </div>
          <div className="box">
            <h3> 총 정산금액(Brut)</h3>
            <p className="total">₩{Number(card.totalAmount ?? 0).toLocaleString()}</p>
          </div>
          <div className="box">
            <h3>수수료</h3>
            <p className="total">₩{Number(card.totalCommission ?? 0).toLocaleString()}</p>
          </div>
          <div className="box">
            <h3>순수령액(Net)</h3>
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
                    <td>₩{Number(it.netAmount ?? 0).toLocaleString()}</td>
                    <td>{it.status}</td>
                    <td>{(it.createdAt || "").replace("T", " ").slice(0, 16)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pager" style={{ marginTop: 12 }}>
            <button disabled={pageData.number <= 0} onClick={() => load(pageData.number - 1)}>이전</button>
            <span style={{ margin: "0 8px" }}>
              {(pageData.number ?? 0) + 1} / {pageData.totalPages || 1}
            </span>
            <button
              disabled={(pageData.number ?? 0) + 1 >= (pageData.totalPages ?? 1)}
              onClick={() => load(pageData.number + 1)}
            >
              다음
            </button>
          </div>
        </>
      )}

      {/* 모달 포탈 */}
      <BankAccountModalPortal
        open={modalOpen}
        busy={batchSubmitting}
        onClose={() => setModalOpen(false)}
        onSubmit={submitBankInfo}   // { bankCode, accountNo } 받음
      />
    </div>
  );
};

export default SettlementComponent;