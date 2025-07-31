/*
    어드민에서 사용할 헤더 
    기존 유저에서 사용하는 GNB와 기능이 다르기에 분리 진행, 단 전체적인 UI 크기는 동일하게 제작할 예정

    1. 로그인을 하지 않았을 경우, 로고(베너) 를 클릭 시 로그인 화면으로 돌아옴
    2. 로그인을 하였을 경우, 관리자의 이름을 우측 상단에 띄워야함 (로그인 분기를 가져와야함 , admin slice를 제작해야함)
    3. 위 두개 내용에서 반응형으로 글씨 크기가 줄어들거나 하게 하자 
    */

import { useSelector } from "react-redux";

    const AdminHeaderComponent = () =>
        {
            const adminLoginState = useSelector(state => state.adminSlice);

        }
    export default  AdminHeaderComponent;