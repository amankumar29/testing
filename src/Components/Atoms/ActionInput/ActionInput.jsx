import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { formatString } from "Helpers/ConvertString/ConvertToLowerCase";

const ActionInput = ({
  error,
  label,
  placeHolder,
  type,
  id,
  className,
  value,
  isEditable = false,
  errorClassName,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    if (value) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  }, [value]);

  const handleClick = (e) => {
    setIsFocused(true);
    if (e.target.value) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (e.target.value) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  };
  return (
    <div className="relative">
      <div
        className={`text-sm font-medium leading-6 w-fit ${
          (isFocused || isFilled) && "text-ibl1"
        } ${error && !isFocused && "text-ird3"} ${
          isHover && !error && "text-ibl1"
        }`}
        data-testid={`${id}_${formatString(label)}`}
      >
        {label}
      </div>
      <div
        className={`border flex h-[46px] text-ibl1 border-solid rounded-lg px-4 py-2.5 mt-2 font-normal text-sm leading-5 ${
          isHover && !error
            ? "border-ibl1"
            : error && !isFocused
            ? "border-ird3"
            : isFocused || isFilled
            ? "text-ibl1 border-ibl1"
            : "border-igy6 "
        } ${className}`}
        onClick={(e) => handleClick(e)}
        onBlur={(e) => {
          handleBlur(e);
        }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        data-testid={`${id}_actioninput`}
      >
        <input
          disabled={!isEditable}
          id={`${id}_${formatString(label)}`}
          autoComplete="off"
          type={type}
          value={value}
          className={`focus:outline-none w-full placeholder:text-igy5`}
          placeholder={placeHolder}
          {...props}
        />
      </div>
      {error && (
        <p
          className={`${errorClassName} text-ird3 text-[10px] font-medium mt-1 absolute`}
          data-testid="error_name"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default ActionInput;

ActionInput.propTypes = {
  error: PropTypes.string,
  label: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string,
  value: PropTypes.string,
  isEditable: PropTypes.bool,
};
