import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

const TextArea = ({
  error,
  placeHolder,
  className,
  label,
  name,
  id,
  charLimit,
  showCharCount = true,
  value,
  labelClassName,
  errorClassName = "",
  onBlur = () => {},
  showArrowIcon = false,
  isFilledValue,
  placeHolderSize,
  emailPadding = false,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isHidden, setIsHidden] = useState(true);
  const [open, setOpen] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (e.target.value) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
    onBlur();
  };

  const handleChange = (e) => {
    const msgLength = e.target.value.length;
    if (msgLength > charLimit) return;
    setCharCount(msgLength);
    const { onChange } = rest;
    if (typeof onChange === "function") {
      onChange(e);
    }
  };

  const handleClickChange = () => {
    setIsFocused(true);
    setIsHidden(!isHidden);
    setOpen(!open);
  };

  useEffect(() => {
    setCharCount(value?.length);
    setIsFilled(!!value);
  }, [value]);

  return (
    <>
      <div className="relative flex flex-col w-full md:w-fit">
        <div className="flex gap-1 items-center cursor-pointer">
          <label
            htmlFor="message"
            className={`text-ibl1 text-sm font-medium ${
              !isHidden  || isFilledValue ? "text-ibl1" : "text-igy1"
            } ${labelClassName} ${(isFocused || isFilled) && "text-ibl1"} ${
              error && !isFocused && "text-ird3"
            } ${isHover && !error && "text-ibl1"}`}
            data-testid={`label_name_${label}`}
          >
            {label}
          </label>
          {
            showArrowIcon && (
              <div onClick={handleClickChange}>
              <ArrowRightIcon
                className={open ? "rotate-90 text-ibl1" : ""}
                data-testid={`arrow_Image`}
              />
            </div>
            )
          }
        </div>
        {(!isHidden || !showArrowIcon) && (
          <textarea
            {...rest}
            className={`border text-ibl1 ${emailPadding ? 'pr-4' : 'pr-[76px]' }  pl-4 py-2.5 mt-2 font-normal ${placeHolderSize ? 'text-sm' : 'text-lg'} leading-7 rounded-lg focus:outline-none placeholder:text-igy5 ${className}  ${
              isHover && !error
                ? "border-ibl1"
                : error && !isFocused
                ? "border-ird3"
                : isFocused || isFilled
                ? "text-ibl1 border-ibl1"
                : "border-igy6"
            } `}
            name={name}
            id={id}
            value={value}
            onFocus={handleFocus}
            placeholder={placeHolder}
            onBlur={(e) => handleBlur(e)}
            onChange={handleChange}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            data-testid={`textarea_value_${value}`}
          ></textarea>
        )}
        {charLimit && (
          <div className="flex justify-between">
            {showCharCount && (!showArrowIcon || !isHidden) ? (
              <span
                className="absolute pb-2 pr-2 text-ibl1 bottom-0 right-0"
                data-testid={`char_limit`}
              >
                {charCount}/{charLimit}
              </span>
            ) : null}
          </div>
        )}
        {error && (!showArrowIcon || !isHidden) && (
          <span
            data-testid={`error_Message`}
            className={`text-ird3 text-[10px] font-medium -bottom-3.5 absolute ${errorClassName} `}
          >
            {error}
          </span>
        )}
      </div>
    </>
  );
};

export default TextArea;

TextArea.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  placeHolder: PropTypes.string,
  labelClassName: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  charLimit: PropTypes.number,
  showCharCount: PropTypes.bool,
  errorClassName: PropTypes.string,
  onBlur: PropTypes.func,
  showArrowIcon: PropTypes.bool,
  isFilledValue: PropTypes.bool
};
