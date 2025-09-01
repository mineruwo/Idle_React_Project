import useCustomMove from "../../../../hooks/useCustomMove";

const ShipperNavBarComponent = () => {
    const {
        shipperMoveToDashBoard,
        shipperMoveToOrder,
        shipperMoveToOrderBoard,
        shipperMoveToPoint,
        shipperMoveToReview,
        shipperMoveToOrderHistory,
        shipperMoveToInquiries,
    } = useCustomMove();

    return (
        <div className="bs-component">
            <nav
                className="navbar navbar-expand-lg sticky-top bg-secondary"
                data-bs-theme="dark"
                style={{
                    zIndex: 1000,
                    top: 0,
                }}
            >
                <div className="container-fluid">
                    <div
                        className="navbar-brand"
                        onClick={shipperMoveToDashBoard}
                    >
                        화주 페이지
                    </div>
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
                                onClick={shipperMoveToDashBoard}
                            >
                                <div className="nav-link">대시보드</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={shipperMoveToOrder}
                            >
                                <div className="nav-link">오더신청</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={shipperMoveToOrderBoard}
                            >
                                <div className="nav-link">오더게시판</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={shipperMoveToOrderHistory}
                            >
                                <div className="nav-link">오더내역</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={shipperMoveToPoint}
                            >
                                <div className="nav-link">포인트</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={shipperMoveToReview}
                            >
                                <div className="nav-link">후기작성</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={shipperMoveToInquiries}
                            >
                                <div className="nav-link">문의내역</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default ShipperNavBarComponent;
