import { useNavigate } from "react-router-dom";

const useCustomMove = () => {
    const navigate = useNavigate();

    const moveToDashBoard = () => {
        navigate({ pathname: `../shipper` });
    };

    const moveToDetails = () => {
        navigate({ pathname: `../details` });
    };

    return { moveToDashBoard, moveToDetails };
};

export default useCustomMove;
