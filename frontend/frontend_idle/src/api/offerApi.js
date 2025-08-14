// src/api/offerApi.js
import axios from "axios";

// 공통 axios 인스턴스 (쿠키 쓰면 withCredentials true 유지)
const HOST = "http://localhost:8080";
const client = axios.create({
  baseURL: HOST,
  withCredentials: true,
});

// 오더별 입찰 목록
export const fetchOffersByOrder = (orderId) =>
  client.get(`/api/offers/order/${orderId}`);

// 입찰 확정
export const acceptOffer = (offerId) =>
  client.post(`/api/offers/${offerId}/accept`);

// 배정 정보만 조회 (뱃지용)
export const fetchAssignment = (orderId) =>
  client.get(`/api/orders/${orderId}/assignment`);

export const createOffer = (payload) =>
  client.post(`/api/offers`, payload); // { orderId, driverId, price, memo }
