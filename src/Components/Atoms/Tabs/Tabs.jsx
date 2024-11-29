import PropTypes from "prop-types";
import { AnimateSharedLayout } from "framer-motion";
import styles from "./Tabs.module.scss";
import { useLocation, useNavigate } from "react-router-dom";

const Tabs = ({
  data = ["Tab 1", "Tab 2", "Tab 3"],
  activeTab = "test-cases",
  disabledTabs = [],
  className = "",
  tabsClassName = "",
  buttonClassName="",
  ...props
}) => {
  const navigateTo = useNavigate();
  const location = useLocation();

  return (
    <div className={`${styles.tabs} ${className}`} {...props}>
      {data.map((tab, index) => {
        return (
          <AnimateSharedLayout key={index}>
            <div
              className={`leading-[22px] ${
                styles.tab
              } font-semibold text-base ${
                data[index]?.type === activeTab
                  ? `${styles.active} ${styles.selected_bar} cursor-default`
                  : `${styles.inactive} hover:text-ibl1`
              } ${
                disabledTabs.includes(index) ? "disabled" : ""
              } ${tabsClassName}`}
            >
              <button
                data-testid={`tab_name_${tab?.tab}`}
                type="button"
                className={`font-semibold ${buttonClassName}`}
                onClick={() => navigateTo(`/projects/${tab?.type}`, {
                  state: {
                    id: location?.state?.id,
                    keyword_name: location?.state?.keyword_name,
                  },
                })}
              >
                {tab?.tab}
              </button>
            </div>
          </AnimateSharedLayout>
        );
      })}
    </div>
  );
};
Tabs.propTypes = {
  activeTab: PropTypes.number,
  className: PropTypes.string,
  data: PropTypes.array,
  disabledTabs: PropTypes.array,
  onChange: PropTypes.func,
  notificationLength: PropTypes.number,
  isNotification: PropTypes.number,
  size: PropTypes.any,
  warningIcon: PropTypes.bool,
  tabsClassName: PropTypes.string,
};
export default Tabs;
