const BASE = "/api/car-owner/dashboard";

const handle = async (res) => {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${txt}`);
  }
  return res.json();
};

// 공통: 쿼리스트링 생성 (값이 비거나 null/undefined면 제외)
const toQuery = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .reduce((p, [k, v]) => (p.append(k, v), p), new URLSearchParams())
    .toString();

/**
 * 요약 (summary)
 * period: "month"(기본), "week" 등
 * ownerId: 선택 (백엔드는 AuthenticationPrincipal 사용)
 */
export const fetchTransportSummary = async ({ period = "month", ownerId } = {}) => {
  const qs = toQuery({ period, ownerId });
  const res = await fetch(`${BASE}/summary${qs ? `?${qs}` : ""}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
};

/**
 * 매출 차트 (sales-chart)
 * period: "month"(기본), "last7" 등
 */
export const fetchSalesChart = async ({ period = "month", ownerId } = {}) => {
  const qs = toQuery({ period, ownerId });
  const res = await fetch(`${BASE}/sales-chart${qs ? `?${qs}` : ""}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
};

/**
 * 진행/예정 배송 목록 (deliveries)
 * 현재 백엔드는 기간/상태 파라미터 없이 최근 READY/ONGOING 5건을 내려줌
 * 필요 시 ownerId만 선택적으로 포함
 */
export const fetchDeliveries = async ({ ownerId } = {}) => {
  const qs = toQuery({ ownerId });
  const res = await fetch(`${BASE}/deliveries${qs ? `?${qs}` : ""}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
};

/**
 * 온도(완료/지각 집계)
 */
export const fetchWarmth = async ({ ownerId } = {}) => {
  const qs = toQuery({ ownerId });
  const res = await fetch(`${BASE}/warmth${qs ? `?${qs}` : ""}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
};