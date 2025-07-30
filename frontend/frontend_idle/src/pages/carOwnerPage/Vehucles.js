import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";

const Vehucles = ()  => {
    return(
        <div>
            <div className="topmenu sticky-top">
            <GNB />
            <NaviTap />
            </div>
            <div>
                정산페이지 
            </div>
            <Footer />
        </div>
    );
}
export default Vehucles