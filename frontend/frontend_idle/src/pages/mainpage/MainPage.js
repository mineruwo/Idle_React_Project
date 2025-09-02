import Footer from "../../layouts/components/common/Footer"
import GNB from "../../layouts/components/common/GNB"
import FeatureStrip from "../../layouts/components/mainpage/FeatureStrip";
import IntroComponent from "../../layouts/components/mainpage/IntroComponent";
import NoticeComponent from "../../layouts/components/mainpage/NoticeComponent";

const MainPage = () => {
    return (
        <main className="bg-third">
            <GNB />
            <IntroComponent />
            <FeatureStrip />
            <NoticeComponent />
            <Footer />
        </main>
    );
}

export default MainPage;