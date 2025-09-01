import Footer from "../../layouts/components/common/Footer"
import GNB from "../../layouts/components/common/GNB"
import IntroComponent from "../../layouts/components/mainpage/IntroComponent";
import NoticeComponent from "../../layouts/components/mainpage/NoticeComponent";

const MainPage = () => {
    return (
        <>
            <GNB />
            <IntroComponent />
            <NoticeComponent />
            <Footer />
        </>
    );
}

export default MainPage;