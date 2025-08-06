// src/api/order/orderApi.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/orders";

// 🚚 오더 등록
export const saveOrder = async (orderData) => {
    console.log("보낼 데이터:", orderData);
  try {
    const response = await axios.post(API_BASE_URL, orderData, {
      withCredentials: true,
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
    const response = await axios.get("http://localhost:8080/api/orders", {
      withCredentials: true, // ✅ 이거 꼭 있어야 함!
    });
    return response.data;
  } catch (error) {
    console.error("오더 목록 불러오기 실패:", error);
    throw error;
  }
};


// 🔍 특정 오더 상세 조회
export const fetchOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`오더 ${orderId} 상세 조회 실패:`, error);
    throw error;
  }
};

// ❌ 오더 삭제
export const deleteOrder = async (orderId) => {
  try {
    await axios.delete(`${API_BASE_URL}/${orderId}`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error(`오더 ${orderId} 삭제 실패:`, error);
    throw error;
  }
};

// ✏️ 오더 수정 (선택 사항)
export const updateOrder = async (orderId, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${orderId}`, updatedData, {
      withCredentials: true,
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

