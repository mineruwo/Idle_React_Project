import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios';
import { checkAdminAuth } from "../api/adminAuthAPI";

// Async thunk for checking admin authentication status
export const checkAuthStatus = createAsyncThunk(
    'admin/checkAuthStatus',
    async (_, { rejectWithValue }) => {
        try {
            const userData = await checkAdminAuth();
            return userData;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Async thunk for admin logout
export const adminLogout = createAsyncThunk(
    'admin/logout',
    async (_, { rejectWithValue }) => {
        try {
            await axios.post('/api/admin/logout');
            return;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    id: '',
    adminName: '',
    role: null, // 권한 필드 추가
    idIndex: null, // adminIdIndex 필드 추가
    isAuthenticated: false,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
};

const adminLoginSlice = createSlice({
    name: 'AdminLoginSlice',
    initialState,
    reducers: {
        adminLogin: (state, action) => {
            const data = action.payload;
            state.id = data.adminId;
            state.adminName = data.name;
            state.role = data.role; // 권한 정보 저장
            state.idIndex = data.idIndex; // idIndex 저장
            state.isAuthenticated = true;
            state.status = 'succeeded';
        }
    },
    extraReducers: (builder) => {
        builder
            // checkAuthStatus reducers
            .addCase(checkAuthStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.isAuthenticated = true;
                state.id = action.payload.adminId;
                state.adminName = action.payload.name;
                state.role = action.payload.role; // 권한 정보 저장
                state.idIndex = action.payload.idIndex; // idIndex 저장
            })
            .addCase(checkAuthStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.isAuthenticated = false;
                state.error = action.payload;
            })
            // adminLogout reducers
            .addCase(adminLogout.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(adminLogout.fulfilled, (state) => {
                state.status = 'idle'; // Reset to idle after logout
                state.id = '';
                state.adminName = '';
                state.role = null; // 권한 정보 초기화
                state.idIndex = null; // idIndex 초기화
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(adminLogout.rejected, (state, action) => {
                state.status = 'failed'; // Or 'idle' depending on desired behavior
                state.error = action.payload;
            });
    }
});

export const { adminLogin } = adminLoginSlice.actions;

export default adminLoginSlice.reducer;
