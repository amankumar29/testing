import PropTypes from "prop-types";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import jiraImage from "../../../Assets/Images/addtojira.svg";
export const CustomButton = ({
  id,
  label,
  className,
  disable = false,
  isRunIcon = false,
  type = "button",
  isAddBtn = false,
  onClick = () => {},
  addToJira = false,
}) => {
  return (
    <>
      <button
        id={id}
        disabled={disable}
        className={`w-full md:w-[196px] h-10 rounded-[8px] gap-[10px] cursor-pointer  flex items-center justify-center font-medium transition-all ease px-3 md:px-0 button-auto ${
          !disable
            ? "bg-ibl1 hover:bg-ibl3 text-iwhite"
            : "bg-ibl2 text-iwhite pointer-events-none"
        }
          ${className}`}
        onClick={onClick}
        type={type}
        data-testid={`button_lable_${label}`}
      >
        {isRunIcon && (
          <div>
            <SlideshowOutlinedIcon
              className="!w-5 h-5"
              data-testid="run_sides_icon"
            />
          </div>
        )}
        {isAddBtn && (
          <div>
            <AddCircleOutlineIcon
              className="!w-5 h-5"
              data-testid="add_btn_icon"
            />
          </div>
        )}
        {addToJira && (
          <div>
            <img
              src={jiraImage}
              className="!w-5 h-5"
              data-testid="add_to_jira"
            />
          </div>
        )}
        <span className="pt-[2px] mdMax:text-nowrap whitespace-nowrap">{label}</span>
      </button>
    </>
  );
};

CustomButton.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  disable: PropTypes.bool,
  isAddBtn: PropTypes.bool,
  isRunIcon: PropTypes.bool,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  onClick: PropTypes.func,
  addToJira: PropTypes.bool,
};
