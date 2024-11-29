import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useOutsideClick } from "Hooks/useOutSideClick";
import styles from "./NewSelectTimeDropdown.module.scss";
import CloseIcon from "@mui/icons-material/Close";
import timeImage from "../../../Assets/Images/Time.svg";
import { CustomButton } from "../CustomButton/CustomButton";

const NewSelectTimeDropdown = ({
  label,
  placeHolder,
  onChange,
  className,
  error,
  value = "00:00", // Default value as "00:00"
  id,
  isRequired,
  isBackground = false,
  onBlurCall = () => {},
  inputClassName,
  clearSelectionCallback,
  showCross = false,
  isBlock = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(value);
  const [selectedHrs, setSelectedHrs] = useState(null);
  const [selectedMin, setSelectedMin] = useState(null);
  const [displayTime, setDisplayTime] = useState(value);
  const [isHover, setIsHover] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
      onBlurCall();
    }
  });

  const hours = Array.from({ length: 24 }, (_, i) =>
    i < 10 ? `0${i}` : `${i}`
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i < 10 ? `0${i}` : `${i}`
  );

  const handleSelectTime = (hour, minute) => {
    if (hour !== null) {
      setSelectedHrs(hour);
    }

    if (minute !== null) {
      setSelectedMin(minute);
    }

    const time = `${hour ? hour : "00"}:${minute ? minute : "00"}`;
    setSelectedTime(time);
  };

  const handleSubmitOk = (e) => {
    if (selectedHrs !== null && selectedMin !== null) {
      setIsOpen(false);
      setDisplayTime(selectedTime);
      onChange(selectedTime); // Pass the selected time as a string
      if (isBlock) {
        e.stopPropagation();
      }
    }
  };

  const handleDropdown = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      onBlurCall();
    }
  };

  useEffect(() => {
    setSelectedTime(value);
    setDisplayTime(value);
  }, [value]);

  const clearSelection = () => {
    setSelectedTime("00:00");
    setDisplayTime("00:00");
    onChange("00:00");
    if (clearSelectionCallback) {
      clearSelectionCallback();
    }
  };
  const handleBlur = () => {
    setIsFocused(false);
    onBlurCall();
  };

  return (
    <div className={`${styles.container} group`} ref={dropdownRef}>
      <div>
        <div
          className={`${styles.label} ${
            (isOpen || selectedTime) && "text-ibl1"
          } ${error && "text-ird1"} ${isHover && "text-ibl1"}`}
          data-testid={`select_dropdown_label_${label}`}
        >
          {label} {isRequired && <span className="text-ird3">*</span>}
        </div>
        <div className="relative" id={id}>
          <div
            className={`${styles.subContainer} ${className} ${
              isBackground && "bg-iwhite"
            } ${(isOpen || selectedTime) && " border-ibl1"} ${
              error && "border-ird1"
            }             ${
              error && !isFocused && isHover && !isOpen && "border-ird3"
            }
             ${isOpen && error && "border-ibl1"} ${isHover && "border-ibl1"}
 `}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onBlur={handleBlur}
            onClick={handleDropdown}
          >
            <div
              data-testid={`selected_option_${selectedTime}`}
              className={`${styles.inputText} ${inputClassName} ${
                !selectedTime ? "text-igy5" : "text-ibl1"
              } truncate ${(isOpen || selectedTime) && "text-ibl1"} !text-sm`}
            >
              {displayTime ? displayTime : placeHolder}
            </div>
            <div
              className={`${styles.iconContainer} ${isOpen && " text-ibl1"}`}
            >
              {showCross ? (
                <CloseIcon
                  fontSize="small"
                  onClick={clearSelection}
                  data-testid="closeIcon"
                  className="cursor-pointer"
                />
              ) : (
                <img src={timeImage} alt="timeClockImage" />
              )}
            </div>
          </div>

          {isOpen && (
            <div
              className={`${styles.isOpenContainer} w-[320px] absolute z-20`}
            >
              <div className={`${styles.listContainer} grid grid-cols-2`}>
                {/* Hours Column */}
                <div className="col-span-1">
                  <div className="flex justify-center items-center bg-ibl1 sticky top-0 z-10 h-[40px] text-iwhite">
                    Hours
                  </div>
                  <div className="overflow-y-auto h-[125px]">
                    {hours?.map((hour) => (
                      <div
                        key={hour}
                        className={`${styles.optionContainer} ${
                          hour === selectedTime?.split(":")[0] &&
                          "bg-ibl12 text-ibl1 font-bold"
                        }`}
                        onClick={() =>
                          handleSelectTime(hour, selectedTime?.split(":")[1])
                        }
                      >
                        {hour}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minutes Column */}
                <div className="col-span-1">
                  <div className="flex justify-center items-center bg-ibl1 sticky top-0 z-10 h-[40px] text-iwhite">
                    Minutes
                  </div>
                  <div className="overflow-y-auto h-[125px]">
                    {minutes?.map((minute) => (
                      <div
                        key={minute}
                        className={`${styles.optionContainer} ${
                          minute === selectedTime?.split(":")[1] &&
                          "bg-ibl12 text-ibl1 font-bold"
                        }`}
                        onClick={() =>
                          handleSelectTime(selectedTime?.split(":")[0], minute)
                        }
                      >
                        {minute}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center mr-2 my-2">
                <CustomButton
                  label="OK"
                  className="!w-[150px] !h-[30px]"
                  disable={selectedHrs === null || selectedMin === null}
                  onClick={(e) => {
                    handleSubmitOk(e);
                  }}
                />
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

NewSelectTimeDropdown.propTypes = {
  label: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.string, // Expecting time string like "HH:MM"
  id: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func,
  isRequired: PropTypes.bool,
  inputClassName: PropTypes.string,
  isBackground: PropTypes.bool,
  onBlurCall: PropTypes.func,
  clearSelectionCallback: PropTypes.func,
  showCross: PropTypes.bool,
};

export default NewSelectTimeDropdown;
