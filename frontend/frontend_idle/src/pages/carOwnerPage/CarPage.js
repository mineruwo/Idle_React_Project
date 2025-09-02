import { Outlet } from "react-router-dom";
import BubbleAnimation from "../../layouts/components/carownerComponent/common/BubbleAnimation";
import "../../layouts/components/carownerComponent/common/BubbleAnimation.css"
import "../../theme/CarOwner/cardashboard.css"
console.log(BubbleAnimation);
const CarPage = ()=>{
    return( 

        <div >
            
            <div className="componentdiv"><Outlet/></div>
            
        </div>
    );
}

export default  CarPage;
