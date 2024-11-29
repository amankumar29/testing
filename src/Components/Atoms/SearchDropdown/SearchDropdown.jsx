import { useRef, useState } from "react";
import styles from "./SearchDropdown.module.scss";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import { useOutsideClick } from "Hooks/useOutSideClick";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import webIcon from "../../../Assets/Images/webicon.svg";
import andriodIcon from "../../../Assets/Images/androidicon.svg";
import iosIcon from "../../../Assets/Images/iosicon.svg";
import apiIcon from "../../../Assets/Images/apiicon.svg";
import tvIcon from "../../../Assets/Images/tv.svg";
import { formatString } from "Helpers/ConvertString/ConvertToLowerCase";

const SearchDropdown = ({
  id,
  label,
  option = [],
  placeHolder,
  onSelect,
  selectedOption = null,
  className,
  onPlusClick,
  hideCross = false,
  isPlusRequired = false,
  iconForApplication = false,
  isEditable = true,
  isRequired,
  onBlur = () => {},
  error,
  isBlock = false,
  isStepsMethod = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [emojiError, setEmojiError] = useState("");
  const [isHover, setIsHover] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Filter the list based on the search query
  const filteredOptions = option?.filter((list) =>
    list?.keyword_name?.toLowerCase()?.includes(searchQuery.toLowerCase())
  );

  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
      setSearchQuery("");
      onBlur();
    }
  });

  const handleSelect = (option, e) => {
    setIsFocused(false);
    onSelect(option);
    setIsOpen(false);
    setSearchQuery("");
    if (isBlock) {
      e.stopPropagation();
    }
  };

  const handlePlusClick = () => {
    onPlusClick();
    setIsOpen(false);
  };

  const handleDropdown = () => {
    if (isEditable) {
      setIsOpen(!isOpen);
      // Clear emoji error when opening or closing the dropdown
      if (!isOpen) {
        setEmojiError("");
        setSearchQuery("");
      }
    }
    if (isOpen) {
      onBlur();
    }
  };

  const noEmojiValidation = (value) => {
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    return emojiRegex.test(value);
  };

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    setSearchQuery(value);
    if (noEmojiValidation(value)) {
      setEmojiError("Emojis are not allowed.");
    } else {
      setEmojiError("");
    }
  };

  return (
    <div
      className={`${styles.container} group ${
        !isEditable && "pointer-events-none"
      } mb-3 lg:mb-0 2`}
    >
      <div
        className={`${styles.label} ${
          (isOpen || selectedOption) && "text-ibl1"
        } ${error && !isOpen && "text-ird1"} 
        ${error && !isOpen && "text-ird3"} 
        ${isOpen && error && "text-ibl1"} ${isHover && "text-ibl1"} `}
        data-testid={`${id}_${formatString(label)}`}
      >
        {label} {isRequired && <span className="text-ird3">*</span>}
      </div>
      <div className="relative" ref={dropdownRef}>
        <div
          className={`${styles.subContainer} ${className} ${
            (isOpen || selectedOption) && " border-ibl1"
          }  ${(isOpen || selectedOption) && "border-ibl1"}
            ${error && !isOpen && "border-ird1"}
            ${error && !isFocused && isHover && !isOpen && "border-ird3"}
            ${isOpen && error && "border-ibl1"} ${isHover && "border-ibl1"}`}
          onClick={handleDropdown}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <div
            data-testid={`${id}_${formatString(selectedOption?.keyword_name)}`}
            className={`${styles.inputText} ${
              !selectedOption ? "text-igy5" : "text-ibl1"
            } truncate ${(isOpen || selectedOption) && " text-ibl1"}`}
          >
            {selectedOption ? selectedOption?.keyword_name : placeHolder}
          </div>
          <div
            className={`${styles.iconContainer} ${
              (isOpen || selectedOption) && " text-ibl1"
            }`}
          >
            {" "}
            {!hideCross && selectedOption && isEditable && (
              <CloseIcon
                fontSize="small"
                onClick={() => handleSelect(null)}
                data-testid={`${id}_close_icon`}
                className="cursor-pointer"
              />
            )}
            {isEditable && (
              <KeyboardArrowDownIcon
                data-testid={`${id}_arrow_icon`}
                className={`${
                  isOpen && styles.isOpenIcon
                } group-hover:text-ibl1 group-hover:transition-all group-hover:duration-300 group-hover:ease-in`}
              />
            )}
          </div>
        </div>
        {isOpen && (
          <div className={`${styles.isOpenContainer} w-full absolute z-[9999]`}>
            <div
              className={` ${
                isPlusRequired
                  ? "flex items-center py-2 px-3 justify-between gap-3"
                  : styles.searchContainer
              }`}
            >
              <div className={`${styles.search}`}>
                <input
                  type="text"
                  placeholder="Search"
                  className={`focus:outline-none mx-2 w-full text-sm placeholder:text-igy5`}
                  autoFocus
                  value={searchQuery}
                  onChange={handleInputChange}
                  data-testid={`${id}_search_input_${searchQuery}`}
                />
                <SearchIcon fontSize="small" data-testid="search_Icon" />
              </div>
              {isPlusRequired && (
                <div className="cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
                  <AddCircleOutlineRoundedIcon onClick={handlePlusClick} />
                </div>
              )}
            </div>
            {emojiError && (
              <p
                className="text-ird3 text-[10px] font-medium mt-1 pl-4 pb-3"
                data-testid="emoji_error"
              >
                {emojiError}
              </p>
            )}
            <hr className={`${styles.hrLine}`} />
            <div className={`${styles.listContainer}`}>
              {filteredOptions?.length === 0 ? (
                <div
                  className={`${styles.noOptionContainer}`}
                  data-testid="no_records_text"
                >
                  No Record Found
                </div>
              ) : (
                filteredOptions?.map((option) => {
                  return (
                    <div
                      className={`${styles.optionContainer} ${
                        (isStepsMethod
                          ? option?._id === selectedOption?._id
                          : option?.id === selectedOption?.id) &&
                        "bg-ibl12 cursor-default"
                      } ${iconForApplication && "flex justify-between"} `}
                      key={isStepsMethod ? option?._id : option?.id}
                      onClick={(e) => handleSelect(option, e)}
                      data-testid={`${id}_option_name_${option?.keyword_name?.toLowerCase()}`}
                    >
                      <span className={`${iconForApplication && "w-[85%]"}`}>
                        {option?.keyword_name}
                      </span>

                      {iconForApplication && (
                        <div className="flex items-center justify-center">
                          <img
                            alt=""
                            data-testid={`${id}_application_type_images`}
                            className="w-6 h-6"
                            src={
                              option?.type === "WEB"
                                ? webIcon
                                : option?.type === "ANDROID"
                                ? andriodIcon
                                : option?.type === "IOS"
                                ? iosIcon
                                : option?.type === "RESTAPI"
                                ? apiIcon
                                : option?.type === "TV" && tvIcon
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        {error && (
          <p
            className="text-ird3 text-[10px] font-medium mt-1 absolute"
            data-testid="error_name"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchDropdown;

SearchDropdown.propTypes = {
  label: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  selectedOption: PropTypes.object,
  option: PropTypes.array,
  onSelect: PropTypes.func,
  onPlusClick: PropTypes.func,
  hideCross: PropTypes.bool,
  isPlusRequired: PropTypes.bool,
  iconForApplication: PropTypes.bool,
  isEditable: PropTypes.bool,
  isRequired: PropTypes.bool,
};
