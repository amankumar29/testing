import { useState } from "react";
import styles from "./TestPlansToggleButton.module.scss";
import PropTypes from "prop-types";

function TestPlansToggleButton({
  onToggleChange = () => {},
  isChecked,
  disableProp = false,
}) {
  const [checked, setChecked] = useState(isChecked);

  const handleChange = () => {
    setChecked(!checked);
    onToggleChange(!checked);
  };

  return (
    <div onClick={(e) => {e.stopPropagation()}}>
      <label
      className={`${
        styles.switch
      } relative inline-block w-[85px] !border-none h-6 ${
        checked ? `!bg-ign6` : "!bg-ird3"
      }`}
    >
      <input
        type="checkbox"
        onChange={handleChange}
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
          checked ? "transform translate-x-[60px]" : ""
        }`}
      ></span>
      <span
        data-testid="checked_message"
        className={`label absolute cursor-pointer ${
          disableProp && "!cursor-default"
        } left-6 top-[3px]  text-[12px] text-iwhite transition-transform duration-300 ${
          checked ? "-translate-x-3" : ""
        }`}
      >
        {checked ? "Active" : "Inactive"}
      </span>
    </label>
    </div>
  );
}

export default TestPlansToggleButton;

TestPlansToggleButton.propTypes = {
  onToggleChange: PropTypes.func,
  isChecked: PropTypes.bool.isRequired,
  setIsChecked: PropTypes.func.isRequired,
  disableProp: PropTypes.bool,
};
