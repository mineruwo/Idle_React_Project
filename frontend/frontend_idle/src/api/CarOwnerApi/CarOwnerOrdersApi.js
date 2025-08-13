export async function fetchCarOwnerOrders({ page = 0, size = 10, status = "", from = "", to = "", q = "" } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("size", size);
  if (status) params.set("status", status);
  if (from) params.set("from", from); // yyyy-MM-dd
  if (to) params.set("to", to);       // yyyy-MM-dd
  if (q) params.set("q", q);

  const res = await fetch(`/api/car-owner/orders?` + params.toString(), {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // Spring Page JSON
}