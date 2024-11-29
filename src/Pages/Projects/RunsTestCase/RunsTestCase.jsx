import { useState } from "react";
import Table from "Components/Atoms/Table/Table";
import FailIcon from "../../../Assets/Images/failure_type.svg";
import Rerun from "../../../Assets/Images/re_run.svg";
import ExpandCircle from "../../../Assets/Images/expand_circle_right.svg";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./RunsTestCase.style.scss";
import chrome from "../../../Assets/Images/google.svg";
import firefox from "../../../Assets/Images/firefox.svg";
import safari from "../../../Assets/Images/safari.svg";
import failureDisable from "../../../Assets/Images/disable_failure_type.svg";

const RunTestCases = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progressBarPoPUp, setProgressBarPoPUp] = useState(false);
  return (
    <>
      <div className="mt-4 overflow-y-auto h-[760px] relative run-Test-Cases">
        <Table
          // isLoading={isLoading}
          data={runTestcaseData}
          checkbox={true}
          columns={[
            { label: "", tHeadClass: "w-[5%]" },
            {
              tHeadClass: "w-[5%]",
              tbodyClass: "text-igy1 text-sm font-normal",
              label: "Run ID",
              column: "id",
            },
            {
              tHeadClass: "w-[5%]",
              tbodyClass: "text-igy1 text-sm font-normal",
              label: "Name",
              column: "name",
              cell: (row) => (
                <div className="flex justify-center items-center gap-3">
                  <p>
                    <img
                      src={
                        row.browser === "chrome"
                          ? chrome
                          : row.browser === "firefox"
                          ? firefox
                          : row.browser === "safari"
                          ? safari
                          : ""
                      }
                      className="w-4 h-4"
                    />
                  </p>
                  <p>{row?.name}</p>
                </div>
              ),
            },
            {
              tHeadClass: "w-[10%]",
              tbodyClass: "text-igy1 text-sm font-normal",
              label: "Created By",
              column: "created_by",
            },
            {
              tHeadClass: "w-[20%]",
              tbodyClass: "text-igy1 text-sm font-normal",
              label: "Start Time",
              column: "start_time",
            },
            {
              tHeadClass: "w-[10%]",
              tbodyClass: "text-igy1 text-sm font-normal",
              label: "Duration",
              column: "duration",
            },
            {
              tHeadClass: "w-[10%]",
              tbodyClass: "text-igy1 text-sm font-normal",
              label: "Status",
              column: "status",
              cell: (row) => (
                <>
                  <div className="flex justify-center items-center cursor-default">
                    {row.status === "In Progress" && (
                      <div className="w-[90px] h-[30px] bg-ior2 text-iro4 text-[14px] font-medium flex justify-center items-center rounded-[4px]">
                        {row.status}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center items-center cursor-default">
                    {row.status === "Failed" && (
                      <div className="w-[90px] h-[30px] bg-ird5 text-ird3 text-[14px] font-medium flex justify-center items-center rounded-[4px]">
                        {row.status}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center items-center cursor-default">
                    {row.status === "Passed" && (
                      <div className="w-[90px] h-[30px] bg-ign5 text-ign1 text-[14px] font-medium flex justify-center items-center rounded-[4px]">
                        {row.status}
                      </div>
                    )}
                  </div>
                </>
              ),
            },
            {
              tHeadClass: "w-[10%]",
              tbodyClass: "text-igy1 text-sm font-normal",
              label: "Completion",
              column: "completion",
              cell: (row, index) => {
                const percentage = row?.completion;
                const passedCount = row?.passed;
                const failedCount = row?.failed;
                const skippedCount = row.skipped;
                return (
                  <>
                    <div className="flex flex-row justify-center">
                      <div
                        style={{ width: 45, height: 45 }}
                        className={`relative ${
                          row?.status === "Failed"
                            ? "failed-progress"
                            : "sucess-process"
                        } z-0 `}
                        onMouseEnter={() => setProgressBarPoPUp(index)}
                        onMouseLeave={() => setProgressBarPoPUp("")}
                      >
                        <CircularProgressbar
                          value={percentage}
                          text={`${percentage}%`}
                          className="cursor-default"
                        />
                        {progressBarPoPUp === index && (
                          <div className="bg-iwhite w-[88px] h-[68px] text-igy1 absolute top-[0px] left-[50px] rounded-[4px] px-[10px] py-[2px] flex flex-col progressBarPoPUp">
                            <div className="flex justify-between text-[11px] font-medium">
                              <p>Passed</p>
                              <p>{passedCount}</p>
                            </div>
                            <div className="flex justify-between text-[11px] font-medium">
                              <p>Failed</p>
                              <p>{failedCount}</p>
                            </div>
                            <div className="flex justify-between text-[11px] font-medium">
                              <p>Skipped</p>
                              <p>{skippedCount}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              },
            },
            {
              tHeadClass: "w-[10%]",
              tbodyClass: "text-igy1 text-sm font-normal",
              label: "Failure Type",
              cell: (row) => (
                <>
                  {row.status === "Failed" ? (
                    <div className="flex justify-center items-center">
                      <CustomTooltip
                        title="Add Failure Type"
                        placement="bottom"
                        height={"28px"}
                        fontSize="11px"
                      >
                        <img src={FailIcon} className="cursor-pointer" />
                      </CustomTooltip>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center">
                      <img src={failureDisable} />
                    </div>
                  )}
                </>
              ),
            },
            {
              tHeadClass: "w-[10%]",
              tbodyClass: "text-igy1 text-sm font-normal",
              label: "Actions",
              column: "actions",
              cell: () => (
                <div className="flex justify-center items-center gap-8">
                  <CustomTooltip
                    title="Re Run"
                    placement="bottom"
                    height={"28px"}
                    fontSize="11px"
                    offset={[0, -3]}
                  >
                    <img src={Rerun} className="cursor-pointer" />
                  </CustomTooltip>

                  <CustomTooltip
                    title="View"
                    placement="bottom"
                    height={"28px"}
                    fontSize="11px"
                    offset={[0, -3]}
                  >
                    <img src={ExpandCircle} className="cursor-pointer" />
                  </CustomTooltip>
                </div>
              ),
            },
          ]}
        />
      </div>
    </>
  );
};

export default RunTestCases;

const runTestcaseData = [
  {
    id: 1,
    name: "Login",
    created_by: "Matt Dickerson",
    start_time: "17:03:25 Mar 27, 2024",
    duration: "04:95:15",
    status: "In Progress",
    completion: "50",
    passed: "90",
    failed: "10",
    skipped: "20",
    browser: "chrome",
  },
  {
    id: 2,
    name: "Login",
    created_by: "Matt Dickerson",
    start_time: "17:03:25 Mar 27, 2024",
    duration: "04:95:15",
    status: "In Progress",
    completion: "80",
    passed: "80",
    failed: "1",
    skipped: "2",
    browser: "firefox",
  },
  {
    id: 3,
    name: "Login",
    created_by: "Matt Dickerson",
    start_time: "17:03:25 Mar 27, 2024",
    duration: "04:95:15",
    status: "Failed",
    completion: "10",
    passed: "70",
    failed: "15",
    skipped: "12",
    browser: "safari",
  },
  {
    id: 4,
    name: "Login",
    created_by: "Matt Dickerson",
    start_time: "17:03:25 Mar 27, 2024",
    duration: "04:95:15",
    status: "Passed",
    completion: "100",
    passed: "60",
    failed: "15",
    skipped: "2",
    browser: "chrome",
  },
  {
    id: 5,
    name: "Login",
    created_by: "Matt Dickerson",
    start_time: "17:03:25 Mar 27, 2024",
    duration: "04:95:15",
    status: "Failed",
    completion: "1",
    passed: "90",
    failed: "10",
    skipped: "20",
    browser: "firefox",
  },
];
