const TestPage = () => {
    return (
        <div class="navbar navbar-expand-lg fixed-top bg-primary" data-bs-theme="dark">
            <div class="container">
                <a href="../" class="navbar-brand">핑크 성남운송</a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarResponsive">                    
                    <ul class="navbar-nav ms-md-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="../help/">고객센터(미정)</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../help/">로그인</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../help/">회원가입</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default TestPage;