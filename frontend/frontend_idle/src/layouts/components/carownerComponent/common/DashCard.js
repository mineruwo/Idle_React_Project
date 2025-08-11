

// Main App component to render the DashCard
const App = () => {
    return (
        // Tailwind CSS setup: Apply Inter font and a background color to the body
        <div className="font-inter bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
            <DashCard />
        </div>
    );
};

const DashCard = () => {
    return (
        // React Fragment to wrap multiple top-level elements
        <>
            {/* Section title for Cards */}
            <div className="flex justify-center items-center mt-5 mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Cards</h2>
            </div>

            {/* Container for the card columns */}
            <div className="flex flex-wrap -mx-4">
                {/* Column for solid background cards */}
                <div className="w-full lg:w-1/2 px-4 mb-8 " id='semiDiv'>
                    <div className="flex flex-col space-y-4 der border-gray-500 mb-3 rounded-lg shadow-md"  id='firstCardDiv' style={{height:'25rem'}}>
                        {/* Secondary Border Card */}
                        <div className="card border border-gray-500 mb-3 rounded-lg shadow-md" style={{ maxWidth: '40rem' }}>
                            <div className="card-header p-3 border-b border-gray-500 text-gray-700 font-semibold">안녕하세요! 손민우님! 이달 총 운송량은 !</div>
                            <div className="card-body p-4 text-gray-800">
                                <h4 className="card-title text-xl font-bold mb-2">수임한 운송건:</h4>
                                <p className="card-text text-sm">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>

                        <div className="card border border-gray-500 mb-3 rounded-lg shadow-md" style={{ maxWidth: '40rem' }}>
                            <div className="card-header p-3 border-b border-gray-500 text-gray-700 font-semibold">이번달 민우님의 총 수익이에요! </div>
                            <div className="card-body p-4 text-gray-800">
                                <h4 className="card-title text-xl font-bold mb-2">정산금: </h4>
                                <p className="card-text text-sm">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>

                    </div>
                    <div className="flex flex-col space-y-4"  id='secounddiv'>
                        {/* Secondary Border Card */}
                        <div className="card border border-gray-500 mb-3 rounded-lg shadow-md" style={{ maxWidth: '40rem', height:'25rem' }}>
                            <div className="card-header p-3 border-b border-gray-500 text-gray-700 font-semibold">민우님 행복주택 예정 추이 </div>
                            <div className="card-body p-4 text-gray-800" >
                                <h4 className="card-title text-xl font-bold mb-2">Secondary card title</h4>
                                <p className="card-text text-sm">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>

                    </div>
                        
                </div>
            </div>
        </>
    );
};

export default App;
