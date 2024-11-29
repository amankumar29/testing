import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useOutsideClick } from "Hooks/useOutSideClick";
import styles from "./SelectDropdown.module.scss";
import webIcon from "../../../Assets/Images/webicon.svg";
import androidIcon from "../../../Assets/Images/androidicon.svg";
import iosIcon from "../../../Assets/Images/iosicon.svg";
import apiIcon from "../../../Assets/Images/apiicon.svg";
import CloseIcon from "@mui/icons-material/Close";
import tvIcon from "../../../Assets/Images/tv.svg";
import chrome from "Assets/Images/google.svg";
import safari from "Assets/Images/safari.svg";
import firefox from "Assets/Images/firefox.svg";
import edge from "Assets/Images/edge.svg";
import telegram from "../../../Assets/Images/telegram.svg";
import teams from "../../../Assets/Images/teams.svg";
import slack from "../../../Assets/Images/slack.svg";
import browserStackLogo from "../../../Assets/Images/browserstack.webp";
import sauceLabs from "../../../Assets/Images/sauceLabs.png";

const SelectDropdown = ({
  label,
  options = [],
  placeHolder,
  onChange,
  className,
  iconForApplication = false,
  error,
  value = null,
  id,
  isRequired,
  isBackground = false,
  onBlur = () => {},
  inputClassName,
  clearSelectionCallback,
  dateRange = false,
  removeContainer = false,
  showCross = false,
  isBlock,
  apiMethodsDropdown = false,
  formDataOption = false,
  isEditable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
      onBlur();
    }
  });

  const handleSelect = (option, e) => {
    onChange(option);
    setIsOpen(false);
    if (isBlock) {
      e.stopPropagation();
    }
  };

  const handleBlur = (option, e) => {
    setIsFocused(false);
    if (option?.length > 1) {
      onChange(option);
    }
  };

  const handleDropdown = () => {
    if (isEditable) {
      setIsOpen(!isOpen);
    }
    // setIsOpen(!isOpen);
    if (isOpen) {
      onBlur();
    }
  };

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const clearSelection = () => {
    setSelectedOption(null);
    onChange(null);
    if (clearSelectionCallback) {
      clearSelectionCallback(); // Call the callback function
    }
  };

  return (
    <div
      className={`${removeContainer ? "" : styles.container} ${
        !isEditable && "pointer-events-none"
      } group`}
      ref={dropdownRef}
    >
      <div>
        <div
          className={`${styles.label} ${
            (isOpen || selectedOption) && "text-ibl1"
          } 
          ${error && !isOpen && "text-ird1"} 
          ${error && !isOpen && "text-ird3"} 
          ${isOpen && error && "text-ibl1"} ${isHover && "text-ibl1"}`}
          data-testid={`select_dropdown_label_${label}`}
        >
          {label} {isRequired && <span className="text-ird3">*</span>}
        </div>
        <div className="relative" id={id}>
          <div
            className={`${styles.subContainer} ${className} ${
              isBackground ? "bg-iwhite" : ""
            }
            ${(isOpen || selectedOption?.name) && "border-ibl1"}
            ${error && !isOpen && "border-ird1"}
            ${error && !isFocused && isHover && !isOpen && "border-ird3"}
            ${isOpen && error && "border-ibl1"} ${isHover && "border-ibl1"}`}
            onBlur={(e) => {
              handleBlur(e);
            }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={handleDropdown}
          >
            <div
              data-testid={`selected_option_${
                selectedOption ? selectedOption?.name : placeHolder
              }`}
              className={`${styles.inputText} ${inputClassName} ${
                !selectedOption ? "text-igy5" : "text-ibl1"
              } truncate ${(isOpen || selectedOption) && "text-ibl1"}`}
            >
              {selectedOption ? selectedOption?.name : placeHolder}
            </div>
            <div
              className={`${styles.iconContainer} ${isOpen && " text-ibl1"} ${
                (isOpen || selectedOption) && " text-ibl1"
              }  `}
            >
              {((selectedOption && dateRange) ||
                (selectedOption !== null && showCross)) && (
                <CloseIcon
                  fontSize="small"
                  onClick={clearSelection}
                  data-testid="closeIcon"
                  className="cursor-pointer"
                />
              )}
              {isEditable && (
                <KeyboardArrowDownIcon
                  data-testid="arrow_Icon"
                  className={`${
                    isOpen && styles.isOpenIcon
                  } group-hover:text-ibl1 group-hover:transition-all group-hover:duration-300 group-hover:ease-in`}
                />
              )}
            </div>
          </div>
          {isOpen && (
            <div
              className={`${styles.isOpenContainer} ${
                apiMethodsDropdown
                  ? "w-[128px]"
                  : formDataOption
                  ? "w-[100px] rounded-lg"
                  : "w-full"
              } absolute z-[9999]`}
            >
              <div className={`${styles.listContainer}`}>
                {options?.map((option) => {
                  return (
                    <div
                      data-testid={`option_name_${option?.name}`}
                      className={`${styles.optionContainer} ${
                        option?.id == selectedOption?.id &&
                        "bg-ibl12 cursor-default"
                      } ${iconForApplication && "flex justify-between"} `}
                      key={option?.id}
                      onClick={(e) => handleSelect(option, e)}
                    >
                      {option?.name}
                      {iconForApplication && (
                        <div className="flex items-center justify-center">
                          <img
                            data-testid={`application_Image_${option?.type}`}
                            src={
                              option?.type === "WEB"
                                ? webIcon
                                : option?.type === "ANDROID"
                                ? androidIcon
                                : option?.type === "IOS"
                                ? iosIcon
                                : option?.type === "RESTAPI"
                                ? apiIcon
                                : option.type === "TV"
                                ? tvIcon
                                : option.type === "Chrome"
                                ? chrome
                                : option.type === "Safari"
                                ? safari
                                : option.type === "Firefox"
                                ? firefox
                                : option.type === "Edge"
                                ? edge
                                : option.type === "Telegram"
                                ? telegram
                                : option.type === "Teams"
                                ? teams
                                : option.type === "browser-stack"
                                ? browserStackLogo
                                : option.type === "sauce-labs"
                                ? sauceLabs
                                : option.type === "Slack" && slack
                            }
                            className="w-6 h-6"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {error && (
            <p
              className="text-ird3 text-[10px] font-medium mt-1 absolute"
              data-testid="error_Message"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

SelectDropdown.propTypes = {
  label: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.object,
  id: PropTypes.string,
  error: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func,
  iconForApplication: PropTypes.bool,
  isRequired: PropTypes.bool,
  inputClassName: PropTypes.string,
  isBackground: PropTypes.bool,
  onBlur: PropTypes.func,
  clearSelectionCallback: PropTypes.func,
  dateRange: PropTypes.bool,
  isEditable: PropTypes.bool,
};

export default SelectDropdown;
