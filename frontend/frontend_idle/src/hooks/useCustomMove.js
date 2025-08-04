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

    const shipperMoveToPayment = () => {
        navigate({ pathname: `../shipper/payment` });
    };

    const shipperMoveToReview = () => {
        navigate({ pathname: `../shipper/review` });
    };

    const carOwnerMoveToDashboard = () => {
        navigate("/carPage");
    };
    const carOwnerMoveToProfile = () => {
        navigate("/carPage/profile");
    };
    const carOwnerMoveToEditProfile = () => {
        navigate("/carpage/editProfile");
    };
    const carOwnerMoveToOrders = () => {
        navigate("/carPage/orders");
    };
    const carOwnerMoveToSettlement = () => {
        navigate("/carPage/settlement");
    };
    const carOwnerMoveToVehucles = () => {
        navigate("/carPage/vehucles");
    };

    const carOwnerMoveToLisense = () => {
        navigate("/carPage/submitDOC");
    };

    const moveToAdminPage = () =>{
        navigate("/admin")
    }

    return {
        shipperMoveToDashBoard,
        shipperMoveToDetails,
        shipperMoveToOrder,
        shipperMoveToPayment,
        shipperMoveToReview,
        carOwnerMoveToDashboard,
        carOwnerMoveToProfile,
        carOwnerMoveToEditProfile,
        carOwnerMoveToOrders,
        carOwnerMoveToSettlement,
        carOwnerMoveToVehucles,
        carOwnerMoveToLisense,
        moveToAdminPage
    };
};

export default useCustomMove;
