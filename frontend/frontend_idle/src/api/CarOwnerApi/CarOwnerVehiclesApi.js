// 목록
export async function fetchVehicles({ page = 0, size = 10 } = {}) {
  const p = new URLSearchParams();
  p.set("page", page);
  p.set("size", size);

  const res = await fetch(`/api/car-owner/vehicles?` + p.toString(), {
    credentials: "include",
    // JWT 미완 시 로컬 프로필에서만:
    // headers: { "X-Dev-User": "driver_123" }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // Page<VehicleSummaryResponse>
}

// 단건
export async function fetchVehicleDetail(id) {
  const res = await fetch(`/api/car-owner/vehicles/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // VehicleDetailResponse
}

// 생성
export async function createVehicle(payload) {
  const res = await fetch(`/api/car-owner/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload), // { plateNumber, type, model?, capacity?, primary? }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // VehicleDetailResponse
}

// 수정
export async function updateVehicle(id, payload) {
  const res = await fetch(`/api/car-owner/vehicles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload), // { type?, model?, capacity? }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// 기본차량 설정/해제
export async function setPrimaryVehicle(id, primary = true) {
  const res = await fetch(`/api/car-owner/vehicles/${id}/primary?primary=${primary}`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// 삭제
export async function deleteVehicle(id) {
  const res = await fetch(`/api/car-owner/vehicles/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}