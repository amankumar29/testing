import Table from "Components/Atoms/Table/Table";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./TestPlan.style.scss";
import { ThemeProvider } from "@emotion/react";
import { Pagination, createMuiTheme } from "@mui/material";
import textEllipsis from "../../../Helpers/TextEllipsis/TextEllipsis";
import { Tooltip } from "react-tooltip";
import { Modal } from "Components/Atoms/Modal/Modal";
import ConfirmDeleteProjectModal from "Components/Molecules/ConfirmDeleteProjectModal/ConfirmDeleteProjectModal";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import deleteicon from "Assets/Images/delete.svg";
import { useDispatch, useSelector, useStore } from "react-redux";
// import {
//   setschedulerModifed,
//   setTestSchedulerList,
// } from "Store/ducks/testCases";
import {
  useGetTestPlanListsQuery,
  useLazyGetTestPlanListsQuery,
  useUpdateSchedulerMutation,
} from "Services/API/apiHooks";
import {
  setError,
  setLoading,
  setTestPlanList,
} from "Store/ducks/testPlanListSlice";
import { useDeleteSchedulerMutation } from "Services/API/apiHooks";
import StatusToggleButton from "Components/Atoms/StatusToggleButton/StatusToggleButton";
import { useContext } from "react";
import { WebsocketContext } from "Services/Socket/socketProvider";

const TestPlan = ({
  searchKey,
  setPayload,
  onRowData,
  callTestPlan,
  setOpenDrawer,
  setIsEditMode,
}) => {
  // const List = useSelector((state) => state?.testCases?.testScheduler);
  const { schedulerModifed } = useSelector((state) => state?.testCases);
  // const [checkedItems, setCheckedItems] = useState({}); // Initialize as empty object
  // const [rowId, setRowId] = useState([]);
  // const [selectAll, setSelectAll] = useState(false);
  // const [testPlansData, setTestPlansData] = useState(List?.list || []);
  const [isLoading, setIsLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);
  const [testPlanId, setTestPlanId] = useState();
  const dispatch = useDispatch();

  const [deleteScheduler, { isError, isSuccess }] =
    useDeleteSchedulerMutation();
  const offset = (page - 1) * rowsPerPage; // Calculate the offset based on current page and rows per page

  const { defaultApplication, userDetails } = useSelector(
    (state) => state?.userDetails
  );
  const selectedProject = defaultApplication;
  const selectedApplication = defaultApplication;
  const {socket} = useContext(WebsocketContext);
  const currentStore = useStore();

  // const {
  //   data,
  //   error: queryError,
  //   isLoading,
  //   refetch,
  //   isUninitialized,  // Use this to check if the query has been triggered
  // } = useGetTestPlanListsQuery(
  //   {
  //     searchKey: searchKey,
  //     limit: rowsPerPage,
  //     offset: offset,
  //     projectId: selectedProject?.projectId,
  //     applicationId: selectedApplication?.id,
  //     sortColumn: "name",
  //     sortDirection: "dsc",
  //   },
  //   {skip:!selectedApplication?.id}
  // );

  // Only refetch if the query has been initialized
  // const handleRefetch = () => {
  //   if (!isUninitialized) {
  //     refetch();
  //   }
  // };

  const [count, setCount] = useState(0);
  const [newTestPlanData, setNewTestPlanData] = useState([]);

  const [updateScheduler] = useUpdateSchedulerMutation();
  const [getTestPlanList] = useLazyGetTestPlanListsQuery();

  const fetchTestPlanList = async () => {
    dispatch(setLoading(isLoading));
    try {
      const body = {
        searchKey: searchKey,
        limit: rowsPerPage,
        offset: offset,
        projectId: selectedProject?.projectId,
        applicationId: selectedApplication?.id,
        sortColumn: "_id",
        sortDirection: "dsc",
      };
      const response = await getTestPlanList(body).unwrap();
      setNewTestPlanData(response?.results?.testPlans);
      setCount(response?.results?.count);
      dispatch(setTestPlanList(response?.results));
      dispatch(setLoading(isLoading));
    } catch (error) {
      dispatch(setError(error.message));
      toast.error(error.msg);
    }
  };

  // useEffect(() => {
  //   if (data) {
  //     dispatch(setTestPlanList(data));
  //   }
  //   dispatch(setLoading(isLoading));

  //   if (queryError) {
  //     dispatch(setError(queryError.message));
  //     toast.error(queryError.message);
  //   }
  // }, [data, isLoading, queryError, dispatch]);

  // const newTestPlanData = data?.results?.testPlans;
  // const count = data?.results?.count;

  useEffect(() => {
    if (count) {
      setTotalPages(Math.ceil(count / rowsPerPage)); // Use rowsPerPage to calculate total pages dynamically
    }
  }, [count, rowsPerPage]); // Dependency array includes count and rowsPerPage

  // List Api for the TestPlans List

  // const fetchTestPlanList = (
  //   limit,
  //   offset,
  //   isdelete,
  //   isduplicate,
  //   rowChanged,
  //   pageChanged,
  //   isUpdate
  // ) => {
  //   if (
  //     List?.list?.length == 0 ||
  //     rowChanged ||
  //     pageChanged ||
  //     isdelete ||
  //     isduplicate ||
  //     List?.projectId != selectedProject?.id ||
  //     List?.applicationId != selectedApplication?.id ||
  //     Object.keys(searchKey).length !== 0 ||
  //     isUpdate ||
  //     schedulerModifed
  //   ) {
  //     // setIsLoading(true);
  //     const paylod = {
  //       applicationId: selectedApplication?.id,
  //       projectId: selectedProject?.id,
  //       limit,
  //       offset,
  //       searchKey: searchKey?.searchKey,
  //       includeCount: true,
  //       sortColumn: "id",
  //       sortOrder: "DESC",
  //     };
  //     getTestPlansList(paylod)
  //       .then((res) => {
  //         const data = res?.data?.results;
  //         dispatch(
  //           setTestSchedulerList({
  //             projectId: selectedProject?.id,
  //             applicationId: selectedApplication?.id,
  //             currentOffset: offset,
  //             totalCount: res?.data?.count,
  //             list: data,
  //           })
  //         );
  //         setCount(res?.data?.count);
  //         setTestPlansData(data);
  //         // setIsLoading(false);
  //         setCurrentOffset(res?.data?.offset);
  //         setTotalPages(Math.ceil(res?.data?.count / limit));
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         // setIsLoading(false);
  //       });
  //     dispatch(setschedulerModifed(false));
  //   }
  // };

  const handleDeleteTestPlan = async (testPlanId) => {
    try {
      const result = await deleteScheduler(testPlanId).unwrap();
      socket.emit("onTestplans", {
        command: "testPlanDelete",
        organizationId: userDetails?.organizationId,
        applicationId: defaultApplication?.id,
        projectId: defaultApplication?.projectId,
        user: {
          userName: userDetails?.userName,
          userId: userDetails?.userId,
        },
        data: {
          Id: testPlanId,
        },
      });
      // handleRefetch();
      fetchTestPlanList();
      const msg = result?.message;
      if (isSuccess || msg) {
        toast.success(msg);
      }
    } catch (error) {
      console.error("Error deleting scheduler:", error);
      const errMsg = error?.data?.details;
      if (isError || errMsg) {
        toast.error(errMsg);
      }
    }
  };

  const fetchUpdateStatusChange = async (isActive, updateId) => {
    const newStatus = isActive === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const payload = {
      status: newStatus,
    };
    try {
      const data = await updateScheduler({ payload, id: updateId }).unwrap();
      // handleRefetch();
      fetchTestPlanList();
      const message = data?.message;
      const offset = (page - 1) * rowsPerPage;
      socket.emit("onTestplans", {
        command: "testPlanUpdate",
        organizationId: userDetails?.organizationId,
        applicationId: defaultApplication?.id,
        projectId: defaultApplication?.projectId,
        user: {
          userName: userDetails?.userName,
          userId: userDetails?.userId,
        },
        data: {
          status: newStatus,
          planId: updateId,
          type: "Status",
        },
      });
      // setRowsPerPage(rowsPerPage, offset);
      // setPage(1);
      // setPayload({});
      toast.success(message);
    } catch (error) {
      console.error("Error updating scheduler:", error);
      const message = error?.data?.details;
      toast.error(message);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 10);
    setPage(1);
    setRowsPerPage(newRowsPerPage);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleShowDeleteModal = () => {
    setOpenConfirmDeleteModal(true);
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDeleteModal(false);
  };

  const handleToggleChange = (isActive, rowId) => {
    fetchUpdateStatusChange(isActive, rowId);
  };
  const handleTestPlanData = (row) => {
    onRowData(row?._id);
    setOpenDrawer(true);
    setIsEditMode(true);
  };
  useEffect(() => {
    if (selectedApplication?.id) {
      // handleRefetch();
      fetchTestPlanList();
    }
  }, [
    selectedApplication,
    searchKey,
    callTestPlan,
    schedulerModifed,
    rowsPerPage,
    offset,
  ]);

  const handelTestPlansSocket = async (response) => {
    const sendUser = response?.user;
    const { defaultApplication: currentProject } =
      currentStore?.getState()?.userDetails;
    if (
      currentProject?.id == response?.applicationId &&
      currentProject?.projectId === response?.projectId
    ) {
      switch (response?.command) {
        case "testPlanCreate":
          const { newtestPlan } = response?.data;
          if (newtestPlan) {
            setNewTestPlanData((preItem) => {
              const newTestSuiteList = [...preItem, newtestPlan];
              const uniqueList = newTestSuiteList.filter(
                (item, index, self) =>
                  index === self.findIndex((t) => t._id === item._id)
              );
              return uniqueList;
            });
            toast.dismiss();
            toast.success(
              `Hello Team! ${sendUser?.userName} has created New TestPlan ${response?.data?.name}`
            );
          }
          break;
        case "testPlanUpdate":
          const { status, planId, type } = response?.data;
          if (type == "Status") {
            setNewTestPlanData((prevItems) =>
              prevItems.map((item) =>
                item?._id === planId
                  ? {
                      ...item,
                      status: status,
                    }
                  : item
              )
            );
          } else {
            const { newtestPlan } = response?.data;
            setNewTestPlanData((prevItems) =>
              prevItems.map((item) =>
                item?._id === planId
                  ? {
                      ...item,
                      ...newtestPlan,
                    }
                  : item
              )
            );
          }
          toast.dismiss();
          toast.success(
            `Hello Team! ${sendUser?.userName} has updated ${planId} TestPlan`
          );
          break;
        case "testPlanDelete":
          const { Id } = response?.data;
          if (Id) {
            setNewTestPlanData((preItem) =>
              preItem?.filter((item) => item?._id !== Id)
            );
            toast.dismiss();
            toast.success(
              `Hello Team! ${sendUser?.userName} has deleted ${Id} TestPlan`
            );
          }
          break;
      }
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("onTestplansResponse", handelTestPlansSocket);
      return () => {
        socket.off("onTestplansResponse", handelTestPlansSocket);
      };
    }
  }, []);

  return (
    <>
      <div className="test-plan">
        <div className="bg-iwhite p-5 rounded-[8px] table-div">
          <div className="tableScroll tableScrollNew">
            <Table
              isDisableCheckbox={true}
              isLoading={isLoading}
              data={newTestPlanData}
              checkbox={false}
              onRowClick={(row) => {
                handleTestPlanData(row);
              }}
              onRowClickPointer={true}
              columns={[
                {
                  tHeadClass: "w-[5%]",
                  tbodyClass: "text-igy1 text-sm font-normal",
                  label: "ID",
                  column: "id",
                  cell: (row) => (
                    <div className="flex items-center justify-center">
                      {row?._id}
                    </div>
                  ),
                },

                {
                  tHeadClass: "w-[7%] text-left ",
                  tbodyClass: "text-igy1 text-sm font-normal",
                  label: "Scheduler Name",
                  column: "test_plan_name",
                  cell: (row) => (
                    <>
                      <div
                        className={` ${
                          row?.test_plan_name?.length > 30 && "cursor-pointer"
                        }`}
                      >
                        <div
                          data-tooltip-id="name"
                          data-tooltip-content={
                            row?.name?.length > 30 ? row?.name : ""
                          }
                          className="pl-2"
                        >
                          {textEllipsis(row?.name, 30)}
                        </div>
                      </div>
                      <Tooltip
                        id="name"
                        place="bottom"
                        className="!text-[11px] max-w-[300px] break-all !text-left"
                      />
                    </>
                  ),
                },
                {
                  tHeadClass: "w-[6%] !text-left",
                  tbodyClass: "text-igy1 text-sm font-normal",
                  label: "Created By",
                  column: "",
                  cell: (row) => (
                    <>
                      <div>{row?.user?.name}</div>
                    </>
                  ),
                },
                {
                  tHeadClass: "w-[6%] text-left",
                  tbodyClass: "text-igy1 text-sm font-normal",
                  label: "Type",
                  column: "execution_type",
                  cell: (row) => {
                    return (
                      <>
                        <div className="pr-[20px]">
                          {row?.executionType === "PARALLEL"
                            ? `${row?.executionType} ${
                                row?.threadCount ? `(${row?.threadCount})` : ""
                              }`
                            : row?.executionType}
                        </div>
                      </>
                    );
                  },
                },
                {
                  tHeadClass: "w-[9%] text-left",
                  tbodyClass: "text-igy1 text-sm font-normal",
                  label: "Schedule On",
                  column: "",
                  cell: (row) => {
                    const isDaily = allDays?.every((day) =>
                      row?.schedule?.scheduledDays?.includes(day)
                    );
                    return (
                      <div className="">
                        {isDaily
                          ? "Daily"
                          : row?.schedule?.scheduledDays
                              ?.map((day) => daysMap[day])
                              .join(" , ")}
                      </div>
                    );
                  },
                },
                {
                  tHeadClass: "w-[9%] text-left",
                  tbodyClass: "text-igy1 text-sm font-normal",
                  label: "Scheduled Type",
                  column: "",
                  cell: (row) => {
                    const convertToIST = (utcTime) => {
                      if (!utcTime) return "";

                      const date = new Date(`1970-01-01T${utcTime}Z`);

                      date.setUTCHours(date.getUTCHours() + 5);
                      date.setUTCMinutes(date.getUTCMinutes() + 30);

                      return date.toISOString().substr(11, 5); // HH:mm
                    };

                    const istTime = convertToIST(row?.schedule?.time);

                    function getIntervalName(timePeriod) {
                      const interval = timeIntervalData?.find(
                        (item) => item?.type === timePeriod
                      );
                      return interval ? interval.name : "Unknown Interval";
                    }

                    const intervalName = getIntervalName(row?.schedule?.time);

                    return (
                      <div>
                        {row?.schedule?.isInterval === true
                          ? `Interval - ${intervalName}`
                          : `Time - ${istTime}`}
                      </div>
                    );
                  },
                },
                {
                  tHeadClass: "w-[10%]",
                  label: "Status",
                  column: "status",
                  cell: (row) => (
                    <div className="flex items-center justify-center">
                      <StatusToggleButton
                        key={`${row?._id}-${row?.status}`} // Unique key for each row based on its ID and isActive status
                        onStatusChange={() =>
                          handleToggleChange(row?.status, row?._id)
                        }
                        status={row?.status}
                      />
                    </div>
                  ),
                },
                {
                  tHeadClass: "w-[6%]",
                  tbodyClass: "text-igy1 text-sm font-normal",
                  cell: (row) => (
                    <div className="flex items-center justify-center">
                      <CustomTooltip
                        title="Delete"
                        placement="bottom"
                        offset={[0, -3]}
                        height={"28px"}
                        fontSize="11px"
                      >
                        <img
                          src={deleteicon}
                          alt="delete icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowDeleteModal(row?._id);
                            setTestPlanId(row?._id);
                          }}
                        />
                      </CustomTooltip>
                    </div>
                  ),
                },
              ]}
            />
            <div className="flex items-center justify-between mt-8 mb-[10px]">
              {!isLoading && count > 0 && (
                <div className="text-sm text-ibl1">{`Showing ${newTestPlanData?.length} out of ${count}`}</div>
              )}
              {!isLoading && count > 25 && (
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
                          className=" relative z-[1]"
                        />
                      </ThemeProvider>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openConfirmDeleteModal}
        onClose={handleCloseConfirmDelete}
        className="rounded-[16px]"
      >
        <ConfirmDeleteProjectModal
          onClick={handleCloseConfirmDelete}
          fetchDeleteTestPlans={() => {
            handleDeleteTestPlan(testPlanId);
          }}
          type={"test-plan"}
        />
      </Modal>
    </>
  );
};

const daysMap = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const allDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeIntervalData = [
  { id: 1, name: "Every 15 Minutes", type: "00:15:00" },
  { id: 2, name: "Every 30 Minutes", type: "00:30:00" },
  { id: 3, name: "Every 1 Hour", type: "01:00:00" },
  { id: 4, name: "Every 2 Hours", type: "02:00:00" },
  { id: 5, name: "Every 4 Hours", type: "04:00:00" },
  { id: 6, name: "Every 6 Hours", type: "06:00:00" },
  { id: 7, name: "Every 8 Hours", type: "08:00:00" },
  { id: 8, name: "Every 12 Hours", type: "12:00:00" },
];

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#052C85",
      contrastText: "#ffffff", // or any contrasting color
    },
  },
});

export default TestPlan;
