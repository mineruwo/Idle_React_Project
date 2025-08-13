import React, { useEffect, useState } from "react";
import "../../../../theme/CarOwner/Order.css";
import { fetchCarOwnerOrders } from "../../../../api/CarOwnerApi/CarOwnerOrdersApi";

const BOARD_POST_URL = (orderId) => `/board/orders/${orderId}`;

const moveToOrderPost = (orderId) => {
  if (!orderId) return;
  window.location.href = BOARD_POST_URL(orderId); // 내부 라우팅이면 navigate로 교체 가능
};

const mockSummary = {
  period: "2024-04-01 ~ 2024-04-30",
  deliveryStats: { done: 15, shipping: 3, scheduled: 2, totalDone: 50 },
};

const mockDeliveries = [
  { id: 101, date: "2024-05-01", from: "서울", to: "부산", s_date: "2024-05-01", status: "배송중",   d_date: "2024-05-02" },
  { id: 102, date: "2024-05-03", from: "인천", to: "대구", s_date: "2024-05-03", status: "배송중",   d_date: "2024-05-04" },
  { id: 103, date: "2024-05-04", from: "대전", to: "광주", s_date: "2024-05-04", status: "배송중",   d_date: "2024-05-05" },
  { id: 104, date: "2024-05-06", from: "광주", to: "인천", s_date: "2024-05-06", status: "배송 예정", d_date: "2024-05-07" },
  { id: 105, date: "2024-05-07", from: "인천", to: "대전", s_date: "2024-05-07", status: "배송 예정", d_date: "2024-05-08" },
];

const OrderDEliveryList = () => {
  return (
    <div className="settlement-page">
      <h2 className="summary-title">배송 요약</h2>
      <div className="delivery-summary">
        <div>기간: {mockSummary.period}</div>
        <div>완료건: {mockSummary.deliveryStats.done}건</div>
        <div>배송중: {mockSummary.deliveryStats.shipping}건</div>
        <div>배송 예정: {mockSummary.deliveryStats.scheduled}건</div>
        <div>누적 완료 배송건: {mockSummary.deliveryStats.totalDone}건</div>
      </div>

      <h2>운송건</h2>
      <table className="delivery-table">
        <thead>
          <tr>
            <th>배송 상태</th>
            <th>출발지</th>
            <th>출발 예정일</th>
            <th>도착지</th>
            <th>예정일</th>
          </tr>
        </thead>
        <tbody>
          {mockDeliveries.map((item) => (
            <tr
              key={item.id}
              onClick={() => moveToOrderPost(item.id)}
              style={{ cursor: "pointer" }}
              title={`게시판 상세로 이동 (#${item.id})`}
            >
              <td>{item.status}</td>
              <td>{item.from}</td>
              <td>{item.s_date}</td>
              <td>{item.to}</td>
              <td>{item.d_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDEliveryList;