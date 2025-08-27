import axios from "axios";

const snsApi = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, 
  withCredentials: true,                       
});

// 기존 로컬 계정과 SNS 연결 (로그인ID/비밀번호 재인증)
export async function linkExisting({ id, password }) {
  const { data } = await snsApi.post("/auth/oauth/link-existing", {
    id,
    passwordEnc: password,
  });
  return data; 
}

// SNS 신규가입 완료 (회원가입 폼 데이터)
export async function snsSignup({ customName, nickname, role }) {
  const { data } = await snsApi.post("/auth/oauth/complete-signup", {
    customName,
    nickname,
    role,
  });
  return data; 
}