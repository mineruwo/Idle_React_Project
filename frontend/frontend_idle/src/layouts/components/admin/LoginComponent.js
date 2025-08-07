import { useState } from "react";
import { useDispatch } from "react-redux";
import { adminLogin } from "../../../slices/adminLoginSlice";
import { loginAdmin } from "../../../api/adminApi";
import useCustomMove from "../../../hooks/useCustomMove"; // useCustomMove 임포트
import Modal from "../common/Modal"; // Modal 컴포넌트 import
import './LoginComponent.css'; // CSS 파일 import

const LoginComponent = () => {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [autoClose, setAutoClose] = useState(null);

    const dispatch = useDispatch();
    const { moveToAdminPage } = useCustomMove(); // moveToAdminPage 가져오기

    const handleLogin = async () => {
        if (!id) {
            setModalMessage("아이디를 입력해주세요.");
            setShowModal(true);
            setAutoClose(null);
            return;
        }
        if (!password) {
            setModalMessage("비밀번호를 입력해주세요.");
            setShowModal(true);
            setAutoClose(null);
            return;
        }

        console.log("ID:", id, "Password:", password);
        try {
            const result = await loginAdmin(id, password);
            console.log("Login successful:", result);
            dispatch(adminLogin(result)); // Redux 상태 업데이트 시 result 전달
            setModalMessage("관리자 로그인 성공!");
            setShowModal(true);
            setAutoClose(1500);
        } catch (error) {
            console.error("Login failed:", error);
            setModalMessage("로그인 실패: " + (error.response ? error.response.data : error.message));
            setShowModal(true);
            setAutoClose(null);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleConfirm = () => {
        setShowModal(false);
        if (modalMessage === "관리자 로그인 성공!") {
            moveToAdminPage(); // 관리자 대시보드로 이동
        }
    }


    return (
        <div className="login-form-card bg-primary">
            <Modal show={showModal} message={modalMessage} onClose={closeModal} onConfirm={handleConfirm} autoCloseDelay={autoClose} />
            <h2>로그인</h2>
            <form>
                <div className="mb-3">
                    <label htmlFor="idInput" className="form-label">
                        아이디
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="idInput"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="passwordInput" className="form-label">
                        비밀번호
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        id="passwordInput"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-light w-100"
                    onClick={handleLogin}
                >
                    로그인
                </button>
            </form>
        </div>
    );
};

export default LoginComponent;

