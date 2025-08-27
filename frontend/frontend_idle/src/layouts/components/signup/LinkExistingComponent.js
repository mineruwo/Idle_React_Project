import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, CssBaseline, FormControl, FormLabel, TextField, Typography, Divider
} from "@mui/material";
import AppTheme from "../../../theme/muitheme/AppTheme";
import { UserCard as Card, UserContainer as Container } from "../../../theme/User/UserCard";
import { PinkTruckIcon } from "../common/IconComponent";
import { linkExisting } from "../../../api/snsApi"; 

export default function LinkExistingComponent(props) {
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => id && password && !loading, [id, password, loading]);

  const validate = () => {
    let ok = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!id || !emailRegex.test(id)) {
      setEmailErr(true); setEmailMsg("이메일 형식에 맞게 입력해주세요"); ok = false;
    } else { setEmailErr(false); setEmailMsg(""); }
    if (!password) {
      setPwErr(true); setPwMsg("비밀번호를 입력해주세요"); ok = false;
    } else { setPwErr(false); setPwMsg(""); }
    return ok;
    };

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setErr(""); setLoading(true);
    try {
      await linkExisting({ id, password });
      nav("/", { replace: true }); // 토큰 쿠키 세팅 후 메인으로
    } catch (e) {
      setErr(e?.message || "연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Container direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <PinkTruckIcon />
          <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
            기존 계정과 연결
          </Typography>

          <Box component="form" onSubmit={onSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="id">로그인 ID(이메일)</FormLabel>
              <TextField
                id="id" name="id" type="email" placeholder="your@email.com"
                value={id} onChange={(e) => setId(e.target.value)}
                error={emailErr} helperText={emailMsg} fullWidth variant="outlined"
                color={emailErr ? "error" : "primary"}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">비밀번호</FormLabel>
              <TextField
                id="password" name="password" type="password" placeholder="••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                error={pwErr} helperText={pwMsg} fullWidth variant="outlined"
                color={pwErr ? "error" : "primary"}
              />
            </FormControl>

            {err && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {err}
              </Typography>
            )}

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 1 }} disabled={!canSubmit}>
              {loading ? "연결 중..." : "연결하기"}
            </Button>
          </Box>

          <Divider sx={{ mt: 2 }}>
            <Typography sx={{ color: "text.secondary" }}>안내</Typography>
          </Divider>
          <Typography variant="body2" color="text.secondary">
            연결 후에는 해당 SNS로 빠르게 로그인할 수 있어요.
          </Typography>
        </Card>
      </Container>
    </AppTheme>
  );
}