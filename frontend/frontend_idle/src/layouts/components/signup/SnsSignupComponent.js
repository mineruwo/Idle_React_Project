import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, CssBaseline, FormControl, FormControlLabel, FormLabel,
  Radio, RadioGroup, TextField, Typography
} from "@mui/material";
import AppTheme from "../../../theme/muitheme/AppTheme";
import { UserCard as Card, UserContainer as Container } from "../../../theme/User/UserCard";
import { snsSignup } from "../../../api/snsApi";
import "../../../theme/signup/SnsSignup.css";

export default function SnsSignupComponent(props) {
  const nav = useNavigate();
  const [customName, setCustomName] = useState("");
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("shipper");
  const [nameErr, setNameErr] = useState("");
  const [nickErr, setNickErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => customName && nickname && !loading, [customName, nickname, loading]);

  const validate = () => {
    let ok = true;
    const nameRegex = /^[가-힣a-zA-Z]{2,20}$/;
    if (!customName || !nameRegex.test(customName)) { setNameErr("이름은 한글/영문 2~20자"); ok = false; }
    else setNameErr("");
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;
    if (!nickname || !nicknameRegex.test(nickname)) { setNickErr("닉네임은 2~10자, 한영숫자"); ok = false; }
    else setNickErr("");
    return ok;
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setErr(""); setLoading(true);
    try {
      await snsSignup({ customName, nickname, role });
      nav("/", { replace: true }); // 토큰 쿠키 세팅 후 메인으로
    } catch (e) {
      setErr(e?.message || "가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Container direction="column" justifyContent="space-between">
        <Card variant="outlined" className="sns-card">
          <Box component="img" src="/img/logo/logo.png" alt="Idle 고양이 로고" className="sns-logo" />

          <Typography component="h1" variant="h4" className="sns-title">
            SNS 신규가입
          </Typography>

          <Box component="form" onSubmit={onSubmit} className="sns-form">
            {/* 사용자이름 */}
            <FormControl>
              <FormLabel htmlFor="customName">이름</FormLabel>
              <TextField
                id="customName" name="customName" placeholder="홍길동"
                value={customName} onChange={(e) => setCustomName(e.target.value)}
                error={!!nameErr} helperText={nameErr} fullWidth variant="outlined"
                color={nameErr ? "error" : "primary"}
              />
            </FormControl>

            {/* 닉네임 */}
            <FormControl>
              <FormLabel htmlFor="nickname">닉네임</FormLabel>
              <TextField
                id="nickname" name="nickname" placeholder="idle"
                value={nickname} onChange={(e) => setNickname(e.target.value)}
                error={!!nickErr} helperText={nickErr} fullWidth variant="outlined"
                color={nickErr ? "error" : "primary"}
              />
            </FormControl>

            {/* 회원 유형 */}
            <FormControl component="fieldset">
              <FormLabel>회원 유형</FormLabel>
              <RadioGroup row name="userType" value={role} onChange={(e) => setRole(e.target.value)}>
                <FormControlLabel value="shipper" control={<Radio />} label="화주" />
                <FormControlLabel value="carrier" control={<Radio />} label="차주" />
              </RadioGroup>
            </FormControl>

            {err && (
              <Typography variant="body2" color="error" className="sns-err">
                {err}
              </Typography>
            )}

            <Button type="submit" fullWidth variant="contained" disabled={!canSubmit}>
              {loading ? "가입 처리 중..." : "가입 완료"}
            </Button>
          </Box>
        </Card>
      </Container>
    </AppTheme>
  );
}