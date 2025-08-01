//넘겨지는 파라미터를 get..

import { useNavigate } from "react-router-dom"



//특정 page 로 넘어가는 공통 모듈 작성..
const useCustomMove = () => {
    //특정 요소로 넘기기 위한 컴포넌트 선언 및 파라미터 정보 확인.
    const navigate = useNavigate();

    const moveToDashboard = () =>{
        navigate("/carPage")
    }
    const moveToProfile = () =>{
        navigate("/carPage/profile")
    }
    const moveToEditProfile = () =>{
        navigate("/carpage/editProfile")
    }
    const moveToOrders = () =>{
        navigate("/carPage/orders")
    }
    const moveToSettlement = () =>{
        navigate("/carPage/settlement")
    }
    const moveToVehucles = () =>{
        navigate("/carPage/vehucles")
    }
    
    const moveToLisense= () =>{
        navigate("/carPage/submitDOC")
    }
    return {moveToDashboard, moveToProfile, moveToEditProfile, moveToOrders, moveToSettlement, moveToVehucles, moveToLisense}
}
export default useCustomMove;