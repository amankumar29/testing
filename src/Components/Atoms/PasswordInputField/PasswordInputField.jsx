import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PropTypes from "prop-types";
import { useState } from "react";

const PasswordInputField = ({
  error,
  label,
  placeHolder,
  isRequired,
  className,
  onFocus,
  handleKeyEnter,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

  const onKeyDown = (event) => {
    if (event.code === "Space") event.preventDefault();
    if (event.code === "Enter") {
      handleKeyEnter();
    }
  };
  return (
    <div className="relative w-full">
      <div
        className={`text-sm font-medium leading-6 w-fit ${
          (isFocused || isFilled) && "text-ibl1"
        } ${error && !isFocused && "text-ird3"} ${
          isHover && !error && "text-ibl1"
        }`}
        data-testid={`${label}_name`}
      >
        {label} {isRequired && <span className="text-ird3">*</span>}
      </div>
      <div
        className={`border flex text-ibl1 border-solid rounded-lg mt-2 focus:outline-none font-normal text-lg leading-7 placeholder:text-igy5 relative mdMax:w-full ${
          isHover && !error
            ? "border-ibl1"
            : error && !isFocused
            ? "border-ird3"
            : isFocused || isFilled
            ? "text-ibl1 border-ibl1"
            : "border-igy6 "
        } ${className}`}
        onClick={(e) => handleClick(e)}
        onBlur={(e) => handleBlur(e)}
        onFocus={onFocus}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        data-testid="password_input"
      >
        <input
          id={label}
          autoComplete={"off"}
          type={isVisible ? "text" : "password"}
          className={`focus:outline-none pr-10 w-full placeholder:text-igy5 px-4 py-2.5 rounded-lg`}
          placeholder={placeHolder}
          onKeyDown={onKeyDown}
          {...props}
        />
        <p className="cursor-pointer text-igy6 hover:text-ibl1 hover:transition-all hover:duration-300 hover:ease-in absolute right-2 top-2">
          {isVisible ? (
            <VisibilityOutlinedIcon
              onClick={() => setIsVisible(false)}
              className="text-ibl1"
            />
          ) : (
            <VisibilityOffOutlinedIcon onClick={() => setIsVisible(true)} />
          )}
        </p>
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

export default PasswordInputField;

PasswordInputField.propTypes = {
  error: PropTypes.string,
  label: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  isRequired: PropTypes.bool,
  onFocus: PropTypes.func,
  onKeyPress: PropTypes.func,
  handleKeyEnter: PropTypes.func,
};
