import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const BANKS = [
  { code: "004", name: "KB국민" },
  { code: "088", name: "신한" },
  { code: "020", name: "우리" },
  { code: "003", name: "IBK기업" },
  { code: "011", name: "NH농협" },
];

export default function BankAccountModalPortal({ open, onClose, onSubmit }) {
  const [bankCode, setBankCode] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setBankCode("");
      setAccountNo("");
      setErr("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const digitsOnly = (v) => v.replace(/\D/g, "");
  const submit = async () => {
    if (!bankCode) return setErr("은행을 선택하세요.");
    if (!accountNo || accountNo.length < 8) return setErr("계좌번호를 정확히 입력하세요.");
    try {
      setSubmitting(true);
      await onSubmit({ bankCode, accountNo });
      onClose(true);
    } catch (e) {
      setErr(e.message || "요청 실패");
      setSubmitting(false);
    }
  };

  return createPortal(
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.4)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999
    }}>
      <div style={{ width:"100%", maxWidth:420, background:"#fff", borderRadius:12, padding:20, boxShadow:"0 10px 30px rgba(0,0,0,.2)" }}>
        <h3 style={{ marginBottom:12 }}>정산 계좌 입력</h3>

        <label style={{ display:"block", marginBottom:10 }}>
          <div style={{ fontSize:12, color:"#666", marginBottom:6 }}>은행</div>
          <select value={bankCode} onChange={(e)=>setBankCode(e.target.value)} style={{ width:"100%", padding:"8px 10px" }}>
            <option value="">은행을 선택하세요</option>
            {BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </label>

        <label style={{ display:"block", marginBottom:10 }}>
          <div style={{ fontSize:12, color:"#666", marginBottom:6 }}>계좌번호</div>
          <input
            value={accountNo}
            onChange={(e)=>setAccountNo(digitsOnly(e.target.value))}
            placeholder="숫자만 입력"
            inputMode="numeric"
            style={{ width:"100%", padding:"8px 10px" }}
          />
        </label>

        {err && <div style={{ color:"#d00", marginBottom:10 }}>{err}</div>}

        <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button onClick={()=>onClose(false)} disabled={submitting}>취소</button>
          <button onClick={submit} disabled={submitting} style={{ background:"#2563eb", color:"#fff", padding:"8px 14px", borderRadius:6 }}>
            {submitting ? "전송 중..." : "정산 신청"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}