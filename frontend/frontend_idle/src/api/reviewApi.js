import axios from 'axios';

// API 서버 주소 (실제 백엔드 주소로 변경 필요)
// .env 파일에서 불러오는 것이 일반적입니다.
const API_SERVER_HOST = process.env.REACT_APP_API_SERVER_HOST || 'http://localhost:8080';

// HttpOnly 쿠키를 사용하므로, JavaScript에서 직접 토큰을 가져올 필요가 없습니다.
// 브라우저가 자동으로 요청에 쿠키를 포함시킵니다.

export const createReview = async (reviewData) => {
  try {
    const response = await axios.post(
      `${API_SERVER_HOST}/api/reviews`,
      reviewData, // 리뷰 데이터를 요청 본문으로 전달
      {
        withCredentials: true, // HttpOnly 쿠키를 자동으로 포함시키도록 설정
        headers: {
          'Content-Type': 'application/json' // JSON 형식으로 데이터를 보냄을 명시
        }
      }
    );
    return response.data; // 성공 시 백엔드 응답 데이터 반환
  } catch (error) {
    console.error("리뷰 생성을 실패했습니다.", error);
    // 에러를 다시 던져서 호출하는 컴포넌트에서 에러를 처리할 수 있도록 합니다.
    throw error;
  }
};

// 특정 대상(차주)의 리뷰 목록을 가져오는 함수 예시
export const getReviewsByTarget = async (targetId) => {
  try {
    const response = await axios.get(
      `${API_SERVER_HOST}/api/reviews/target/${targetId}`,
      {
        withCredentials: true // HttpOnly 쿠키를 자동으로 포함시키도록 설정
      }
    );
    return response.data;
  } catch (error) {
    console.error(`대상 ID ${targetId}의 리뷰를 가져오는데 실패했습니다.`, error);
    throw error;
  }
};

// 리뷰를 삭제하는 함수 예시
export const deleteReview = async (reviewId) => {
  try {
    const response = await axios.delete(
      `${API_SERVER_HOST}/api/reviews/${reviewId}`,
      {
        withCredentials: true // HttpOnly 쿠키를 자동으로 포함시키도록 설정
      }
    );
    return response.data; // 또는 삭제 성공 여부 (보통 204 No Content)
  } catch (error) {
    console.error(`리뷰 ID ${reviewId} 삭제를 실패했습니다.`, error);
    throw error;
  }
};