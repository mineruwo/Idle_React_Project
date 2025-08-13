import { useNavigate } from "react-router-dom";

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

    const shipperMoveToPayment = () => {
        navigate({ pathname: `/shipper/payment` });
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
            case "carrier":
                navigate("/carPage");
            default:
                navigate("/");
        }
    };

    return {
        shipperMoveToDashBoard,
        shipperMoveToOrder,
        shipperMoveToOrderBoard,
        shipperMoveToPayment,
        shipperMoveToReview,
        shipperMoveToPoint,
        shipperMoveToPaymentSuccess,
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
    };
};

export default useCustomMove;
