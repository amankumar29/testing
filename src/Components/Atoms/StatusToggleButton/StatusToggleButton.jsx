import { useState, useEffect } from "react";
import styles from "./StatusToggleButton.module.scss";
import PropTypes from "prop-types";

function StatusToggleButton({ onStatusChange = () => {}, status, disableProp = false }) {
  const [isActive, setIsActive] = useState(status === "ACTIVE");

  useEffect(() => {
    setIsActive(status === "ACTIVE");
  }, [status]);

  const handleToggle = () => {
    const newStatus = isActive ? "INACTIVE" : "ACTIVE";
    setIsActive(!isActive);
    onStatusChange(newStatus);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label
        className={`${
          styles.switch
        } relative inline-block w-[85px] !border-none h-6 ${
          isActive ? `!bg-ign6` : "!bg-ird3"
        }`}
      >
        <input
          type="checkbox"
          onChange={handleToggle}
          checked={isActive}
          className={`absolute opacity-0 w-0 h-0 cursor-pointer ${
            disableProp && "!cursor-default"
          }`}
          data-testid="checkbox"
          disabled={disableProp}
        />
        <span
          className={`slider absolute cursor-pointer ${
            disableProp && "!cursor-default"
          } w-4 h-4 top-[4.36px] left-1 rounded-full bg-iwhite transition-transform duration-300 ${
            isActive ? "transform translate-x-[60px]" : ""
          }`}
        ></span>
        <span
          data-testid="status_message"
          className={`label absolute cursor-pointer ${
            disableProp && "!cursor-default"
          } left-6 top-[3px] text-[12px] text-iwhite transition-transform duration-300 ${
            isActive ? "-translate-x-3" : ""
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </label>
    </div>
  );
}

export default StatusToggleButton;

StatusToggleButton.propTypes = {
  onStatusChange: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  disableProp: PropTypes.bool,
};
