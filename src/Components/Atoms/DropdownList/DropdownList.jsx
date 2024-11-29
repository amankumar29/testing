import PropTypes from "prop-types";
import { useOutsideClick } from "Hooks/useOutSideClick";
import { useRef } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import styles from "./DropdownList.module.scss";

const DropDownList = ({
  list,
  label,
  selectedOptions = { name: "Select type" },
  onClick = () => {},
  open,
  setOpen,
  isMultiple = () => {},
  isMult = false,
  isRequired,
  onChange,
}) => {
  const dropDownRef = useRef(null);

  const toggleDropdown = () => {
    setOpen(!open);
    if (isMult) {
      isMultiple();
    }
  };

  useOutsideClick(dropDownRef, () => {
    if (open) {
      setOpen(false);
    }
  });

  return (
    <>
      <div
        className={`text-sm left-5 ${
          selectedOptions.name !== "Select type" && "text-ibl1"
        } font-medium leading-5`}
        data-testid={`labelname_${label}`}
      >
        {label} {isRequired && <span className="text-ird3">*</span>}
      </div>
      <div ref={dropDownRef} className="relative">
        <div
          className={`group border mt-3 rounded-[8px] cursor-pointer w-[204px] h-[52px] flex justify-between items-center bg-white p-4 
            ${
              open || selectedOptions.name !== "Select type"
                ? "border-ibl1"
                : "border-igy6"
            } 
            hover:border-ibl1`}
          onClick={toggleDropdown}
          onChange={onChange}
          data-testid="dropdown_name"
        >
          <span>
            <span
              className={`!text-[18px] truncate 
                ${
                  selectedOptions.name !== "Select type"
                    ? "text-ibl1"
                    : "text-igy5"
                } 
                ${
                  (open || selectedOptions.name !== "Select type") &&
                  "text-ibl1"
                }`}
            >
              {open && selectedOptions.name === "Select type"
                ? "Select type"
                : selectedOptions.name}
            </span>
          </span>
          <span>
            <KeyboardArrowDownIcon
              className={`${open && styles.isOpenIcon} ${
                open || selectedOptions.name !== "Select type"
                  ? "text-ibl1"
                  : "text-igy6"
              } group-hover:text-ibl1 group-hover:transition-all group-hover:duration-300 group-hover:ease-in`}
            />
          </span>
        </div>
        {open && (
          <div className="cursor-pointer w-[204px] rounded-lg mt-1 border border-ibl12 bg-iwhite absolute z-[9999]">
            {list.map((option, index) => (
              <div
                key={index}
                className={`flex justify-between items-center cursor-pointer p-3 hover:bg-ibl12 
                  ${index === 0 ? "rounded-t-[7px]" : ""}
                  ${index === list.length - 1 ? "rounded-b-[7px]" : ""}`}
                onClick={() => onClick(option)}
                data-testid={`${index}_option_name`}
              >
                <span>{option.name}</span>
                <span>
                  <img src={option.img} alt={option.name} className="w-6 h-6" />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

DropDownList.propTypes = {
  list: PropTypes.array,
  label: PropTypes.string,
  selectedOptions: PropTypes.object,
  isMultiple: PropTypes.func,
  onChange: PropTypes.func,
  isMult: PropTypes.bool,
  onClick: PropTypes.func,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  isRequired: PropTypes.bool,
};

export default DropDownList;
