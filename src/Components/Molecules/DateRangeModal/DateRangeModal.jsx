import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal } from "../../Atoms/Modal/Modal";
import "./DateRangeModal.style.scss";

export function DateRangeModal({ isOpen = false, onClose = () => {} }) {
  const [localStartDate, setLocalStartDate] = useState(null);
  const [localEndDate, setLocalEndDate] = useState(null);

  const onChange = (dates) => {
    const [start, end] = dates;
    console.log(start);
    setLocalStartDate(start);
    setLocalEndDate(end);
    if (start && end) {
      setTimeout(() => {
        onClose(start, end);
        setLocalStartDate(null);
        setLocalEndDate(null);
      }, 500);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={`p-6`}>
        <div className="flex justify-end">
          <CloseIcon
            onClick={onClose}
            data-testid="close_Icon"
            className="hover:cursor-pointer"
          />
        </div>
        <DatePicker
          selected={new Date()}
          onChange={onChange}
          startDate={localStartDate}
          endDate={localEndDate}
          formatWeekDay={(nameOfDay) => `${nameOfDay}`.substring(0, 1)}
          selectsRange
          inline
          monthsShown={2}
          maxDate={new Date()}
          disabledKeyboardNavigation
        />
      </div>
    </Modal>
  );
}
