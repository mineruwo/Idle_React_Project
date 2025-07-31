import "../../../theme/ShipperCustomCss/ShipperDashBoard.css";

const ShipperDashBoardComponent = () => {
    return (
        <div className="dashboard">
            <div className="card">
                <div className="card-title">오더상세</div>
                <div className="card-content">11건</div>
                <div className="card-desc">
                    최근 오더: 진행중 2, 완료 8, 취소 1
                </div>
                <div className="card-action">상세보기</div>
            </div>
            <div className="card">
                <div className="card-title">배송현황</div>
                <div className="card-content">2건 진행중</div>
                <div className="card-desc">실시간 위치 확인, 지연건 0건</div>
                <div className="card-action">배송현황 바로가기</div>
            </div>
            <div className="card">
                <div className="card-title">포인트</div>
                <div className="card-content">175,000P</div>
                <div className="card-desc">최근 충전: +20,000P</div>
                <div className="card-action">포인트 내역</div>
            </div>
            <div className="card">
                <div className="card-title">후기</div>
                <div className="card-content">평점 4.8 ★</div>
                <div className="card-desc">최근 후기 3개, 후기 작성 가능</div>
                <div className="card-action">내 후기 보기</div>
            </div>
        </div>
    );
};

export default ShipperDashBoardComponent;
