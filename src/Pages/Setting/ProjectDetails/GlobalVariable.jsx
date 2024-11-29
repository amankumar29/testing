import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import SearchInput from "Components/Atoms/SearchInput/SearchInput";
import Table from "Components/Atoms/Table/Table";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import React, { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { RiDeleteBin6Line } from "react-icons/ri";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import AddVariableModal from "Components/Molecules/AddVariableModal/AddVariableModal";
import { useParams } from "react-router-dom";
import {
  useDeleteGlobalVariableMutation,
  useLazyGetGlobalVariableQuery,
} from "Services/API/apiHooks";
import { toast } from "react-toastify";
import { Pagination, ThemeProvider, createMuiTheme } from "@mui/material";
import { Modal } from "Components/Atoms/Modal/Modal";
import ConfirmDeleteModal from "Components/Molecules/ConfirmDeleteModal/ConfirmDeleteModal";

const GlobalVariable = () => {
  const { applicationId, projectId } = useParams();
  const [variableData, setVariableData] = useState([]);
  const [showAddVariableModal, setShowAddVariableModal] = useState(false);
  const [isEditVariable, setIsEditVariable] = useState(false);
  const [editVariableValue, setEditVariableValue] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isShowCursor, setIsShowCursor] = useState(false);
  const [searchValue, setSearchValue] = useState({
    value: "",
    error: null,
  });
  const [globalVariableCount, setGlobalVariableCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);
  const [globalId, setGlobalId] = useState(null);


  const [getGlobalVariableList, { isLoading: isGlobalVariableLoading }] =
    useLazyGetGlobalVariableQuery();

  const [deleteVariable] = useDeleteGlobalVariableMutation();

  const handleOpenVariableModal = () => {
    setShowAddVariableModal(true);
    setIsEditVariable(false);
  };

  const handleCloseVariableModal = () => {
    setShowAddVariableModal(false);
  };

  // const handleGetVariable = (value) => {
  //   if (isEditVariable) {
  //     setVariableData((prevData) =>
  //       prevData?.map((item, index) => (index === editIndex ? value : item))
  //     );
  //   } else {
  //     setVariableData((prevData) => [...prevData, value]);
  //   }
  // };

  // const handleDeleteVariable = (value) => {
  //   setVariableData((prevData) =>
  //     prevData?.filter((item) => item?.variableName !== value?.variableName)
  //   );
  // };

  const handleEditVariable = (row, index) => {
    setIsEditVariable(true);
    setEditVariableValue(row);
    setShowAddVariableModal(true);
    setEditIndex(index);
  };

  // Search
  const handleSearch = () => {
    setIsShowCursor(true);
  };

  const fetchGlobalVariableList = async () => {
    try {
      const body = {
        projectId: projectId,
        applicationId: applicationId,
        ...(searchValue.value && {
          search: searchValue?.value,
        }),
      };
      const response = await getGlobalVariableList(body).unwrap();
      const data = response?.results?.variables;
      console.log(data);
      setVariableData(data);
      setGlobalVariableCount(response?.results?.totalCount);
      setTotalPages(response?.results?.totalCount / rowsPerPage);
    } catch (error) {
      toast.error(error.msg);
    }
  };

  const fetchDeleteGlobalVariable = async () => {
    try {
      const result = await deleteVariable(globalId).unwrap();
      fetchGlobalVariableList();
      const msg = result?.message;
      toast.success(msg);
    } catch (error) {
      const errMsg = error?.data?.details;
      if (errMsg) {
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

  const handleOpenConfirmDelete = (id) => {
    setOpenConfirmDeleteModal(true);
    setGlobalId(id)
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDeleteModal(false);
  };


  const noEmojiValidation = (value) => {
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    return emojiRegex.test(value);
  };

  useEffect(() => {
    fetchGlobalVariableList();
  }, [applicationId, projectId, searchValue?.value]);

  return (
    <>
      <div className="flex flex-col mt-2">
        {/* Add Variable & Search */}
        <div className="flex justify-between items-center">
          <div className="text-xl font-medium text-ibl1">Global Variable</div>
          <div className="flex justify-center items-center gap-2">
            <div>
              <SearchInput
                autoFocusProp={isShowCursor ? true : undefined}
                placeHolder="Search Variable Name"
                className={"w-[300px]"}
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
            <>
              <div>
                <CustomButton
                  label="Add Variable"
                  onClick={handleOpenVariableModal}
                />
              </div>
              <AddVariableModal
                isOpen={showAddVariableModal}
                onClose={handleCloseVariableModal}
                // onGetVariable={(value) => {
                //   handleGetVariable(value);
                // }}
                isEditVariable={isEditVariable}
                initialValues={editVariableValue}
                applicationId={applicationId}
                projectId={projectId}
                fetchGlobalVariableList={fetchGlobalVariableList}
              />

              <Modal
                isOpen={openConfirmDeleteModal}
                onClose={handleCloseConfirmDelete}
                className="rounded-[16px]"
              >
                <ConfirmDeleteModal
                  onClick={handleCloseConfirmDelete}
                  fetchUserList={fetchDeleteGlobalVariable}
                />
              </Modal>
            </>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 h-[calc(100vh-400px)] table-div table-global-var">
          <div className="tableScroll !h-full">
            <Table
              isLoading={isGlobalVariableLoading}
              data={variableData}
              columns={[
                {
                  tHeadClass: "w-[14%] !text-left pl-20",
                  tbodyClass: "text-igy1 text-sm font-normal",
                  label: "Variable Name",
                  column: "variableName",
                  cell: (row) => (
                    <>
                      <div className="flex items-center gap-2">
                        <div
                          className={`!text-left ${
                            row?.variableName?.length > 30 && "cursor-pointer"
                          }`}
                        >
                          <div
                            data-tooltip-id="variableName"
                            data-tooltip-content={
                              row?.variableName?.length > 30
                                ? row?.variableName
                                : ""
                            }
                            className="w-fit capitalize"
                          >
                            {row?.variableName}
                          </div>
                        </div>
                      </div>
                      <Tooltip
                        id="variableName"
                        place="bottom"
                        className="!text-[11px] max-w-[300px] break-all !text-left"
                      />
                    </>
                  ),
                },
                {
                  tHeadClass: "w-[14%] !text-left",
                  tbodyClass: "text-igy1 text-sm font-normal",
                  label: "Variable Value",
                  column: "variableValue",
                  cell: (row) => (
                    <>
                      <div className="flex items-center gap-2">
                        <div
                          className={`!text-left ${
                            row?.variableValue?.length > 30 && "cursor-pointer"
                          }`}
                        >
                          <div
                            data-tooltip-id="variableValue"
                            data-tooltip-content={
                              row?.variableValue?.length > 30
                                ? row?.variableValue
                                : ""
                            }
                            className="w-fit"
                          >
                            {row?.variableValue}
                          </div>
                        </div>
                      </div>
                      <Tooltip
                        id="variableValue"
                        place="bottom"
                        className="!text-[11px] max-w-[300px] break-all !text-left"
                      />
                    </>
                  ),
                },
                {
                  tHeadClass: "w-[14%]",
                  tbodyClass: "text-igy1 text-sm font-normal",
                  label: "Actions",
                  column: "actions",
                  cell: (row, index) => (
                    <div className="flex justify-center items-center gap-[25px]">
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
                                handleEditVariable(row, index);
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
                    </div>
                  ),
                },
              ]}
            />
            <div className="flex items-center justify-between my-8 pagination-row">
              {!isGlobalVariableLoading && globalVariableCount > 0 && (
                <div className="text-sm text-ibl1">{`Showing ${variableData?.length} out of ${globalVariableCount}`}</div>
              )}
              {!isGlobalVariableLoading && globalVariableCount > 25 && (
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
    </>
  );
};

export default GlobalVariable;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#052C85",
      contrastText: "#ffffff",
    },
  },
});
