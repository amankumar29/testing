import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import { Pagination, ThemeProvider, createMuiTheme } from "@mui/material";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import Switcher from "Components/Molecules/Switcher/Switcher";
import {
  setGetUserList,
  setError as setUserError,
  setLoading as setUserLoading,
} from "Store/ducks/getUserListSlice";
import { useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "react-tooltip";
import verfiedImage from "../../Assets/Images/Verified badge.svg";
import { CustomButton } from "../../Components/Atoms/CustomButton/CustomButton";
import { Modal } from "../../Components/Atoms/Modal/Modal";
import SearchInput from "../../Components/Atoms/SearchInput/SearchInput";
import Table from "../../Components/Atoms/Table/Table";
import TestPlansToggleButton from "../../Components/Atoms/TestPlansToggleButton/TestPlansToggleButton";
import AssignUserModal from "../../Components/Molecules/AssignUserModal/AssignUserModal";
import ConfirmDeleteModal from "../../Components/Molecules/ConfirmDeleteModal/ConfirmDeleteModal";
import EditRole from "../../Components/Molecules/EditRole/EditRole";
import textEllipsis from "../../Helpers/TextEllipsis/TextEllipsis";
import {
  useDeleteUserDataMutation,
  useLazyGetApplicationDetailsByIdQuery,
  useUpdateUserStatusApplicationMutation,
} from "Services/API/apiHooks";
import { toast } from "react-toastify";
import { useContext } from "react";
import { WebsocketContext } from "Services/Socket/socketProvider";

const Users = () => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState({
    value: "",
    error: null,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [openAssignUser, setOpenAssignUser] = useState(false);
  const [openEditRole, setOpenEditRole] = useState(false);
  const [openConfirmEdit, setOpenConfirmEdit] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);
  const [isShowCursor, setIsShowCursor] = useState(false);
  const [userDeleteId, setUserDeleteId] = useState(null);
  const { defaultApplication } = useSelector((state) => state?.userDetails);
  const { userDetails } = useSelector((state) => state?.userDetails);
  const [newUserData, setNewUserData] = useState([]);
  const [userTotalCount, setUserTotalCount] = useState(0);
  const [count, setCount] = useState(0);
  // const[newOffset,setNewOffset]=useState(0)

  const appId = defaultApplication?.id;
  const offset = (page - 1) * rowsPerPage;

  const [getApplicationList, { isLoading: isUserLoading }] =
    useLazyGetApplicationDetailsByIdQuery();
  const [deleteUser, { isError, isSuccess }] = useDeleteUserDataMutation();
  const {socket} = useContext(WebsocketContext);
  const defaultApplicationRef = useRef();

  // Update User
  const [
    updateUser,
    { isError: isUserStatusError, isSuccess: isUserStatusSuccess },
  ] = useUpdateUserStatusApplicationMutation();

  // Use effect to set total pages based on count
  useEffect(() => {
    if (userTotalCount) {
      setTotalPages(Math.ceil(userTotalCount / rowsPerPage)); // Use rowsPerPage to calculate total pages dynamically
    }
  }, [userTotalCount, rowsPerPage]); // Dependency array includes count and rowsPerPage

  const fetchUserList = async () => {
    if (isUserLoading) {
      dispatch(setUserLoading(true));
    }
    try {
      const payload = {
        id: appId,
        params: {
          limit: rowsPerPage,
          offset: offset,
          sortDirection: "asc",
          sortColumn: "name",
          searchKey: searchValue?.value,
        },
      };
      const respons = await getApplicationList(payload).unwrap();
      setNewUserData(respons?.results?.userIds);
      setUserTotalCount(respons?.results?.count?.totalCount);
      setTotalPages(
        Math.ceil(respons?.results?.count?.totalCount / rowsPerPage)
      ); // Use rowsPerPage to calculate total pages dynamically
      dispatch(setGetUserList(respons?.results));
      dispatch(setUserLoading(false));
    } catch (error) {
      toast.dismiss();
      toast.error(error?.message);
      dispatch(setUserError(error.message));
    }
  };

  useEffect(() => {
    if (appId) {
      fetchUserList();
    }
  }, [searchValue?.value, defaultApplication, rowsPerPage, offset]);

  // Confirm Delete Modal
  const handleOpenConfirmDelete = (id) => {
    setOpenConfirmDeleteModal(true);
    console.log("id", id);
    setUserDeleteId(id);
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDeleteModal(false);
  };

  // For Assign User
  const handleOpenAssignUser = () => {
    setOpenAssignUser(true);
  };

  const handleCloseAssignUser = () => {
    setOpenAssignUser(false);
  };

  // For open Edit Role

  const handleOpenEditRole = (row) => {
    setOpenConfirmEdit(row);
    setOpenEditRole(true);
  };

  const handleCloseEditRole = () => {
    setOpenEditRole(false);
  };

  // Search
  const handleSearch = () => {
    setIsShowCursor(true);
  };

  // Get All User List

  // Delete
  const fetchDeleteUser = async () => {
    const payload = {
      applicationId: defaultApplication?.id,
      projectId: defaultApplication?.projectId,
      deleteUserId: userDeleteId,
    };

    try {
      const result = await deleteUser(payload).unwrap();
      fetchUserList();
      const msg = result?.message;
      socket.emit("onProjects", {
        command: "removeUser",
        organizationId: userDetails?.organizationId,
        user: {
          userName: userDetails?.userName,
          userId: userDetails?.userId,
        },
        data: {
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          deleteUserId: userDeleteId,
        },
      });
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

  const handleToggleChange = (isActive, rowId) => {
    fetchUpdateUserStatusChange(isActive, rowId);
  };

  // Update Status
  const fetchUpdateUserStatusChange = async (isActive, rowId) => {
    const statusPayload = {
      projectId: defaultApplication?.projectId,
      applicationId: defaultApplication?.id,
      isActive: !isActive,
      userId: rowId,
    };

    try {
      const result = await updateUser(statusPayload).unwrap();
      socket.emit("onProjects", {
        command: "updateUser",
        organizationId: userDetails?.organizationId,
        user: {
          userName: userDetails?.userName,
          userId: userDetails?.userId,
        },
        data: {
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          isActive: !isActive,
          userId: rowId,
        },
      });
      fetchUserList();
      const msg = result?.message;
      if (isUserStatusSuccess || msg) {
        toast.success(msg);
      }
    } catch (error) {
      console.error("Error deleting scheduler:", error);
      const errMsg = error?.data?.details;
      if (isUserStatusError || errMsg) {
        toast.error(errMsg);
      }
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

  const noEmojiValidation = (value) => {
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    return emojiRegex.test(value);
  };

  const handelUserSocket = async (response) => {
    const { project } = response?.data;
    const { projectId, applicationId } = response?.data;
    const application = project?.applicationIds?.filter(
      (app) => app?._id == defaultApplication?.id
    );
    if (
      (defaultApplicationRef?.current?.id == applicationId || application) &&
      defaultApplicationRef?.current?.projectId === (project?._id || projectId)
    ) {
      if (response?.command === "inviteUser") {
        const { userIds } = response?.data;
        setNewUserData((pre) => {
          const newUsers = userIds.filter(
            (newUser) =>
              !pre.some((existingUser) => existingUser?._id === newUser?._id)
          );
          return [...pre, ...newUsers];
        });
      }

      if (response?.command === "removeUser") {
        const { deleteUserId } = response?.data;
        setNewUserData((pre) => {
          return pre.filter((item) => item?._id !== deleteUserId);
        });
      }

      if (response?.command === "updateUser") {
        const { userId, status } = response?.data;
        setNewUserData((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, isActive: status } : user
          )
        );
      }

      if (response?.command === "updateUserRole") {
        const { userId, userRole } = response?.data;
        setNewUserData((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, userRole: userRole } : user
          )
        );
      }
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("onProjectResponse", handelUserSocket);
      return () => {
        socket.off("onProjectResponse", handelUserSocket);
      };
    }
  }, []);

  useEffect(() => {
    defaultApplicationRef.current = defaultApplication;
  }, [defaultApplication]);

  return (
    <>
      <div className="flex flex-col">
        <div className="text-[20px] font-medium leading-7 text-igy1">Users</div>

        <Modal
          isOpen={openConfirmDeleteModal}
          onClose={handleCloseConfirmDelete}
          className="rounded-[16px]"
        >
          <ConfirmDeleteModal
            onClick={handleCloseConfirmDelete}
            fetchUserList={fetchDeleteUser}
          />
        </Modal>
        <div className="items-center justify-between gap-3 mt-4 mdMax:mt-2 xl:flex testcase-search">
          <Switcher setSearchValue={setSearchValue}/>
          <>
            <div className="flex mdMax:flex-col gap-4 items-center mt-[34px] mdMax:mt-[10px]">
              <div className="flex gap-2 mdMax:mb-3 mdMax:order-2 mdMax:w-full">
                <CustomButton
                  label="Assign User"
                  className="w-[127px] h-[36px]"
                  onClick={() => {
                    handleOpenAssignUser();
                  }}
                />
              </div>

              <Modal isOpen={openAssignUser} onClose={handleCloseAssignUser}>
                <AssignUserModal
                  onClick={handleCloseAssignUser}
                  getList={() => fetchUserList()}
                />
              </Modal>

              <Modal isOpen={openEditRole} onClose={handleCloseEditRole}>
                <EditRole
                  onClick={handleCloseEditRole}
                  openConfirmEdit={openConfirmEdit}
                  getList={() => {
                    setSearchValue({ value: "" });
                    fetchUserList();
                  }}
                  selectedApplication={defaultApplication}
                  selectedProject={defaultApplication}
                />
              </Modal>

              <div className="mdMax:w-full w-[275px]">
                <SearchInput
                  autoFocusProp={isShowCursor ? true : undefined}
                  placeHolder="Search"
                  maxLength={255}
                  onIconClick={handleSearch}
                  onChange={(e) => {
                    const value = e?.target?.value;
                    if (value === " " && value?.length === 1) {
                      setSearchValue({ value: "", error: null });
                    } else if (noEmojiValidation(value)) {
                      setSearchValue({
                        value,
                        error: "Emojis are not allowed.",
                      });
                    } else {
                      setSearchValue({ value, error: null });
                    }
                  }}
                  value={searchValue.value}
                  error={searchValue.error}
                />
              </div>
            </div>
          </>
        </div>
        <div>
          <>
            <div className="mt-4 bg-iwhite p-5 rounded-[8px] table-div mdMax:mt-0">
              <div className="tableScroll !h-[calc(100vh-340px)]">
                <Table
                  isLoading={isUserLoading}
                  data={newUserData}
                  columns={[
                    {
                      tHeadClass: "w-[10%] !text-left pl-[60px] mdMax:pl-[20px]",
                      tbodyClass: "text-igy1 text-sm font-normal",
                      label: "Profile",
                      cell: (row, index) => (
                        <div className="flex items-center justify-start">
                          <div
                            className={`w-[40px] h-[40px] rounded-[50%] flex items-center justify-center ${
                              colors[index % colors.length]
                            }`}
                          >
                            {row?.name && `${row?.name[0]?.toUpperCase()}`}
                          </div>
                        </div>
                      ),
                    },
                    {
                      tHeadClass: "w-[10%] !text-left",
                      tbodyClass: "text-igy1 text-sm font-normal",
                      label: "Name",
                      column: "name",
                      cell: (row) => (
                        <>
                          <div className="flex items-center gap-2">
                            <div
                              className={`!text-left ${
                                row?.name?.length > 30 && "cursor-pointer"
                              }`}
                            >
                              <div
                                data-tooltip-id="name"
                                data-tooltip-content={
                                  row?.name?.length > 30 ? row?.name : ""
                                }
                                className="w-fit capitalize"
                              >
                                {row?.name
                                  ? textEllipsis(`${row?.name}`, 30)
                                  : "--"}
                              </div>
                            </div>
                            <div>
                              {row?.userRole === "OWNER" && (
                                <img src={verfiedImage} alt="verifiedImage" />
                              )}
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
                      tHeadClass: "w-[14%] !text-left",
                      tbodyClass: "text-igy1 text-sm font-normal",
                      label: "Email",
                      column: "email",
                      cell: (row) => (
                        <>
                          <div className="flex items-center gap-2">
                            <div
                              className={`${
                                row?.email?.length > 30 && "cursor-pointer"
                              }`}
                            >
                              <div
                                data-tooltip-id="email"
                                data-tooltip-content={
                                  row?.email?.length > 30 ? row?.email : ""
                                }
                                className="w-fit"
                              >
                                {row?.email
                                  ? textEllipsis(`${row?.email}`, 30)
                                  : "--"}
                              </div>
                            </div>
                          </div>
                          <Tooltip
                            id="email"
                            place="bottom"
                            className="!text-[11px] max-w-[300px] break-all !text-left"
                          />
                        </>
                      ),
                    },
                    {
                      tHeadClass: "w-[14%]",
                      label: "Status",
                      column: "status",
                      cell: (row) => (
                        <div className="flex items-center justify-center">
                          <TestPlansToggleButton
                            key={`${row?._id}-${row?.isActive}`} // Unique key for each row based on its ID and isActive status
                            onToggleChange={() =>
                              handleToggleChange(row?.isActive, row?._id)
                            }
                            isChecked={row?.isActive}
                            disableProp={row?._id === userDetails?._id && true}
                          />
                        </div>
                      ),
                    },
                    {
                      tHeadClass: "w-[14%]",
                      tbodyClass: "text-igy1 text-sm font-normal",
                      label: "Actions",
                      column: "actions",
                      cell: (row) => (
                        <div className="flex justify-center items-center gap-[25px]">
                          {row?._id === userDetails?._id ? (
                            <div className="flex items-center gap-6">
                              <div>
                                <CustomTooltip
                                  title="Edit"
                                  placement="bottom"
                                  height={"28px"}
                                  fontSize="11px"
                                  offset={[0, -3]}
                                >
                                  <ModeOutlinedIcon className="!w-[20px] !h-[20px] text-igy6 cursor-pointer" />
                                </CustomTooltip>
                              </div>

                              <div>
                                <CustomTooltip
                                  title="Delete"
                                  placement="bottom"
                                  height={"28px"}
                                  fontSize="11px"
                                  offset={[0, -3]}
                                >
                                  <span>
                                    <RiDeleteBin6Line className="w-[20px] h-[20px] text-igy6 cursor-pointer" />
                                  </span>
                                </CustomTooltip>
                              </div>
                            </div>
                          ) : row?.isActive === false ? (
                            <div className="flex items-center gap-6">
                              <div>
                                <CustomTooltip
                                  title="Edit"
                                  placement="bottom"
                                  height={"28px"}
                                  fontSize="11px"
                                  offset={[0, -3]}
                                >
                                  <ModeOutlinedIcon className="!w-[20px] !h-[20px] text-igy6 cursor-pointer" />
                                </CustomTooltip>
                              </div>
                              <div>
                                <CustomTooltip
                                  title="Delete"
                                  placement="bottom"
                                  height={"28px"}
                                  fontSize="11px"
                                  offset={[0, -3]}
                                >
                                  <span>
                                    <RiDeleteBin6Line
                                      style={{
                                        cursor: "pointer",
                                        fontSize: "20px",

                                        color: "#F64242",
                                      }}
                                      onClick={() => {
                                        handleOpenConfirmDelete(row?._id);
                                      }}
                                    />
                                  </span>
                                </CustomTooltip>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-6">
                              <div>
                                <CustomTooltip
                                  title="Edit"
                                  placement="bottom"
                                  height={"28px"}
                                  fontSize="11px"
                                  offset={[0, -3]}
                                >
                                  <ModeOutlinedIcon
                                    className="!w-[20px] !h-[20px] text-ibl1 cursor-pointer"
                                    onClick={() => {
                                      handleOpenEditRole(row);
                                    }}
                                  />
                                </CustomTooltip>
                              </div>
                              <div>
                                <CustomTooltip
                                  title="Delete"
                                  placement="bottom"
                                  height={"28px"}
                                  fontSize="11px"
                                  offset={[0, -3]}
                                >
                                  <span>
                                    <RiDeleteBin6Line
                                      style={{
                                        cursor: "pointer",

                                        fontSize: "20px",
                                        color: "#F64242",
                                      }}
                                      onClick={() => {
                                        handleOpenConfirmDelete(row?._id);
                                      }}
                                    />
                                  </span>
                                </CustomTooltip>
                              </div>
                            </div>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
                <div className="flex items-center justify-between mt-8 mb-[40px] pagination-row">
                  {!isUserLoading && userTotalCount > 0 && (
                    <div className="text-sm text-ibl1">{`Showing ${
                      newUserData?.length
                    } out of ${userTotalCount}`}</div>
                  )}
                  {!isUserLoading && userTotalCount > 25 && (
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
          </>
        </div>
      </div>
    </>
  );
};

export default Users;

const colors = ["bg-ibl2", "bg-ibl4", "bg-ign4", "bg-ipr1"];

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#052C85",
      contrastText: "#ffffff",
    },
  },
});
