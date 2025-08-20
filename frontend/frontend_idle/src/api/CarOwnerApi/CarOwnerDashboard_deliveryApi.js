const BASE = "/api/car-owner";
const DASH = `${BASE}/dashboard`;
const ORDERS = `${BASE}/orders`;

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
  return res.json();
}

/** 대시보드: 진행/준비 배송 목록 (CREATED/ONGOING) */
export async function fetchDeliveries() {
  const res = await fetch(`${DASH}/deliveries`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
}

export async function fetchSalesChart() {
  const res = await fetch(`${DASH}/sales-chart`, { credentials: "include" });
  return handle(res);
}
export async function fetchTransportSummary() {
  const res = await fetch(`${DASH}/summary`, { credentials: "include" });
  return handle(res);
}
export async function fetchWarmth() {
  const res = await fetch(`${DASH}/warmth`, { credentials: "include" });
  return handle(res);
}

/** ✅ 상태 전이 (CREATED->ONGOING, ONGOING->COMPLETED) — 쿼리파라미터 사용 */
export async function patchOrderStatus(orderId, nextStatus, token) {
  const url = `${ORDERS}/${encodeURIComponent(orderId)}/status?status=${encodeURIComponent(nextStatus)}`;
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return handle(res); // { ...OrderDetailResponse }
}

/** ✅ 취소 — 별도 /cancel 없음. 동일 엔드포인트에 status=CANCELED */
export async function cancelOrder(orderId) {
  const url = `${ORDERS}/${encodeURIComponent(orderId)}/status?status=CANCELED`;
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
  });
  return handle(res); // { ...OrderDetailResponse }
}