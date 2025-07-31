import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const GNB = () => {
    const [hideHeader, setHideHeader] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;

            if (currentY > lastScrollY && currentY > 80) {
                setHideHeader(true); // 아래로 스크롤하면 숨김
            } else {
                setHideHeader(false); // 위로 스크롤하면 보임
            }

            setLastScrollY(currentY);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <div
            className={`navbar navbar-expand-lg sticky-top bg-primary 
                transition-top ${hideHeader ? "hide" : ""}`}
            data-bs-theme="light"
        >
            <div className="container">
                <a href="../" className="navbar-brand">
                    핑크 성남운송
                </a>

                <div className="collapse navbar-collapse" id="navbarResponsive">
                    <ul className="navbar-nav ms-md-auto">
                        <li className="nav-item">
                            <Link to="/" className="nav-link">
                                고객센터(미정)
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/login/" className="nav-link">
                                로그인
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/signup/" className="nav-link">
                                회원가입
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GNB;
