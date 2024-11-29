import styles from "./DownLoadDropDown.module.scss";
import PropTypes from "prop-types";

const DownLoadDropDown = ({ options, onChange }) => {
  const handleSelect = (option) => {
    onChange(option);
  };

  return (
    <>
      <div className="relative">
        <div
          className={`absolute top-5 right-0 bg-iwhite rounded-[8px] w-[204px] h-[96px] z-[999] ${styles.shadow}`}
        >
          <div className="flex flex-col">
            {options?.map((each, index) => (
              <div
                onClick={() => handleSelect(each)}
                key={index}
                className={`py-3 pl-2 text-base font-medium text-igy1 hover:bg-ibl12 cursor-pointer ${
                  index === 0
                    ? "hover:rounded-t-[8px]"
                    : "hover:rounded-b-[8px]"
                }`}
                data-testid={`${index}_label`}
              >
                {each?.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DownLoadDropDown;

DownLoadDropDown.propTypes = {
  options: PropTypes.any,
  onMouseLeave: PropTypes.any,
  onChange: PropTypes.func,
};
