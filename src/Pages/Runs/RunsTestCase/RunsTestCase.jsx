import { ThemeProvider } from "@emotion/react";
import { createMuiTheme } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import Table from "Components/Atoms/Table/Table";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import DonutChart from "Components/Molecules/DonutChart/DonutChart";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import "react-circular-progressbar/dist/styles.css";
import { useDispatch, useSelector, useStore } from "react-redux";
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
// import useStore from "../../../Store/useRunsSwitcherStore";
import "./RunsTestCase.style.scss";
import {
  useDeleteRunsListMutation,
  useGetRunsTestCaseListQuery,
  useGetUserDataQuery,
  useLazyGetRunsTestCaseListQuery,
} from "Services/API/apiHooks";
import {
  setRunTestCaseList,
  setLoading as setRunsLoading,
  setError as setRunsError,
} from "Store/ducks/getRunsTestCaseSlice";
import apiIcon from "../../../Assets/Images/apiicon.svg";
import { WebsocketContext } from "Services/Socket/socketProvider";
import Cookies from "js-cookie";
import { setDefaultApplication, setUserDetails } from "Store/ducks/userDetailsSlice";

const RunTestCases = ({
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
  const [totalPages, setTotalPages] = useState(0);
  const [deleteRunsList, { isError, isSuccess }] = useDeleteRunsListMutation();

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
  const storedUser = localStorage.getItem("defaultApp");
  const storedProjectId = Cookies.get("projectId");
  const storedApplicationId = Cookies.get("applicationId");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const type = "TEST_CASE";
  const resetPagination = () => {
    setPage(1);
  };

  const offset = (page - 1) * rowsPerPage; // Calculate the offset based on current page and rows per page

  const { defaultApplication ,userDetails} = useSelector((state) => state?.userDetails);
  // const selectedProject = defaultApplication;
  // const selectedApplication = defaultApplication;
  const {socket} =  useContext(WebsocketContext)
  const currentStore = useStore()
  let selectedProject = (() => {
    try {
      return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing storedUser:", error);
      return null;
    }
  })();
  let selectedApplication = selectedProject;
  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
  } = useGetUserDataQuery();

  // const {
  //   data: runData,
  //   isLoading: isRunsLoading,
  //   error: isRunsErrors,
  //   refetch,
  // } = useGetRunsTestCaseListQuery(
  //   {
  //     applicationId: selectedApplication?.id,
  //     projectId: selectedProject?.projectId,
  //     runType: type,
  //     fromDate: endDate,
  //     toDate: startDate,
  //     search: searchKey?.searchKey || "",
  //     limit: rowsPerPage,
  //     offset: offset,
  //     includeCount: true,
  //     sortDirection:'desc',
  //     sortColumn:'_id',
  //   },
  //   {
  //     refetchOnMountOrArgChange: true, // This will refetch when the component mounts again
  //     skip: !selectedProject,
  //   }
  // );

  // const runTestCaseData = runData?.results;
  // const testCaseCount = runData?.count;
  const [newrunTestCaseData,setNewrunTestCaseData] = useState()
  const [newtestCaseCount,setNewtestCaseCount]=useState()
  const [fetchRunTestCases ,{ isLoading: isRunsLoading, error: isRunsErrors }] = useLazyGetRunsTestCaseListQuery()

  useEffect(() => {
    if (newtestCaseCount) {
      setTotalPages(Math.ceil(newtestCaseCount / rowsPerPage));
    }
  }, [newtestCaseCount, rowsPerPage]);

  // Dispatch loading state
  // useEffect(() => {
  //   if (isRunsLoading) {
  //     dispatch(setRunsLoading(true));
  //   }

  //   // Handle API response
  //   if (runData) {
  //     dispatch(setRunTestCaseList(runData));
  //     dispatch(setRunsLoading(false)); // Set loading to false
  //   }

  //   // Handle errors
  //   if (isRunsErrors) {
  //     dispatch(setRunsError(isRunsErrors.message)); // Dispatch error to Redux
  //   }
  // }, [isRunsLoading, runData, isRunsErrors, dispatch]);

  // Fetch run test cases data
  // const fetchRunTestCases = (limit, offset) => {
  //   dispatch(
  //     fetchRunList({
  //       limit,
  //       offset,
  //       selectedApplication,
  //       selectedProject,
  //       searchKey: searchKey?.searchKey || "",
  //       startDate,
  //       endDate,
  //       customDate,
  //       todayDate,
  //       yesterDayDate,                                                        // this is usefull for feature reference
  //       lastWeekDate,
  //       lastMonthDate,
  //     })
  //   );
  // };

  // Effect for fetching data when component mounts or dependencies change
  // useEffect(() => {
  //   const offset = (page - 1) * rowsPerPage;
  //   if (selectedApplication?.id && type === "test-cases") {
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

// Fetch RuntestCaseData

 const fetchRunTestCasesData = async()=>{
  dispatch(setRunsLoading(true));
  try {
    const body = {
      applicationId: selectedApplication?.id,
      projectId: selectedProject?.projectId,
      runType: type,
      fromDate: startDate,
      toDate: endDate,
      search: searchKey?.searchKey || "",
      limit: rowsPerPage,
      offset: offset,
      includeCount: true,
      sortDirection:'desc',
      sortColumn:'_id',
    }
   const response = await fetchRunTestCases(body).unwrap()
    if(response){
      setNewrunTestCaseData(response?.results)
      setNewtestCaseCount(response?.count)
      dispatch(setRunTestCaseList(newrunTestCaseData));
      dispatch(setRunsLoading(false));
    }
  } catch (error) {
    dispatch(setRunsLoading(false));
    dispatch(setRunsError(isRunsErrors?.message));
    toast.error(error?.message)
  }
 }
 
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
        // refetch();
        fetchRunTestCasesData()
        if (onItemDeleted) {
          onItemDeleted(deleteId);
        }
      }
    } catch (err) {
      const errMsg = err?.details;
      console.log(errMsg)
      if (isError || errMsg) {
        toast.error(errMsg);
      }
    }
    // .then((res) => {
    //   const message = res?.data?.message;
    //   setRowsPerPage(25);
    //   setPage(1);
    //   toast.success(message);
    //   // Call the parent callback function
    //   if (onItemDeleted) {
    //     onItemDeleted(deleteId);
    //   }                                                            // this is usefull for feature reference
    // })
    // .catch((error) => {
    //   const message = error?.response?.data?.details;
    //   toast.error(message || "Deleting test cases is not allowed.");
    // });
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
  
  useEffect(() => {
    if (!isUserLoading && userData && storedUser && storedUser !== "undefined") {
      const parsedUser = JSON.parse(storedUser);
  
      if (storedProjectId && storedApplicationId) {
        const updatedUserDetails = {
          ...userData?.results,
          defaultApplicationId: parsedUser?.id,
          defaultProjectId: parsedUser?.projectId,
          defaultApplicationType: parsedUser?.type,
          defaultAppData: parsedUser?.appData,
        };
  
        if (
          JSON.stringify(updatedUserDetails) !== JSON.stringify(userDetails) ||
          JSON.stringify(parsedUser) !== JSON.stringify(defaultApplication)
        ) {
          dispatch(setUserDetails(updatedUserDetails));
          dispatch(setDefaultApplication(parsedUser));
          selectedApplication = parsedUser
          selectedProject = parsedUser
        }
      }
    }
  
    if (selectedApplication?.id) {
      fetchRunTestCasesData();
    }
  }, [
    isUserLoading,
    userData,
    storedUser,
    storedProjectId,
    storedApplicationId,
    userDetails,
    defaultApplication,
    rowsPerPage,searchKey, startDate, endDate, page
  ]);


  const handleTestcaseSocket = async(response)=>{
    const sendUser= response?.user
    const {defaultApplication:currentProject} = currentStore?.getState()?.userDetails
    if(currentProject?.id == response?.applicationId && currentProject?.projectId === response?.projectId ){
      if(response?.command == "createRun-testCase"){
        const newTestCaseRun = response?.data
        if(newTestCaseRun){
          setNewrunTestCaseData((preItem)=>{
            const newTestCaseList = [newTestCaseRun,...preItem];
            const uniqueList = newTestCaseList.filter((item, index, self) =>
              index === self.findIndex((t) => t._id === item._id)
            );
          return uniqueList;
          })
          toast.dismiss()
          toast.success(`Hello Team! ${sendUser?.userName} has created New TestCaseRun ${response?.data?.name}`)
        }
      }
    }
  }

  useEffect(() => {
    if (socket) {
      socket.on("onTestcasesResponse", handleTestcaseSocket);
      return () => {
        socket.off("onTestcasesResponse", handleTestcaseSocket);
      };
    }
  }, []);


  return (
    <>
      <div className="md:mt-4 run-Test-Cases run-Test-mobile-full bg-iwhite p-5 rounded-[8px] table-div">
        <div className="tableScroll tableScrollNew">
          <Table
            isLoading={isLoading}
            data={newrunTestCaseData}
            onRowClick={(row) => {
              navigateTo(`/runs/test-cases/${row?._id}/summary`);
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
                      ) : selectedApplication.type === 'RESTAPI' ? (
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
                        className="break-all cursor-pointer w-fit"
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
                      place="bottom"
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
                          {row?.executionStatus.replace(/_/g, " ")}
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
                            row?.executionStatus === "FAILED"
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
            {!isRunsLoading && newtestCaseCount > 0 && (
              <div className="text-sm text-ibl1">{`Showing ${newrunTestCaseData?.length} out of ${newtestCaseCount}`}</div>
            )}
            {!isRunsLoading && newtestCaseCount > 25 && (
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

export default RunTestCases;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#052C85",
      contrastText: "#ffffff", // or any contrasting color
    },
  },
});

RunTestCases.propTypes = {
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
  lastWeekDate: PropTypes.bool,
  lastMonthDate: PropTypes.bool,
  isReClick: PropTypes.bool,
  clearCheckBoxes: PropTypes.bool,
  setDropDown: PropTypes.any,
};
