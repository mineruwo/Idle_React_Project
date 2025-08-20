import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB"
import NewPasswordComponent from "../../layouts/components/login/NewPasswordComponent";

const NewPasswordPage = () => {
    return (
        <>
            <GNB />
            <NewPasswordComponent />
            <Footer />
        </>
    );
}

export default NewPasswordPage;