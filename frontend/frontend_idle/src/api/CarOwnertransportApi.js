export const fetchTransportSummary = async (nickname) => {
  try {
    const response = await fetch(`/api/car-owner/dashboard/summary?nickname=실제로_있는_닉네임`);
    if (!response.ok) {
      throw new Error("서버 응답 오류");
    }
    return await response.json();
  } catch (error) {
    console.error("운송 요약 정보 가져오기 실패:", error);
    throw error;
  }
};