import { configureStore } from "@reduxjs/toolkit";
import adminLoginSlice from "./slices/adminLoginSlice";

export default configureStore({
    reducer:{
        "adminLoginSlice" : adminLoginSlice
    }
})