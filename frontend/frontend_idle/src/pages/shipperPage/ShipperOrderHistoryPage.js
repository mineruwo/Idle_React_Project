import React, { useState, useEffect } from "react";
import ShipperInvoiceComponent from "../../layouts/components/shipperComponent/ShipperInvoiceComponent";
import "../../theme/ShipperCustomCss/ShipperOrderHistory.css";
import { fetchMyOrders } from "../../api/orderApi";

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
    const [filter, setFilter] = useState("ALL"); // 'ALL', 'COMPLETED', 'INVOICE_ISSUED'

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                const allOrders = await fetchMyOrders();
                const relevantOrders = allOrders.filter(
                    (order) =>
                        order.status === "COMPLETED" ||
                        order.status === "INVOICE_ISSUED"
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

    const handlePrint = () => {
        window.print();
    };

    const getStatusInfo = (status) => {
        switch (status.toUpperCase()) {
            case "COMPLETED":
                return { className: "completed", text: "배송완료" };
            case "INVOICE_ISSUED":
                return { className: "issued", text: "계산서 발행됨" };
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
        return order.status === filter;
    });

    return (
        <div className="history-container">
            <h1 className="history-title">완료된 운송 내역</h1>

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
                    onClick={() => setFilter("INVOICE_ISSUED")}
                    className={filter === "INVOICE_ISSUED" ? "active" : ""}
                >
                    계산서 발행됨
                </button>
            </div>

            {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const isInvoiceIssued = order.status === "INVOICE_ISSUED";
                    return (
                        <div className="order-card" key={order.id}>
                            <div className="order-header">
                                <div className="order-id">
                                    주문번호: {order.orderNo}
                                </div>
                                <span
                                    className={`order-status ${statusInfo.className}`}
                                >
                                    {statusInfo.text}
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
                    order={selectedOrder}
                    handlePrint={handlePrint}
                />
            </Modal>
        </div>
    );
};

export default ShipperOrderHistoryPage;
