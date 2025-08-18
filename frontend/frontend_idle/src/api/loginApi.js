import api from "./authApi"; 

// 쿠키 기반 힌트
const hasAuthHint = () =>
  typeof document !== "undefined" &&
  /(?:^|;\s*)hasAuth=1(?:;|$)/.test(document.cookie);

export const login = async (credentials) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    try { localStorage.setItem("auth:pulse", String(Date.now())); } catch {}
    return data;
  } catch (error) {
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("로그인 실패: 서버와 연결할 수 없습니다");
  }
};

// 로그아웃: 서버가 쿠키 삭제(Set-Cookie Max-Age=0)
export const logout = async () => {
  await api.post("/auth/logout");
  try { localStorage.setItem("auth:pulse", String(Date.now())); } catch {}
};

// ID & 비밀번호 체크 
export const checkAccount = async (id, password) => {
  try {
    const { data } = await api.post("/customer/check-account", {
      id,
      passwordEnc: password,
    });
    return data;
  } catch (err) {
    alert("로그인 중 오류 발생");
    return false;
  }
};

// 현재 사용자 조회
export const fetchMe = async ({ force = false } = {}) => {
  if (!hasAuthHint()) return null;
  const { data } = await api.get("/auth/auto");  // 만료 시 인터셉터가 /auth/refresh 처리
  return data;
};