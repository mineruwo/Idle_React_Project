import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"

const useAdminLogin= () =>{
    const navigation = useNavigate();

    const dispatch = useDispatch();

    const adminState = useSelector(state => state.adminLoginSlice);
}