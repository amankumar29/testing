import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";
import { useState } from "react";

const SearchInput = ({
  error,
  placeHolder,
  className,
  onIconClick = () => {},
  autoFocusProp,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isHover, setIsHover] = useState(false);

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

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      onIconClick();
    }
  };

  return (
    <div className="relative">
      <div
        className={`border flex h-10 text-ibl1 group border-solid rounded-lg pl-4 pr-2 font-normal text-sm leading-5 bg-iwhite ${
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
      >
        <input
          autoFocus={autoFocusProp}
          data-testid={`search_value`}
          id={placeHolder}
          autoComplete="off"
          type={"text"}
          onKeyDown={onKeyDown}
          className={`focus:outline-none pr-2 w-full placeholder:text-igy5`}
          placeholder={placeHolder}
          {...props}
        />
        <SearchIcon
          onClick={onIconClick}
          data-testid="search_Icon"
          className={`group-hover:!text-ibl1 cursor-pointer  my-auto ${
            isFocused || isFilled ? "text-ibl1" : "text-igy5"
          }`}
        />
      </div>
      {error && (
        <p
          className="text-ird3 text-[10px] font-medium mt-0.5 absolute"
          data-testid="error_message"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchInput;
SearchInput.propTypes = {
  error: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  onKeyPress: PropTypes.func,
  onIconClick: PropTypes.func,
  autoFocusProp: PropTypes.bool,
};
