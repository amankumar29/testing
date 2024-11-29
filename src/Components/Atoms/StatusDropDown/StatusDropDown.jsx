import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useOutsideClick } from "Hooks/useOutSideClick";
import PropTypes from "prop-types";
import { useRef } from "react";
import styles from "./StatusDropDown.module.scss";

const TestStatusDropDown = ({ options, data, isOpen, toggleDropdown, statusDropdownAPi, className, selectedStatus }) => {
  const uniqueId = data?._id;
  const dropDownRef = useRef(null);
  useOutsideClick(dropDownRef, () => {
    if (isOpen) {
      toggleDropdown();
    }
  });

  const handleOptionClick = (option, e) => {
    e?.stopPropagation();
    if(option === selectedStatus?.[uniqueId]?.status){
      return;  
    }
    statusDropdownAPi(option, uniqueId);
    toggleDropdown(); // Close the dropdown when an option is selected
  };

  const getStyles = (option) => {
    let backgroundColor, textColor;
    switch (option) {
      case "ACTIVE":
        backgroundColor = "bg-ign5";
        textColor = "text-ign1";
        break;
      case "DRAFT":
        backgroundColor = "bg-ibl10";
        textColor = "text-ibl11";
        break;
      case "BLOCKED":
        backgroundColor = "bg-ird4";
        textColor = "text-ird2";
        break;
      case "OBSOLETE":
        backgroundColor = "bg-ior2";
        textColor = "text-ior3";
        break;
      default:
        backgroundColor = "bg-gray-200";
        textColor = "text-gray-800";
    }
    return `${backgroundColor} ${textColor}`;
  };

  const capitalizeFirstLetter = (string) => {
    return string?.charAt(0)?.toUpperCase() + string?.slice(1)?.toLowerCase();
  }

  return (
    <div className="relative" ref={dropDownRef}>
      <div className={`ml-[30px] ${className}`}>
        <div
          className={`rounded-[8px] p-2 cursor-pointer flex justify-between items-center w-[128px] h-[32px] z-0 ${getStyles(
            data?.status
          )}`}
          onClick={(e) => {
            e?.stopPropagation(); // Prevent row click event
            toggleDropdown();
          }}
          data-testid={`selected_option_${data?.status}`}
        >
          <span className="text-sm font-medium">{capitalizeFirstLetter(data?.status)}</span>
          <KeyboardArrowDownIcon
            className={isOpen && "rotate-180"}
            data-testid="arrow_Icon"
          />
        </div>
        {isOpen && (
          <div
            className={`w-[128px] h-[128px] bg-iwhite rounded-[8px] absolute z-50 ${styles.dropdownShadow}`}
          >
            {options?.map((option, index) => (
              <div
                data-testid={`option_name_${option}`}
                key={index}
                className={`pl-3 pt-[5px] text-igy4 font-normal text-sm h-[32px] hover:bg-ibl12 ${data?.status === option?.value ? 'bg-ibl12 !cursor-default' : '' } ${
                  index === 0
                    ? "rounded-t-[8px]"
                    : index === options?.length - 1 && "rounded-b-[8px]"
                } ${selectedStatus?.[uniqueId]?.status === option?.value ? '!cursor-default' : 'cursor-pointer'}`}
                onClick={(e) => {
                  e?.stopPropagation();
                  if(data?.status !== option?.value){
                    handleOptionClick(option?.value, e)
                  }
                }}
              >
                {option?.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

TestStatusDropDown.propTypes = {
  options: PropTypes.any,
  data: PropTypes.any,
  statusDropdownAPi: PropTypes.func,
  className: PropTypes.string,
};

export default TestStatusDropDown;
