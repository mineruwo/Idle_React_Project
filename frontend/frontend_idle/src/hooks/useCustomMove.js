import { useNavigate } from "react-router-dom";

const useCustomMove = () => {
    const navigate = useNavigate();

    const moveToDashBoard = () => {
        navigate({ pathname: `../shipper` });
    };

    const moveToDetails = () => {
        navigate({ pathname: `../shipper/details` });
    };

    const moveToOrder = () => {
        navigate({ pathname: `../shipper/order` });
    };

    const moveToPayment = () => {
        navigate({ pathname: `../shipper/payment` });
    };

    const moveToReview = () => {
        navigate({ pathname: `../shipper/review` });
    };

    const moveToStatus = () => {
        navigate({ pathname: `../shipper/status` });
    };

    return {
        moveToDashBoard,
        moveToDetails,
        moveToOrder,
        moveToPayment,
        moveToReview,
        moveToStatus,
    };
};

export default useCustomMove;
