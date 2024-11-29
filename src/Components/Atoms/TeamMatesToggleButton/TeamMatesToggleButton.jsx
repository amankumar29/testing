import { useState } from "react";
import styles from "./TeamMatesToggleButton.module.scss";
import PropTypes from "prop-types";

function TeamMatesToggleButton({ onToggleChange = () => {}, isChecked }) {
  const [checked, setChecked] = useState(!isChecked);

  const handleChange = () => {
    setChecked(!checked);
    onToggleChange(!checked);
  };

  return (
    <label
      className={`${styles.switch} relative inline-block !border-none h-6 ${
        checked ? `bg-ign6 w-[70px]` : "bg-ird3 w-[75px]"
      }`}
    >
      <input
        type="checkbox"
        className="absolute opacity-0 w-0 h-0"
        data-testid="checkbox"
      />
      <span
        data-testid="checked_message"
        className={`label absolute  left-[15px] top-[3.5px]  text-[12px] text-iwhite transition-transform duration-300 `}
      >
        {checked ? "Active" : "Inactive"}
      </span>
    </label>
  );
}

export default TeamMatesToggleButton;

TeamMatesToggleButton.propTypes = {
  onToggleChange: PropTypes.func,
  isChecked: PropTypes.bool.isRequired,
  setIsChecked: PropTypes.func.isRequired,
};
