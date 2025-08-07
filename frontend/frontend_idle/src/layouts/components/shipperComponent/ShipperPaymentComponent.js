import React, { useState, useEffect } from "react";
import "../../../theme/ShipperCustomCss/ShipperPayment.css";
import {
    payWithPoints,
    preparePayment,
    verifyPayment,
    fetchUserPoints,
} from "../../../api/paymentApi";

const ShipperPaymentComponent = ({
    remainingLimit = 500000,
    nickname,
    userId,
}) => {
    const [currentPoints, setCurrentPoints] = useState(0);

    useEffect(() => {
        const getUserPoints = async () => {
            try {
                const response = await fetchUserPoints(userId);
                setCurrentPoints(response.points);
            } catch (error) {
                console.error("Failed to fetch user points:", error);
            }
        };

        getUserPoints();
    }, [userId]);

    // 포인트 충전
    const [chargeAmount, setChargeAmount] = useState("");
    const [selectedPaymentType, setSelectedPaymentType] = useState("card");
    const [recentHistory, setRecentHistory] = useState([
        { type: "충전", amount: "+10,000", date: "2025-07-25" },
        { type: "사용", amount: "-3,500", date: "2025-07-27" },
        { type: "충전", amount: "+5,000", date: "2025-07-30" },
    ]);

    const ClickChargeBtn = async () => {
        const amount = parseInt(chargeAmount, 10);

        if (isNaN(amount) || amount < 1000) {
            alert("충전 금액은 1,000원 이상의 유효한 숫자여야 합니다.");
            return;
        }

        const merchantUid = `mid_${new Date().getTime()}`;

        let pgToUse = "";
        let payMethodToUse = "";
        let pgProviderForBackend = "";

        if (selectedPaymentType === "card") {
            pgToUse = "html5_inicis";
            payMethodToUse = "card";
            pgProviderForBackend = "html5_inicis";
        } else if (selectedPaymentType === "kakaopay") {
            pgToUse = "kakaopay";
            payMethodToUse = "card";
            pgProviderForBackend = "kakaopay";
        } else if (selectedPaymentType === "inicis") {
            pgToUse = "html5_inicis";
            payMethodToUse = "card";
            pgProviderForBackend = "html5_inicis";
        } else if (selectedPaymentType === "tosspay") {
            pgToUse = "tosspay";
            payMethodToUse = "card";
            pgProviderForBackend = "tosspay";
        } else if (selectedPaymentType === "payco") {
            pgToUse = "payco";
            payMethodToUse = "card";
            pgProviderForBackend = "payco";
        } else if (selectedPaymentType === "mobilians") {
            pgToUse = "mobilians";
            payMethodToUse = "card";
            pgProviderForBackend = "mobilians";
        } else {
            alert("결제 수단을 선택해주세요.");
            return;
        }

        try {
            const prepareResponse = await preparePayment({
                merchantUid: merchantUid,
                itemName: "포인트 충전",
                amount: amount,
                buyerName: nickname,
                buyerEmail: "buyer@example.com", // 실제 사용자 이메일로 변경 필요
                userId: userId,
                pgProvider: pgProviderForBackend,
            });

            if (!prepareResponse.success) {
                alert(`결제 준비 실패: ${prepareResponse.message}`);
                return;
            }

            // 포트원(아임포트) 결제창 호출
            const { IMP } = window;
            IMP.init("imp16058080");
            IMP.request_pay(
                {
                    pg: pgToUse,
                    pay_method: payMethodToUse,
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
                                );
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

    // 포인트 결제
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
            await payWithPoints(userId, pointsToUse);

            setMessage(
                `${pointsToUse.toLocaleString()}P 결제가 완료되었습니다.`
            );

            setCurrentPoints((prevPoints) => prevPoints - pointsToUse);

            const newHistory = {
                type: "사용",
                amount: `-${pointsToUse.toLocaleString()}`,
                date: new Date().toISOString().split("T")[0],
            };
            setRecentHistory((prevHistory) =>
                [newHistory, ...prevHistory].slice(0, 3)
            );

            setUsePoints("");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const CHARGE_PRESETS = [10000, 30000, 50000, 100000, 200000];
    const handlePresetClick = (amount) => setChargeAmount(amount);

    return (
        <div className="point-layout-container">
            {/* 왼쪽: 포인트 관리 섹션 */}
            <div className="point-management-section">
                <h2 className="page-title">포인트 관리</h2>
                <div className="point-charge-wrap">
                    <div className="point-balance-box">
                        <span className="label">충전포인트 잔액</span>
                        <span className="amount-highlight">
                            {currentPoints.toLocaleString()}P
                        </span>
                    </div>

                    <div className="charge-amount-select">
                        <div className="section-title">
                            충전금액
                            <span className="remaining-limit">
                                남은 충전 한도 {remainingLimit.toLocaleString()}
                                원
                            </span>
                        </div>
                        <div className="preset-list">
                            {CHARGE_PRESETS.map((amt) => (
                                <button
                                    type="button"
                                    key={amt}
                                    onClick={() => handlePresetClick(amt)}
                                    className={`preset-btn${
                                        chargeAmount == amt ? " selected" : ""
                                    }`}
                                >
                                    {amt / 10000}만원
                                </button>
                            ))}
                        </div>
                        <div className="explain-box">
                            <span>
                                카드/새로운 포인트 충전금액 제한이 있습니다.
                            </span>
                        </div>
                    </div>

                    <ul className="charge-point-table">
                        <li>
                            현재 잔액{" "}
                            <span>{currentPoints.toLocaleString()}P</span>
                        </li>
                        <li>
                            충전할 포인트{" "}
                            <span className="plus">
                                +{Number(chargeAmount || 0).toLocaleString()}P
                            </span>
                        </li>
                        <li className="after-charge-pt">
                            충전 후 예상 포인트{" "}
                            <span className="final">
                                {(
                                    Number(currentPoints) +
                                    Number(chargeAmount || 0)
                                ).toLocaleString()}
                                P
                            </span>
                        </li>
                    </ul>

                    <div className="pay-method-section">
                        <div className="section-title">결제수단</div>
                        <div className="pay-method-list">
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
                                일반결제
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="kakaopay"
                                    checked={selectedPaymentType === "kakaopay"}
                                    onChange={(e) =>
                                        setSelectedPaymentType(e.target.value)
                                    }
                                />
                                카카오페이
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="inicis"
                                    checked={selectedPaymentType === "inicis"}
                                    onChange={(e) =>
                                        setSelectedPaymentType(e.target.value)
                                    }
                                />
                                이니시스
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
                                토스페이
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
                                페이코
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="mobilians"
                                    checked={
                                        selectedPaymentType === "mobilians"
                                    }
                                    onChange={(e) =>
                                        setSelectedPaymentType(e.target.value)
                                    }
                                />
                                모빌리언스
                            </label>
                        </div>
                    </div>

                    <button
                        className="submit-charge-btn"
                        disabled={!chargeAmount || chargeAmount < 10000}
                        onClick={() => ClickChargeBtn()}
                    >
                        {chargeAmount
                            ? `${Number(
                                  chargeAmount
                              ).toLocaleString()}원 결제하기`
                            : "충전 금액을 입력하세요"}
                    </button>
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
