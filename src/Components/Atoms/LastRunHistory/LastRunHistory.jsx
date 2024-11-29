import notexecuted from "Assets/Images/notexecuted.svg";
import PassedImage from "../../../Assets/Images/Passed.svg";
import failedImage from "../../../Assets/Images/Failed.svg";
import inprogressImage from "../../../Assets/Images/In Progress.svg";
import QueuedImage from "../../../Assets/Images/Queued.svg";
import PropTypes from "prop-types";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import { calculateDuration } from "../../../Helpers/CalculateDuration/CalculateDuration";
import ConvertToLocalTimeZone from "../../../Helpers/ConvertTolocalTimeZone/ConvertToLocalTimeZone";

const LastRunHistory = ({ row }) => {
  const checkRunHistory = row?.runs || [] ;

  const reversedHistory = [...checkRunHistory];

  const renderIcons = () => {
    const icons = [];
    for (let i = 0; i < 6; i++) {
      if (reversedHistory[i]) {
        const { executionStatus, executionStartTime, executionEndTime } = reversedHistory[i];

        let imageSrc;
        switch (executionStatus) {
          case "FAILED":
            imageSrc = failedImage;
            break;
          case "PASSED":
            imageSrc = PassedImage;
            break;
          case "IN_PROGRESS":
            imageSrc = inprogressImage;
            break;
          case "QUEUED":
            imageSrc = QueuedImage;
            break;
          default:
            imageSrc = notexecuted;
        }

        if (executionStartTime) {
          const startDate = ConvertToLocalTimeZone(executionStartTime);
          const duration =
          executionStartTime && executionEndTime
              ? ` Duration:${calculateDuration(executionStartTime, executionEndTime)}`
              : "";
          const title = `${startDate}${duration}`;

          icons.push(
            <div key={i} className="w-6 h-6">
              <CustomTooltip
                title={title}
                placement="bottom"
                offset={[0, -10]}
                height={"40px"}
                fontSize="11px"
              >
                <img
                  src={imageSrc}
                  className="w-[24px] h-[24px]"
                  data-testid={`${i}_image_name`}
                />
              </CustomTooltip>
            </div>
          );
        } else {
          icons.push(
            <div key={i} className="w-[24px] h-[24px]">
              <CustomTooltip
                title="Queued"
                placement="bottom"
                offset={[0, -10]}
                height={"28px"}
                fontSize="11px"
              >
                <img
                  src={imageSrc}
                  className="w-6 h-6"
                  data-testid={`${i}_image_name`}
                />
              </CustomTooltip>
            </div>
          );
        }
      } else {
        icons.push(
          <div key={i} className="w-[24px] h-[24px]">
            <CustomTooltip
              title="Not Executed"
              placement="bottom"
              offset={[0, -10]}
              height={"28px"}
              fontSize="11px"
            >
              <img
                src={notexecuted}
                className="w-[24px] h-[24px]"
                data-testid={`${i}_image_name`}
              />
            </CustomTooltip>
          </div>
        );
      }
    }
    return icons;
  };
  return (
    <div className={`flex justify-center items-center gap-1`} onClick={(e) => e.stopPropagation()}>
      {renderIcons()}
    </div>
  );
};

export default LastRunHistory;

LastRunHistory.propTypes = {
  row: PropTypes.array,
};
