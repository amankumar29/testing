import styles from "./CustomCheckbox.module.scss";
import PropTypes from "prop-types";

const CustomCheckbox = ({ isChecked, onChecked,id }) => {
  const handleChange = () => {
    onChecked();
  };

  return (
    <label className={`h-[22px] cursor-pointer`} data-testid={`${id}`}>
      <input
        id={id}
        type="checkbox"
        className={styles.inputContainer}
        checked={isChecked}
        onChange={handleChange}
      />
      <span className={styles.customCheckbox}></span>
    </label>
  );
};

export default CustomCheckbox;
CustomCheckbox.propTypes = {
  isChecked: PropTypes.bool,
  onChecked: PropTypes.func,
};
