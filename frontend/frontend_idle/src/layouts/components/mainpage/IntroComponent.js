import { Button } from "react-bootstrap";
import useCustomMove from './../../../hooks/useCustomMove';
import '../../../theme/main/intro.css';

const IntroComponent = () => {
    const {
        moveToLoginPage
    } = useCustomMove();

    return (
        <div
            className="text-white hero"
            style={{
                backgroundImage: `
                    linear-gradient(180deg, rgba(2,6,23,.35) 0%, rgba(2,6,23,.55) 100%),
                    url(${process.env.PUBLIC_URL}/img/main/main5.png)
                `,
            }}
        >

            <div className="content">
                <h1 className="fw-bold mb-3 title">
                    화물운송을 간편하게 연결합니다
                </h1>
                <p className="lead mb-4 subtitle">
                    화물운송을 손쉽게 연결하는 플랫폼입니다
                </p>
                <div className="d-flex justify-content-start gap-3 flex-wrap">
                    <Button variant="dark" size="lg" onClick={moveToLoginPage}>
                        시작하기
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default IntroComponent;
