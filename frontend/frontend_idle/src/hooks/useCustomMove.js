import { useNavigate } from "react-router-dom";

const useCustomMove = () => {
    const navigate = useNavigate();

    const shipperMoveToDashBoard = () => {
        navigate({ pathname: `../shipper` });
    };

    const shipperMoveToDetails = () => {
        navigate({ pathname: `../shipper/details` });
    };

    const shipperMoveToOrder = () => {
        navigate({ pathname: `../shipper/order` });
    };

    const shipperMoveToOrderBoard = () => {
        navigate({ pathname: `../shipper/orderBoard` });
    };

    const shipperMoveToPayment = () => {
        navigate({ pathname: `../shipper/payment` });
    };

    const shipperMoveToReview = () => {
        navigate({ pathname: `../shipper/review` });
    };

    const shipperMoveToPoint = () => {
        navigate({ pathname: `../shipper/point` });
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
    }

    return {
        shipperMoveToDashBoard,
        shipperMoveToDetails,
        shipperMoveToOrder,
        shipperMoveToOrderBoard,
        shipperMoveToPayment,
        shipperMoveToReview,
        shipperMoveToPoint,
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
        moveToMainPage
    };
};

export default useCustomMove;
