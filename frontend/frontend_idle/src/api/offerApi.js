// frontend/src/api/offerApi.js
import axios from "axios";

const HOST = process.env.REACT_APP_API_BASE_URL;
const client = axios.create({
  baseURL: HOST,
  withCredentials: true,
});

// 오더별 입찰 목록
export const fetchOffersByOrder = (orderId) =>
  client.get(`/offers/order/${orderId}`);

// 입찰 확정 (화주)
export const acceptOffer = (offerId) =>
  client.post(`/offers/${offerId}/accept`);

// 배정 정보(뱃지/운임 갱신)
export const fetchAssignment = (orderId) =>
  client.get(`/orders/${orderId}/assignment`);

// (기사) 입찰 생성 — driverId는 안 보냄 (로그인에서 추출)
export const createOffer = ({ orderId, price, memo }) =>
  client.post(`/offers/add`, { orderId, price, memo });

// (화주) 기사 선택 → 등록+배정 한 번에
export const assignOfferDirect = ({ orderId, driverId, price, memo }) =>
  client.post(`/offers/assign`, { orderId, driverId, price, memo });

// ✅ (기사) 입찰 수정
export const updateOffer = ({ offerId, price, memo }) =>
  client.put(`/offers/${offerId}`, { price, memo });
