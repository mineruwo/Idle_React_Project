import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB"
import SignupComponent from "../../layouts/components/signup/SignupComponent"

const SignupPage = () => {
    return (
        <main className="bg-third">
            <GNB />
            <SignupComponent />
            <Footer />
        </main>
    );
}

export default SignupPage;