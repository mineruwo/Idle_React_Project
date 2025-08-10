import { useState, useEffect } from "react";
import "../../../theme/ShipperCustomCss/ShipperPoint.css";
import {
    payWithPoints,
    preparePayment,
    verifyPayment,
    fetchUserPoints,
} from "../../../api/paymentApi";

const ShipperPointComponent = ({ nickname, userId }) => {
    const [currentPoints, setCurrentPoints] = useState(0);
    const CHARGE_PRESETS = [10000, 30000, 50000, 100000, 200000];
    const handlePresetClick = (amount) => setChargeAmount(amount);

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
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const ClickChargeBtn = async () => {
        const amount = parseInt(chargeAmount, 10);

        if (isNaN(amount) || amount < 1000) {
            setMessage("충전 금액은 1,000원 이상의 유효한 숫자여야 합니다.");
            return;
        }

        const merchantUid = `mid_${new Date().getTime()}`;

        let pgToUse = "";
        let payMethodToUse = "";
        let pgProviderForBackend = "";

        if (selectedPaymentType === "card") {
            pgToUse = "mobilians";
            payMethodToUse = "card";
            pgProviderForBackend = "mobilians";
        } else if (selectedPaymentType === "kakaopay") {
            pgToUse = "kakaopay";
            payMethodToUse = "card";
            pgProviderForBackend = "kakaopay";
        } else if (selectedPaymentType === "tosspay") {
            pgToUse = "tosspay";
            payMethodToUse = "card";
            pgProviderForBackend = "tosspay";
        } else if (selectedPaymentType === "payco") {
            pgToUse = "payco";
            payMethodToUse = "card";
            pgProviderForBackend = "payco";
        } else {
            setMessage("결제 수단을 선택해주세요.");
            return;
        }

        setIsLoading(true);
        setMessage("결제 처리중...");

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
                setMessage(`결제 준비 실패: ${prepareResponse.message}`);
                setIsLoading(false);
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
                                setMessage("결제 성공 및 검증 완료");
                                const newChargeAmount = parseInt(
                                    chargeAmount,
                                    10
                                );
                                setCurrentPoints(
                                    (prevPoints) => prevPoints + newChargeAmount
                                );
                                setChargeAmount("");
                            } else {
                                setMessage(
                                    `결제 검증 실패: ${verifyResponse.message}`
                                );
                            }
                        } catch (error) {
                            setMessage(
                                `결제 검증 중 오류 발생: ${error.message}`
                            );
                        } finally {
                            setIsLoading(false);
                        }
                    } else {
                        setMessage(`결제 실패: ${rsp.error_msg}`);
                        setIsLoading(false);
                    }
                }
            );
        } catch (error) {
            setMessage(`결제 준비 중 오류 발생: ${error.message}`);
            setIsLoading(false);
        }
    };

    return (
        <div className="point-layout-container">
            <div className="point-management-section">
                <h2 className="page-title">포인트</h2>
                <div className="point-charge-wrap">
                    <div className="charge-amount-select">
                        <div className="section-title">충전금액</div>
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

                    <div className="payment-method-section point-management-section">
                        <h2 className="page-title">결제 수단</h2>
                        <div className="payment-method-details-content">
                            <div className="payment-group">
                                <h3 className="payment-group-title">
                                    일반결제
                                </h3>
                                <div className="pay-method-list easy-payment-options">
                                    <label
                                        className={`payment-option ${
                                            selectedPaymentType === "card"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentType"
                                            value="card"
                                            checked={
                                                selectedPaymentType === "card"
                                            }
                                            onChange={(e) =>
                                                setSelectedPaymentType(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <span>일반결제</span>
                                    </label>
                                </div>
                            </div>
                            <div className="payment-group">
                                <h3 className="payment-group-title">
                                    간편결제
                                </h3>
                                <div className="pay-method-list easy-payment-options">
                                    <label
                                        className={`payment-option ${
                                            selectedPaymentType === "kakaopay"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentType"
                                            value="kakaopay"
                                            checked={
                                                selectedPaymentType ===
                                                "kakaopay"
                                            }
                                            onChange={(e) =>
                                                setSelectedPaymentType(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <span>카카오페이</span>
                                    </label>
                                    <label
                                        className={`payment-option ${
                                            selectedPaymentType === "tosspay"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentType"
                                            value="tosspay"
                                            checked={
                                                selectedPaymentType ===
                                                "tosspay"
                                            }
                                            onChange={(e) =>
                                                setSelectedPaymentType(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <span>토스페이</span>
                                    </label>
                                    <label
                                        className={`payment-option ${
                                            selectedPaymentType === "payco"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentType"
                                            value="payco"
                                            checked={
                                                selectedPaymentType === "payco"
                                            }
                                            onChange={(e) =>
                                                setSelectedPaymentType(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <span>페이코</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        className="submit-charge-btn"
                        disabled={isLoading || !chargeAmount}
                        onClick={() => ClickChargeBtn()}
                    >
                        {isLoading
                            ? "결제 처리중..."
                            : chargeAmount
                            ? `${Number(
                                  chargeAmount
                              ).toLocaleString()}원 충전하기`
                            : "금액을 입력해주세요"}
                    </button>
                    {message && <p className="payment-message">{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default ShipperPointComponent;
