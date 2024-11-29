import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
// import userDateTime from "../../../Helpers/userDateTime/userDateTime";
import { CircularProgress } from "@mui/material";
import userDateTime from "../../../Helpers/userDateTime/userDateTime";
import textEllipsis from "../../../Helpers/TextEllipsis/TextEllipsis";
import { Tooltip } from "react-tooltip";

const TestPlanInfoModal = ({
  onClick = () => {},
  testPlanLoading,
  testPlanInfo,
  testSuitInfo,
  paramType
}) => {
  return (
    <div className="flex items-center justify-center w-auto h-full">
      <div className="w-[611px] h-[302px] rounded-2xl shadow-2xl">
        {testPlanLoading ? (
          <div
            className="flex justify-center items-center mt-[250px]"
            data-testid="circular_progress"
          >
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="flex flex-row  bg-ibl7 w-full rounded-t-[10px]">
              <div className="h-[80px] flex justify-center items-center">
                <div className="flex justify-start pl-6"></div>
                <div className="text-[18px] font-medium leading-7 flex justify-center items-center w-[523px]">
                  {/* {testPlanInfo.test_plan_name} Details */}
                  <>
                    <div className="text-left cursor-pointer">
                      <div
                        data-tooltip-id="planHeading"
                        data-tooltip-content={
                          testPlanInfo?.test_plan_name?.length > 30
                            ? testPlanInfo?.test_plan_name
                            : ""
                        }
                      >
                        { paramType === 'test-suites' ? `${textEllipsis(testSuitInfo?.name, 30)} Details` : `${textEllipsis(testPlanInfo?.test_plan_name, 30)} Details`} 
                      </div>
                    </div>
                    <Tooltip
                      id="planHeading"
                      place="top"
                      className="!text-[11px] max-w-[300px] break-all !text-left"
                    />
                  </>
                </div>
                <div
                  className="flex justify-end !pr-6 pl-[14px]"
                  data-testid="close_icon"
                >
                  <CloseIcon onClick={onClick} className="cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="flex flex-col h-[320px] overflow-y-auto gap-4 mt-6 mx-8">
              <div className="flex flex-col gap-[17px]">
                <div className="flex justify-between">
                  <div className="text-sm font-medium leading-5 text-igy2">
                    { paramType === 'test-suites' ? 'Test Suite Name' : 'Test Plan Name' }
                  </div>
                  <div className="text-igy2 text-[16px] font-normal">
                    {/* {testPlanInfo?.test_plan_name} */}
                    <>
                      <div className="text-left cursor-pointer">
                        <div
                          data-tooltip-id="planHeading"
                          data-tooltip-content={
                            testPlanInfo?.test_plan_name?.length > 30
                              ? testPlanInfo?.test_plan_name
                              : ""
                          }
                        >
                          {paramType === 'test-suites' ? textEllipsis(testSuitInfo?.name, 30) : textEllipsis(testPlanInfo?.test_plan_name, 30)}
                        </div>
                      </div>
                      <Tooltip
                        id="planHeading"
                        place="top"
                        className="!text-[11px] max-w-[300px] break-all !text-left"
                      />
                    </>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium leading-5 text-igy2"
                    data-testid="owner"
                  >
                    Owner
                  </div>
                  <div className="text-igy2 text-[16px] font-normal">
                    {paramType === 'test-suites' ? `${testSuitInfo?.createdBy?.firstName} ${testSuitInfo?.createdBy?.lastName}`: testPlanInfo?.owner}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium leading-5 text-igy2"
                    data-testid="created_on"
                  >
                    Created On
                  </div>
                  <div className="text-igy2 text-[16px] font-normal">
                    {paramType === 'test-suites' ? userDateTime(testSuitInfo?.createdAt) : userDateTime(testPlanInfo?.createdAt)}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium leading-5 text-igy2"
                    data-testid="updated_on"
                  >
                    Updated On
                  </div>
                  <div className="text-igy2 text-[16px] font-normal">
                    { paramType === 'test-suites' ? userDateTime(testSuitInfo?.updatedAt) : userDateTime(testPlanInfo?.updatedAt)}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div
                    className="text-sm font-medium text-igy2"
                    data-testid="number_of_steps"
                  >
                    {
                      paramType === 'test-suites' ? 'Number Of Test Cases' : 'Number Of Test Suites'
                    }
                    
                  </div>
                  <div
                    className="text-sm font-medium text-igy2"
                    // data-testid={`${testCaseInfo?.total_steps}_steps`}
                  >
                    {  paramType === 'test-suites' ? testSuitInfo?.testCases?.length  : testPlanInfo?.total_test_suites}
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

TestPlanInfoModal.propTypes = {
  onClick: PropTypes.func,
  testCaseInfo: PropTypes.object, // Ensure testCaseInfo is an object
  testPlanLoading: PropTypes.bool,
  testSuitInfo: PropTypes.any,
  testPlanInfo: PropTypes.any,
  paramType: PropTypes.string
};

export default TestPlanInfoModal;
