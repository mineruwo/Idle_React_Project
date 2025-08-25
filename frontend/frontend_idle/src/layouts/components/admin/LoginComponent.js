import { useState } from "react";
import { useDispatch } from "react-redux";
import { adminLogin } from "../../../slices/adminLoginSlice";
import { loginAdmin } from "../../../api/adminApi";
import useCustomMove from "../../../hooks/useCustomMove";
import Modal from "../common/Modal";
import '../../../theme/admin.css';

const initialState = {
    id: "",
    password: "",
};

const LoginComponent = () => {
    const [loginInfo, setLoginInfo] = useState(initialState);
    const [modalState, setModalState] = useState({ show: false, message: "", autoClose: null });

    const dispatch = useDispatch();
    const { moveToAdminPage } = useCustomMove();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo({ ...loginInfo, [name]: value });
    };

    const showModal = (message, autoClose = null) => {
        setModalState({ show: true, message, autoClose });
    };

    const handleLogin = async () => {
        const { id, password } = loginInfo;
        if (!id) {
            showModal("아이디를 입력해주세요.");
            return;
        }
        if (!password) {
            showModal("비밀번호를 입력해주세요.");
            return;
        }

        try {
            const result = await loginAdmin(id, password);
            dispatch(adminLogin(result));
            showModal("관리자 로그인 성공!", 1500);
        } catch (error) {
            console.error("Login failed:", error);
            const errorMessage = error.response ? error.response.data : error.message;
            showModal(`로그인 실패: ${errorMessage}`);
        }
    };

    const closeModal = () => {
        setModalState({ ...modalState, show: false });
    };

    const handleConfirm = () => {
        closeModal();
        if (modalState.message === "관리자 로그인 성공!") {
            moveToAdminPage();
        }
    }

    return (
        <div className="login-page-container">
            <Modal show={modalState.show} message={modalState.message} onClose={closeModal} onConfirm={handleConfirm} autoCloseDelay={modalState.autoClose} />
            <div className="login-form-box">
                <h2 className="login-header">관리자 로그인</h2>
                <form>
                    <div className="admin-form-group">
                        <label htmlFor="id">아이디</label>
                        <input
                            type="text"
                            id="id"
                            name="id"
                            value={loginInfo.id}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="admin-form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={loginInfo.password}
                            onChange={handleChange}
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
