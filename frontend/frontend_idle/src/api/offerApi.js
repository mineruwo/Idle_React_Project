// frontend/src/api/offerApi.js
import axios from "axios";

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

// 배정 정보(뱃지/운임 갱신)
export const fetchAssignment = (orderId) =>
  client.get(`/api/orders/${orderId}/assignment`);

// (기사) 입찰 생성 — driverId는 안 보냄 (로그인에서 추출)
export const createOffer = ({ orderId, price, memo }) =>
  client.post(`/api/offers`, { orderId, price, memo });

// (화주) 기사 선택 → 등록+배정 한 번에
export const assignOfferDirect = ({ orderId, driverId, price, memo }) =>
  client.post(`/api/offers/assign`, { orderId, driverId, price, memo });
