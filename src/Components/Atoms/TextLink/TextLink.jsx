import PropTypes from "prop-types";

const TextLink = ({ label, onClick, className }) => {
  return (
    <button
      type="button"
      className={`font-medium text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in-out hover:underline ${className}`}
      onClick={onClick}
      data-testid={`text_Link_${label}`}
    >
      {label}
    </button>
  );
};

export default TextLink;
TextLink.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};
