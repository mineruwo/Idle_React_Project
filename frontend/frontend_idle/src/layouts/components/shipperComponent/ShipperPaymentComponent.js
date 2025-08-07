import React, { useState, useEffect } from "react";
import "../../../theme/ShipperCustomCss/ShipperPayment.css";
import {
    payWithPoints,
    preparePayment,
    verifyPayment,
    fetchUserPoints,
} from "../../../api/paymentApi";

// props를 적용하여 컴포넌트를 동적으로 만듭니다.
const ShipperPaymentComponent = ({
    nickname,
    userId, // userId prop 추가
}) => {
    const [currentPoints, setCurrentPoints] = useState(0); // 포인트 상태를 컴포넌트 내부에서 관리

    useEffect(() => {
        const getUserPoints = async () => {
            try {
                const response = await fetchUserPoints(userId);
                setCurrentPoints(response.points); // 백엔드에서 받은 포인트로 업데이트
            } catch (error) {
                console.error("Failed to fetch user points:", error);
                // 에러 처리: 사용자에게 메시지를 표시하거나 기본값 설정 등
            }
        };

        getUserPoints();
    }, [userId]); // userId가 변경될 때마다 실행

    // 포인트 충전 관련 상태
    const [chargeAmount, setChargeAmount] = useState("");
    const [selectedPaymentType, setSelectedPaymentType] = useState("card"); // 기본값 신용카드 일반결제
    const [recentHistory, setRecentHistory] = useState([
        { type: "충전", amount: "+10,000", date: "2025-07-25" },
        { type: "사용", amount: "-3,500", date: "2025-07-27" },
        { type: "충전", amount: "+5,000", date: "2025-07-30" },
    ]);

    const ClickChargeBtn = async (
        chargeAmount,
        nickname,
        redirect_url,
        selectedPaymentType // 변경된 파라미터 이름
    ) => {
        const amount = parseInt(chargeAmount, 10);

        if (isNaN(amount) || amount < 1000) {
            alert("충전 금액은 1,000원 이상의 유효한 숫자여야 합니다.");
            return;
        }

        const merchantUid = `mid_${new Date().getTime()}`;

        let pgToUse = "";
        let payMethodToUse = "";
        let pgProviderForBackend = ""; // 백엔드에 전달할 실제 PG사

        if (selectedPaymentType === "card") {
            pgToUse = "html5_inicis"; // 신용카드 일반결제 (KG이니시스 예시)
            payMethodToUse = "card";
            pgProviderForBackend = "html5_inicis";
        } else if (selectedPaymentType === "easy") {
            pgToUse = "kakaopay"; // 간편결제 (카카오페이 예시)
            payMethodToUse = "card"; // 카카오페이는 내부적으로 카드 결제 사용
            pgProviderForBackend = "kakaopay";
        } else if (selectedPaymentType === "transfer") {
            pgToUse = "html5_inicis"; // 계좌이체 (KG이니시스 예시)
            payMethodToUse = "trans"; // 실시간 계좌이체
            pgProviderForBackend = "html5_inicis";
        } else if (selectedPaymentType === "tosspay") {
            pgToUse = "tosspay"; // 토스페이
            payMethodToUse = "card"; // 토스페이는 카드 결제 방식 사용
            pgProviderForBackend = "tosspay";
        } else if (selectedPaymentType === "payco") {
            pgToUse = "payco"; // 페이코
            payMethodToUse = "card"; // 페이코는 카드 결제 방식 사용
            pgProviderForBackend = "payco";
        } else {
            alert("결제 수단을 선택해주세요.");
            return;
        }

        try {
            // 1. 백엔드에 결제 준비 요청
            const prepareResponse = await preparePayment({
                merchantUid: merchantUid,
                itemName: "포인트 충전",
                amount: amount,
                buyerName: nickname,
                buyerEmail: "buyer@example.com", // 실제 사용자 이메일로 변경 필요
                userId: userId, // 백엔드에 userId 전달
                pgProvider: pgProviderForBackend, // 백엔드에 실제 PG사 정보 전달
            });

            if (!prepareResponse.success) {
                alert(`결제 준비 실패: ${prepareResponse.message}`);
                return;
            }

            // 2. 포트원(아임포트) 결제창 호출
            const { IMP } = window;
            IMP.init("imp16058080"); // 가맹점 번호 지정
            IMP.request_pay(
                {
                    pg: pgToUse, // 선택된 PG사로 설정
                    pay_method: payMethodToUse, // 선택된 결제 방식으로 설정
                    merchant_uid: merchantUid,
                    name: "포인트 충전",
                    amount: amount,
                    buyer_email: "buyer@example.com", // 실제 사용자 이메일로 변경 필요
                    buyer_name: nickname,
                    buyer_tel: "010-1222-2222", // 실제 사용자 전화번호로 변경 필요
                    buyer_addr: "서울특별시 강남구 삼성동", // 실제 사용자 주소로 변경 필요
                    buyer_postcode: "123-456", // 실제 사용자 우편번호로 변경 필요
                    m_redirect_url: "http://localhost:3000/shipper/payment",
                },
                async (rsp) => {
                    if (rsp.success) {
                        // 3. 백엔드에 결제 검증 요청
                        try {
                            const verifyResponse = await verifyPayment({
                                impUid: rsp.imp_uid,
                                merchantUid: rsp.merchant_uid,
                            });

                            if (verifyResponse.success) {
                                alert("결제 성공 및 검증 완료");
                                const newChargeAmount = parseInt(
                                    chargeAmount,
                                    10
                                );
                                setCurrentPoints(
                                    (prevPoints) => prevPoints + newChargeAmount
                                ); // 포인트 업데이트
                                const newHistory = {
                                    type: "충전",
                                    amount: `+${newChargeAmount.toLocaleString()}`,
                                    date: new Date()
                                        .toISOString()
                                        .split("T")[0],
                                };
                                setRecentHistory((prevHistory) =>
                                    [newHistory, ...prevHistory].slice(0, 3)
                                );
                                setChargeAmount("");
                            } else {
                                alert(
                                    `결제 검증 실패: ${verifyResponse.message}`
                                );
                            }
                        } catch (error) {
                            alert(`결제 검증 중 오류 발생: ${error.message}`);
                        }
                    } else {
                        alert(`결제 실패: ${rsp.error_msg}`);
                    }
                }
            );
        } catch (error) {
            alert(`결제 준비 중 오류 발생: ${error.message}`);
        }
    };

    // 포인트 결제 관련 상태
    const [usePoints, setUsePoints] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handlePointPayment = async () => {
        const pointsToUse = parseInt(usePoints, 10);

        if (isNaN(pointsToUse) || pointsToUse <= 0) {
            setMessage("결제할 포인트를 올바르게 입력해주세요.");
            return;
        }
        if (pointsToUse > (currentPoints || 0)) {
            setMessage("사용 가능한 포인트보다 많은 금액입니다.");
            return;
        }

        setIsLoading(true);
        setMessage("결제 처리중...");

        try {
            // API 호출
            await payWithPoints(userId, pointsToUse); // userId prop 사용

            // API 호출 성공
            setMessage(
                `${pointsToUse.toLocaleString()}P 결제가 완료되었습니다.`
            );

            setCurrentPoints((prevPoints) => prevPoints - pointsToUse); // 포인트 업데이트

            // 최근 내역에 추가하고 3개로 제한
            const newHistory = {
                type: "사용",
                amount: `-${pointsToUse.toLocaleString()}`,
                date: new Date().toISOString().split("T")[0],
            };
            setRecentHistory((prevHistory) =>
                [newHistory, ...prevHistory].slice(0, 3)
            );

            setUsePoints(""); // 입력 필드 초기화
        } catch (error) {
            // 네트워크 오류 또는 API 에러 처리
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="point-layout-container">
            {/* 왼쪽: 포인트 관리 섹션 */}
            <div className="point-management-section">
                <h2 className="page-title">포인트 관리</h2>
                <div className="point-balance-section">
                    <span className="point-balance-label">내 포인트</span>
                    <span className="point-balance-amount">
                        {(currentPoints || 0).toLocaleString()}P
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
                                    chargeAmount,
                                    nickname,
                                    "http://localhost:3000/redirect",
                                    selectedPaymentType // 선택된 결제 타입 전달
                                )
                            }
                        >
                            포인트 충전
                        </button>
                    </div>
                    <div className="payment-method-selection">
                        <label>
                            <input
                                type="radio"
                                name="paymentType"
                                value="card"
                                checked={selectedPaymentType === "card"}
                                onChange={(e) =>
                                    setSelectedPaymentType(e.target.value)
                                }
                            />
                            신용카드 일반결제
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="paymentType"
                                value="easy"
                                checked={selectedPaymentType === "easy"}
                                onChange={(e) =>
                                    setSelectedPaymentType(e.target.value)
                                }
                            />
                            간편결제 (카카오페이)
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="paymentType"
                                value="tosspay"
                                checked={selectedPaymentType === "tosspay"}
                                onChange={(e) =>
                                    setSelectedPaymentType(e.target.value)
                                }
                            />
                            간편결제 (토스페이)
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="paymentType"
                                value="payco"
                                checked={selectedPaymentType === "payco"}
                                onChange={(e) =>
                                    setSelectedPaymentType(e.target.value)
                                }
                            />
                            간편결제 (페이코)
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="paymentType"
                                value="transfer"
                                checked={selectedPaymentType === "transfer"}
                                onChange={(e) =>
                                    setSelectedPaymentType(e.target.value)
                                }
                            />
                            계좌이체
                        </label>
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
                        <strong>
                            {(currentPoints || 0).toLocaleString()}P
                        </strong>
                    </div>
                    <div className="input-section">
                        <label htmlFor="usePoints">사용할 포인트</label>
                        <input
                            id="usePoints"
                            type="number"
                            min="1"
                            max={currentPoints || 0}
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
