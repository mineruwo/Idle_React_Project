import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

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
        navigate({
            pathname: `/shipper/payment`,
        }, { state: { orderData } });
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
    const carOwnerMoveToOrders = () => navigate("/carPage/orders");
    const carOwnerMoveToSettlement = () => navigate("/carPage/settlement");
    const carOwnerMoveToVehicles = () => navigate("/carPage/vehicles");
    const carOwnerMoveToLisense = () => navigate("/carPage/submitDOC");

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

    // 공통 OAuth 시작 (flow: "login" | "signup")
    const oauthStart = (provider, { flow = "login", replace = true, next } = {}) => {
        const url = new URL(`${API_BASE}/oauth2/authorization/${provider}`);
        url.searchParams.set("flow", flow);
        if (next) url.searchParams.set("next", next); // 로그인/가입 후 돌아올 경로
        moveToExternal(url.toString(), { replace });
    };

    // 분리된 퍼블릭 API
    const oauthLogin = (provider, opts) => oauthStart(provider, { flow: "login", ...(opts || {}) });
    const oauthSignup = (provider, opts) => oauthStart(provider, { flow: "signup", ...(opts || {}) });

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
        carOwnerMoveToOrders,
        carOwnerMoveToSettlement,
        carOwnerMoveToVehicles,
        carOwnerMoveToLisense,
        moveToAdminPage,
        moveToWebSocketTestPage,
        moveToLoginPage,
        moveToSignUpPage,
        moveToMainPage,
        moveToMyPageByRole,
        moveToNewPassword,
        oauthLogin,
        oauthSignup
    };
};

export default useCustomMove;
