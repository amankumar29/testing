import { useState, useEffect, useRef } from "react";
import styles from "./MultiSelectDropdown.module.scss";
import { useOutsideClick } from "Hooks/useOutSideClick";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import textEllipsis from "../../../Helpers/TextEllipsis/TextEllipsis";
import { Checkbox } from "../../Atoms/Checkbox/Checkbox";
import PropTypes from "prop-types";

const MultiSelectDropdown = ({
  options,
  selectedOptions = [],
  onSelect,
  label,
  isEditable = true,
  className,
  placeHolder,
  isRequired,
  onBlur = () => {},
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isHover, setIsHover] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setFilteredOptions(
      options?.filter((option) =>
        option.keyword_name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, options]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      onBlur();
    }
  };

  const handleOptionClick = (option) => {
    setIsFocused(false);
    if (selectedOptions.some((o) => o.id === option.id)) {
      const data = selectedOptions.filter((o) => o.id !== option.id);
      onSelect(data);
    } else {
      onSelect([...selectedOptions, option]);
    }
  };

  const handleRemoveOption = (option) => {
    onSelect(selectedOptions.filter((i) => i.id !== option.id));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
      setSearch("");
      onBlur();
    }
  });

  return (
    <div
      className={`${styles.container} group ${
        !isEditable && "pointer-events-none"
      }`}
      ref={dropdownRef}
    >
      <div
        className={`${styles.label} ${
          (isOpen || selectedOptions.length > 0) && "text-ibl1"
        }  ${error && !isOpen && "text-ird1"} 
          ${error && !isOpen && "text-ird3"} 
          ${isOpen && error && "text-ibl1"} ${isHover && "text-ibl1"}`}
        data-testid={`${label}_name`}
      >
        {label} {isRequired && <span className="text-ird3">*</span>}
      </div>
      <div className="relative">
        <div
          onClick={toggleDropdown}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          className={`${styles.subContainer} ${className} ${
            (isOpen || selectedOptions.length > 0) && " border-ibl1"
          } 
            ${(error && !isOpen) && "border-ird1"}
            ${(error && !isFocused && isHover && !isOpen) && "border-ird3"}
            ${(isOpen && error) && "border-ibl1"} ${
            isHover && "border-ibl1"
          } `}
        >
          {selectedOptions?.length === 0 ? (
            <div className="text-igy5 text-sm" data-testid="select_test_suites">
              {placeHolder}
            </div>
          ) : (
            <div
              className={`flex w-[340px] ${
                selectedOptions?.length > 2 && `overflow-x-auto mt-[20px]`
              }  gap-2`}
            >
              {selectedOptions?.map((option) => (
                <div
                  key={option.id}
                  className={`flex justify-end gap-1 items-center bg-ibl12 rounded-md h-10 max-w-[135px] py-1 pl-2`}
                  data-testid={`${option.keyword_name}_name`}
                >
                  <div className="text-sm whitespace-nowrap">
                    {option
                      ? textEllipsis(option?.keyword_name, 12)
                      : placeHolder}
                  </div>
                  <div>
                    <CloseIcon
                      fontSize="small"
                      className="ml-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option);
                      }}
                      data-testid="close_icon"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div
            className={`${styles.iconContainer} ${
              (isOpen || selectedOptions.length > 0) && "text-ibl1"
            }`}
            data-testid="keyboard_arrow_down"
          >
            {isEditable && (
              <KeyboardArrowDownIcon
                className={`${
                  isOpen && styles.isOpenIcon
                } group-hover:text-ibl1 group-hover:transition-all group-hover:duration-300 group-hover:ease-in`}
              />
            )}
          </div>
        </div>

        {isOpen && (
          <div className={`${styles.isOpenContainer}  w-full absolute z-10`}>
            <div className={`${styles.searchContainer}`}>
              <div className="flex items-center">
                <div className={`${styles.search} mx-3`}>
                  <input
                    type="text"
                    placeholder="Search"
                    className="focus:outline-none mx-2 w-full text-sm placeholder:text-igy5"
                    autoFocus
                    value={search}
                    onChange={handleSearchChange}
                    data-testid="input_search"
                  />
                  <SearchIcon fontSize="small" data-testid="search_icon" />
                </div>
              </div>
              <hr className={`${styles.hrLine} mt-[10px]`} />
              <div className={`${styles.listContainer}`}>
                {filteredOptions.length === 0 ? (
                  <div
                    className={styles.noOptionContainer}
                    data-testid="no_record_found"
                  >
                    No Record Found
                  </div>
                ) : (
                  <ul className="max-h-60 overflow-y-auto">
                    {filteredOptions?.map((option) => (
                      <li
                        key={option.id}
                        className="p-2 hover:bg-ibl12 cursor-pointer text-sm"
                        data-testid={`${option.keyword_name}_name`}
                      >
                        <label className="flex items-center">
                          <div className="flex items-center gap-4">
                            <div className="relative ml-5">
                              <Checkbox
                                className="cursor-pointer"
                                id={option.id}
                                isHeaderCheck={true}
                                checked={selectedOptions.some(
                                  (selected) => selected?.id === option?.id
                                )}
                                onChange={() => handleOptionClick(option)}
                              />
                            </div>
                            <div className="break-words max-w-[250px]">
                              {option.keyword_name}
                            </div>
                          </div>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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

MultiSelectDropdown.propTypes = {
  options: PropTypes.array,
  selectedOptions: PropTypes.array,
  onSelect: PropTypes.func,
  label: PropTypes.string,
  className: PropTypes.string,
  isEditable: PropTypes.bool,
  error: PropTypes.string,
  placeHolder: PropTypes.string,
  isRequired: PropTypes.bool,
};

export default MultiSelectDropdown;
