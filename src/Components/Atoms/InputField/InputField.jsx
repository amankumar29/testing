import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const InputField = ({
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
  disabled = false,
  autocomplete,
  placeHolderSize,
  charLimit,
  showCharCount = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [charCount, setCharCount] = useState(0);

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

  const handleChange = (e) => {
    const msgLength = e?.target?.value?.length;
    if (msgLength > charLimit) return;
    setCharCount(msgLength);
    const { onChange } = props;
    if (typeof onChange === "function") {
      onChange(e);
    }
  };

  useEffect(() => {
    setCharCount(value?.length);
    setIsFilled(!!value);
  }, [value]);

  return (
    <div className="relative">
      <div
        className={`text-sm font-medium leading-6 w-fit ${
          (isFocused || isFilled) && !disabled && "text-ibl1"
        } ${error && !isFocused && !disabled && "text-ird3"} ${
          isHover && !error && !disabled && "text-ibl1"
        } ${disabled && "text-igy6"}`}
        data-testid={`${label}_name`}
      >
        {label} {isRequired && <span className="text-ird3">*</span>}
      </div>
      <div
        className={`border flex  border-solid rounded-lg mt-2 focus:outline-none font-normal text-lg leading-7 placeholder:text-igy5 ${inputClassName} ${
          disabled ? "text-igy6" : "text-ibl1"
        } ${
            isHover && !error && !disabled
            ? "border-ibl1"
            : error && !isFocused && !disabled
            ? "border-ird3"
            : (isFocused || isFilled) && !disabled
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
        <input
          disabled={disabled}
          data-testid={`input_field_Value`}
          id={id}
          autoComplete={autocomplete}
          value={value}
          type={type}
          onChange={handleChange}
          className={`focus:outline-none w-full placeholder:text-igy5 bg-iwhite px-4 rounded-lg ${
            placeHolderSize ? "text-sm" : "text-base"
          }`}
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

      {charLimit && (
        <div className="flex justify-end">
          {showCharCount ? (
            <span
              className="pb-2 pt-2 text-ibl1 bottom-0 right-0"
              data-testid={`char_limit`}
            >
              {charCount}/{charLimit}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default InputField;

InputField.propTypes = {
  error: PropTypes.string,
  label: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  isRequired: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  onFocus: PropTypes.func,
  isMult: PropTypes.bool,
  isMultiple: PropTypes.func,
  id: PropTypes.string,
  onBlur: PropTypes.func,
  onBlurCall: PropTypes.func,
  value: PropTypes.string,
  max_Length: PropTypes.number,
  autocomplete: PropTypes.string,
  charLimit: PropTypes.number,
  showCharCount: PropTypes.bool,
  placeHolderSize: PropTypes.bool,
  onChange: PropTypes.func,
};
