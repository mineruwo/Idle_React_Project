
import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import DashboardHeader from "../../layouts/components/carownerComponent/DashComponent/DashboardHeader";
import DeliveryList from "../../layouts/components/carownerComponent/DashComponent/DeliveryList";
import SalesChart from "../../layouts/components/carownerComponent/DashComponent/SalesChart";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";



const CarDashpage = () => {


    const chartData = [
        { day: 1, sales: 10000, deliveries: 8 },
        { day: 7, sales: 18000, deliveries: 10 },
        { day: 13, sales: 14000, deliveries: 9 },
        { day: 19, sales: 26000, deliveries: 13 },
        { day: 25, sales: 31000, deliveries: 15 },
        { day: 30, sales: 40000, deliveries: 18 },
    ];

    const deliveries = [
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
            <div className="dashboard-container">
                <div className="dashborad-firstcontainer">
                    <DashboardHeader
                        name="홍길동"
                        completed={12}
                        inProgress={3}
                        scheduled={2}
                        total={17}
                        revenue={2400000}
                        commission={10}
                        settlement={2160000}
                    />
                    <SalesChart data={chartData} />
                </div>
                <div className="dashboard-secoundcontainer">

                </div>
            </div>
            <div>
                <DeliveryList deliveries={deliveries} />
            </div>
            <Footer />
        </div>
    );
};

export default CarDashpage;