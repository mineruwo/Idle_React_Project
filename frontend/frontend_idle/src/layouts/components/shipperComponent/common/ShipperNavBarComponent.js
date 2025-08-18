import useCustomMove from "../../../../hooks/useCustomMove";

const ShipperNavBarComponent = () => {
    const {
        shipperMoveToDashBoard,
        shipperMoveToOrder,
        shipperMoveToOrderBoard,
        shipperMoveToPoint,
        shipperMoveToPayment,
        shipperMoveToReview,
    } = useCustomMove();

    return (
        <div className="bs-component">
            <nav
                className="navbar navbar-expand-lg sticky-top"
                data-bs-theme="dark"
                style={{
                    backgroundColor: "rgb(244, 170, 168)",
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
                                onClick={shipperMoveToPoint}
                            >
                                <div className="nav-link">포인트</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={shipperMoveToPayment}
                            >
                                <div className="nav-link">결제</div>
                            </li>
                            <li
                                className="nav-item py-2 border-bottom border-light border-opacity-25"
                                onClick={shipperMoveToReview}
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
