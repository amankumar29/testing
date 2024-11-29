import React, { useState, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import HelpIcon from "@mui/icons-material/Help";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import PropTypes from "prop-types";
import { removeCookies } from "Helpers/RemoveCookies/RemoveCookies";

const NavIcon = ({
  activeIcon,
  defaultIcon,
  path,
  id,
  isActive,
  onHover,
  onClick,
}) => {
  const location = useLocation();
  return (
    <NavLink
      className={`${isActive ? "cursor-default" : ""}`}
      to={path}
      onClick={() => onClick(id)}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-2xl ${
          isActive
            ? "bg-ibl7"
            : "hover:bg-gradient-to-b from-[#4564AC] to-[#728BC6] hover:transition-all hover:duration-300 hover:ease-in-out cursor-pointer"
        }`}
      >
        {isActive ? (
          <div className="text-ibl3" data-testid={`${id}_action_icon`}>
            {activeIcon}
          </div>
        ) : (
          <div className="text-iwhite" data-testid={`${id}_default_icon`}>
            {defaultIcon}
          </div>
        )}
      </div>
    </NavLink>
  );
};

NavIcon.propTypes = {
  activeIcon: PropTypes.element,
  defaultIcon: PropTypes.element,
  path: PropTypes.string,
  id: PropTypes.number,
  isActive: PropTypes.bool,
  onHover: PropTypes.func,
  onClick: PropTypes.func,
};

const SideMenuBar = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleIconClick = useCallback((id) => {
    setHoveredId(null);
    removeCookies();
  }, []);

  const navData = [
    {
      id: 1,
      tooltipTitle: "Dashboard",
      activeIcon: <DashboardIcon />,
      defaultIcon: <DashboardOutlinedIcon />,
      path: "/dashboard",
    },
    {
      id: 2,
      tooltipTitle: "Projects",
      activeIcon: <CreateNewFolderIcon />,
      defaultIcon: <CreateNewFolderOutlinedIcon />,
      path: "/projects",
    },
    {
      id: 3,
      tooltipTitle: "Runs",
      activeIcon: <SlideshowIcon />,
      defaultIcon: <SlideshowOutlinedIcon />,
      path: "/runs",
    },
    {
      id: 4,
      tooltipTitle: "Settings",
      activeIcon: <SettingsIcon />,
      defaultIcon: <SettingsOutlinedIcon />,
      path: "/setting",
    },
    {
      id: 5,
      tooltipTitle: "Users",
      activeIcon: <PeopleAltIcon />,
      defaultIcon: <PeopleAltOutlinedIcon />,
      path: "/users",
    },
    {
      id: 6,
      tooltipTitle: "Documentation",
      activeIcon: <HelpIcon />,
      defaultIcon: <HelpOutlineOutlinedIcon />,
      path: "/documentation",
    },
  ];

  return (
    <div className="">
      <div className="flex flex-col items-center justify-center gap-8 mt-24 lgMax:overflow-y-auto lgMax:h-screen lgMax:justify-start lgMax:pb-8 lgMax:mt-20">
        {navData.map((item) => (
          <CustomTooltip
            key={item.id}
            title={item.tooltipTitle}
            placement="right"
            offset={[0, 12]}
            height="44px"
            fontSize="16"
            open={
              hoveredId === item.id && !location.pathname.includes(item.path)
            }
          >
            <div>
              <NavIcon
                activeIcon={item.activeIcon}
                defaultIcon={item.defaultIcon}
                path={item.path}
                id={item.id}
                isActive={location.pathname.includes(item.path)}
                onHover={setHoveredId}
                onClick={handleIconClick}
              />
            </div>
          </CustomTooltip>
        ))}
      </div>
    </div>
  );
};

export default SideMenuBar;
