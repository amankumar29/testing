import "./Checkbox.style.scss";
import PropTypes from "prop-types";

export const Checkbox = ({
  children,
  className = "",
  label = "",
  classNameLabel = "",
  ref,
  isHeaderCheck = false,
  id,
  disable,
  ...props
}) => {
  return (
    <label
      className={`${isHeaderCheck ? "header-checkbox" : "custom-checkbox"} ${
        props.disabled ? "disabled" : ""
      } ${className}`}
      htmlFor={props.id}
      data-testid={`${id}_children`}
    >
      <input
        {...props}
        type="checkbox"
        ref={ref}
        className={className}
        data-testid={`${id}_checkbox`}
        disabled={disable}
      />
      {label && !children && (
        <span
          className={`text ${
            props.disabled ? "disabled" : ""
          } ${classNameLabel}`}
          data-testid={`labelname_${label}`}
        >
          {label}
        </span>
      )}
      {children}
    </label>
  );
};
Checkbox.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  classNameLabel: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  ref: PropTypes.any,
  isHeaderCheck: PropTypes.any,
};

Checkbox.displayName = "Checkbox";
