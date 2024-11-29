import FaAngleDown from "Assets/Images/expand_more.svg";
import PropTypes from "prop-types";
import NewSearchInput from "../NewSearchInput/NewSearchInput";
import { useOutsideClick } from "Hooks/useOutSideClick";
import { useRef } from "react";

const DropDownWithSearch = ({
  list,
  label,
  selectedOptions,
  onClick = () => {},
  open,
  setOpen,
  isMultiple = () => {},
  isMult = false,
  dropdownClassName,
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
      {/* <div className="text-sm left-5 text-ibl5 font-medium leading-5">
        {label}
      </div> */}
      <div className={`flex flex-col ${dropdownClassName}`}>
        <div
          ref={dropDownRef}
          className="border border-ibl1  rounded-[8px] cursor-pointer w-[320px] h-[52px] flex justify-between items-center bg-white p-4"
          onClick={toggleDropdown}
          data-testid="dropdown_search"
        >
          <span>
            <span className="text-sm font-medium text-igy1">
              {open ? "Select Application" : null}
            </span>
            <span className="text-sm font-normal text-ibl1">
              {open ? null : selectedOptions?.name}
            </span>
          </span>

          <span>
            <img
              src={FaAngleDown}
              alt=""
              className={open ? "rotate-180" : ""}
            />
          </span>
        </div>
        {open && (
          <div className="flex flex-col">
            <div className="cursor-pointer w-[320px] rounded-[8px] mt-1 border border-ibl12 bg-iwhite">
              <div className="flex justify-center">
                <NewSearchInput
                  placeHolder="Search"
                  className="w-[288px] h-8 mx-4 my-2 rounded-[8px] outline-none"
                  border={true}
                />
              </div>
              {list.map((option, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center cursor-pointer p-3 hover:bg-ibl12 ${
                    index === 0 && "rounded-t-[7px]"
                  } ${index === 3 && "rounded-b-[7px]"} `}
                  onClick={() => onClick(option)}
                  data-testid={`${index}_name_option`}
                >
                  <span>{option.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DropDownWithSearch;

DropDownWithSearch.propTypes = {
  list: PropTypes.array,
  label: PropTypes.string,
  isMultiple: PropTypes.func,
  isMult: PropTypes.bool,
  onClick: PropTypes.func,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};
