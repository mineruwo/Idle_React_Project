import Footer from "../layouts/components/Footer";
import GNB from "../layouts/components/GNB"
import IntroComponent from "../layouts/components/IntroComponent";
import NoticeComponent from "../layouts/components/NoticeComponent";

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