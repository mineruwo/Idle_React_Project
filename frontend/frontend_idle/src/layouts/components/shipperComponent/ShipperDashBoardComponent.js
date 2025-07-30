const ShipperDashBoardComponent = () => {

    return (
        <div class="dashboard">
            <div class="card">
                <div class="card-title">오더상세</div>
                <div class="card-content">12건</div>
                <div class="card-desc">최근 오더: 진행중 3, 완료 8, 취소 1</div>
                <div class="card-action">상세보기</div>
            </div>
            <div class="card">
                <div class="card-title">배송현황</div>
                <div class="card-content">4건 진행중</div>
                <div class="card-desc">실시간 위치 확인, 지연건 0건</div>
                <div class="card-action">배송현황 바로가기</div>
            </div>
            <div class="card">
                <div class="card-title">포인트</div>
                <div class="card-content">175,000P</div>
                <div class="card-desc">최근 적립: +2,000P / 소멸예정: 5,000P</div>
                <div class="card-action">포인트 내역</div>
            </div>
            <div class="card">
                <div class="card-title">후기</div>
                <div class="card-content">평점 4.8 ★</div>
                <div class="card-desc">최근 후기 3개, 후기 작성 가능</div>
                <div class="card-action">내 후기 보기</div>
            </div>
        </div>
    )

}

export default ShipperDashBoardComponent;