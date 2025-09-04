import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB"
import LoginComponent from "../../layouts/components/login/LoginComponent"

const LoginPage = () => {
    return (
        <main className="bg-third">
            <GNB />
            <LoginComponent />
            <Footer />
        </main>
    );
}

export default LoginPage;