import styles from "./ProjectStepper.module.scss";
import PropTypes from "prop-types";
import CheckIcon from "@mui/icons-material/Check";

const ProjectStepper = ({
  isActive = false,
  isCompleted = false,
  label,
  onLabelClick = () => {},
  isDisabled = false,
  stepNo,
}) => {
  return (
    <div className={styles.business_step}>
      <div
        className={`${styles.bullet} ${isActive && styles.bullet_active} ${
          isCompleted && styles.bullet_completed
        }`}
      >
        {isCompleted ? <CheckIcon /> : stepNo}
      </div>
      <div
        className={`mx-4 ${styles.vertical} ${
          isCompleted ? "bg-ibl1" : "bg-ibl2"
        }`}
      />
      <h6
        className={`text-[16px] font-semibold  ${
          isActive ? " text-ibl3" : isCompleted ? "text-ibl1" : "text-ibl2"
        }
      ${
        isCompleted && !isDisabled && !isActive
          ? "hover:text-ibl1 cursor-pointer"
          : "pointer-events-none "
      } transition-all duration-300 ease-out whitespace-nowrap`}
        onClick={onLabelClick}
      >
        {label}
      </h6>
    </div>
  );
};

export default ProjectStepper;

ProjectStepper.propTypes = {
  isActive: PropTypes.bool,
  isCompleted: PropTypes.bool,
  label: PropTypes.string,
  onLabelClick: PropTypes.func,
  isDisabled: PropTypes.bool,
  stepNo: PropTypes.number,
};
