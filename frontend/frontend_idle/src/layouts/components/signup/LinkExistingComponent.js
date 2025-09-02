import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, CssBaseline, FormControl, FormLabel, TextField, Typography, Divider
} from "@mui/material";
import AppTheme from "../../../theme/muitheme/AppTheme";
import { UserCard as Card, UserContainer as Container } from "../../../theme/User/UserCard";
import { linkExisting } from "../../../api/snsApi";
import "../../../theme/signup/LinkExisting.css";

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
        <Card variant="outlined" className="le-card">
          <Box component="img" src="/img/logo/logo.png" alt="Idle 고양이 로고" className="le-logo" />

          <Typography component="h1" variant="h4" className="le-title">
            기존 계정 연결
          </Typography>

          <Box component="form" onSubmit={onSubmit} noValidate className="le-form">
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
              <Typography variant="body2" color="error" className="le-err">
                {err}
              </Typography>
            )}

            <Button type="submit" fullWidth variant="contained" className="le-submit" disabled={!canSubmit}>
              {loading ? "연결 중..." : "연결하기"}
            </Button>
          </Box>

        </Card>
      </Container>
    </AppTheme>
  );
}