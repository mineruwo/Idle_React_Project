const ShipperNavBarComponent = () => {

  return (
    <div className="bs-docs-section clearfix">
      <div className="row">
        <div className="col-lg-12">

          <div className="bs-component">
            <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
              <div className="container-fluid">
                <div className="collapse navbar-collapse" id="navbarColor02">
                  <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                      <a className="nav-link" href="#">대시보드</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">오더신청</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">오더상세</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">배송현황</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">포인트</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">후기작성</a>
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

export default ShipperNavBarComponent;