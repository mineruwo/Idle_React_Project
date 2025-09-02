import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import { CircularProgress, FormHelperText, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { sendSignupEmailCode, verifySignupEmailCode } from '../../../api/emailApi';
import '../../../theme/signup/EmailVerification.css';

export default function EmailVerificationModal({ open, onClose, onVerified, email }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendMsg, setSendMsg] = useState('');

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  const isEmailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  useEffect(() => {
    if (open) {
      setSending(false);
      setSent(false);
      setSendMsg('');
      setCode('');
      setVerifying(false);
      setVerifyMsg('');
    }
  }, [open]);

  const handleSend = async () => {
    setSendMsg('');
    if (!isEmailValid(email)) {
      setSendMsg('이메일 형식이 올바르지 않습니다. 모달 열기 전 이메일을 다시 확인하세요.');
      return;
    }
    setSending(true);
    try {
      await sendSignupEmailCode(email);
      setSent(true);
      setSendMsg('인증 코드가 이메일로 전송되었습니다.');
    } catch {
      setSendMsg('코드 전송에 실패했습니다. 잠시 후 다시 시도하세요.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    setVerifyMsg('');
    if (!code.trim()) {
      setVerifyMsg('인증 코드를 입력하세요.');
      return;
    }
    setVerifying(true);
    try {
      const { data } = await verifySignupEmailCode(email, code);
      if (data?.ok && data?.verified === true) {
        setVerifyMsg('인증이 완료되었습니다.');
        if (typeof onVerified === 'function') onVerified();
        resetStateOnClose();
      } else {
        setVerifyMsg('인증 코드가 올바르지 않거나 만료되었습니다.');
      }
    } catch {
      setVerifyMsg('인증 중 오류가 발생했습니다.');
    } finally {
      setVerifying(false);
    }
  };

  const resetStateOnClose = () => {
    setSending(false);
    setSent(false);
    setSendMsg('');
    setCode('');
    setVerifying(false);
    setVerifyMsg('');
    onClose?.();
  };

   return (
    <Dialog open={open} onClose={resetStateOnClose}>
      <DialogTitle>이메일 인증</DialogTitle>

      <DialogContent className="ev-content">
        <DialogContentText>
          입력한 이메일로 인증 코드를 전송합니다
          {email ? (
            <>
              <br />
              <strong className="ev-email">{email}</strong>
            </>
          ) : null}
        </DialogContentText>

        {!sent && (
          <>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={sending || !isEmailValid(email)}
                className="ev-btn ev-send-btn"
              >
                {sending ? <CircularProgress size={20} /> : '인증 코드 발송'}
              </Button>
            </Stack>
            {sendMsg && (
              <FormHelperText error={!sent} className="ev-helper">
                {sendMsg}
              </FormHelperText>
            )}
          </>
        )}
        
        {sent && (
          <>
            <Stack direction="row" spacing={1} alignItems="center">
              <OutlinedInput
                required
                id="code"
                name="code"
                placeholder="인증 코드"
                fullWidth
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={!!verifyMsg && verifyMsg !== '인증이 완료되었습니다.'}
                className="ev-code-input"
              />
              <Button
                variant="outlined"
                onClick={handleVerify}
                disabled={verifying || !code.trim()}
                className="ev-btn ev-verify-btn"
              >
                {verifying ? <CircularProgress size={20} /> : '인증하기'}
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="text"
                onClick={handleSend}
                disabled={sending}
                className="ev-btn ev-resend-btn"
              >
                {sending ? <CircularProgress size={18} /> : '코드 재전송'}
              </Button>
            </Stack>

            {verifyMsg && (
              <FormHelperText
                error={verifyMsg !== '인증이 완료되었습니다.'}
                className="ev-helper"
              >
                {verifyMsg}
              </FormHelperText>
            )}
          </>
        )}
      </DialogContent>

      {/* 하단 패딩 CSS로 이동 */}
      <DialogActions className="ev-actions">
        <Button onClick={resetStateOnClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
