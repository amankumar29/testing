import { useState } from "react";
import "./CategoryBar.style.scss";
import PropTypes from "prop-types";

const CategoryBar = ({
  toBeInvestigate,
  automationBug,
  environmentIssue,
  productBug,
  noDefect,
  total,
}) => {
  const calculatePercentage = (count) => (count / total) * 100;
  const percentages = {
    toBeInvestigate: calculatePercentage(toBeInvestigate),
    automationBug: calculatePercentage(automationBug),
    environmentIssue: calculatePercentage(environmentIssue),
    productBug: calculatePercentage(productBug),
    noDefect: calculatePercentage(noDefect),
  };

  const [showDetail, setShowDetail] = useState(false);

  const toggleDetail = () => setShowDetail(!showDetail);

  return (
    <div className="relative">
      {showDetail && (
        <div className="absolute w-[300px] bg-iwhite p-3 shadow-[0_0_4px_0_rgba(12,86,255,0.72)] rounded-lg bottom-12 z-10">
          <div className="flex h-2.5 w-full border border-solid border-[#cccccc] rounded-lg overflow-hidden">
            <div
              className="progress-bar__investigation"
              style={{ width: `${percentages.toBeInvestigate}%` }}
            ></div>
            <div
              className="progress-bar__automation"
              style={{ width: `${percentages.automationBug}%` }}
            ></div>
            <div
              className="progress-bar__environment"
              style={{ width: `${percentages.environmentIssue}%` }}
            ></div>
            <div
              className="progress-bar__productBug"
              style={{ width: `${percentages.productBug}%` }}
            ></div>
            <div
              className="progress-bar__noDefect"
              style={{ width: `${percentages.noDefect}%` }}
            ></div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {[
              {
                label: "To Be Investigate",
                count: toBeInvestigate,
                color: "#d5cdc7",
              },
              {
                label: "Automation Bug",
                count: automationBug,
                color: "#ffc33b",
              },
              {
                label: "Environment Issue",
                count: environmentIssue,
                color: "#76c6d8",
              },
              { label: "Product Bug", count: productBug, color: "#e78d47" },
              { label: "No Defect", count: noDefect, color: "#a8d5f4" },
            ].map(
              (item) =>
                item.count > 0 && (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-xs font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>{item.label}</div>
                    </div>
                    <div>{item.count}</div>
                  </div>
                )
            )}
          </div>
        </div>
      )}
      <div
        className="progress-bar"
        onMouseEnter={toggleDetail}
        onMouseLeave={toggleDetail}
        aria-label="Category progress bar"
      >
        <div
          className="progress-bar__investigation"
          style={{ width: `${percentages.toBeInvestigate}%` }}
        ></div>
        <div
          className="progress-bar__automation"
          style={{ width: `${percentages.automationBug}%` }}
        ></div>
        <div
          className="progress-bar__environment"
          style={{ width: `${percentages.environmentIssue}%` }}
        ></div>
        <div
          className="progress-bar__productBug"
          style={{ width: `${percentages.productBug}%` }}
        ></div>
        <div
          className="progress-bar__noDefect"
          style={{ width: `${percentages.noDefect}%` }}
        ></div>
      </div>
    </div>
  );
};

CategoryBar.propTypes = {
  toBeInvestigate: PropTypes.number,
  automationBug: PropTypes.number,
  environmentIssue: PropTypes.number,
  productBug: PropTypes.number,
  noDefect: PropTypes.number,
  total: PropTypes.number,
};

export default CategoryBar;
