import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../../theme/ShipperCustomCss/ShipperPaymentSuccessPage.css';

const ShipperPaymentSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { paymentInfo } = location.state || {};

    if (!paymentInfo) {
        return (
            <div className="spp-success-container">
                <div className="spp-success-card">
                    <h2>잘못된 접근입니다.</h2>
                    <p>결제 정보를 찾을 수 없습니다.</p>
                    <button onClick={() => navigate('/')} className="spp-success-btn">메인으로 돌아가기</button>
                </div>
            </div>
        );
    }

    return (
        <div className="spp-success-container">
            <div className="spp-success-card">
                <div className="spp-success-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle cx="26" cy="26" r="25" fill="#4CAF50"/>
                        <path fill="#FFF" d="M14.1 27.2l7.1 7.2 16.7-16.8L36.6 16l-15.4 15.5-5.8-5.9z"/>
                    </svg>
                </div>
                <h1 className="spp-success-title">결제가 성공적으로 완료되었습니다!</h1>
                <p className="spp-success-message">주문해 주셔서 감사합니다. 결제 정보는 다음과 같습니다.</p>

                <div className="spp-success-summary">
                    <h2 className="spp-summary-title">결제 요약</h2>
                    <ul>
                        <li><strong>주문 번호:</strong> <span>{paymentInfo.merchantUid}</span></li>
                        <li><strong>상품명:</strong> <span>{paymentInfo.itemName}</span></li>
                        <li><strong>결제 금액:</strong> <span>{paymentInfo.amount?.toLocaleString()}원</span></li>
                        <li><strong>결제 일시:</strong> <span>{new Date(paymentInfo.paidAt).toLocaleString()}</span></li>
                        <li><strong>결제 수단:</strong> <span>{paymentInfo.pgProvider}</span></li>
                    </ul>
                </div>

                <div className="spp-success-actions">
                    <button onClick={() => navigate('/shipper/order-history')} className="spp-success-btn">주문 내역 확인</button>
                    <button onClick={() => navigate('/')} className="spp-success-btn spp-success-btn-secondary">메인으로 돌아가기</button>
                </div>
            </div>
        </div>
    );
};

export default ShipperPaymentSuccessPage;
