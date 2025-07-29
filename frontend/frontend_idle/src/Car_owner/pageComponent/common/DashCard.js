import React from 'react';

// Main App component to render the DashCard
const App = () => {
  return (
    // Tailwind CSS 설정: Inter 폰트와 배경색을 body에 적용
    <div className="font-inter bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <DashCard />
    </div>
  );
};

const DashCard = () => {
  return (
    // 여러 최상위 요소를 감싸기 위한 React Fragment
    <>
      {/* 카드 섹션 제목 */}
      <div className="flex justify-center items-center mt-5 mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Cards</h2>
      </div>

      {/* 메인 컨테이너: 섹션 1&2 그룹과 섹션 3 그룹을 가로로 배치 */}
      {/* flex: flexbox 컨테이너로 설정 */}
      {/* flex-wrap: 작은 화면에서는 항목들이 다음 줄로 넘어감 (세로로 쌓임) */}
      {/* lg:flex-nowrap: 큰 화면(lg 브레이크포인트 이상)에서는 항목들이 한 줄에 유지됨 (가로로 배치) */}
      {/* items-stretch: flex 컨테이너의 자식 요소(컬럼)들이 컨테이너의 전체 높이를 채우도록 함 */}
      <div className="flex flex-wrap lg:flex-nowrap -mx-4 items-stretch">

        {/* 왼쪽 컬럼: 섹션 1과 섹션 2 카드를 포함하는 DIV */}
        {/* w-full: 작은 화면에서 전체 너비, lg:w-1/2: 큰 화면에서 절반 너비 */}
        <div className="w-full lg:w-1/2 px-4 mb-8">
          {/* flex-col: 자식 요소(카드)들을 수직으로 배치 */}
          {/* space-y-4: 수직 간격 */}
          {/* h-full: 부모 컬럼의 높이(items-stretch에 의해 결정됨)를 꽉 채움 */}
          <div className="flex flex-col space-y-4 h-full">

            {/* 섹션 1 카드 */}
            {/* flex-none: 이 요소의 크기가 고정되도록 함 (flex 컨테이너 내에서 확장/축소되지 않음) */}
            <div className="card border border-gray-500 rounded-lg shadow-md flex-none">
              <div className="card-header p-3 border-b border-gray-500 text-gray-700 font-semibold">Section1</div>
              <div className="card-body p-4 text-gray-800">
                <h4 className="card-title text-xl font-bold mb-2">Secondary card title</h4>
                <p className="card-text text-sm">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
              </div>
            </div>

            {/* 섹션 2 카드 */}
            {/* flex-none: 이 요소의 크기가 고정되도록 함 */}
            <div className="card border border-gray-500 rounded-lg shadow-md flex-none">
              <div className="card-header p-3 border-b border-gray-500 text-gray-700 font-semibold">Section2</div>
              <div className="card-body p-4 text-gray-800">
                <h4 className="card-title text-xl font-bold mb-2">Secondary card title</h4>
                <p className="card-text text-sm">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
              </div>
            </div>

          </div>
        </div>

        {/* 오른쪽 컬럼: 확장된 섹션 3 카드를 포함하는 큰 DIV */}
        {/* w-full: 작은 화면에서 전체 너비, lg:w-1/2: 큰 화면에서 절반 너비 */}
        <div className="w-full lg:w-1/2 px-4 mb-8">
          {/* flex-col: 자식 요소들을 수직으로 배치 (여기서는 하나만 있으므로 큰 의미는 없으나 일관성을 위해) */}
          {/* h-full: 부모 컬럼의 높이(items-stretch에 의해 결정됨)를 꽉 채움 */}
          <div className="flex flex-col h-full">
            {/* 섹션 3 카드 */}
            {/* flex-grow: 사용 가능한 모든 수직 공간을 채우도록 함 (왼쪽 두 카드의 높이 합만큼 확장) */}
            <div className="card border border-gray-500 rounded-lg shadow-md flex-grow">
              <div className="card-header p-3 border-b border-gray-500 text-gray-700 font-semibold">Section3</div>
              <div className="card-body p-4 text-gray-800">
                <h4 className="card-title text-xl font-bold mb-2">Expanded card title</h4>
                <p className="card-text text-sm">이 카드는 왼쪽에 있는 섹션 1과 섹션 2 카드의 전체 높이와 너비에 맞춰 확장되도록 설계되었습니다.</p>
                <p className="card-text text-sm">다양한 화면 크기에서 반응적이고 균형 잡힌 레이아웃을 구현하기 위해 Tailwind CSS flexbox 유틸리티를 사용합니다.</p>
                <p className="card-text text-sm">이 콘텐츠는 높이 조정을 시연하기 위해 확장될 수 있습니다.</p>
                <p className="card-text text-sm">공간을 차지하기 위한 추가 콘텐츠입니다.</p>
                <p className="card-text text-sm">높이를 더 늘리기 위한 더 많은 콘텐츠입니다.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default App;
