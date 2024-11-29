import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PropTypes from "prop-types";

const NavButton = ({ path, label, onClick }) => {
  const [isActive, setIsActive] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsActive(location.pathname.includes(path));
  }, [location.pathname, path]);

  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={isActive ? "cursor-default" : ""}
    >
      <div
        className={`h-12 mdMax:h-10 px-4 rounded-xl font-semibold text-base mdMax:text-sm flex items-center justify-between tracking-[0.45px] ${
          isActive
            ? "bg-ibl7"
            : "bg-iwhite hover:bg-ibl7 group hover:transition-all hover:duration-300 hover:ease-in-out cursor-pointer"
        }`}
      >
        <div>{label}</div>
        <ArrowForwardIosIcon
          className={
            isActive
              ? "text-ibl1"
              : "text-iwhite group-hover:text-ibl1 group-hover:transition-all group-hover:duration-300 group-hover:ease-in-out"
          }
          fontSize="small"
        />
      </div>
    </NavLink>
  );
};

NavButton.propTypes = {
  path: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default NavButton;
