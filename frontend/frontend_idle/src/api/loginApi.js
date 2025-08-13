import api from "./authApi"; 

export const login = async (credentials) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
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

// 로그인 상태/프로필 조회 
export const fetchMe = async () => {
  const { data } = await api.get("/auth/auto");
  return data; 
};