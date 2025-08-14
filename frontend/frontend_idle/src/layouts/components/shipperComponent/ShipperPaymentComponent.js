import { useState, useEffect } from "react";
import "../../../theme/ShipperCustomCss/ShipperPayment.css";
import {
    payWithPoints,
    preparePayment,
    verifyPayment,
    fetchUserPoints,
    failPayment,
} from "../../../api/paymentApi";
import useCustomMove from "../../../hooks/useCustomMove";

const ShipperPaymentComponent = ({ nickname, userId, userEmail }) => {
    const [currentPoints, setCurrentPoints] = useState(0);
    const [usePoints, setUsePoints] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedPaymentType, setSelectedPaymentType] = useState("card");

    const { shipperMoveToPaymentSuccess } = useCustomMove();

    const [orderList, setOrderList] = useState([
        {
            orderId: "ORD123456789",
            itemName: "화물 운송 서비스",
            amount: 50000,
        },
    ]);

    const addOrder = () => {
        const newOrder = {
            orderId: `ORD${Math.floor(Math.random() * 1000000000)}`,
            itemName: "추가된 운송 서비스",
            amount: Math.floor(Math.random() * 100000) + 10000,
        };
        setOrderList((prevList) => [...prevList, newOrder]);
    };

    useEffect(() => {
        const getUserPoints = async () => {
            try {
                const response = await fetchUserPoints();
                setCurrentPoints(response.points);
            } catch (error) {
                console.error("Failed to fetch user points:", error);
            }
        };

        getUserPoints();
    }, [userId]);

    const totalAmount = orderList.reduce((sum, order) => sum + order.amount, 0);

    const handleMaxPointsClick = () => {
        const maxUsablePoints = Math.min(totalAmount, currentPoints);
        setUsePoints(maxUsablePoints.toString());
    };

    const handlePayment = async () => {
        const pointsToUse = parseInt(usePoints, 10) || 0;
        const totalOrderAmount = totalAmount;

        if (pointsToUse < 0) {
            setMessage("사용할 포인트는 0 이상이어야 합니다.");
            return;
        }
        if (pointsToUse > currentPoints) {
            setMessage("보유 포인트보다 많은 포인트를 사용할 수 없습니다.");
            return;
        }

        const amountToPayExternally = totalOrderAmount - pointsToUse;

        setIsLoading(true);
        setMessage("결제 처리중...");

        try {
            if (amountToPayExternally <= 0) {
                // 전액 포인트로 결제
                const response = await payWithPoints({
                    userId: userId,
                    points: totalOrderAmount, // 주문 금액만큼 포인트 사용
                });

                if (response.success) {
                    setMessage(
                        `${totalOrderAmount.toLocaleString()}P 포인트로 결제가 완료되었습니다.`
                    );
                    setCurrentPoints(
                        (prevPoints) => prevPoints - totalOrderAmount
                    );
                    setUsePoints("");
                } else {
                    setMessage(`포인트 결제 실패: ${response.message}`);
                }
            } else {
                // 일부 포인트 사용 후 외부 결제
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
                    alert("결제 수단을 선택해주세요.");
                    setIsLoading(false);
                    return;
                }

                const prepareResponse = await preparePayment({
                    merchantUid: merchantUid,
                    itemName:
                        orderList.length > 1
                            ? `${orderList[0].itemName} 외 ${
                                  orderList.length - 1
                              }건`
                            : orderList[0].itemName,
                    amount: amountToPayExternally, // 외부 결제 금액
                    buyerName: nickname,
                    buyerEmail: userEmail,
                    userId: userId,
                    pgProvider: pgProviderForBackend,
                    pointsToUse: pointsToUse,
                });

                if (!prepareResponse.success) {
                    setMessage(`결제 준비 실패: ${prepareResponse.message}`);
                    setIsLoading(false);
                    return;
                }

                const { IMP } = window;
                IMP.init("imp16058080");
                IMP.request_pay(
                    {
                        pg: pgToUse,
                        pay_method: payMethodToUse,
                        merchant_uid: merchantUid,
                        name:
                            orderList.length > 1
                                ? `${orderList[0].itemName} 외 ${
                                      orderList.length - 1
                                  }건`
                                : orderList[0].itemName,
                        amount: amountToPayExternally,
                        buyer_email: userEmail,
                        buyer_name: nickname,
                        buyer_tel: "010-1222-2222",
                        buyer_addr: "서울특별시 강남구 삼성동",
                        buyer_postcode: "123-456",
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
                                    const paymentInfo = {
                                        merchantUid: rsp.merchant_uid,
                                        itemName:
                                            orderList.length > 1
                                                ? `${
                                                      orderList[0].itemName
                                                  } 외 ${
                                                      orderList.length - 1
                                                  }건`
                                                : orderList[0].itemName,
                                        amount: amountToPayExternally,
                                        paidAt: new Date().toISOString(),
                                        pgProvider: pgProviderForBackend,
                                    };

                                    if (pointsToUse > 0) {
                                        setCurrentPoints(
                                            (prevPoints) =>
                                                prevPoints - pointsToUse
                                        );
                                        setUsePoints("");
                                    }
                                    shipperMoveToPaymentSuccess({
                                        paymentInfo,
                                    });
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
                            // 결제 실패 또는 취소 시
                            await failPayment(rsp.merchant_uid);
                            setMessage(`결제 실패: ${rsp.error_msg}`);
                            setIsLoading(false);
                        }
                    }
                );
            }
        } catch (error) {
            setMessage(`결제 처리 중 오류 발생: ${error.message}`);
            setIsLoading(false);
        }
    };

    const finalPaymentAmount = Math.max(
        0,
        totalAmount - (parseInt(usePoints, 10) || 0)
    );
    const supplyAmount = Math.round(finalPaymentAmount / 1.1);
    const vatAmount = finalPaymentAmount - supplyAmount;

    return (
        <div className="spp-point-layout-container">
            <div className="left-sections-wrapper">
                <button onClick={addOrder} style={{ marginBottom: "1rem" }}>
                    주문 정보 추가 테스트
                </button>

                <div className="order-info-section">
                    <h2 className="spp-page-title">주문 정보</h2>
                    {orderList.map((order) => (
                        <div className="order-item" key={order.orderId}>
                            <div className="order-amount">
                                <span>{order.orderId}</span>
                                <span>{order.amount.toLocaleString()}원</span>
                            </div>

                            <div className="order-details-wrap">
                                <ul className="order-info-table">
                                    <li>
                                        <span>상품명</span>
                                        <span>{order.itemName}</span>
                                    </li>
                                    <li>
                                        <span>출발지</span>
                                        <span>{order.origin}</span>
                                    </li>
                                    <li>
                                        <span>도착지</span>
                                        <span>{order.destination}</span>
                                    </li>
                                    <li>
                                        <span>화물 종류</span>
                                        <span>{order.cargoType}</span>
                                    </li>
                                </ul>
                                <ul className="order-info-table">
                                    <li>
                                        <span>크기</span>
                                        <span>{order.size}</span>
                                    </li>
                                    <li>
                                        <span>무게</span>
                                        <span>{order.weight}</span>
                                    </li>
                                    <li>
                                        <span>차량 종류</span>
                                        <span>{order.vehicleType}</span>
                                    </li>
                                    <li>
                                        <span>포장 여부</span>
                                        <span>{order.isPackaged}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="point-usage-section spp-point-management-section">
                    <h2 className="spp-page-title">포인트 사용</h2>
                    <div className="point-usage-details-content">
                        <div className="current-points">
                            현재 사용 가능 포인트:{" "}
                            <strong>
                                {(currentPoints || 0).toLocaleString()}P
                            </strong>
                        </div>

                        <div className="input-section">
                            <label htmlFor="usePoints">사용할 포인트</label>
                            <div className="point-input-group">
                                <input
                                    id="usePoints"
                                    type="number"
                                    min="0"
                                    max={currentPoints}
                                    value={usePoints}
                                    onChange={(e) =>
                                        setUsePoints(e.target.value)
                                    }
                                    placeholder="사용할 포인트 입력"
                                />
                                <button
                                    type="button"
                                    className="max-use-btn"
                                    onClick={handleMaxPointsClick}
                                >
                                    최대 사용
                                </button>
                            </div>
                        </div>

                        <div className="final-payment-info">
                            최종 결제 금액:{" "}
                            <span className="final-amount">
                                {finalPaymentAmount.toLocaleString()}원
                            </span>
                        </div>
                    </div>
                </div>

                <div className="spp-payment-method-section spp-point-management-section">
                    <h2 className="spp-page-title">결제 수단</h2>
                    <div className="payment-method-details-content">
                        <div className="payment-group">
                            <h3 className="payment-group-title">일반결제</h3>
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
                                        checked={selectedPaymentType === "card"}
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
                            <h3 className="payment-group-title">간편결제</h3>
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
                                            selectedPaymentType === "kakaopay"
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
                                            selectedPaymentType === "tosspay"
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
            </div>

            <div className="summary-section spp-point-management-section">
                <h2 className="spp-page-title">결제 요약</h2>
                <div className="summary-details-content">
                    <ul className="summary-table">
                        <li>
                            <span>주문 금액</span>
                            <span>{totalAmount.toLocaleString()}원</span>
                        </li>
                        <li>
                            <span>사용한 포인트</span>
                            <span className="point-discount">
                                -
                                {(
                                    parseInt(usePoints, 10) || 0
                                ).toLocaleString()}
                                P
                            </span>
                        </li>
                        <li className="summary-subtotal">
                            <span>합계 금액</span>
                            <span>
                                {(
                                    totalAmount - (parseInt(usePoints, 10) || 0)
                                ).toLocaleString()}
                                원
                            </span>
                        </li>
                        <li>
                            <span>과세 물품가액</span>
                            <span>{supplyAmount.toLocaleString()}원</span>
                        </li>
                        <li>
                            <span>부가세</span>
                            <span>{vatAmount.toLocaleString()}원</span>
                        </li>
                        <li className="final-amount-to-pay">
                            <span>최종 결제 금액</span>
                            <span className="final">
                                {finalPaymentAmount.toLocaleString()}원
                            </span>
                        </li>
                    </ul>
                </div>
                <button
                    className="payment-btn"
                    onClick={handlePayment}
                    disabled={isLoading || finalPaymentAmount < 0}
                >
                    {isLoading
                        ? "결제 처리중..."
                        : finalPaymentAmount <= 0
                        ? `${totalAmount.toLocaleString()}P 포인트로 결제하기`
                        : `${finalPaymentAmount.toLocaleString()}원 결제하기`}
                </button>

                {message && <p className="payment-message">{message}</p>}
            </div>
        </div>
    );
};

export default ShipperPaymentComponent;
