import React, { useEffect, useMemo, useState } from "react";
import { fetchDeliveries, patchOrderStatus, cancelOrder } from "../../../../api/CarOwnerApi/CarOwnerDashboard_deliveryApi";
import "../../../../theme/CarOwner/cardashboard.css";

const STATUS = {
  CREATED: "CREATED",     // 준비(상차 전)
  ONGOING: "ONGOING",     // 배송중
  COMPLETED: "COMPLETED", // 완료
  CANCELED: "CANCELED",   // 취소
};

const labelOf = (s) =>
  s === STATUS.CREATED ? "🚚 상차 완료" :
  s === STATUS.ONGOING ? "✅ 배송 완료" :
  "완료됨";

const nextStatusOf = (s) =>
  s === STATUS.CREATED ? STATUS.ONGOING :
  s === STATUS.ONGOING ? STATUS.COMPLETED :
  STATUS.COMPLETED;

const canTransit = (cur, next) =>
  (cur === STATUS.CREATED && next === STATUS.ONGOING) ||
  (cur === STATUS.ONGOING && next === STATUS.COMPLETED);

const canCancelStatus = (s) => s === STATUS.CREATED || s === STATUS.ONGOING;

// (UI 보조) 간단 당일 체크. 최종 검증은 서버에서 함.
const isSameDayKST = (dateStr) => {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split(/[ T:-]/).map(Number);
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = now.getMonth() + 1;
  const dd = now.getDate();
  return y === yyyy && m === mm && d === dd;
};

export default function DeliveryList() {
  const [rows, setRows] = useState([]);
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setInitialLoading(true);
        const data = await fetchDeliveries();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        alert(e.message || "배송 목록을 불러오지 못했습니다.");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  const hasNoData = useMemo(() => !rows || rows.length === 0, [rows]);

  const onClickProceed = async (row) => {
    const id = row.id ?? row.deliveryNum;
    if (!id) return;
    const next = nextStatusOf(row.status);
    if (!canTransit(row.status, next)) return;

    const prev = row.status;
    setLoadingIds((s) => new Set([...s, id]));
    setRows((prevRows) => prevRows.map(r => ((r.id ?? r.deliveryNum) === id ? { ...r, status: next } : r)));

    try {
      const updated = await patchOrderStatus(id, next);
      setRows((prevRows) => prevRows.map(r =>
        ((r.id ?? r.deliveryNum) === updated.id) ? { ...r, status: updated.status } : r
      ));
    } catch (e) {
      alert(e.message || "상태 업데이트 실패");
      setRows((prevRows) => prevRows.map(r => ((r.id ?? r.deliveryNum) === id ? { ...r, status: prev } : r)));
    } finally {
      setLoadingIds((s) => {
        const c = new Set(s);
        c.delete(id);
        return c;
      });
    }
  };

  const onClickCancel = async (row) => {
    const id = row.id ?? row.deliveryNum;
    if (!id || !canCancelStatus(row.status)) return;

    if (!window.confirm("정말 취소하시겠습니까?")) return;
    const reason = window.prompt("취소 사유를 입력해주세요(선택):") || "";

    const prev = row.status;
    setLoadingIds((s) => new Set([...s, id]));
    setRows((prevRows) => prevRows.map(r => ((r.id ?? r.deliveryNum) === id ? { ...r, status: STATUS.CANCELED } : r)));

    try {
      const updated = await cancelOrder(id, reason);
      setRows((prevRows) => prevRows.map(r =>
        ((r.id ?? r.deliveryNum) === updated.id) ? { ...r, status: updated.status } : r
      ));
    } catch (e) {
      const msg = e.message || "취소 실패";
      if (msg.includes("SAME_DAY_CANCEL_NOT_ALLOWED")) {
        alert("당일 취소는 고객센터를 통해서만 가능합니다.");
        // window.location.href = "/support";
      } else {
        alert(msg);
      }
      setRows((prevRows) => prevRows.map(r => ((r.id ?? r.deliveryNum) === id ? { ...r, status: prev } : r)));
    } finally {
      setLoadingIds((s) => {
        const c = new Set(s);
        c.delete(id);
        return c;
      });
    }
  };

  return (
    <div className="delivery-box">
      <h2>배송중인 건</h2>

      <table>
        <thead>
          <tr>
            <th>운송번호</th>
            <th>배송 상태</th>
            <th>화물 종류</th>
            <th>출발지</th>
            <th>출발 예정일</th>
            <th>도착지</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {initialLoading ? (
            <tr><td colSpan="7">불러오는 중...</td></tr>
          ) : hasNoData ? (
            <tr><td colSpan="7">진행중인 배송이 없습니다.</td></tr>
          ) : rows.map((d) => {
              const id = d.id ?? d.deliveryNum;
              const busy = loadingIds.has(id);
              const isDone = d.status === STATUS.COMPLETED;
              const isCanceled = d.status === STATUS.CANCELED;
              const sameDay = isSameDayKST(d.s_date);

              return (
                <tr key={id}>
                  <td>{d.deliveryNum}</td>
                  <td>{d.status}</td>
                  <td>{d.transport_type}</td>
                  <td>{d.from}</td>
                  <td>{d.s_date}</td>
                  <td>{d.to}</td>
                  <td>
                    {isDone ? (
                      <span className="badge bg-success">완료됨</span>
                    ) : isCanceled ? (
                      <span className="badge bg-danger">취소됨</span>
                    ) : (
                      <div className="d-flex gap-2">
                        <button
                          className={`btn ${d.status === STATUS.CREATED ? "btn-primary" : "btn-success"}`}
                          disabled={busy}
                          onClick={() => onClickProceed(d)}
                          title={d.status === STATUS.CREATED ? "상차 완료로 상태 변경" : "배송 완료로 상태 변경"}
                        >
                          {busy ? "처리 중..." : labelOf(d.status)}
                        </button>

                        {canCancelStatus(d.status) && (
                          <button
                            className={`btn ${sameDay ? "btn-outline-secondary" : "btn-outline-danger"}`}
                            disabled={busy || sameDay}
                            onClick={() => onClickCancel(d)}
                            title={sameDay ? "당일 취소는 고객센터를 통해서만 가능합니다." : "취소"}
                          >
                            취소
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}