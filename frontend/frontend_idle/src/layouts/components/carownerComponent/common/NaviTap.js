import { useNavigate } from 'react-router-dom';
import '../../../../theme/CustomCss.css'

const NaviTap = () => {
  const navigate = useNavigate();
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
                    <li className="nav-item" onClick={()=>navigate("/carPage")}>
                      <a className="nav-link active" href="#">DashBoard
                        <span className="visually-hidden">(current)</span>
                      </a>
                    </li>
                    <li className="nav-item" onClick={()=>navigate("/carPage/profile")}>
                      <a className="nav-link" href="#"> Profile</a>
                    </li>
                    <li className="nav-item" onClick={()=>navigate("/carPage/orders")}>
                      <a className="nav-link" href="#">Order</a>
                    </li>
                    <li className="nav-item" onClick={()=>navigate("/carPage/settlement")}>
                      <a className="nav-link" href="#">MyCars</a>
                    </li>
                    <li className="nav-item" onClick={()=>navigate("/carPage/vehucles")}>
                      <a className="nav-link" href="#">Vehucles</a>
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