// src/api/order/orderApi.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const orderApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// 🚚 오더 등록
export const saveOrder = async (orderData) => {
    console.log("보낼 데이터:", orderData);
  try {
    const response = await orderApi.post('/orders', orderData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("오더 등록 실패:", error);
    throw error;
  }
};

// 📋 오더 전체 목록 불러오기
export const fetchOrders = async () => {
  try {
    const response = await orderApi.get("/orders");
    return response.data;
  } catch (error) {
    console.error("오더 목록 불러오기 실패:", error);
    throw error;
  }
};


// 🔍 특정 오더 상세 조회
export const fetchOrderById = async (orderId) => {
  try {
    const response = await orderApi.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`오더 ${orderId} 상세 조회 실패:`, error);
    throw error;
  }
};

// ❌ 오더 삭제
export const deleteOrder = async (orderId) => {
  try {
    await orderApi.delete(`/orders/${orderId}`);
  } catch (error) {
    console.error(`오더 ${orderId} 삭제 실패:`, error);
    throw error;
  }
};

// ✏️ 오더 수정 (선택 사항)
export const updateOrder = async (orderId, updatedData) => {
  try {
    const response = await orderApi.put(`/orders/${orderId}`, updatedData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`오더 ${orderId} 수정 실패:`, error);
    throw error;
  }
};
export const getDriverOfferSummary = async (orderId) => {
  const { data } = await orderApi.get(`/orders/${orderId}/offers/summary`);
  return data; // { count, minPrice, avgPrice }
};

export const createDriverOffer = async (orderId, { driverId, price, memo }) => {
  const { data } = await orderApi.post(`/orders/${orderId}/offers`, { driverId, price, memo });
  return data;
};

