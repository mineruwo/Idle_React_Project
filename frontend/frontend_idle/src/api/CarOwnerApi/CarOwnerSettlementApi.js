// 목록 (기간/상태/페이징)
export async function fetchSettlements({ page=0, size=10, status="", from="", to="" } = {}) {
  const p = new URLSearchParams();
  p.set("page", page);
  p.set("size", size);
  if (status) p.set("status", status);
  if (from) p.set("from", from); // yyyy-MM-dd
  if (to) p.set("to", to);

  const res = await fetch(`/api/car-owner/settlements?` + p.toString(), {
    credentials: "include",
    // JWT 미완 시: headers: { "X-Dev-User": "driver_123" }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // Page<SettlementSummaryResponse>
}

// 단건 조회
export async function fetchSettlementDetail(id) {
  const res = await fetch(`/api/car-owner/settlements/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // SettlementDetailResponse
}

// 생성
export async function createSettlement(payload) {
  const res = await fetch(`/api/car-owner/settlements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload), // { orderId, amount, memo? }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// 승인/지급/취소
export async function approveSettlement(id, memo) {
  const res = await fetch(`/api/car-owner/settlements/${id}/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ memo: memo || "" }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function paySettlement(id, txRef) {
  const res = await fetch(`/api/car-owner/settlements/${id}/pay`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ txRef: txRef || "" }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function cancelSettlement(id, memo) {
  const res = await fetch(`/api/car-owner/settlements/${id}/cancel`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ memo: memo || "" }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// 요약 카드
export async function fetchSettlementSummaryCard() {
  const res = await fetch(`/api/car-owner/settlements/summary`, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // SettlementSummaryCardResponse
}