import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB"
import LoginComponent from "../../layouts/components/login/LoginComponent"

const LoginPage = () => {
    return (
        <>
            <GNB />
            <LoginComponent />
            <Footer />
        </>
    );
}

export default LoginPage;