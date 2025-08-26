import React, { useState, useEffect } from 'react';
import ShipperInvoiceComponent from '../../layouts/components/shipperComponent/ShipperInvoiceComponent';
import '../../theme/ShipperCustomCss/ShipperOrderHistory.css';
import { fetchMyOrders } from '../../api/orderApi';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="modal-close-btn" onClick={onClose}>&times;</span>
        {children}
      </div>
    </div>
  );
};

const ShipperOrderHistoryPage = () => {
  const [orders, setOrders] = useState([]); // Initialize with empty array
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const loadCompletedOrders = async () => {
      try {
        setLoading(true);
        const allOrders = await fetchMyOrders();
        const completed = allOrders.filter(order => order.status === 'COMPLETED');
        setOrders(completed);
      } catch (err) {
        console.error("Failed to fetch completed orders:", err);
        setError("완료된 운송 내역을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadCompletedOrders();
  }, []); // Empty dependency array means this runs once on mount

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Simple print handler using window.print
  const handlePrint = () => {
    window.print();
  };

  const getStatusInfo = (status) => {
    switch (status.toUpperCase()) {
      case 'DELIVERY_COMPLETED':
        return { className: 'completed', text: '배송완료' };
      case 'INVOICE_ISSUED':
        return { className: 'issued', text: '계산서 발행됨' };
      default:
        return { className: 'default', text: status };
    }
  };

  const handleIssueInvoiceClick = (order) => {
    // Combine real order data with mock shipper details for the invoice
    const invoiceOrder = {
      ...order,
      // Add mock shipper details for invoice component
      shipperCeo: '화주 대표명',
      shipperBizNum: order.shipperBizNum || '화주 사업자번호', // Use real if available, else mock
      shipperAddress: '화주 주소',
      shipperBizType: '화주 업태',
      shipperBizItem: '화주 종목',
      itemName: order.itemName || `${order.departure} -> ${order.arrival}`, // Use real itemName or derive
      shipperName: order.shipperNickname || '화주 상호명', // Use real nickname or mock
    };
    setSelectedOrder(invoiceOrder);
    setIsModalOpen(true);
  };

  return (
    <div className="history-container">
      <h1 className="history-title">완료된 운송 내역</h1>
      {orders.length > 0 ? (
        orders.map(order => {
          const statusInfo = getStatusInfo(order.status);
          const isInvoiceIssued = order.status === 'INVOICE_ISSUED';
          return (
            <div className="order-card" key={order.orderId}>
              <div className="order-header">
                <div className="order-info">
                  완료일: <span className="order-date">{order.completionDate}</span>
                </div>
                <span className={`order-status ${statusInfo.className}`}>{statusInfo.text}</span>
              </div>
              <div className="order-details">
                <div>
                  <p className="item-name">{order.itemName}</p>
                  <div className="order-info" style={{ marginTop: '0.5rem' }}>
                    {`담당기사: ${order.driverName} (${order.vehicleNumber}) / 주문번호: ${order.orderId}`}
                  </div>
                </div>
                <p className="item-amount">{(order.driverPrice || order.proposedPrice || 0).toLocaleString()}원</p>
              </div>
              <div className="card-actions">
                <button 
                  className="action-btn"
                  onClick={() => handleIssueInvoiceClick(order)}
                  disabled={isInvoiceIssued}
                >
                  {isInvoiceIssued ? '발행 완료' : '세금계산서 발행'}
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p>완료된 운송 내역이 없습니다.</p>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ShipperInvoiceComponent order={selectedOrder} handlePrint={handlePrint} />
      </Modal>
    </div>
  );
};

export default ShipperOrderHistoryPage;
