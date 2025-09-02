import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import OrderBoard from "../orderPage/OrderBoard";

const CarOrderBoard = () => {
    return (
        <div>
            <div>
                <GNB />
                <NaviTap />
            </div>
            <div>
                <OrderBoard />
            </div>
            <Footer />
        </div>
    );
};

export default CarOrderBoard;
