import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB"
import OauthLandingComponent from "../../layouts/components/signup/OauthLandingComponent.js"


const OauthLandingPage = () => {
    return (
        <>
            <GNB />
            <OauthLandingComponent />
            <Footer />
        </>
    );
}

export default OauthLandingPage;