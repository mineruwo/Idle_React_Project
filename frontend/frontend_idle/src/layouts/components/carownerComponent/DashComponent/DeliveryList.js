import React from "react";
import "../DashComponent/styles/dashboard.css";

const DeliveryList = ({ deliveries }) => {
  return (
    <div className="delivery-box">
      <h2>배송중인 건</h2>
      <table>
        <thead>
          <tr>
            <th>배송 상태</th>
            <th>출발지</th>
            <th>출발 예정일 </th>
            <th>도착지</th>
            <th>예정일</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d, i) => (
            <tr key={i}>
              <td>{d.status}</td>
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
