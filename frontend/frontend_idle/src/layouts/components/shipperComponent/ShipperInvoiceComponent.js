import React from 'react';
import '../../../theme/ShipperCustomCss/Invoice.css';

const ShipperInvoiceComponent = ({ order, handlePrint }) => {
  if (!order) return null;

  // Calculate amounts
  const supplyAmount = Math.round(order.amount / 1.1);
  const taxAmount = order.amount - supplyAmount;

  return (
    <div className="invoice-wrapper">
      <div className="invoice-header">
        <h1>세금계산서</h1>
      </div>

      <div className="info-tables">
        <table className="info-table">
          <thead>
            <tr>
              <th colSpan="4" style={{backgroundColor: '#e0e0e0'}}>공급자 (보내는 사람)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>상호</th>
              <td colSpan="3">(주)IDLE 로지스틱스</td>
            </tr>
            <tr>
              <th>대표</th>
              <td>홍길동</td>
              <th>사업자등록번호</th>
              <td>123-45-67890</td>
            </tr>
            <tr>
              <th>주소</th>
              <td colSpan="3">서울특별시 강남구 테헤란로 123</td>
            </tr>
            <tr>
              <th>업태</th>
              <td>서비스</td>
              <th>종목</th>
              <td>화물운송주선</td>
            </tr>
          </tbody>
        </table>

        <table className="info-table">
          <thead>
            <tr>
              <th colSpan="4" style={{backgroundColor: '#e0e0e0'}}>공급받는 자 (받는 사람)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>상호</th>
              <td colSpan="3">{order.shipperName || '화주 상호명'}</td>
            </tr>
            <tr>
              <th>대표</th>
              <td>{order.shipperCeo || '화주 대표명'}</td>
              <th>사업자등록번호</th>
              <td>{order.shipperBizNum || '화주 사업자번호'}</td>
            </tr>
            <tr>
              <th>주소</th>
              <td colSpan="3">{order.shipperAddress || '화주 주소'}</td>
            </tr>
            <tr>
              <th>업태</th>
              <td>{order.shipperBizType || '화주 업태'}</td>
              <th>종목</th>
              <td>{order.shipperBizItem || '화주 종목'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table className="items-table">
        <thead>
          <tr>
            <th>작성일자</th>
            <th>공급가액</th>
            <th colSpan="2">세액</th>
          </tr>
        </thead>
        <tbody>
            <tr>
                <td>{new Date().toLocaleDateString()}</td>
                <td className="text-right">{supplyAmount.toLocaleString()}</td>
                <td colSpan="2" className="text-right">{taxAmount.toLocaleString()}</td>
            </tr>
            <tr>
                <th colSpan="4">합계금액: {order.amount.toLocaleString()}원</th>
            </tr>
            <tr>
                <th>품목</th>
                <th>규격</th>
                <th>수량</th>
                <th>단가</th>
            </tr>
            <tr>
                <td>{order.itemName}</td>
                <td>-</td>
                <td>1</td>
                <td className="text-right">{supplyAmount.toLocaleString()}</td>
            </tr>
        </tbody>
      </table>
      
      <div className="total-summary">
        <p>이 금액을 영수함.</p>
      </div>

      <div className="invoice-actions">
        <button className="print-btn" onClick={handlePrint}>인쇄하기</button>
      </div>
    </div>
  );
};

export default ShipperInvoiceComponent;
