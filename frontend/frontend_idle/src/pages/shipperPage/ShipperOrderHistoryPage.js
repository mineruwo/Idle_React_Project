import React, { useState } from 'react';
import ShipperInvoiceComponent from '../../layouts/components/shipperComponent/ShipperInvoiceComponent';
import '../../theme/ShipperCustomCss/ShipperOrderHistory.css';

// Mock Data for Completed Deliveries
const mockCompletedData = [
  {
    orderId: 'ORD123456789',
    completionDate: '2023년 10월 27일',
    itemName: '서울 강남구 -> 부산 해운대구',
    amount: 55000,
    driverName: '김기사',
    vehicleNumber: '12가 3456',
    status: 'INVOICE_ISSUED',
    shipperName: '삼성전자', // 화주 정보 추가
    shipperBizNum: '124-81-12345'
  },
  {
    orderId: 'ORD123456790',
    completionDate: '2023년 10월 25일',
    itemName: '인천 연수구 -> 대구 수성구',
    amount: 72000,
    driverName: '이운전',
    vehicleNumber: '34나 7890',
    status: 'DELIVERY_COMPLETED',
    shipperName: 'LG전자',
    shipperBizNum: '129-81-12345'
  },
  {
    orderId: 'ORD123456792',
    completionDate: '2023년 8월 02일',
    itemName: '서울 강서구 -> 경기 수원시 영통구',
    amount: 35000,
    driverName: '박기사',
    vehicleNumber: '56다 1234',
    status: 'DELIVERY_COMPLETED',
    shipperName: 'SK하이닉스',
    shipperBizNum: '134-81-12345'
  },
];

// Modal Component
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
  const [orders, setOrders] = useState(mockCompletedData);
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
    setSelectedOrder(order);
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
                <p className="item-amount">{order.amount.toLocaleString()}원</p>
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
