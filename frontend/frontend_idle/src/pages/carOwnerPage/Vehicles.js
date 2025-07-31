import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import VehicleListRegister from "../../layouts/components/carownerComponent/VehuclesComponent/VehiclesComponent";
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
                <VehicleListRegister/>
            </div>
            <Footer />
        </div>
    );
}
export default Vehucles