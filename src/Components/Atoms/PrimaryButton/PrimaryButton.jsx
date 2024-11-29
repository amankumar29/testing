import PropTypes from "prop-types";

const PrimaryButton = ({ onClick, disabled, label, ...props }) => {
  return (
    <button
      data-testid={`primary_button_${label}`}
      disabled={disabled}
      className={`bg-ibl1 text-iwhite hover:bg-ibl3 hover:transition-all hover:duration-300 hover:ease-in text-base font-medium rounded-lg w-full h-[52px] disabled:bg-ibl2`}
      onClick={onClick}
      {...props}
    >
      {label}
    </button>
  );
};

export default PrimaryButton;

PrimaryButton.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.string,
};
