
export const fetchCarOwnerProfileMe = async () => {
  const res = await fetch("/api/car-owner/profile", {
    method: "GET",
    credentials: "include", // HttpOnly 쿠키 사용 시 필수
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "차주 프로필 조회 실패");
  }
  return res.json();
};

export const updateCarOwnerProfile = async (payload) => {
  const res = await fetch("/api/car-owner/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// 닉네임 중복 확인
export const checkNicknameAvailable = async (nickname) => {
  const params = new URLSearchParams({ nickname });
  const res = await fetch(`/api/car-owner/profile/availability/nickname?${params}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // boolean
};

export const uploadAvatar = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/files/avatar", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  // 서버가 URL 문자열 반환 → "/uploads/avatars/xxx.jpg"
  return res.text();
};

