const BASE = "/api/car-owner/dashboard";

const handle = async (res) => {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${txt}`);
  }
  return res.json();
};


const toQuery = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .reduce((p, [k, v]) => (p.append(k, v), p), new URLSearchParams())
    .toString();


export const fetchTransportSummary = async ({ period = "month", ownerId } = {}) => {
  const qs = toQuery({ period, ownerId });
  const res = await fetch(`${BASE}/summary${qs ? `?${qs}` : ""}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
};


export const fetchSalesChart = async ({ period = "month", ownerId } = {}) => {
  const qs = toQuery({ period, ownerId });
  const res = await fetch(`${BASE}/sales-chart${qs ? `?${qs}` : ""}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
};


export const fetchDeliveries = async ({ ownerId } = {}) => {
  const qs = toQuery({ ownerId });
  const res = await fetch(`${BASE}/deliveries${qs ? `?${qs}` : ""}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
};


export const fetchWarmth = async ({ ownerId } = {}) => {
  const qs = toQuery({ ownerId });
  const res = await fetch(`${BASE}/warmth${qs ? `?${qs}` : ""}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
};