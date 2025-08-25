import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useWindowSize from '../../../hooks/useWindowSize';
import menuConfig from '../../../constants/menuConfig';
import './SidebarComponent.css';

const MenuItem = ({ item, openSubMenu, toggleSubMenu, toggleSidebar, isSmallScreen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if the current item is active
  const isActive = item.submenu
    ? item.submenu.some(subItem => location.pathname.startsWith(subItem.path))
    : location.pathname === item.path;

  const isSubmenuOpen = openSubMenu === item.name;

  const handleItemClick = () => {
    if (item.submenu) {
      toggleSubMenu(item.name);
    } else {
      navigate(item.path);
      if (isSmallScreen && toggleSidebar) { // Only close sidebar if it's an overlay (small screen)
        toggleSidebar();
      }
    }
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
            <MenuItem
              key={subItem.name}
              item={subItem}
              openSubMenu={openSubMenu} // Pass down
              toggleSubMenu={toggleSubMenu} // Pass down
              toggleSidebar={toggleSidebar} // Pass down
              isSmallScreen={isSmallScreen} // Pass isSmallScreen down
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const SidebarComponent = ({ isOpen, toggleSidebar }) => {
  const { width } = useWindowSize();
  const { role, isAuthenticated } = useSelector((state) => state.adminLogin);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const isSmallScreen = width <= 767;
  const location = useLocation(); // Import useLocation

  useEffect(() => {
    const activeParent = menuConfig.find(item =>
      item.submenu && item.submenu.some(subItem => location.pathname.startsWith(subItem.path))
    );
    setOpenSubMenu(activeParent ? activeParent.name : null);
  }, [location.pathname, menuConfig]); // Re-evaluate when path changes

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
            toggleSidebar={toggleSidebar}
            isSmallScreen={isSmallScreen} // Pass isSmallScreen down
          />
        ))}
      </ul>
    </div>
  );
};

export default SidebarComponent;