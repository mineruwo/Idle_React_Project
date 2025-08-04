import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const IntroComponent = () => {
    const {
        shipperMoveToDashBoard,
        carOwnerMoveToDashboard
    } = useCustomMove();

    return (
        <div className="position-relative text-white">
            <img
                src={process.env.PUBLIC_URL + "/img/main/MainImage.PNG"}
                alt="소개 이미지"
                className="img-fluid w-100"
            />

            <div
                className="position-absolute "
                style={{ top: "30%", left: "15%" }}
            >
                <h1
                    className="fw-bold mb-3 text-dark"
                    style={{
                        fontSize: "clamp(1rem, 4vw, 3rem)"
                    }}
                >
                    화물운송을 간편하게 연결합니다
                </h1>
                <p
                    className="lead mb-4 text-dark"
                    style={{
                        fontSize: "clamp(0.5rem, 2.5vw, 2rem)", 
                    }}
                >
                    화물운송을 손쉽게 연결하는 플랫폼입니다
                </p>
                <div className="d-flex justify-content-start gap-3 flex-wrap">
                    <Link to="/login">
                        <Button variant="dark" size="lg">
                            시작하기
                        </Button>
                    </Link>
                </div>
            </div>
        </div >
    );
};

export default IntroComponent;
