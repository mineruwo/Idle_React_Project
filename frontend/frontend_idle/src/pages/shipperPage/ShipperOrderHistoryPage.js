import React, { useState, useEffect, useRef } from "react";
import ShipperInvoiceComponent from "../../layouts/components/shipperComponent/ShipperInvoiceComponent";
import "../../theme/ShipperCustomCss/ShipperOrderHistory.css";
import { fetchMyOrders, updateOrder } from "../../api/orderApi";

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="modal-close-btn" onClick={onClose}>
                    &times;
                </span>
                {children}
            </div>
        </div>
    );
};

const ShipperOrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("ALL");

    const invoiceRef = useRef();

    const handlePrint = async () => {
        if (!selectedOrder || !invoiceRef.current) {
            alert("인쇄할 내용이 없습니다.");
            return;
        }

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert(
                "팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요."
            );
            return;
        }

        const invoiceHTML = invoiceRef.current.innerHTML;
        const originalStyles = Array.from(document.styleSheets)
            .map((styleSheet) => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map((rule) => rule.cssText)
                        .join("");
                } catch (e) {
                    console.warn(
                        "Cannot read some CSS rules due to security restrictions: ",
                        e
                    );
                    return "";
                }
            })
            .join("\n");

        printWindow.document.write(
            `
                <html>
                    <head>
                        <title>세금계산서 인쇄</title>
                        <style>${originalStyles}</style>
                    </head>
                    <body>
                        ${invoiceHTML}
                    </body>
                </html>
            `
        );

        printWindow.document.close();
        printWindow.focus();

        // 인쇄 대화상자가 닫힐 때까지 기다리는 Promise
        const printPromise = new Promise((resolve) => {
            let printed = false;
            const printListener = (mql) => {
                if (!mql.matches) {
                    printed = true;
                    resolve(true);
                }
            };

            const mediaQueryList = printWindow.matchMedia("print");
            // addEventListener에 once 옵션을 주어 한번만 실행되게 함
            if (mediaQueryList.addEventListener) {
                mediaQueryList.addEventListener("change", printListener, {
                    once: true,
                });
            } else {
                // fallback for older browsers
                mediaQueryList.addListener(printListener);
            }

            // 사용자가 인쇄를 누르거나, PDF 저장을 완료했을 때
            printWindow.onafterprint = () => {
                if (!printed) {
                    printed = true;
                    resolve(true);
                }
            };

            // 사용자가 인쇄 창을 그냥 닫았을 때
            printWindow.onbeforeunload = () => {
                if (!printed) {
                    printed = true;
                    resolve(false); // 인쇄하지 않고 닫았으므로 false
                }
            };

            printWindow.print();
        });

        const wasPrinted = await printPromise;
        printWindow.close(); // 작업이 끝났으므로 인쇄 창을 닫음

        if (wasPrinted) {
            try {
                // 인쇄 작업이 완료된 후에 API 호출 및 상태 업데이트 진행
                const updatedData = {
                    taxInvoiceIssued: true,
                    taxInvoiceNumber: `INV-${
                        selectedOrder.id
                    }-${new Date().getFullYear()}`,
                };
                const response = await updateOrder(
                    selectedOrder.id,
                    updatedData
                );

                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id === selectedOrder.id
                            ? { ...order, ...response }
                            : order
                    )
                );

                // 모든 작업이 끝난 후 모달을 닫고 최종 알림 표시
                setIsModalOpen(false);
                alert("세금계산서 발행이 완료되었습니다.");
            } catch (error) {
                console.error("세금계산서 발행 실패:", error);
                alert("세금계산서 발행에 실패했습니다.");
            }
        }
    };

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                const allOrders = await fetchMyOrders();
                const relevantOrders = allOrders.filter(
                    (order) =>
                        order.status === "COMPLETED" ||
                        order.taxInvoiceIssued === true
                );
                setOrders(relevantOrders);
            } catch (err) {
                setError("운송 내역을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const getStatusInfo = (status) => {
        switch (status.toUpperCase()) {
            case "COMPLETED":
                return { className: "completed", text: "배송완료" };
            default:
                return { className: "default", text: status };
        }
    };

    const handleIssueInvoiceClick = (order) => {
        const invoiceOrder = {
            ...order,
            shipperCeo: "화주 대표명",
            shipperBizNum: order.shipperBizNum || "화주 사업자번호",
            shipperAddress: "화주 주소",
            shipperBizType: "화주 업태",
            shipperBizItem: "화주 종목",
            itemName:
                order.itemName || `${order.departure} -> ${order.arrival}`,
            shipperName: order.shipperNickname || "화주 상호명",
        };
        setSelectedOrder(invoiceOrder);
        setIsModalOpen(true);
    };

    const filteredOrders = orders.filter((order) => {
        if (filter === "ALL") return true;
        if (filter === "COMPLETED")
            return (
                order.status === "COMPLETED" && order.taxInvoiceIssued !== true
            );
        if (filter === "INVOICE_ISSUED_FILTER")
            return order.taxInvoiceIssued === true;
        return false;
    });

    return (
        <div className="history-container">
            <h1 className="history-title">오더 내역</h1>

            <div className="filter-controls">
                <button
                    onClick={() => setFilter("ALL")}
                    className={filter === "ALL" ? "active" : ""}
                >
                    전체
                </button>
                <button
                    onClick={() => setFilter("COMPLETED")}
                    className={filter === "COMPLETED" ? "active" : ""}
                >
                    배송완료
                </button>
                <button
                    onClick={() => setFilter("INVOICE_ISSUED_FILTER")}
                    className={
                        filter === "INVOICE_ISSUED_FILTER" ? "active" : ""
                    }
                >
                    계산서 발행됨
                </button>
            </div>

            {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const isInvoiceIssued = order.taxInvoiceIssued;
                    return (
                        <div className="order-card" key={order.id}>
                            <div className="order-header">
                                <div className="order-id">
                                    주문번호: {order.orderNo}
                                </div>
                                <span
                                    className={`order-status ${
                                        isInvoiceIssued
                                            ? "issued"
                                            : statusInfo.className
                                    }`}
                                >
                                    {isInvoiceIssued
                                        ? "계산서 발행됨"
                                        : statusInfo.text}
                                </span>
                            </div>
                            <div className="order-body">
                                <div className="order-route">
                                    <span className="route-label">출발지:</span>{" "}
                                    {order.departure}
                                </div>
                                <div className="order-route">
                                    <span className="route-label">도착지:</span>{" "}
                                    {order.arrival}
                                </div>
                                <div className="order-item">
                                    <span className="item-label">품목:</span>{" "}
                                    {order.cargoType}
                                </div>
                                <div className="order-driver">
                                    <span className="driver-label">
                                        담당기사:
                                    </span>{" "}
                                    {order.assignedDriverNickname}
                                </div>
                                <div className="order-date-info">
                                    <span className="date-label">완료일:</span>{" "}
                                    {new Date(
                                        order.departedAt
                                    ).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="order-footer">
                                <p className="item-amount">
                                    {(
                                        order.driverPrice ||
                                        order.proposedPrice ||
                                        0
                                    ).toLocaleString()}
                                    원
                                </p>
                                <button
                                    className="action-btn"
                                    onClick={() =>
                                        handleIssueInvoiceClick(order)
                                    }
                                    disabled={isInvoiceIssued}
                                >
                                    {isInvoiceIssued
                                        ? "발행 완료"
                                        : "세금계산서 발행"}
                                </button>
                            </div>
                        </div>
                    );
                })
            ) : (
                <p>해당 내역이 없습니다.</p>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ShipperInvoiceComponent
                    ref={invoiceRef}
                    order={selectedOrder}
                />
                <div className="invoice-actions">
                    <button className="print-btn" onClick={handlePrint}>
                        발행 및 인쇄
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ShipperOrderHistoryPage;
