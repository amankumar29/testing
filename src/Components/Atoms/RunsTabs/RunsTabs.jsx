import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

const RunsTabs = ({ clearSearchValue, clearDatePicker }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (newValue) => {
    navigate(newValue);
    clearSearchValue(newValue);
    clearDatePicker(newValue);
  };

  const getTabClass = (path) =>
    location.pathname === path
      ? "font-semibold px-2 border-b-[3px] border-ibl1 text-ibl1"
      : "px-2 text-ibl2 cursor-pointer font-semibold hover:text-ibl1";

  const tabs = [
    { label: "Test Cases", path: "/runs/test-case" },
    { label: "Test Suites", path: "/runs/test-suite" },
    { label: "Test Scheduler", path: "/runs/test-scheduler" },
  ];

  return (
    <div className="flex justify-between items-center mt-4 overflow-x-auto order-2 md:order-none mdMax:w-full">
      <div className="flex items-start mb-2 gap-[15px] min-w-500">
        {tabs?.map((tab) => (
          <div key={tab?.path} className={getTabClass(tab?.path)}>
            <span
              data-testid={`tab_label_${tab?.label}`}
              className={
                location?.pathname === tab?.path
                  ? "pointer-events-none"
                  : "cursor-pointer"
              }
              onClick={() => handleChange(tab?.path)}
            >
              {tab?.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RunsTabs;

RunsTabs.propTypes = {
  clearSearchValue: PropTypes.func,
  clearDatePicker: PropTypes.func
}
