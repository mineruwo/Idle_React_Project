import { Button } from "react-bootstrap";

const IntroComponent = () => {

    return (
        <div className="position-relative text-white">
            <img
                src={process.env.PUBLIC_URL + "/img/main/MainImage.png"} 
                alt="소개 이미지"
                className="img-fluid w-100"
            />

            <div
                className="position-absolute "
                style={{ top: "35%", left: "15%"}}
            >
                <h1 className="fw-bold display-5 mb-3 text-dark">
                    화물운송을 간편하게 연결합니다
                </h1>
                <p className="lead mb-4 text-dark">
                    화물운송을 손쉽게 연결하는 플랫폼입니다
                </p>
                <div className="d-flex justify-content-start gap-3 flex-wrap">
                    <Button size="lg"
                        style={{ backgroundColor: "#eb6864", borderColor: "#eb6864" }}
                        className="text-white px-4">
                        화물주로 시작하기
                    </Button>
                <Button variant="dark" size="lg">
                    차주로 시작하기
                </Button>
            </div>
        </div>
        </div >
    );
}

export default IntroComponent;