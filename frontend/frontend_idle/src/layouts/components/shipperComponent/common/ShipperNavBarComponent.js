import useCustomMove from "../../../../hooks/useCustomMove";

const ShipperNavBarComponent = () => {
    const { moveToDashBoard, moveToDetails } = useCustomMove();

    return (
        <div className="bs-component">
            <nav
                className="navbar navbar-expand-lg bg-primary bg-opacity-75"
                data-bs-theme="dark"
            >
                <div className="container-fluid">
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav me-auto">
                            <li
                                className="nav-item"
                                onClick={() => moveToDashBoard()}
                            >
                                <a className="nav-link" href="#">
                                    대시보드
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">
                                    오더신청
                                </a>
                            </li>
                            <li className="nav-item" onClick={moveToDetails}>
                                <a className="nav-link" href="#">
                                    오더상세
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">
                                    배송현황
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">
                                    포인트
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">
                                    후기작성
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default ShipperNavBarComponent;
