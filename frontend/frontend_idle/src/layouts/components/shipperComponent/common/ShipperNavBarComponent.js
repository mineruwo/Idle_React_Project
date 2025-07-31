import useCustomMove from "../../../../hooks/useCustomMove";

const ShipperNavBarComponent = () => {
    const {
        moveToDashBoard,
        moveToDetails,
        moveToOrder,
        moveToPayment,
        moveToReview,
        moveToStatus,
    } = useCustomMove();

    return (
        <div className="bs-component">
            <nav
                className="navbar navbar-expand-lg bg-primary bg-opacity-75"
                data-bs-theme="dark"
            >
                <div className="container-fluid">
                    <div className="navbar-brand">화주 페이지</div>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#shipperNavbar"
                        aria-controls="shipperNavbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div
                        className="collapse navbar-collapse"
                        id="shipperNavbar"
                    >
                        <ul className="navbar-nav mx-auto">
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={() => moveToDashBoard()}
                            >
                                <div className="nav-link">대시보드</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={() => moveToOrder()}
                            >
                                <div className="nav-link">오더신청</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={moveToDetails}
                            >
                                <div className="nav-link">오더상세</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={() => moveToStatus()}
                            >
                                <div className="nav-link">배송현황</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={() => moveToPayment()}
                            >
                                <div className="nav-link">포인트</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={() => moveToReview()}
                            >
                                <div className="nav-link">후기작성</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default ShipperNavBarComponent;
