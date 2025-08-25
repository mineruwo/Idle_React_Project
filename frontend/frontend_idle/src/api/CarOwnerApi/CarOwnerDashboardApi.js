const BASE = "/api/car-owner/dashboard";

const handle = async (res) => {
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} :: ${await res.text().catch(()=> "")}`);
  return res.json();
};

export const fetchSalesChart = async (ownerId) => {
  const res = await fetch(`${BASE}/sales-chart?ownerId=${encodeURIComponent(ownerId)}`, {
    method: "GET",
    credentials: "include", // 기존 API와 동일
  });
  return handle(res);
};

export const fetchTransportSummary = async (ownerId) => {
  const res = await fetch(`${BASE}/summary?ownerId=${encodeURIComponent(ownerId)}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
};

export const fetchDeliveries = async (ownerId) => {
  const res = await fetch(`${BASE}/deliveries?ownerId=${encodeURIComponent(ownerId)}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
};

export const fetchWarmth = async (ownerId) => {
  const res = await fetch(`${BASE}/warmth?ownerId=${encodeURIComponent(ownerId)}`, {
    method: "GET",
    credentials: "include",
  });
  return handle(res);
};