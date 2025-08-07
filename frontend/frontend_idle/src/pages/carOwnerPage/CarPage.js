import { Outlet } from "react-router-dom";
import BubbleAnimation from "../../layouts/components/carownerComponent/common/BubbleAnimation";
import "../../layouts/components/carownerComponent/common/BubbleAnimation.css"
console.log(BubbleAnimation);
const CarPage = ()=>{
    return( 

        <div>
            <div className="bubblediv"><BubbleAnimation warmth={90}/></div>
            <div className="componentdiv"><Outlet/></div>
            
        </div>
    );
}

export default  CarPage;
