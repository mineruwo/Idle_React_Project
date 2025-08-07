import { useState } from "react";
import { useDispatch } from "react-redux";
import { adminLogin } from "../../../slices/adminLoginSlice";
import './LoginComponent.css'; // CSS 파일 import

const LoginComponent = () => {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch();
    
    const handleLogin = () => {
        console.log("ID:", id, "Password:", password);
        dispatch(adminLogin()); 
    };

    return (
        <div className="login-form-card bg-primary">
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
