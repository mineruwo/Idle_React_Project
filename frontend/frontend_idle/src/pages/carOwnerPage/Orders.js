import { useNavigate } from "react-router-dom";
import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import OrderDEliveryList from "../../layouts/components/carownerComponent/OrderComponent/OrderDEliveryList";
const Order = () => {
    
    const orderDelivers = [
        { status: "배송중", from: "서울", s_date: "2024-05-01", to: "부산", date: "2024-05-02" },
        { status: "배송중", from: "인천", s_date: "2024-05-03", to: "대구", date: "2024-05-04" },
        { status: "배송중", from: "대전", s_date: "2024-05-04", to: "광주", date: "2024-05-05" },
        { status: "배송 예정", from: "광주", s_date: "2024-05-06", to: "인천", date: "2024-05-07" },
        { status: "배송 예정", from: "인천", s_date: "2024-05-07", to: "대전", date: "2024-05-08" },
    ];
    return (

        <div>
            <div className="topmenu sticky-top">
                <GNB />
                <NaviTap />
            </div>
            <div className="orderdiv">
              <OrderDEliveryList orderDelivery={orderDelivers} />
            </div>
            <Footer />
        </div>
    );
}
export default Order