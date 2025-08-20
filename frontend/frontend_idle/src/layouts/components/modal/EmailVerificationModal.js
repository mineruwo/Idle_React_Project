import { useState } from "react";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { sendSignupEmailCode, verifySignupEmailCode } from "../../../api/emailApi";

export default function EmailVerificationModal({ open, onClose, onVerified, email }) {
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  const sendCode = async () => {
    await sendSignupEmailCode(email);
    setSent(true);
    alert("인증 코드가 발송되었습니다.");
  };

  const verifyCode = async () => {
    const { data } = await verifySignupEmailCode(email, code);
    if (data?.ok && data?.verified === true) {
      alert("이메일 인증이 완료되었습니다!");
      onVerified();
      onClose();
    } else {
      alert("인증 코드가 올바르지 않습니다.");
    }
  };


  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, bgcolor: 'background.paper',
        borderRadius: 2, boxShadow: 24, p: 4
      }}>
        <Typography variant="h6">이메일 인증</Typography>
        <Stack spacing={2} mt={2}>
          <Button variant="contained" onClick={sendCode} disabled={sent}>
            {sent ? "코드 발송됨" : "인증 코드 발송"}
          </Button>
          <TextField
            label="인증 코드"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button variant="contained" onClick={verifyCode}>
            인증하기
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}