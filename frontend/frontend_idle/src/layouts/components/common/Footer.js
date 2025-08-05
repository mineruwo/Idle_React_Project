import React from 'react';
import useCustomMove from "../../../hooks/useCustomMove";

const Footer = () => {
    const { moveToAdminPage } = useCustomMove();

    return (
        <>
            <footer className="bg-dark text-white py-4 mt-5">
                <div className="container text-center">
                    <p className="mb-1 fw-bold">IDLE</p>
                    <p className="mb-2 small">
                        주소: 경기도 성남시 중원구 운송로 123 | 고객센터: 1600-1234
                    </p>
                    <p className="mb-0 small">&copy; 2025 Pink Seongnam Logistics. All rights reserved.</p>
                    <div>
                        <button onClick={moveToAdminPage}>어드민 페이지</button>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Footer;