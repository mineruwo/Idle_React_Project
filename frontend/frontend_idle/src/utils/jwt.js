// base64url -> utf-8 문자열
export function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) str += "=".repeat(4 - pad);

  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return "";
  }
}

// "a.b.c" 형태의 JWT에서 payload를 객체로
export function parseJwt(token) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getRoleFromToken(token) {
  const claims = parseJwt(token);
  return claims?.role ? String(claims.role).toLowerCase() : null;
}

export function isTokenExpired(token, skewSeconds = 30) {
  const claims = parseJwt(token);
  if (!claims || !claims.exp) return false; // exp 없으면 일단 유효로 간주
  const now = Math.floor(Date.now() / 1000);
  return claims.exp <= (now - skewSeconds);
}