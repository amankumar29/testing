import styles from "./ToggleButton.module.scss";
import PropTypes from "prop-types";

function ToggleButton({ onToggleChange = () => {}, isChecked, setIsChecked, addNewConfig }) {
  const handleChange = () => {
    setIsChecked(!isChecked);
    onToggleChange(!isChecked);
  };

  const bgColor = isChecked ? (addNewConfig ? 'bg-ign6' : 'bg-ibl3') : (addNewConfig ? 'bg-ird3' : 'bg-ibl2');

  return (
    <label
      className={`${
        styles.switch
      } relative inline-block w-[50px] !border-none h-6 ${bgColor} `}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        className="absolute opacity-0 w-0 h-0 cursor-pointer"
        data-testid="checkbox"
      />
      <span
        className={`slider absolute cursor-pointer w-4 h-4 top-[3.36px] left-1 rounded-full bg-iwhite transition-transform duration-300 ${
          isChecked ? "transform translate-x-6" : ""
        }`}
      ></span>
      <span
        data-testid="checked_message"
        className={`label cursor-pointer absolute left-6 top-[3.5px] text-[12px] text-iwhite transition-transform duration-300 ${
          isChecked ? "-translate-x-5" : ""
        }`}
      >
        {isChecked ? "Yes" : "No"}
      </span>
    </label>
  );
}

export default ToggleButton;

ToggleButton.propTypes = {
  onToggleChange: PropTypes.func,
  isChecked: PropTypes.bool.isRequired,
  addNewConfig:PropTypes.bool.isRequired,
  setIsChecked: PropTypes.func.isRequired,
};
