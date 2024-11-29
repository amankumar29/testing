import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import NumberFormat from "react-number-format";

const TimeNumberInput = ({
  error,
  label,
  placeHolder,
  isRequired,
  type,
  id,
  className,
  inputClassName,
  onBlurCall = () => {},
  isMult = false,
  value = "",
  isMultiple = () => {},
  max_Length,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const handleClick = (e) => {
    setIsFocused(true);
    if (e.target.value || value?.length >= 1) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
    if (isMult) {
      isMultiple();
    }
  };

  useEffect(() => {
    if (value?.length >= 1) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  }, [value]);

  const handleBlur = (e) => {
    setIsFocused(false);
    if (e.target.value || value?.length >= 1) {
      setIsFilled(true);
      onBlurCall(true);
    } else {
      setIsFilled(false);
      onBlurCall(false);
    }
  };

  return (
    <div className="relative">
      <div
        className={`text-sm font-medium leading-6 w-fit ${
          (isFocused || isFilled) && "text-ibl1"
        } ${error && !isFocused && "text-ird1"} ${
          isHover && !error && "text-ibl1"
        }`}
        data-testid={`${label}_name`}
      >
        {label} {isRequired && <span className="text-ird3">*</span>}
      </div>
      <div
        className={`border flex text-ibl1 border-solid rounded-lg px-4 py-2.5 mt-2 focus:outline-none font-normal text-lg leading-7 placeholder:text-igy5 ${inputClassName} ${
          isHover && !error
            ? "border-ibl1"
            : error && !isFocused
            ? "border-ird3"
            : isFocused || isFilled
            ? "!text-ibl1 !border-ibl1"
            : "border-igy6 "
        } ${className} ${inputClassName}`}
        onClick={(e) => handleClick(e)}
        onBlur={(e) => {
          handleBlur(e);
        }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <NumberFormat
          data-testid={`input_field_Value`}
          id={id}
          autoComplete="off"
          value={value}
          type={type}
          className={`focus:outline-none pr-2 w-full placeholder:text-igy5`}
          placeholder={placeHolder}
          maxLength={max_Length}
          {...props}
        />
      </div>
      {error && (
        <p
          className="text-ird3 text-[10px] font-medium mt-1 absolute"
          data-testid="error_name"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default TimeNumberInput;

TimeNumberInput.propTypes = {
  error: PropTypes.string,
  label: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  isRequired: PropTypes.bool,
  type: PropTypes.string,
  onFocus: PropTypes.func,
  isMult: PropTypes.bool,
  isMultiple: PropTypes.func,
  id: PropTypes.string,
  onBlur: PropTypes.func,
  onBlurCall: PropTypes.func,
  value: PropTypes.string,
  max_Length: PropTypes.number,
};
