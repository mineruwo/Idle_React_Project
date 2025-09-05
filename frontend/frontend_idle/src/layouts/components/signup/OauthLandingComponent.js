import { useEffect } from "react";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { Button, CssBaseline, Typography, Box } from "@mui/material";
import AppTheme from "../../../theme/muitheme/AppTheme";
import "../../../theme/signup/OauthLanding.css";

export default function OAuthLanding(props) {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const hash = new URLSearchParams((loc.hash || "").replace(/^#/, ""));
    const search = new URLSearchParams(loc.search || "");
    const token = hash.get("token") || search.get("token");
    const mode = (hash.get("mode") || search.get("mode") || "choose").toLowerCase();

    if (!token) {
      nav("/login?e=no-token", { replace: true });
      return;
    }

    try {
      sessionStorage.setItem("oauth:token", token);
    } catch { }

    const clean = mode ? `/oauth2/land?mode=${encodeURIComponent(mode)}` : "/oauth2/land";
    window.history.replaceState(null, "", clean);

    if (mode === "link") {
      nav("/oauth2/link", { replace: true });
      return;
    }
    if (mode === "signup") {
      nav("/oauth2/signup", { replace: true });
      return;
    }

  }, [loc, nav]);


  const sp = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const modeNow = (sp.get("mode") || "choose").toLowerCase();


  if (modeNow === "choose") {
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