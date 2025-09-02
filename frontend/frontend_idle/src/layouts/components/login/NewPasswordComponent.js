import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  CssBaseline,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CancelRounded from "@mui/icons-material/CancelRounded";
import { useLocation, useNavigate } from "react-router-dom";
import AppTheme from "../../../theme/muitheme/AppTheme";
import { UserCard as Card, UserContainer as SignInContainer } from "../../../theme/User/UserCard";
import api from "../../../api/authApi";
import "../../../theme/login/NewPassword.css";

// 비밀번호 정책 체크
function checkPasswordRules(pw = "") {
  return {
    length: pw.length >= 8,
    english: /[A-Za-z]/.test(pw),
    digit: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

function calcStrength(pw = "") {
  const rules = checkPasswordRules(pw);
  const score = Object.values(rules).filter(Boolean).length; // 0..4
  return { rules, score, percent: (score / 4) * 100 };
}

const RuleRow = ({ ok, label }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    {ok ? (
      <CheckCircleRounded fontSize="small" color="success" />
    ) : (
      <CancelRounded fontSize="small" color="disabled" />
    )}
    <Typography variant="caption" color={ok ? "success.main" : "text.secondary"}>
      {label}
    </Typography>
  </Stack>
);

export default function NewPasswordComponent({ onSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const { rules, percent } = useMemo(() => calcStrength(password), [password]);
  const matches = password.length > 0 && password === confirm;
  const canSubmit = !!token && matches && Object.values(rules).every(Boolean) && !submitting;


  useEffect(() => {
    let t = location.state?.token;

    if (!t) {
      const params = new URLSearchParams(location.search);
      t = params.get("token");
      if (t) {
        params.delete("token");
        navigate(
          { pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : "" },
          { replace: true }
        );
      }
    }
    if (t) setToken(t);
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setDone(true);
      if (typeof onSuccess === "function") onSuccess();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const msg = data?.message || data?.detail;

      if (status === 403) {
        setError("이미 사용 중인 비밀번호입니다. 다른 비밀번호를 입력해 주세요.");
      } else if (status === 400) {
        setError("링크가 만료되었거나 이미 사용되었습니다. 다시 요청해 주세요.");
      } else {
        setError(msg || "비밀번호 재설정에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <SignInContainer direction="column" justifyContent="space-between">
          <Card variant="outlined" className="np-card np-card-sm">
            <CardHeader title={<Typography variant="h5">비밀번호 재설정</Typography>} subheader="유효하지 않은 접근" />
            <CardContent>
              <Alert severity="warning" className="np-mb-16">
                잘못된 접근입니다. 로그인 화면에서 다시 시도해주세요.
              </Alert>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={() => navigate("/login")}>로그인으로</Button>
              </Stack>
            </CardContent>
          </Card>
        </SignInContainer>
      </AppTheme>
    );
  }

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined" component="form" onSubmit={handleSubmit} className="np-card">
          <Box component="img" src="/img/logo/logo.png" alt="Idle 고양이 로고" className="np-logo" />
          <Typography component="h1" variant="h4" className="np-title">새 비밀번호 설정</Typography>

          <Box noValidate className="np-form">
            {error && <Alert severity="error">{error}</Alert>}

            {done ? (
              <>
                <Alert severity="success" className="np-mb-16">
                  비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해 주세요.
                </Alert>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button fullWidth variant="contained" onClick={() => navigate("/login")}>로그인 하러 가기</Button>
                  <Button fullWidth variant="text" onClick={() => navigate("/")}>메인으로</Button>
                </Stack>
              </>
            ) : (
              <Stack spacing={3}>
                <TextField
                  label="비밀번호"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPw((v) => !v)} edge="end" aria-label="비밀번호 표시 토글">
                            {showPw ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box>
                  <LinearProgress variant="determinate" value={percent} className="np-strength-bar np-mb-8" />
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <RuleRow ok={rules.length} label="8자 이상" />
                    <RuleRow ok={rules.english} label="영문자 포함" />
                    <RuleRow ok={rules.digit} label="숫자 포함" />
                    <RuleRow ok={rules.special} label="특수문자 포함" />
                  </Stack>
                </Box>

                <TextField
                  label="비밀번호 확인"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  fullWidth
                  error={confirm.length > 0 && password !== confirm}
                  helperText={confirm.length > 0 && password !== confirm ? "비밀번호가 서로 일치하지 않습니다." : " "}
                  slotProps={{
                    formHelperText: { sx: { mt: 0, ml: 1 } },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" aria-label="비밀번호 확인 표시 토글">
                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!canSubmit}
                    fullWidth
                    startIcon={submitting ? <CircularProgress size={18} /> : null}
                  >
                    {submitting ? "변경 중..." : "비밀번호 변경"}
                  </Button>
                  <Button variant="text" fullWidth onClick={() => navigate("/login")}>취소</Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}