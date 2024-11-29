import { ThemeProvider } from "@emotion/react";
import { createMuiTheme } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import Table from "Components/Atoms/Table/Table";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import DonutChart from "Components/Molecules/DonutChart/DonutChart";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import "react-circular-progressbar/dist/styles.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { fetchRunList } from "Store/ducks/runsList";
import defaultBrowser from "../../../Assets/Images/defaultBrowser.svg";
import Delete from "../../../Assets/Images/delete.svg";
import edge from "../../../Assets/Images/edge.svg";
import firefox from "../../../Assets/Images/firefox.svg";
import chrome from "../../../Assets/Images/google.svg";
import mobileIcon from "../../../Assets/Images/runsMobileIcon.svg";
import safari from "../../../Assets/Images/safari.svg";
import tvIcon from "../../../Assets/Images/tv.svg";
import { Modal } from "../../../Components/Atoms/Modal/Modal";
import ConfirmDeleteModal from "../../../Components/Molecules/ConfirmDeleteModal/ConfirmDeleteModal";
import { calculateDuration } from "../../../Helpers/CalculateDuration/CalculateDuration";
import ConvertToLocalTimeZone from "../../../Helpers/ConvertTolocalTimeZone/ConvertToLocalTimeZone";
import textEllipsis from "../../../Helpers/TextEllipsis/TextEllipsis";
import { deleteRunsData } from "../../../Services/API/Run/Run";
import useStore from "../../../Store/useRunsSwitcherStore";
import "./RunsTestPlans.style.scss";
import {
  useDeleteRunsListMutation,
  useGetRunsTestCaseListQuery,
} from "Services/API/apiHooks";
import {
  setRunTestCaseList,
  setLoading as setRunsLoading,
  setError as setRunsError,
} from "Store/ducks/getRunsTestCaseSlice";
import apiIcon from "../../../Assets/Images/apiicon.svg";

const RunsTestPlans = ({
  searchKey,
  onProjectSelect,
  handleSearchSubmit,
  onApplicationSelect,
  onItemDeleted,
  rowIdUpdate,
  startDate = "",
  endDate = "",
  customDate,
  todayDate,
  yesterDayDate,
  lastWeekDate,
  lastMonthDate,
  isReClick,
  clearCheckBoxes,
  setDropDown,
}) => {
  // const { selectedApplication, selectedProject } = useStore();
  const [progressBarPoPUp, setProgressBarPoPUp] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState([]);
  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const {
    runsListData,
    dataCount,
    // totalPages,
    currentOffset,
    isLoading,
    error,
  } = useSelector((state) => state.runListData); // Assuming 'runs' is the slice name

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const type = "TEST_PLAN";

  const resetPagination = () => {
    setPage(1);
  };

  // // Fetch run test cases data
  // const fetchRunTestCases = (limit, offset) => {
  //   dispatch(
  //     fetchRunList({
  //       runType: runType,
  //       limit,
  //       offset,
  //       selectedApplication,
  //       selectedProject,
  //       searchKey: searchKey?.searchKey || "",
  //       startDate,
  //       endDate,
  //       customDate,
  //       todayDate,
  //       yesterDayDate,
  //       lastWeekDate,
  //       lastMonthDate,
  //     })
  //   );
  // };

  // // Effect for fetching data when component mounts or dependencies change
  // useEffect(() => {
  //   const offset = (page - 1) * rowsPerPage;
  //   if (selectedApplication?.id && type === "test-scheduler") {
  //     fetchRunTestCases(rowsPerPage, offset);
  //   }
  // }, [
  //   rowsPerPage,
  //   page,
  //   selectedApplication,
  //   searchKey,
  //   startDate,
  //   endDate,
  //   isReClick,
  // ]);

  const offset = (page - 1) * rowsPerPage; // Calculate the offset based on current page and rows per page

  const { defaultApplication } = useSelector((state) => state?.userDetails);
  const selectedProject = defaultApplication;
  const selectedApplication = defaultApplication;
  const [deleteRunsList, { isError, isSuccess }] = useDeleteRunsListMutation();

  const {
    data: runData,
    isLoading: isRunsLoading,
    error: isRunsErrors,
    refetch,
  } = useGetRunsTestCaseListQuery(
    {
      applicationId: selectedApplication?.id,
      projectId: selectedProject?.projectId,
      runType: type,
      fromDate: startDate,
      toDate: endDate,
      search: searchKey?.searchKey || "",
      limit: rowsPerPage,
      offset: offset,
      includeCount: true,
      sortDirection: "desc",
      sortColumn: "_id",
    },
    {
      refetchOnMountOrArgChange: true, // This will refetch when the component mounts again
      skip: !selectedProject,
    }
  );

  const runTestSchedulerData = runData?.results;
  const testScheduletCount = runData?.count;

  useEffect(() => {
    if (testScheduletCount) {
      setTotalPages(Math.ceil(testScheduletCount / rowsPerPage));
    }
  }, [testScheduletCount, rowsPerPage]);

  // Dispatch loading state
  useEffect(() => {
    if (isRunsLoading) {
      dispatch(setRunsLoading(true));
    }

    // Handle API response
    if (runData) {
      dispatch(setRunTestCaseList(runData));
      dispatch(setRunsLoading(false)); // Set loading to false
    }

    // Handle errors
    if (isRunsErrors) {
      dispatch(setRunsError(isRunsErrors.message)); // Dispatch error to Redux
    }
  }, [isRunsLoading, runData, isRunsErrors, dispatch]);

  // Handle errors by showing toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle changing rows per page
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    resetPagination();
    setRowsPerPage(newRowsPerPage);
  };

  // Handle changing the page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Reset pagination when project or application changes
  useEffect(() => {
    resetPagination();
  }, [onProjectSelect, onApplicationSelect]);

  // Reset pagination when search or date filters change
  useEffect(() => {
    resetPagination();
  }, [
    handleSearchSubmit,
    customDate,
    todayDate,
    yesterDayDate,
    lastWeekDate,
    lastMonthDate,
  ]);

  const handleDelete = async () => {
    try {
      const result = await deleteRunsList(deleteId).unwrap();
      const msg = result?.message;
      if (isSuccess || msg) {
        toast.success(msg);
        refetch();
        if (onItemDeleted) {
          onItemDeleted(deleteId);
        }
      }
    } catch (err) {
      const errMsg = err?.details;
      if (isError || errMsg) {
        toast.error(errMsg);
      }
    }

    // deleteRunsData(deleteId)
    //   .then((res) => {
    //     const message = res?.data?.message;
    //     setRowsPerPage(25);
    //     setPage(1);
    //     toast.success(message);
    //     // Call the parent callback function
    //     if (onItemDeleted) {
    //       onItemDeleted(deleteId);
    //     }
    //   })
    //   .catch((error) => {
    //     const message = error?.response?.data?.details;
    //     toast.error(message || "Deleting test cases is not allowed.");
    //   });
  };

  useEffect(() => {
    resetPagination();
  }, [clearCheckBoxes]);

  const handleOpenConfirmDelete = (id) => {
    setDeleteId(id);
    setDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(false);
  };

  // Define the Mode column separately based on the condition
  const modeColumn =
    selectedApplication?.type === "ANDROID" ||
    selectedApplication?.type === "IOS" ||
    selectedApplication?.type === "TV"
      ? [
          {
            tHeadClass: "w-[14%] text-left",
            tbodyClass: "text-igy1 text-sm font-normal",
            label: "Mode",
            column: "id",
            cell: (row) => (
              <div className="text-left">
                {row?.engineConfig?.target?.toLowerCase() === "local"
                  ? "Local"
                  : row?.engineConfig?.target?.toLowerCase() === "remote"
                  ? row?.grid === "browser-stack"
                    ? "Cloud - Browserstack"
                    : "Cloud - SauceLabs"
                  : "- -"}
              </div>
            ),
          },
        ]
      : [];

  return (
    <>
      <div className="md:mt-4 run-Test-Cases run-Test-mobile-full bg-iwhite p-5 rounded-[8px] table-div">
        <div className="tableScroll tableScrollNew">
          <Table
            isLoading={isLoading}
            data={runTestSchedulerData}
            onRowClick={(row) => {
              navigateTo(`/runs/test-scheduler/${row?._id}/summary`);
            }}
            onRowClickPointer={true}
            columns={[
              {
                tHeadClass: "w-[8%] text-center",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "ID",
                column: "id",
                cell: (row) => <div className="text-center row-id">{row?._id}</div>,
              },
              {
                tHeadClass: "w-[21%] text-left",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "Name",
                column: "name",
                cell: (row) => (
                  <>
                    <span className="flex items-center gap-3">
                      {selectedApplication?.type === "ANDROID" ||
                      selectedApplication?.type === "IOS" ? (
                        <img src={mobileIcon} className="w-5 h-5" alt="" />
                      ) : selectedApplication?.type === "TV" ? (
                        <img src={tvIcon} className="h-4" alt="" />
                      ) : selectedApplication?.type === 'RESTAPI' ? (
                        <img src={apiIcon} className="h-4" alt="" />
                      ) : (
                        <img
                          alt=""
                          src={
                            row?.browser === "CHROME"
                              ? chrome
                              : row?.browser === "FIREFOX"
                              ? firefox
                              : row?.browser === "SAFARI"
                              ? safari
                              : row?.browser === "EDGE"
                              ? edge
                              : row?.browser === "DEFAULT" && defaultBrowser
                          }
                          className="w-4 h-4 p-0 m-0"
                        />
                      )}
                      <p
                        data-tooltip-id="runsTestCaseName"
                        data-tooltip-content={
                          row?.runName?.length > 45 ? row?.runName : ""
                        }
                        className="cursor-pointer w-fit"
                      >
                        {textEllipsis(row?.runName, 45)}
                      </p>
                    </span>

                    <Tooltip
                      id="runsTestCaseName"
                      place="bottom"
                      className="!text-[11px] max-w-[300px] break-all !text-left"
                    />
                  </>
                ),
              },
              ...modeColumn,
              {
                tHeadClass: "w-[10%] text-left",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "Created By",
                column: "created_by",
                cell: (row) => (
                  <>
                    <div
                      className="text-left"
                      data-tooltip-id="runsCreatedBy"
                      data-tooltip-content={
                        row?.createdBy?.firstName &&
                        row?.createdBy?.lastName &&
                        `${row?.createdBy?.firstName} ${row?.createdBy?.lastName}`
                          .length > 30
                          ? `${row?.createdBy?.firstName} ${row?.createdBy?.lastName}`
                          : ""
                      }
                    >
                      {row?.createdBy?.firstName && row?.createdBy?.lastName
                        ? textEllipsis(
                            `${row?.createdBy?.firstName}  ${row?.createdBy?.lastName}`,
                            30
                          )
                        : "--"}
                    </div>
                    <Tooltip
                      id="runsCreatedBy"
                      place="top"
                      className="!text-[11px] max-w-[300px] break-all !text-left"
                    />
                  </>
                ),
              },
              {
                tHeadClass: "w-[17%] text-center",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "Start Time",
                column: "start_time",
                cell: (row) => (
                  <div className="text-center">
                    {row?.runStartTime
                      ? ConvertToLocalTimeZone(row?.runStartTime)
                      : "- -"}
                  </div>
                ),
              },
              {
                tHeadClass: "w-[9%] text-center",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "Duration",
                column: "duration",
                cell: (row) => (
                  <div className="text-center">
                    {calculateDuration(row?.runStartTime, row?.runEndTime)}
                  </div>
                ),
              },
              {
                tHeadClass: "w-[10%]",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "Status",
                column: "status",
                cell: (row) => (
                  <>
                    <div className="flex items-center justify-center">
                      {row?.executionStatus === "IN_PROGRESS" && (
                        <div className="w-[120px] h-[30px] bg-ior2 text-iro4 text-[14px] font-medium flex justify-center items-center rounded-[4px]">
                          {row?.executionStatus?.replace(/_/g, " ")}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      {row?.executionStatus === "ABORTED" && (
                        <div className="w-[90px] h-[30px] bg-igy10 text-igy11 text-[14px] font-medium flex justify-center items-center rounded-[4px]">
                          {row?.executionStatus}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      {row?.executionStatus === "DONE" && (
                        <div className="w-[90px] h-[30px] bg-ign5 text-ign1 text-[14px] font-medium flex justify-center items-center rounded-[4px]">
                          {row?.executionStatus}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      {row?.executionStatus === "QUEUED" && (
                        <div className="w-[90px] h-[30px] bg-ipr1 text-ipr2 text-[14px] font-medium flex justify-center items-center rounded-[4px]">
                          {row?.executionStatus}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      {row?.executionStatus === "CANCELLED" && (
                        <div className="w-[90px] h-[30px] bg-ird5 text-ird3 text-[14px] font-medium flex justify-center items-center rounded-[4px]">
                          {row?.executionStatus}
                        </div>
                      )}
                    </div>
                  </>
                ),
              },
              {
                tHeadClass: "w-[7%]",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "Completion %",
                column: "completion",
                cell: (row, index) => {
                  return (
                    <>
                      <div className="flex flex-row justify-center">
                        <div
                          style={{ width: 45, height: 45 }}
                          className={`relative ${
                            row?.status === "Failed"
                              ? "failed-progress"
                              : "sucess-process"
                          }`}
                          onMouseEnter={() => setProgressBarPoPUp(index)}
                          onMouseLeave={() => setProgressBarPoPUp("")}
                        >
                          <DonutChart row={row} />
                          {progressBarPoPUp === index && (
                            <div className="bg-iwhite w-[88px] h-[68px] text-igy1 absolute top-[0px] right-[50px] rounded-[4px] px-[10px] py-[2px] flex flex-col progressBarPoPUp z-[9]">
                              <div className="flex justify-between text-[11px] font-medium">
                                <p>Passed</p>
                                <p>{row?.testStats?.passedTests}</p>
                              </div>
                              <div className="flex justify-between text-[11px] font-medium">
                                <p>Failed</p>
                                <p>{row?.testStats?.failedTests}</p>
                              </div>
                              <div className="flex justify-between text-[11px] font-medium">
                                <p>Skipped</p>
                                <p>{row?.testStats?.skippedTests}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  );
                },
              },
              // {
              //   tHeadClass: "w-[18%]",
              //   tbodyClass: "text-igy1 text-sm font-normal",
              //   label: "Failure Type",
              //   cell: () => (
              //     <div className="flex justify-center">
              //       <div className="w-[300px]">
              //         <CategoryBar
              //           toBeInvestigate={10}
              //           automationBug={2}
              //           environmentIssue={4}
              //           productBug={5}
              //           noDefect={10}
              //           total={20}
              //         />
              //       </div>
              //     </div>
              //   ),
              // },
              {
                tHeadClass: "w-[4%]",
                tbodyClass: "text-igy1 text-sm font-normal",
                cell: (row) => (
                  <div className="flex items-center justify-center">
                    <CustomTooltip
                      title="Delete"
                      placement="bottom"
                      height={"28px"}
                      fontSize="11px"
                      offset={[0, -3]}
                    >
                      <img
                        alt=""
                        src={Delete}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e?.stopPropagation(); // Stop propagation to prevent row click
                          handleOpenConfirmDelete(row?._id);
                        }}
                      />
                    </CustomTooltip>
                  </div>
                ),
              },
            ]}
          />
          <div className="flex items-center justify-between mt-8">
            {!isLoading && testScheduletCount > 0 && (
              <div className="text-sm text-ibl1">{`Showing ${runTestSchedulerData?.length} out of ${testScheduletCount}`}</div>
            )}
            {!isLoading && testScheduletCount > 25 && (
              <div className="flex items-center">
                <div className="flex text-[15px] text-ibl1 font-medium">
                  <div className="flex items-center gap-2">
                    <div>Page Limit:</div>
                    <div>
                      <select
                        name="pageValue"
                        id="pageValue"
                        onChange={handleChangeRowsPerPage}
                        value={rowsPerPage}
                      >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={75}>75</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <ThemeProvider theme={theme}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handleChangePage}
                        showFirstButton
                        showLastButton
                        color="primary"
                      />
                    </ThemeProvider>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={deleteModal} onClose={handleCloseDeleteModal}>
        <ConfirmDeleteModal
          onClick={handleCloseDeleteModal}
          fetchUserList={handleDelete}
        />
      </Modal>
    </>
  );
};

export default RunsTestPlans;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#052C85",
      contrastText: "#ffffff", // or any contrasting color
    },
  },
});

RunsTestPlans.propTypes = {
  searchKey: PropTypes.object,
  onProjectSelect: PropTypes.any,
  handleSearchSubmit: PropTypes.any,
  onApplicationSelect: PropTypes.any,
  onItemDeleted: PropTypes.bool,
  rowIdUpdate: PropTypes.func,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  customDate: PropTypes.bool,
  todayDate: PropTypes.string,
  yesterDayDate: PropTypes.string,
  lastWeekDate: PropTypes.string,
  lastMonthDate: PropTypes.string,
  isReClick: PropTypes.bool,
};
