import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import SettlementComponent from "../../layouts/components/carownerComponent/SettlementComponent/SettlementComponent";

const Settlement = ()  => {
    return(
        <div>
            <div className="topmenu">
            <GNB />
            <NaviTap />
            </div>
           <div>
            <SettlementComponent/>
            </div> 
            
            <Footer />
        </div>
    );
}
export default Settlement