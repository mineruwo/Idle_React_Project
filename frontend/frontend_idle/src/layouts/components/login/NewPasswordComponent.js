import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormHelperText,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CancelRounded from "@mui/icons-material/CancelRounded";
import { useNavigate, useSearchParams } from "react-router-dom";
// ⚠️ 프로젝트에 맞게 경로 조정
// axios 인스턴스: 로그인 등에서 사용하던 api 인스턴스 재사용
// 예: import api from "../../api/authApi";
// import api from "../../api/authApi";

// 비밀번호 정책 체크
function checkPasswordRules(pw = "") {
  return {
    length: pw.length >= 8,
    caseMix: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
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
  const [searchParams] = useSearchParams();
  const ticket = searchParams.get("ticket") || ""; // reset-ticket (일회용)

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const { rules, score, percent } = useMemo(() => calcStrength(password), [password]);
  const matches = password.length > 0 && password === confirm;

  const canSubmit = ticket && matches && Object.values(rules).every(Boolean) && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    
    // try {
    //   // 서버 규격: { ticket, newPassword }
    //   await api.post("/auth/reset-password", { ticket, newPassword: password });
    //   setDone(true);
    //   if (typeof onSuccess === "function") onSuccess();
    // } catch (err) {
    //   const msg = err?.response?.data?.message || "비밀번호 재설정에 실패했습니다. 링크가 만료되었거나 이미 사용되었을 수 있어요.";
    //   setError(msg);
    // } finally {
    //   setSubmitting(false);
    // }
  };

//   if (!ticket) {
//     return (
//       <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" p={2}>
//         <Card sx={{ width: "100%", maxWidth: 440 }}>
//           <CardHeader title="비밀번호 재설정" subheader="유효하지 않은 접근" />
//           <CardContent>
//             <Alert severity="warning" sx={{ mb: 2 }}>
//               이메일로 받은 재설정 링크에 포함된 토큰(ticket)이 없습니다. 비밀번호 찾기 화면에서 다시 시도해주세요.
//             </Alert>
//             <Stack direction="row" spacing={1}>
//               <Button variant="outlined" onClick={() => navigate("/forgot-password")}>비밀번호 찾기</Button>
//               <Button variant="text" onClick={() => navigate("/login")}>로그인으로</Button>
//             </Stack>
//           </CardContent>
//         </Card>
//       </Box>
//     );
//   }

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" p={2}>
      <Card sx={{ width: "100%", maxWidth: 480 }} component="form" onSubmit={handleSubmit}>
        <CardHeader
          title={<Typography variant="h5">새 비밀번호 설정</Typography>}
          subheader="비밀번호는 안전하게 암호화되어 저장됩니다"
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          {done ? (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해 주세요.
              </Alert>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button fullWidth variant="contained" onClick={() => navigate("/login")}>로그인 하러 가기</Button>
                <Button fullWidth variant="text" onClick={() => navigate("/")}>메인으로</Button>
              </Stack>
            </>
          ) : (
            <Stack spacing={2}>
              <TextField
                label="새 비밀번호"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw((v) => !v)} edge="end" aria-label="비밀번호 표시 토글">
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box>
                <LinearProgress variant="determinate" value={percent} sx={{ borderRadius: 1, mb: 1 }} />
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <RuleRow ok={rules.length} label="8자 이상" />
                  <RuleRow ok={rules.caseMix} label="대/소문자 혼합" />
                  <RuleRow ok={rules.digit} label="숫자 포함" />
                  <RuleRow ok={rules.special} label="특수문자 포함" />
                </Stack>
              </Box>

              <TextField
                label="새 비밀번호 확인"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" aria-label="비밀번호 확인 표시 토글">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {!matches && confirm.length > 0 && (
                <FormHelperText error>비밀번호가 서로 일치하지 않습니다.</FormHelperText>
              )}

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
        </CardContent>
      </Card>
    </Box>
  );
}
