import { useState } from "react";
import { useDispatch } from "react-redux";
import { adminLogin } from "../../../slices/adminLoginSlice";
import { loginAdmin } from "../../../api/adminApi";
import useCustomMove from "../../../hooks/useCustomMove";
import Modal from "../common/Modal";
import '../../../theme/admin.css'; // 공통 CSS 파일 import

const LoginComponent = () => {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [autoClose, setAutoClose] = useState(null);

    const dispatch = useDispatch();
    const { moveToAdminPage } = useCustomMove();

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

        try {
            const result = await loginAdmin(id, password);
            dispatch(adminLogin(result));
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
            moveToAdminPage();
        }
    }

    return (
        <div className="login-page-container">
            <Modal show={showModal} message={modalMessage} onClose={closeModal} onConfirm={handleConfirm} autoCloseDelay={autoClose} />
            <div className="login-form-box">
                <h2 className="login-header">관리자 로그인</h2>
                <form>
                    <div className="admin-form-group">
                        <label htmlFor="idInput">아이디</label>
                        <input
                            type="text"
                            id="idInput"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label htmlFor="passwordInput">비밀번호</label>
                        <input
                            type="password"
                            id="passwordInput"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="admin-primary-btn"
                        onClick={handleLogin}
                        style={{ width: '100%', marginTop: '20px' }}
                    >
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginComponent;