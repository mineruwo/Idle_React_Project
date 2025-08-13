import React, { useEffect, useState } from "react";
import "../../../../theme/CarOwner/Settlement.css";
import {
  fetchSettlements,
  fetchSettlementSummaryCard,
  // 필요 시: createSettlement, approveSettlement, paySettlement, cancelSettlement
} from "../../../../api/CarOwnerApi/CarOwnerSettlementApi";

const SettlementComponent = () => {
  // 필터
  const [from, setFrom] = useState(""); // yyyy-MM-dd
  const [to, setTo] = useState("");
  const [status, setStatus] = useState(""); // REQUESTED/APPROVED/PAID/CANCELED/""
  const [pageData, setPageData] = useState({ content: [], number: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = async (page = 0) => {
    setLoading(true); setErr(null);
    try {
      const [listRes, cardRes] = await Promise.all([
        fetchSettlements({ page, size: pageData.size, status, from, to }),
        fetchSettlementSummaryCard()
      ]);
      setPageData(listRes);
      setCard(cardRes);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, [from, to, status]);

  const print = () => window.print();

  return (
    <div className="settlement-page">
      {/* 상단 필터/액션 */}
      <div className="actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="settlementtitle">
          <h1>정산 내역</h1>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span>기간</span>
            <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
            <span>~</span>
            <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
            <select value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="">전체</option>
              <option value="REQUESTED">요청</option>
              <option value="APPROVED">승인</option>
              <option value="PAID">지급완료</option>
              <option value="CANCELED">취소</option>
            </select>
            <button onClick={()=>load(0)}>조회</button>
          </div>
        </div>
        <div className="settlementprintbtn">
          <button onClick={print}>정산 인쇄</button>
        </div>
      </div>

      {/* 요약 카드 */}
      {card && (
        <div className="summary-section">
          <div className="box">
            <h3>📆 기준 월</h3>
            <p>{card.month}</p>
          </div>
          <div className="box">
            <h3>💰 오늘 수입</h3>
            <p className="total">₩{card.todayEarnings.toLocaleString()}</p>
          </div>
          <div className="box">
            <h3>📈 이번 달 수입</h3>
            <p className="total">₩{card.monthEarnings.toLocaleString()}</p>
          </div>
          <div className="box">
            <h3>⏳ 미지급 합계</h3>
            <p className="total">₩{card.unsettledAmount.toLocaleString()}</p>
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
                <th>오더ID</th>
                <th>금액</th>
                <th>상태</th>
                <th>요청일</th>
              </tr>
            </thead>
            <tbody>
              {pageData.content.map((it) => (
                <tr key={it.id}>
                  <td>{it.id}</td>
                  <td>{it.orderId}</td>
                  <td>₩{it.amount?.toLocaleString?.() ?? "-"}</td>
                  <td>{it.status}</td>
                  <td>{it.createdAt?.replace("T"," ")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pager" style={{ marginTop: 12 }}>
            <button disabled={pageData.number <= 0} onClick={() => load(pageData.number - 1)}>이전</button>
            <span style={{ margin: "0 8px" }}>{pageData.number + 1} / {pageData.totalPages || 1}</span>
            <button disabled={pageData.number + 1 >= pageData.totalPages} onClick={() => load(pageData.number + 1)}>다음</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SettlementComponent;