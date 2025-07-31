
import '../../../../theme/CustomCss.css'
import useCustomMove from '../../../../Car_owner/hooks/useCustomMove';

const NaviTap = () => {
  const {moveToDashboard, moveToEditProfile, moveToOrders, moveToProfile, moveToSettlement, moveToVehucles} = useCustomMove();
  return (
    <div className="bs-docs-section clearfix " >
      <div className="row">
        <div className="col-lg-12">

          <div className="bs-component">
            <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
              <div className="container-fluid">
                <a className="navbar-brand" href="#">Idle</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarColor01">
                  <ul className="navbar-nav me-auto">
                    <li className="nav-item" onClick={moveToDashboard}>
                      <a className="nav-link active" href="#">대시보드
                        <span className="visually-hidden">(current)</span>
                      </a>
                    </li>
                    <li className="nav-item" onClick={moveToProfile}>
                      <a className="nav-link" href="#"> 프로필</a>
                    </li>
                    <li className="nav-item" onClick={moveToOrders}>
                      <a className="nav-link" href="#">내 운송</a>
                    </li>
                    <li className="nav-item" onClick={moveToSettlement}>
                      <a className="nav-link" href="#">정산</a>
                    </li>
                    <li className="nav-item" onClick={moveToVehucles}>
                      <a className="nav-link" href="#">내 차량</a>
                    </li>
                  </ul>
                  <form className="d-flex">
                    <input className="form-control me-sm-2" type="search" placeholder="Search" />
                    <button className="btn btn-secondary my-2 my-sm-0" type="submit">Search</button>
                  </form>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaviTap;