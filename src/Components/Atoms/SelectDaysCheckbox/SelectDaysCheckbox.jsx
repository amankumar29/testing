import "./SelectDaysCheckbox.style.scss";
import PropTypes from "prop-types";

export default function SelectDaysCheckbox({
  className = "",
  ref,
  id,
  label,
  classNameLabel,
  isHeaderCheck = false,
  index,
  checked,
  ...props
}) {
  return (
    <>
      <div
        className={`flex flex-col items-center gap-[20px] ${
          isHeaderCheck ? "header-checkboxPlan" : "custom-checkboxPlan"
        } ${props.disabled ? "disabled" : ""} ${className}`}
        htmlFor={props.id}
        data-testid={`${id}_children `}
      >
        <div>
          <input
            style={{ marginLeft: index === 0 && "-10px" }}
            {...props}
            type="checkbox"
            ref={ref}
            className={className}
            data-testid={`${id}_checkbox`}
            checked={checked}
          />
        </div>
        {label && (
          <span
            style={{ marginLeft: index !== 0 ? "20px" : "0px" }}
            className={`text ${
              props.disabled ? "disabled" : ""
            } ${classNameLabel}`}
            data-testid={`labelname_${label}`}
          >
            {label}
          </span>
        )}{" "}
      </div>
    </>
  );
}

SelectDaysCheckbox.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  classNameLabel: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  ref: PropTypes.any,
  isHeaderCheck: PropTypes.any,
  checked: PropTypes.bool,
};
