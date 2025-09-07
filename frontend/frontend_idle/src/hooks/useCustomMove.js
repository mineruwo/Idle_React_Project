import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

const useCustomMove = () => {
    const navigate = useNavigate();

    const shipperMoveToDashBoard = () => {
        navigate({ pathname: `/shipper` });
    };

    const shipperMoveToOrder = () => {
        navigate({ pathname: `/shipper/order` });
    };

    const shipperMoveToOrderBoard = () => {
        navigate({ pathname: `/shipper/orderBoard` });
    };

    const shipperMoveToPayment = (orderData) => {
        navigate(
            {
                pathname: `/shipper/payment`,
            },
            { state: { orderData } }
        );
    };

    const shipperMoveToPaymentSuccess = (state) => {
        navigate({ pathname: `/shipper/payment/success` }, { state });
    };

    const shipperMoveToReview = () => {
        navigate({ pathname: `/shipper/review` });
    };

    const shipperMoveToPoint = () => {
        navigate({ pathname: `/shipper/point` });
    };

    const shipperMoveToOrderHistory = () => {
        navigate({ pathname: `/shipper/orderHistory` });
    };

    const shipperMoveToInquiries = () => {
        navigate({ pathname: `/shipper/inquiries` });
    };

    const carOwnerMoveToDashboard = () => navigate("/carPage");
    const carOwnerMoveToProfile = () => navigate("/carPage/profile");
    const carOwnerMoveToEditProfile = () => navigate("/carPage/editProfile");
    const carOwnerMoveToOrderBoard = () => navigate("/carPage/CarOrderBoard");
    const carOwnerMoveToOrders = () => navigate("/carPage/orders");
    const carOwnerMoveToSettlement = () => navigate("/carPage/settlement");
    const carOwnerMoveToVehicles = () => navigate("/carPage/vehicles");
    const carOwnerMoveToLisense = () => navigate("/carPage/submitDOC");
    const carOwnerMoveToInquiries = () => navigate("/carPage/inquiries");

    const moveToAdminPage = () => {
        console.log("hook admin page");
        navigate("/admin");
    };

    const moveToWebSocketTestPage = () => {
        navigate("/websocket");
    };

    const moveToLoginPage = () => {
        navigate("/login");
    };

    const moveToSignUpPage = () => {
        navigate("/signup");
    };

    const moveToMainPage = () => {
        navigate("/");
    };

    const moveToMyPageByRole = (role) => {
        switch (role) {
            case "shipper":
                navigate("/shipper");
                break;
            case "carrier":
                navigate("/carPage");
                break;
            default:
                navigate("/");
        }
    };

    const moveToNewPassword = (token, { replace = false } = {}) => {
        if (!token) return;
        navigate("/newPassword", { state: { token }, replace });
    };

    // 외부 이동
    const moveToExternal = (url, { replace = false } = {}) => {
        if (replace) window.location.replace(url);
        else window.location.href = url;
    };

    // OAuth 로그인 시작
    const oauthLogin = (provider, { replace = true } = {}) => {
        const url = `${API_BASE}/oauth2/authorization/${provider}`;
        moveToExternal(url, { replace });
    };

    return {
        shipperMoveToDashBoard,
        shipperMoveToOrder,
        shipperMoveToOrderBoard,
        shipperMoveToPayment,
        shipperMoveToReview,
        shipperMoveToPoint,
        shipperMoveToPaymentSuccess,
        shipperMoveToOrderHistory,
        shipperMoveToInquiries,
        carOwnerMoveToDashboard,
        carOwnerMoveToProfile,
        carOwnerMoveToEditProfile,
        carOwnerMoveToOrderBoard,
        carOwnerMoveToOrders,
        carOwnerMoveToSettlement,
        carOwnerMoveToVehicles,
        carOwnerMoveToLisense,
        carOwnerMoveToInquiries,
        moveToAdminPage,
        moveToWebSocketTestPage,
        moveToLoginPage,
        moveToSignUpPage,
        moveToMainPage,
        moveToMyPageByRole,
        moveToNewPassword,
        oauthLogin,
    };
};

export default useCustomMove;
