import api from "./authApi"; 

export const login = async (credentials) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    try { localStorage.setItem("auth:pulse", String(Date.now())); } catch {}
    return data;
  } catch (error) {
    throw error;
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

export const resetPassword = async ({ token, newPassword }) => {
  try {
    await api.post("/auth/reset-password", { token, newPassword });
  } catch (err) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const message = data?.message || data?.detail || "비밀번호 재설정 실패";

    const code = status === 400 ? "TOKEN_INVALID_OR_USED" : "UNKNOWN";

    throw Object.assign(new Error(message), { status, code, cause: err });
  }
}

/**
 * 🙋‍♂️ 내 정보 조회 (인증)
 */
export const getMe = async () => {
    const { data } = await api.get("/auth/me");
    return data;
};