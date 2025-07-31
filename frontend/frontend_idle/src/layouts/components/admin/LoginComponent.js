import React, { useState } from 'react';
import './LoginComponent.css';

const LoginComponent = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // 로그인 로직 구현
    console.log('ID:', id, 'Password:', password);
  };

  return (
    <div className="login-wrapper">
      <div className="login-container bg-primary">
        <h2>로그인</h2>
        <form>
          <div className="mb-3">
            <label htmlFor="idInput" className="form-label">아이디</label>
            <input
              type="text"
              className="form-control"
              id="idInput"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passwordInput" className="form-label">비밀번호</label>
            <input
              type="password"
              className="form-control"
              id="passwordInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-light w-100" onClick={handleLogin}>
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;