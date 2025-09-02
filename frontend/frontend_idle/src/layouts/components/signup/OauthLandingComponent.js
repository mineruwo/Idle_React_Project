import { useEffect } from "react";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import { Button, CssBaseline, Typography, Box } from "@mui/material";
import AppTheme from "../../../theme/muitheme/AppTheme";
import "../../../theme/signup/OauthLanding.css";

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
        <Box className="oauth-wrap">
          <Box className="oauth-card">
            <Typography variant="h5" className="oauth-title">
              SNS 로그인 완료
            </Typography>
            <Typography variant="body2" color="text.secondary" className="oauth-sub">
              기존 계정과 연결하시겠습니까?
            </Typography>

            <Box className="oauth-actions">
              <Button fullWidth variant="contained" component={RouterLink} to="/oauth2/link">
                기존 계정과 연결
              </Button>
              <Button fullWidth variant="outlined" component={RouterLink} to="/oauth2/signup">
                새 계정 만들기
              </Button>
            </Box>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  return null;
}