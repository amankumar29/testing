import PropTypes from "prop-types";
import styles from "./NewSearchInput.module.scss";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";

const NewSearchInput = ({
  className,
  disable,
  inputClassName,
  error,
  onIconClick = () => {},
  shadow,
  hoverEffect = false,
  border = false,
  placeHolder,
  ...props
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      onIconClick();
    }
    validate(e.target);
  };

  const handleBlur = (e) => {
    setIsFocus(false);
    if (e.target.value) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  };

  const handleClick = (e) => {
    setIsFocus(true);
    if (e.target.value) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  };
  // Validate input on change
  const validate = (input) => {
    if (/^\s/.test(input.value)) {
      input.value = "";
    }
  };
  return (
    <div>
      <div
        onClick={(e) => handleClick(e)}
        className={`flex cursor-pointer rounded-[10px] box-content group min-h-[40px] w-full ${className} ${
          styles.inputContainer
        } bg-iwhite  ${shadow && `${styles.shadow}`} ${
          !disable && "hover:border-ibl1"
        } ${disable && "pointer-events-none"}  ${
          error &&
          `border border-solid border-ird1 focus-within:border-ird1 hover:border-ird1`
        }
            ${isFocus && "!border-ibl1"}
             ${isFilled && "text-ibl1 !border-ibl1"}
          ${border && `border border-solid border-igy6`} `}
        data-testid="new_search_input"
      >
        <input
          type="text"
          disabled={disable}
          onKeyDown={onKeyDown}
          onBlur={handleBlur}
          placeholder={placeHolder}
          className={`${styles.form_input} ${inputClassName} ${
            isFocus && `!text-ibl1`
          }  ${
            !isFocus && "cursor-pointer"
          } rounded-[10px] px-3.5 pt-1 pb-[3px] outline-none tracking-[0.22px] grow`}
          {...props}
        />

        <button
          disabled={disable}
          type="button"
          onClick={() => onIconClick()}
          className={`flex flex-col justify-center text-ibl1 !font-bold pr-[19px] cursor-pointer  ${
            hoverEffect &&
            !isFocus &&
            `group-hover:text-ibl1 group-hover:transition-all group-hover:ease-in group-hover:duration-300`
          } ${isFocus && `!text-ibl1`}`}
          data-testid="search_icon_button"
        >
          <SearchIcon
            className={`text-igy6 group-hover:!text-ibl1 ${
              isFocus && `!text-ibl1`
            } ${isFilled && "!text-ibl1"}`}
          />
        </button>
      </div>
      <p
        className={`text-ird3 text-[10px] font-medium absolute`}
        data-testid="error_name"
      >
        {error ? error : ""}
      </p>
    </div>
  );
};

export default NewSearchInput;

NewSearchInput.propTypes = {
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  disable: PropTypes.bool,
  shadow: PropTypes.bool,
  error: PropTypes.string,
  onIconClick: PropTypes.func,
  hoverEffect: PropTypes.bool,
  border: PropTypes.bool,
  placeHolder: PropTypes.string,
};
