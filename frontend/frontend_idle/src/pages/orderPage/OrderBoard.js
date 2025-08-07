import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { fetchOrders } from "../../api/orderApi";

const cargoTypeMap = {
  appliance: "가전제품",
  furniture: "가구",
  food: "식품",
  etc: "기타",
};

const cargoSizeMap = {
  small: "소형",
  medium: "중형",
  large: "대형",
};

const weightMap = {
  "under50": "50kg 미만",
  "50to100": "50~100kg",
  "100to200": "100~200kg",
  "over200": "200kg 이상",
};

const vehicleMap = {
  "1ton": "1톤",
  "2.5ton": "2.5톤",
  "5ton": "5톤",
  "11ton": "11톤 이상",
};

const OrderBoard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        console.error("오더 목록 불러오기 실패", error);
      }
    };
    loadOrders();
  }, []);

  return (
    <BoardContainer>
      <Sidebar>오더 게시판</Sidebar>

      <OrderList>
        {orders.map((order) => (
          <OrderCard key={order.id} onClick={() => setSelectedOrder(order)}>
            <CardHeader>
              <RouteText>
                <span className="label">출발</span> {order.departure} → <span className="label">도착</span> {order.arrival}
              </RouteText>
              <Status>
                {order.isImmediate ? "즉시" : `예약 시간: ${order.reservedDate ?? "-"}`}
              </Status>
            </CardHeader>
            <CardBody>
              <Left>
                <p>기사 제안가</p>
                <p>평균가</p>
              </Left>
              <Right>
                <p>{order.driverPrice?.toLocaleString() || "-"} 원</p>
                <p>{order.avgPrice?.toLocaleString() || "-"} 원</p>
              </Right>
            </CardBody>
          </OrderCard>
        ))}
      </OrderList>

      {selectedOrder && (
        <DetailPanel>
          <DetailBox>
            <h3>화물 상세 정보</h3>
            <p><strong>출발지:</strong> {selectedOrder.departure}</p>
            <p><strong>도착지:</strong> {selectedOrder.arrival}</p>
            <p><strong>화물 종류:</strong> {selectedOrder.cargoType}</p>
            <p><strong>크기:</strong> {selectedOrder.cargoSize}</p>
            <p><strong>무게:</strong> {selectedOrder.weight}</p>
            <p><strong>차량:</strong> {selectedOrder.vehicle}</p>
            <p><strong>포장 상세:</strong> {selectedOrder.packingOptions}</p>
            <p><strong>포장 요약:</strong> {selectedOrder.packingOption || "-"}</p>
            <p><strong>예약시간:</strong> {selectedOrder.reservedDate ?? "-"}</p>
          </DetailBox>

          <DetailBox>
            <h3>운임 정보</h3>
            <p><strong>기사 제안가:</strong> {selectedOrder.driverPrice?.toLocaleString()} 원</p>
            <p><strong>화주 제안가:</strong> {selectedOrder.proposedPrice?.toLocaleString()} 원</p>
            <p><strong>평균가:</strong> {selectedOrder.avgPrice?.toLocaleString()} 원</p>
            <p><strong>상태:</strong> {selectedOrder.status || "-"}</p>
            <p><strong>등록일:</strong> {selectedOrder.date ? new Date(selectedOrder.date).toLocaleDateString() : "-"}</p>
          </DetailBox>
        </DetailPanel>
      )}
    </BoardContainer>
  );
};

export default OrderBoard;

const BoardContainer = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: #f9f9f9;
`;

const Sidebar = styled.div`
  width: 260px;
  background-color: #e9cde2;
  color: #5d2e8c;
  font-size: 1.8rem;
  font-weight: bold;
  padding: 40px 20px;
  box-sizing: border-box;
  flex-shrink: 0;
`;

const OrderList = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  max-width: 420px;
`;

const OrderCard = styled.div`
  width: 100%;
  padding: 20px;
  border: 2px solid #333;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const RouteText = styled.p`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 230px;

  .label {
    font-weight: bold;
  }
`;

const Status = styled.span`
  color: #ba55d3;
  font-size: 14px;
  font-weight: 500;
`;

const CardBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Left = styled.div`
  font-size: 14px;
  color: #444;
`;

const Right = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: right;
`;

const DetailPanel = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DetailBox = styled.div`
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  h3 {
    margin-bottom: 12px;
    font-size: 18px;
    color: #333;
  }

  p {
    font-size: 14px;
    margin: 6px 0;
    color: #555;
  }
`;
