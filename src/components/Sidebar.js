import React, { useState } from "react";
import "../App.css";
import "../Responsive.css";
import { SidebarData } from "./SidebarData";
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

function Sidebar({ loadComponent }) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const handleNavigation = (link) => {
    window.history.pushState({}, "", link);
    loadComponent(link);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div>
      <div className="sidebarMenuBtn">
        <IconButton aria-label="menu" size="large" onClick={toggleSidebar}>
          <MenuIcon fontSize="inherit" sx={{ color: "white" }} />
        </IconButton>
      </div>
      <div className={`Sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <ul className="SidebarList">
          {SidebarData.map((val, key) => {
            return (
              <li
                className="row"
                key={key}
                id={window.location.pathname === val.link ? "active" : ""}
                onClick={() => handleNavigation(val.link)}
              >
                <div id="icon">{val.icon}</div>
                <div id="title">{val.title}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
