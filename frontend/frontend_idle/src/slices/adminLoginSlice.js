import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: '',
    adminName: '',
};

const adminLoginSlice = createSlice({
    name: 'AdminLoginSlice',
    initialState: initialState,
    reducers: {
        adminLogin: (state, action) => {
            console.log("가짜 로그인 수행..");
            console.log(action.payload);

            const data = action.payload;

            return { id: data.id, adminName: data.adminName };
        },
        adminLogout: (state, action) => {
            console.log("로그 아웃 함");
            return { ...initialState };
        }
    }
});

export const { adminLogin, adminLogout } = adminLoginSlice.actions;

export default adminLoginSlice.reducer;