// OrderBoard.js (최신 디자인 반영 + 박스 너비 중앙 정렬 + 긴 텍스트 말줄임 처리)

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { fetchOrders } from "../../api/orderApi";

const OrderBoard = () => {
  const [orders, setOrders] = useState([]);

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
    <BoardWrapper>
      <Sidebar>오더 게시판</Sidebar>
      <ContentArea>
        {orders.map((order) => (
          <OrderCard key={order.id}>
            <TopRow>
              <Route>
                <strong>출발지:</strong> <Ellipsis>{order.departure}</Ellipsis>
                <span style={{ margin: "0 5px" }}>→</span>
                <strong>도착지:</strong> <Ellipsis>{order.arrival}</Ellipsis>
              </Route>
              <Status>{order.isImmediate ? "즉시" : `예약 시간:${order.reservedDate}`}</Status>
            </TopRow>

            <MiddleRow>
              <Label>기사 제안가</Label>
              <Price>{order.proposedPrice?.toLocaleString()} 원</Price>
            </MiddleRow>

            <BottomRow>
              <Label>평균가</Label>
              <Price>{order.averagePrice?.toLocaleString()} 원</Price>
            </BottomRow>
          </OrderCard>
        ))}
      </ContentArea>
    </BoardWrapper>
  );
};

export default OrderBoard;

// ================= styled-components =================

const BoardWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f7f7f7;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #eccce4;
  padding: 30px 20px;
  font-size: 28px;
  font-weight: bold;
  color: #5c2d91;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const OrderCard = styled.div`
  background: white;
  width: 420px;
  border: 2px solid #222;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Route = styled.p`
  font-size: 15px;
  font-weight: 500;
  display: flex;
  gap: 4px;
`;

const Ellipsis = styled.span`
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: bottom;
`;

const Status = styled.span`
  font-size: 14px;
  color: #cc57c3;
  font-weight: bold;
`;

const MiddleRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
`;

const Label = styled.p`
  font-size: 14px;
  color: #666;
`;

const Price = styled.p`
  font-size: 16px;
  font-weight: bold;
`;
