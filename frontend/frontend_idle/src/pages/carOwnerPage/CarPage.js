import { Outlet } from "react-router-dom";
import "../../layouts/components/carownerComponent/common/BubbleAnimation.css"
import "../../theme/CarOwner/cardashboard.css"

const CarPage = ()=>{
    return( 

        <div >
            
            <div className="componentdiv"><Outlet/></div>
            
        </div>
    );
}

export default  CarPage;
