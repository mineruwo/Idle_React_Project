import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: '',
    adminName: '',
    isAuthenticated: false, // 인증 상태를 나타내는 플래그 추가
};

const adminLoginSlice = createSlice({
    name: 'AdminLoginSlice',
    initialState: initialState,
    reducers: {
        adminLogin: (state, action) => {
            console.log("로그인 성공 처리...");
            console.log(action.payload);

            const data = action.payload;
            // 서버로부터 받은 사용자 정보와 함께 isAuthenticated를 true로 설정
            return { id: data.adminId, adminName: data.name, isAuthenticated: true };
        },
        adminLogout: (state, action) => {
            console.log("로그 아웃 함");
            // 로그아웃 시 isAuthenticated를 false로 설정하고 초기 상태로 되돌림
            return { ...initialState, isAuthenticated: false };
        }
    }
});

export const { adminLogin, adminLogout } = adminLoginSlice.actions;

export default adminLoginSlice.reducer;