import { useEffect } from "react";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import { Button, CssBaseline, Typography, Box } from "@mui/material";
import AppTheme from "../../../theme/muitheme/AppTheme";

export default function OAuthLanding(props) {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const mode = (sp.get("mode") || "").toLowerCase(); // choose | link | signup

  useEffect(() => {
    if (mode === "link") nav("/oauth2/link", { replace: true });
    if (mode === "signup") nav("/oauth2/signup", { replace: true });
  }, [mode, nav]);

  if (mode === "choose" || !mode) {
    return (
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
          <Box sx={{ width: 420, border: "1px solid #e5e7eb", borderRadius: 2, p: 3, bgcolor: "#fff" }}>
            <Typography variant="h5" fontWeight={700}>SNS 로그인 완료</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              계정을 어떻게 사용할까요?
            </Typography>
            <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Button fullWidth variant="contained" component={RouterLink} to="/oauth2/link">기존 계정과 연결</Button>
              <Button fullWidth variant="outlined" component={RouterLink} to="/oauth2/signup">새 계정 만들기</Button>
            </Box>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  // link/signup은 위 useEffect에서 라우팅됨. 잠깐 뜨는 빈 화면 처리
  return null;
}