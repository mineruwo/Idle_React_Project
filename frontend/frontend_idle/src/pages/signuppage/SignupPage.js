import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB"
import SignupComponent from "../../layouts/components/signup/SignupComponent"

const LoginPage = () => {
    return (
        <>
            <GNB />
            <SignupComponent />
            <Footer />
        </>
    );
}

export default LoginPage;