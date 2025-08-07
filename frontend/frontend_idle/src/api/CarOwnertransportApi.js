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

export const fetchCarOwnerProfile = async (customName) => {
  try {
    const res = await fetch(`/api/car-owner/profile/${customName}`);
    if (!res.ok) throw new Error("차주 프로필 조회 실패");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ fetchCarOwnerProfile Error:", err);
    throw err;
  }
};

export const updateCarOwnerProfile = async (customName, updatedData) => {
  try {
    const res = await fetch(`/api/car-owner/profile/${customName}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) throw new Error("차주 정보 수정 실패");
    return await res.json();
  } catch (err) {
    console.error("❌ updateCarOwnerProfile Error:", err);
    throw err;
  }
};