import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useWindowSize from '../../../hooks/useWindowSize';
import menuConfig from '../../../constants/menuConfig';
import './SidebarComponent.css';

const MenuItem = ({ item, openSubMenu, toggleSubMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname.startsWith(item.path);
  const isSubmenuOpen = openSubMenu === item.name;

  const handleItemClick = () => {
    if (item.submenu) {
      toggleSubMenu(item.name);
    }
    navigate(item.path);
  };

  return (
    <li
      onClick={handleItemClick}
      className={`${isActive ? 'active' : ''} ${item.submenu ? 'has-submenu' : ''} ${isSubmenuOpen ? 'is-open' : ''}`}
    >
      {item.name}
      {item.submenu && isSubmenuOpen && (
        <ul className="submenu-list">
          {item.submenu.map((subItem) => (
            <MenuItem key={subItem.name} item={subItem} />
          ))}
        </ul>
      )}
    </li>
  );
};

const SidebarComponent = ({ isOpen }) => {
  const { width } = useWindowSize();
  const { role, isAuthenticated } = useSelector((state) => state.adminLogin);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const isSmallScreen = width <= 767;

  const toggleSubMenu = (menuName) => {
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

  const accessibleMenus = menuConfig.filter(item => item.permissions.includes(role));

  if (!isAuthenticated) {
    return null; // Or a login prompt
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {!isSmallScreen && (
        <div className="sidebar-header">
          <h2>관리자 페이지</h2>
        </div>
      )}
      <ul className="sidebar-list">
        {accessibleMenus.map((item) => (
          <MenuItem
            key={item.name}
            item={item}
            openSubMenu={openSubMenu}
            toggleSubMenu={toggleSubMenu}
          />
        ))}
      </ul>
    </div>
  );
};

export default SidebarComponent;
