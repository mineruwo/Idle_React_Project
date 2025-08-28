const BASE = "/api/car-owner";
const SETTLEMENTS = `${BASE}/settlements`;

async function handle(res) {
  if (!res.ok) {
    let msg = `요청 실패 (${res.status})`;
    try {
      const body = await res.json();
      msg = body.code ? `${body.code}:${body.message}` : (body.message || msg);
    } catch {
      const txt = await res.text().catch(() => "");
      msg = txt || msg;
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

const qp = (v) => (v !== undefined && v !== null && v !== "" ? String(v) : undefined);

/** 정산 목록: GET /api/car-owner/settlements */
export async function fetchSettlements({ page = 0, size = 20, status = "", from = "", to = "" } = {}, token) {
  const url = new URL(SETTLEMENTS, window.location.origin);
  const params = { page, size, status: qp(status), from: qp(from), to: qp(to) };
  Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return handle(res);
}

/** 정산 상세: GET /api/car-owner/settlements/{id} */
export async function fetchSettlementDetail(id, token) {
  const res = await fetch(`${SETTLEMENTS}/${encodeURIComponent(id)}`, {
    method: "GET",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return handle(res);
}

/** 요약 카드: GET /api/car-owner/settlements/summary */
export async function fetchSettlementSummaryCard({ from = "", to = "" } = {}, token) {
  const url = new URL(`${SETTLEMENTS}/summary`, window.location.origin);
  if (qp(from)) url.searchParams.set("from", from);
  if (qp(to)) url.searchParams.set("to", to);

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return handle(res);
}

/** (주문 1건 기준) 정산 생성: POST /api/car-owner/settlements/order/{orderId} */
export async function createSettlementForOrder(orderId, token) {
  const res = await fetch(`${SETTLEMENTS}/order/${encodeURIComponent(orderId)}`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return handle(res); // returns settlementId
}

/** 월 동기화: POST /api/car-owner/settlements/sync?ym=YYYY-MM */
export async function syncMonthly(ym, token) {
  const url = new URL(`${SETTLEMENTS}/sync`, window.location.origin);
  url.searchParams.set("ym", ym); // "2025-08"

  const res = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return handle(res); // returns created count
}

/** 정산 요청(READY→REQUESTED): POST /api/car-owner/settlements/{id}/request */
export async function requestPayout(id, token) {
  const res = await fetch(`${SETTLEMENTS}/${encodeURIComponent(id)}/request`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return handle(res);
}

/** 지급 완료(REQUESTED/APPROVED→PAID): POST /api/car-owner/settlements/{id}/paid */
export async function markSettlementPaid(id, token) {
  const res = await fetch(`${SETTLEMENTS}/${encodeURIComponent(id)}/paid`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return handle(res);
}

/** 🔸 월 정산 신청: POST /api/car-owner/settlements/batch/request?ym=YYYY-MM
 *  백엔드 엔드포인트가 다르면 아래 경로만 맞춰주세요.
 */
export async function requestPayoutBatch(ym, token, { bankCode, accountNo } = {}) {
  const url = new URL(`/api/car-owner/settlements/batch/request`, window.location.origin);
  url.searchParams.set("ym", ym);

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  // 모달에서 값이 들어오면 JSON 바디로 전송 (없으면 빈 바디)
  const body = (bankCode || accountNo) ? JSON.stringify({ bankCode, accountNo }) : null;

  const res = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    headers,
    body,
  });
  return handle(res);
}