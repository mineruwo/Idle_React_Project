import { useEffect, useState } from "react";
import "../../../../theme/CarOwner/profile.css";
import { useNavigate } from "react-router-dom";
import useCustomMove from "../../../../hooks/useCustomMove";

// 위 코드에서 쓰던 API를 페이지로 이식
import {
  fetchCarOwnerProfileMe,
  updateCarOwnerProfile,
  checkNicknameAvailable,
} from "../../../../api/CarOwnerProfileApi";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { carOwnerMoveToLisense } = useCustomMove();

  // 백엔드 연동 필드 (customName, nickname, phone)
  const [form, setForm] = useState({ customName: "", nickname: "", phone: "" });
  const [nickOk, setNickOk] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // UI에만 쓰이는 보조 필드 (백엔드 저장 X)
  const [uiExtra, setUiExtra] = useState({
    insurance: "",
    driverLisense: "", // 기존 철자 유지 (프로젝트 다른 부분과의 충돌 방지)
    // email은 백엔드 모델에 없어서 제외. 필요하면 백엔드에 컬럼/DTO 추가 후 연결.
  });

  useEffect(() => {
    let mounted = true;
    fetchCarOwnerProfileMe()
      .then((u) => {
        if (!mounted) return;
        setForm({
          customName: u?.customName || "",
          nickname: u?.nickname || "",
          phone: u?.phone || "",
        });
      })
      .catch((e) => setErr(e.message));
    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onChangeExtra = (e) => {
    const { name, value } = e.target;
    setUiExtra((prev) => ({ ...prev, [name]: value }));
  };

  const onCheckNickname = async () => {
    try {
      const ok = await checkNicknameAvailable(form.nickname);
      setNickOk(ok);
      if (!ok) alert("이미 사용 중인 닉네임입니다.");
    } catch (e) {
      alert("닉네임 확인 실패: " + e.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await updateCarOwnerProfile(form); // { customName, nickname, phone }
      alert("수정 완료!");
      navigate("../profile");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (err) return <div className="editprofile-wrapper">에러: {err}</div>;

  return (
    <div className="editprofile-wrapper">
      <div className="editprofile-card">
        <div className="profile-avatar" />
        <div className="profileEdit">
          <form className="edit-form" onSubmit={onSubmit}>
            {/* Full Name -> customName(이름) */}
            <label>
              Full Name
              <input
                name="customName"
                value={form.customName}
                onChange={onChange}
                maxLength={30}
                placeholder="예) 홍길동"
              />
            </label>

            {/* Username -> nickname(닉네임) + 중복 확인 */}
            <label>
              Username
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  name="nickname"
                  value={form.nickname}
                  onChange={onChange}
                  maxLength={20}
                  placeholder="예) hong123"
                />
                <button type="button" onClick={onCheckNickname}>
                  중복확인
                </button>
              </div>
              {!nickOk && (
                <span style={{ color: "red", fontSize: 12 }}>사용 불가</span>
              )}
            </label>

            {/* Email -> 백엔드 모델에 없음: 숨기거나 컬럼 추가 전까지 주석 처리 권장
            <label>
              Email
              <input name="email" value={uiExtra.email} onChange={onChangeExtra}/>
            </label>
            */}

            {/* 휴대폰(backend: phone) */}
            <label>
              Phone
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="010-1234-5678"
              />
            </label>

            {/* Insurance / DriverLisense: 백엔드 저장 대상 아님 */}
            <label>
              Insurance
              <input
                name="insurance"
                value={uiExtra.insurance}
                onChange={onChangeExtra}
                placeholder="000-000-000-00"
              />
            </label>

            <label>
              DriverLisense
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  name="driverLisense"
                  value={uiExtra.driverLisense}
                  onChange={onChangeExtra}
                  placeholder="000-0000-000"
                />
                <button
                  className="driverbtn"
                  type="button"
                  onClick={carOwnerMoveToLisense}
                >
                  증서 제출
                </button>
              </div>
            </label>

            <button className="btn" type="submit" disabled={saving}>
              {saving ? "저장 중..." : "Save"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;