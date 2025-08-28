
import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import OrderDEliveryList from "../../layouts/components/carownerComponent/OrderComponent/OrderDEliveryList";
const Order = () => {
    

    return (

        <div>
            <div className="topmenu sticky-top">
                <GNB />
                <NaviTap />
            </div>
            <div className="orderdiv">
              <OrderDEliveryList/>
            </div>
            <Footer />
        </div>
    );
}
export default Order