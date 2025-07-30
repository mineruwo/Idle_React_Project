import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";

const Settlement = ()  => {
    return(
        <div>
            <div className="topmenu sticky-top">
            <GNB />
            <NaviTap />
            </div>
           <div>
            차량관리 
            </div> 
            
            <Footer />
        </div>
    );
}
export default Settlement