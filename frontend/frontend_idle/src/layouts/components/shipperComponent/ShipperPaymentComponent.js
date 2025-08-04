import React, { useState } from "react";
import "../../../theme/ShipperCustomCss/ShipperPayment.css";

// props를 제거하고, 디자인 확인을 위해 currentPoints를 내부 상태로 관리합니다.
const ShipperPaymentComponent = () => {
    // 포인트 충전 관련 상태
    const [chargeAmount, setChargeAmount] = useState("");
    const [points, setPoints] = useState(15000); // 충전된 포인트 (기존 로직 유지)
    const recentHistory = [
        { type: "충전", amount: "+10,000", date: "2025-07-25" },
        { type: "사용", amount: "-3,500", date: "2025-07-27" },
        { type: "충전", amount: "+5,000", date: "2025-07-30" },
    ];

    // const handleCharge = () => {
    //     if (chargeAmount && !isNaN(chargeAmount)) {
    //         setPoints(points + parseInt(chargeAmount, 10));
    //         setChargeAmount("");
    //         alert(`${chargeAmount}P가 충전되었습니다.`);
    //     }
    // };

    const ClickChargeBtn = (
        pg_method,
        chargeAmount,
        nickname,
        redirect_url
    ) => {
        if (parseInt(chargeAmount, 10) < 1000) {
            alert("충전 금액은 1,000원 이상이어야 합니다.");
            return;
        }

        const { IMP } = window;
        IMP.init("imp16058080"); // 가맹점 번호 지정
        IMP.request_pay(
            {
                pg: "kakaopay", // 결제 방식 지정
                pay_method: "card",
                merchant_uid: `mid_${new Date().getTime()}`, // 현재 시간
                name: "포인트 충전",
                amount: `${chargeAmount}`, // 충전할 금액
                buyer_email: "구매자 이메일",
                buyer_name: `${nickname}`, // 충전 요청한 유저의 닉네임
                buyer_tel: "010-1222-2222",
                buyer_addr: "서울특별시 강남구 삼성동",
                buyer_postcode: "123-456",
                m_redirect_url: "http://localhost:3000/shipper/payment", // 만약 새창에서 열린다면 결제 완료 후 리다이렉션할 주소
            },
            function (rsp) {
                // callback
                if (rsp.success) {
                    // 만약 결제가 성공적으로 이루어졌다면
                    alert("결제 성공");
                } else {
                    alert(`결제 실패: ${rsp.error_msg}`);
                }
            }
        );
    };

    // 포인트 결제 관련 상태 (디자인 확인용)
    const [usePoints, setUsePoints] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    // props 대신 임시로 사용할 내부 상태
    const [currentPoints, setCurrentPoints] = useState(50000);

    // 백엔드 로직을 제거하고 UI 동작만 확인하도록 수정한 핸들러
    const handlePointPayment = () => {
        const pointsToUse = parseInt(usePoints, 10);

        if (isNaN(pointsToUse) || pointsToUse <= 0) {
            setMessage("결제할 포인트를 올바르게 입력해주세요.");
            return;
        }
        if (pointsToUse > currentPoints) {
            setMessage("사용 가능한 포인트보다 많은 금액입니다.");
            return;
        }

        setIsLoading(true);
        setMessage("결제 처리중...");

        // 1.5초 후 결제가 완료되었다는 메시지를 보여주는 시뮬레이션
        setTimeout(() => {
            setIsLoading(false);
            setMessage(
                `${pointsToUse.toLocaleString()}P 결제가 완료되었습니다.`
            );
            setCurrentPoints(currentPoints - pointsToUse); // 결제 후 포인트 차감
            setUsePoints(""); // 입력 필드 초기화
        }, 1500);
    };

    return (
        <div className="point-layout-container">
            {/* 왼쪽: 포인트 관리 섹션 */}
            <div className="point-management-section">
                <h2 className="page-title">포인트 관리</h2>
                <div className="point-balance-section">
                    <span className="point-balance-label">내 포인트</span>
                    <span className="point-balance-amount">
                        {points.toLocaleString()}P
                    </span>
                </div>

                <div className="point-charge-section">
                    <label htmlFor="charge-amount">충전할 금액</label>
                    <div className="charge-input-group">
                        <input
                            id="charge-amount"
                            type="number"
                            placeholder="포인트 금액 입력"
                            min="1000"
                            value={chargeAmount}
                            onChange={(e) => setChargeAmount(e.target.value)}
                        />
                        <button
                            className="charge-btn"
                            onClick={() =>
                                ClickChargeBtn(
                                    "kakaopay",
                                    chargeAmount,
                                    "nickname",
                                    "http://localhost:3000/redirect"
                                )
                            }
                        >
                            카카오페이
                        </button>
                    </div>
                </div>

                <div className="point-history-section">
                    <h3>최근 내역</h3>
                    <ul>
                        {recentHistory.map((item, idx) => (
                            <li
                                key={idx}
                                className={`history-item ${
                                    item.type === "충전" ? "plus" : "minus"
                                }`}
                            >
                                <span className="history-type">
                                    {item.type}
                                </span>
                                <span className="history-amount">
                                    {item.amount}P
                                </span>
                                <span className="history-date">
                                    {item.date}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 오른쪽: 포인트 결제 섹션 */}
            <div className="point-payment-section">
                <div className="point-payment-container">
                    <h2 className="page-title">포인트 결제하기</h2>
                    <div className="current-points">
                        현재 사용 가능 포인트:{" "}
                        <strong>{currentPoints.toLocaleString()}P</strong>
                    </div>
                    <div className="input-section">
                        <label htmlFor="usePoints">사용할 포인트</label>
                        <input
                            id="usePoints"
                            type="number"
                            min="1"
                            max={currentPoints}
                            value={usePoints}
                            onChange={(e) => setUsePoints(e.target.value)}
                            placeholder="결제에 사용할 포인트 입력"
                        />
                    </div>

                    <button
                        className="payment-btn"
                        onClick={handlePointPayment}
                        disabled={isLoading}
                    >
                        {isLoading ? "결제 처리중..." : "포인트로 결제하기"}
                    </button>

                    {message && <p className="payment-message">{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default ShipperPaymentComponent;
