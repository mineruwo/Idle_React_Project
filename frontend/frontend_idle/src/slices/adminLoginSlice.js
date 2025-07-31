import { createSlice } from "@reduxjs/toolkit"

// 구조는 id와 password를 받아서 쓸거임;
const initState = {
    id:'',
    adminName : '',
}

const adminLoginSlice = createSlice({
    name : 'AdminLoginSlice',
    initialState : initState,
    reducers:{
        login: (state, action) => {
            console.log("가짜 로그인 수행..");
            console.log(action.payload);

            const data = action.payload;

            return {id: data.id , adminName: data.adminName};
        },
        logout: (state, action) => {
            console.log("로그 아웃 함");
            return {...initState};
        }
    }
});

export const {adminLogin , adminLogout} = adminLoginSlice.actions;

export default adminLoginSlice.reducer;