import React from "react";
import "../../../../theme/CarOwner/cardashboard.css";
const DeliveryList = ({ deliveries }) => {
  return (
    <div className="delivery-box">
      <h2>배송중인 건</h2>
      <table>
        <thead>
          <tr>
            <th>운송번호</th>
            <th>배송 상태</th>
            <th>화물 종류</th>
            <th>출발지</th>
            <th>출발 예정일</th>
            <th>도착지</th>
            <th>도착 예정일</th>
          </tr>
        </thead>
        <tbody>
          {(deliveries || []).length === 0 ? (
            <tr><td colSpan="7">진행중인 배송이 없습니다.</td></tr>
          ) : (deliveries || []).map((d, i) => (
            <tr key={i}>
              <td>{d.deliveryNum}</td>
              <td>{d.status}</td>
              <td>{d.transport_type}</td>
              <td>{d.from}</td>
              <td>{d.s_date}</td>
              <td>{d.to}</td>
              <td>{d.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryList;
