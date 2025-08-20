import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useState } from 'react';
import { sendResetEmailCode, verifyResetEmailCode } from '../../../api/emailApi';
import { CircularProgress, FormHelperText, Stack } from '@mui/material';

function ForgotPasswordModal({ open, handleClose, onVerified }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendMsg, setSendMsg] = useState("");

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");

  const isEmailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  const handleSend = async () => {
    setSendMsg("");
    if (!isEmailValid(email)) {
      setSendMsg("이메일 형식이 올바르지 않습니다.");
      return;
    }
    setSending(true);
    try {
      await sendResetEmailCode(email);
      setSent(true);
      setSendMsg("인증 코드가 이메일로 전송되었습니다.");
    } catch (e) {
      setSendMsg("코드 전송에 실패했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    setVerifyMsg("");
    if (!code.trim()) {
      setVerifyMsg("인증 코드를 입력하세요.");
      return;
    }
    setVerifying(true);
    try {
      const { data } = await verifyResetEmailCode(email, code);
      const token = data?.token;
      
     if (token) {
        setVerifyMsg("인증이 완료되었습니다.");
        if (typeof onVerified === "function") {
          onVerified({ email, token }); 
        }
        resetStateOnClose();
      } else {
        setVerifyMsg("인증 코드가 올바르지 않거나 만료되었습니다.");
      }
    } catch (e) {
      setVerifyMsg("인증 중 오류가 발생했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  const resetStateOnClose = () => {
    setEmail("");
    setSending(false);
    setSent(false);
    setSendMsg("");
    setCode("");
    setVerifying(false);
    setVerifyMsg("");
    handleClose();
  };

  return (
    <Dialog open={open} onClose={resetStateOnClose}>
      <DialogTitle>비밀번호 찾기</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, width: 420 }}>
        <DialogContentText>
          이메일을 입력한 뒤 인증 코드를 받아 입력하세요.
        </DialogContentText>

        <Stack direction="row" spacing={1} alignItems="center">
          <OutlinedInput
            sx={{ flex: 1, minWidth: 0 }}
            required
            id="email"
            name="email"
            placeholder="이메일 주소"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!sendMsg && !sent}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sending || !isEmailValid(email)}
            sx={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', flexShrink: 0, px: 1.5 }}
          >
            {sending ? <CircularProgress size={20} /> : sent ? "재전송" : "전송"}
          </Button>
        </Stack>
        {sendMsg && (
          <FormHelperText error={!sent} sx={{ ml: 0 }}>
            {sendMsg}
          </FormHelperText>
        )}

        {/* 코드 입력 + 인증 버튼 (전송 후 노출) */}
        {sent && (
          <>
            <Stack direction="row" spacing={1} alignItems="center">
              <OutlinedInput
              sx={{ flex: 1, minWidth: 0 }}
                required
                id="code"
                name="code"
                placeholder="인증 코드"
                fullWidth
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={!!verifyMsg && verifyMsg !== "인증이 완료되었습니다."}
              />
              <Button
                variant="outlined"
                onClick={handleVerify}
                disabled={verifying || !code.trim()}
                sx={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', flexShrink: 0, px: 1.5 }}
              >
                {verifying ? <CircularProgress size={20} /> : "인증하기"}
              </Button>
            </Stack>
            {verifyMsg && (
              <FormHelperText
                error={verifyMsg !== "인증이 완료되었습니다."}
                sx={{ ml: 0 }}
              >
                {verifyMsg}
              </FormHelperText>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ pb: 2, px: 3 }}>
        <Button onClick={resetStateOnClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ForgotPasswordModal;