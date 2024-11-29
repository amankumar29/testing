import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import userDateTime from "../../../Helpers/userDateTime/userDateTime";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Tooltip } from "react-tooltip";
import textEllipsis from "../../../Helpers/TextEllipsis/TextEllipsis";
import { useGetProjectListInfoQuery } from "Services/API/apiHooks";

const ProjectDetails = ({
  onClick = () => {},
  showInfo = {},
  isModalLoading,
}) => {

  const [open, setOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [getProjectInfo, setGetProjectInfo] = useState([]);

  const { data: projectInfoData , refetch } = useGetProjectListInfoQuery(showInfo?._id);

  useEffect(() => {
    if (projectInfoData) {
      setGetProjectInfo(projectInfoData?.results);
      refetch()
    }
  }, [projectInfoData]);

  const handleClickChange = () => {
    setOpen(!open);
    setIsHidden(!isHidden);
  };

  const counts =
    showInfo?.applicationIds?.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {}) || {};

  const formattedResult = Object.entries(counts)
    .map(([type, count]) => `${type === "API" ? "REST API" : type}(${count})`)
    .join(", ");

  return (
    <div className="flex items-center justify-center w-auto h-full">
      <div className="w-full md:w-[586px] h-[472px] rounded-2xl shadow-2xl">
        {isModalLoading ? (
          <div
            className="flex justify-center items-center mt-[200px]"
            data-testid="circular_progress"
          >
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="flex flex-row bg-ibl7 w-full rounded-t-[10px] relative">
              <div className="h-[80px] flex justify-center items-center w-full">
                <div className="flex justify-start !pl-6"></div>
                <div
                  className="text-[18px] font-medium leading-7 flex justify-center items-center"
                  data-testid={`${showInfo?.name}_details`}
                >
                  {/* {showInfo?.name} Details */}
                  <>
                    <div className="text-left">
                      <div
                        data-tooltip-id="goToProfile"
                        data-tooltip-content={
                          showInfo?.name?.length > 30 ? showInfo?.name : ""
                        }
                      >
                        {textEllipsis(showInfo?.name, 30)} Details
                      </div>
                    </div>
                    <Tooltip
                      id="goToProfile"
                      place="top"
                      className="!text-[11px] max-w-[300px] break-all !text-left"
                    />
                  </>
                </div>
                <div
                  className="flex justify-end !pr-6 pl-[14px] absolute right-0"
                  data-testid="close_icon"
                >
                  <CloseIcon onClick={onClick} className="cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="flex flex-col h-[344px] overflow-y-auto gap-[8px] md:gap-[18px] my-6 mx-[22px] md:mx-[52px] min-w-[320px] mdMax:min-w-0">
              <div className="flex gap-[6px]">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-start items-center">
                    <div
                      className={`flex justify-start text-sm font-medium text-igy1`}
                      data-testid="description"
                    >
                      Description
                    </div>
                    <ArrowRightIcon
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleClickChange();
                      }}
                      className={open ? "rotate-90 text-igy1" : ""}
                      data-testid="right_icon"
                    />
                  </div>
                  {!isHidden && (
                    <div className="h-[110px] mdMax:w-full w-[478px]  border text-ibl1 pr-[76px] pl-4 py-2.5 mt-2 font-normal text-lg leading-7 rounded-lg focus:outline-none">
                      {/* <div className="flex text-left h-[80px] overflow-y-auto text-igy1 text-sm">
                        {showInfo?.description}
                      </div> */}
                      <div
                        className="flex text-left h-[80px] overflow-y-auto text-igy1 text-sm"
                        data-testid="show_info_description"
                      >
                        {showInfo?.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-[17px]">
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid="owner"
                  >
                    Owner
                  </div>
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid={`${showInfo?.name}_name`}
                  >
                    {showInfo?.userIds[0]?.firstName} {showInfo?.userIds[0]?.lastName}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid="applications"
                  >
                    Applications
                  </div>
                  <div
                    className="flex text-sm font-medium text-igy2"
                    data-testid={`${formattedResult}_results`}
                  >
                    {formattedResult}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid="number_of_users"
                  >
                    Number Of Users
                  </div>
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid={`${showInfo?.userCount}_user_count`}
                  >
                    {showInfo?.userIds?.length}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid="test_plans"
                  >
                    Number Of Test Plans
                  </div>
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid={`${showInfo?.testPlansCount}_plans_count`}
                  >
                    {getProjectInfo?.plansCount ? getProjectInfo?.plansCount : 0}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid="test_suites"
                  >
                    Number Of Test Suites
                  </div>
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid={`${showInfo?.testSuitesCount}_suites_count`}
                  >
                    {getProjectInfo?.suitesCount ? getProjectInfo?.suitesCount : 0}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid="test_cases"
                  >
                    Number Of Test Cases
                  </div>
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid={`${showInfo?.testCasesCount}_count`}
                  >
                    {getProjectInfo?.testCasesCount ? getProjectInfo?.testCasesCount : 0}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid="created_on"
                  >
                    Created On
                  </div>
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid={`${showInfo?.createdAt}_date`}
                  >
                    {userDateTime(showInfo?.createdAt)}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid="updated_on"
                  >
                    Updated On
                  </div>
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid={`${showInfo?.updatedAt}_update_date`}
                  >
                    {userDateTime(showInfo?.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;

ProjectDetails.propTypes = {
  onClick: PropTypes.func,
  showInfo: PropTypes.object,
  isModalLoading: PropTypes.bool,
};
