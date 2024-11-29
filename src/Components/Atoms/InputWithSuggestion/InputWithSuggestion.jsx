import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "./InputWithSuggestion.module.scss";
import { useOutsideClick } from "Hooks/useOutSideClick";
import SearchIcon from "@mui/icons-material/Search";
import { formatString } from "Helpers/ConvertString/ConvertToLowerCase";

const InputWithSuggestion = ({
  error,
  label,
  placeHolder,
  type,
  id,
  className,
  value,
  isEditable = false,
  onBlur = () => {},
  onOptionSelect = () => {},
  onInputValueChange = () => {},
  outputValues,
  // preText = "out_",
  ...props
}) => {
  const dropdownRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [suggestionModal, setSuggestionModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [finalOutPutValues, setFinalOutPutValues] = useState(outputValues);

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

  const handleOptionSelect = (option) => {
    setSuggestionModal(false);
    onOptionSelect(option);
    setSearchValue("");
  };

  const handleChange = (e) => {
    onInputValueChange(e);
  };

  const handleFilter = () => {
    const filteredValues = outputValues?.filter((item) =>
      item?.keyword_name?.includes(searchValue)
    );
    setFinalOutPutValues(filteredValues);
  };

  useEffect(() => {
    setFinalOutPutValues(outputValues);
  }, [outputValues]);

  useEffect(() => {
    handleFilter();
  }, [searchValue]);

  useEffect(() => {
    if (value?.keyword_name) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  }, [value]);

  useOutsideClick(dropdownRef, () => {
    if (suggestionModal) {
      setSuggestionModal(false);
      onBlur();
      setSearchValue("");
    }
  });

  return (
    <div className="flex flex-col">
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
      <div className="relative" ref={dropdownRef}>
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
            value={value ? value?.keyword_name : ""}
            className={`focus:outline-none w-full placeholder:text-igy5`}
            placeholder={placeHolder}
            onChange={(e) => {
              handleChange(e);
            }}
            onFocus={(e) => {
              setSuggestionModal(true);
            }}
            {...props}
          />
        </div>
        <div
          className={`${styles.isOpenContainer} absolute w-full top-[54px] z-10`}
        >
          {suggestionModal && isEditable && outputValues?.length > 0 && (
            <div>
              <div className={styles.searchContainer}>
                <div className={`${styles.search}`}>
                  <input
                    type="text"
                    placeholder="Search"
                    className={`focus:outline-none mx-2 w-full text-sm placeholder:text-igy5`}
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                    data-testid={`${id}_search_input_${searchValue}`}
                  />
                  <SearchIcon fontSize="small" data-testid="search_Icon" />
                </div>
              </div>
              <hr className={`${styles.hrLine}`} />

              {finalOutPutValues?.length === 0 ? (
                <div
                  className={`${styles.noOptionContainer}`}
                  data-testid="no_records_text"
                >
                  No Record Found
                </div>
              ) : (
                <div>
                  {finalOutPutValues?.map((option) => (
                    <div>
                      <p
                        className={`${styles.optionContainer} ${
                          option?.keyword_name == value?.keyword_name &&
                          "bg-ibl12 pointer-events-none"
                        }`}
                        onClick={() => {
                          handleOptionSelect(option);
                        }}
                      >
                        <span>{option?.keyword_name}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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

export default InputWithSuggestion;

InputWithSuggestion.propTypes = {
  error: PropTypes.string,
  label: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string,
  value: PropTypes.object,
  isEditable: PropTypes.bool,
  onBlur: PropTypes.func,
  onOptionSelect: PropTypes.func,
  onInputValueChange: PropTypes.func,
  outputValues: PropTypes.array,
  preText: PropTypes.string,
};
