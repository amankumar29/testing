import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Table from "../../../../Components/Atoms/Table/Table";
import textEllipsis from "../../../../Helpers/TextEllipsis/TextEllipsis";
import { Tooltip } from "react-tooltip";
import StatusDropDown from "../../../../Components/Atoms/StatusDropDown/StatusDropDown";
import LastRunHistory from "../../../../Components/Atoms/LastRunHistory/LastRunHistory";
import ActionIcons from "../../../../Components/Atoms/ActionIcons/ActionIcons";
import { ThemeProvider } from "@emotion/react";
import { createMuiTheme } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import {
  duplicateSuiteTestCase,
  getDuplicateList,
  getTestCasesList,
  getTestSuiteDetails,
  removeSuiteTestCase,
  statusDropDown,
  updateTestSuite,
} from "../../../../Services/API/Projects/Projects";
import { toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchInput from "../../../../Components/Atoms/SearchInput/SearchInput";
import { CustomButton } from "../../../../Components/Atoms/CustomButton/CustomButton";
import RunPopUp from "../../../../Components/Atoms/RunPopUp/RunPopUp";
import { Modal } from "../../../../Components/Atoms/Modal/Modal";
import AddNewTestCaseModal from "../../../../Components/Molecules/AddNewTestCaseModal/AddNewTestCaseModal";
import DropLoadDropdown from "../../../../Components/Atoms/DownLoadDropDown/DownLoadDropDown";
import DownloadForOfflineOutlinedIcon from "@mui/icons-material/DownloadForOfflineOutlined";
import styles from "./TestSuiteDetails.module.scss";
import { useOutsideClick } from "Hooks/useOutSideClick";
import CloseIcon from "@mui/icons-material/Close";
import AddNewTestSuiteModal from "../../../../Components/Molecules/AddNewTestSuiteModal/AddNewTestSuiteModal";
import { getTestCaseInfo } from "../../../../Services/API/TestCaseInfo/TestCaseInfo";
import CreateRunModal from "../../../../Components/Molecules/CreateRunModal/CreateRunModal";
import { setStorage } from "../../../../Storage";
import AddTestCaseModal from "../../../../Components/Molecules/AddTestCaseModal/AddTestCaseModal";
import { getSpreedsheet } from "../../../../Services/API/Spreadsheet/Spreadsheet";
import { ApkFileAlertModal } from "Components/Molecules/ApkFileAlertModal/ApkFileAlertModal";
import { useDispatch, useSelector, useStore } from "react-redux";
import { setsuiteIsCreated } from "Store/ducks/testCases";
import { ApplicationTypeEnum } from "Enums/ApplicationTypeEnum";
import { WebsocketContext } from "Services/Socket/socketProvider";
import CreateApiRunModal from "Components/Molecules/CreateApiRunModal/CreateApiRunModal";
import { fetchDefaultData } from "Helpers/DefaultApi/FetchDefaultApi";
import { useLazyGetUserDataQuery, useSetDefaultMutation } from "Services/API/apiHooks";

const TestSuiteDetails = () => {
  const location = useLocation();
  const navigateTo = useNavigate();
  const runDropDown = useRef(null);
  const { defaultApplication, userDetails } = useSelector(
    (state) => state?.userDetails
  );
  const [setDefault] = useSetDefaultMutation();
  const [getuserDetails] = useLazyGetUserDataQuery();
  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Blocked", value: "BLOCKED" },
    { label: "Draft", value: "DRAFT" },
    { label: "Obsolete", value: "OBSOLETE" },
  ];
  const requiredData = {
    id: location?.state?.id,
    project: location?.state?.project,
    application: location?.state?.application,
    name: location?.state?.name,
    isDuplicate: location?.state?.isDuplicate || defaultApplication?.isDefault,
    projectName: location?.state?.projectName,
    applicationName:
      location?.state?.applicationName || defaultApplication?.keyword_name,
    applicationType:
      location?.state?.applicationType || defaultApplication?.type,
  };

  const selectedApplication =
    location?.state?.application || defaultApplication;
  const checkApk = selectedApplication?.appData?.apkFile;

  const [isLoading, setIsLoading] = useState(false);
  const [testCasesData, setTestCasesData] = useState([]);
  const [allTestCasesData, setAllTestCasesData] = useState([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [dataCount, setDataCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [showRunPopup, setShowRunPopUp] = useState(false);
  const [openTestCaseModal, setOpenTestCaseModal] = useState(false);
  const [dropdown, setDropDown] = useState(false);
  const [searchKey, setSearchKey] = useState({
    value: "",
    error: null,
  });
  const [searchValue, setSearchValue] = useState("");
  const [checkedItems, setCheckedItems] = useState([]);
  const [rowId, setRowId] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [step, setStep] = useState(0);
  const [testCaseInfoLoading, setTestCaseInfoLoading] = useState(false);
  const [testCaseInfo, setTestCaseInfo] = useState([]);
  const [openCreateRunModal, setOpenCreateRunModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [testSuiteName, setTestSuiteName] = useState(location?.state?.name);
  const [closeActionPopup, setCloseActionPopup] = useState(false);
  const testSuiteId = location?.state?.id;
  const [sheetList, setSheetList] = useState([]);
  const [openApkModal, setOpenApkModal] = useState(false);
  const [activeRowRunPopup, setActiveRowRunPopup] = useState(null);
  const [activeRowMorePopup, setActiveRowMorePopup] = useState(null);
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);
  const [closeRunPopUp, setCloseRunPopUp] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [disableRunImage, setDisableRunImage] = useState(false);
  const [apiRunModal, setApiRunModal] = useState(false);
  const dispatch = useDispatch();
  const { socket } = useContext(WebsocketContext);
  const testCasesDataRef = useRef(testCasesData);
  const currentStore = useStore();

  //Api to call the test-cases list of a particular test-suite.
  const fetchTestCasesData = (limit, offset, callback) => {
    setIsLoading(true);
    const requestBody = {
      // applicationId: requiredData?.application?.id,
      // projectId: requiredData?.project?.id,
      applicationId: defaultApplication?.id,
      projectId: defaultApplication?.projectId,
      limit,
      offset,
      includeCount: true,
      searchKey: searchValue,
      sortColumn: "id",
      sortOrder: "Desc",
      withoutPagination: false,
    };

    getTestSuiteDetails(requiredData?.id, requestBody)
      .then((res) => {
        const data = res?.data?.results;
        setTestCasesData(data);
        setDataCount(res?.data?.count);
        setTotalPages(Math.ceil(res?.data?.count / limit));
        setCurrentOffset(res?.data?.offset);
        setTestSuiteName(res?.data?.results?.name);
        setIsLoading(false);
        if (callback) {
          callback(res?.data?.results);
        }
      })
      .catch((error) => {
        const message = error?.response?.data?.details;
        toast.error(message || "Error retrieving testcases list data");
        setIsLoading(false);
      });
  };

  const fetchAllTestCasesData = () => {
    const requestBody = {
      // applicationId: requiredData?.application?.id,
      // projectId: requiredData?.project?.id,
      applicationId: defaultApplication?.id,
      projectId: defaultApplication?.projectId,
      sortColumn: "id",
      sortOrder: "Desc",
      withoutPagination: true,
    };

    getTestSuiteDetails(requiredData?.id)
      .then((res) => {
        const data = res?.data?.results?.testCases;
        setAllTestCasesData(data);
      })
      .catch((error) => {
        const message = error?.response?.data?.details;
        toast.error(message || "Error retrieving testcases list data");
      });
  };

  //Function to Change the entries per page.
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 10);
    setPage(1);
    setRowsPerPage(newRowsPerPage);
    setCheckedItems([]);
    setRowId([]);
    fetchTestCasesData(newRowsPerPage, 0);
  };

  //Function to change the current page.
  const handleChangePage = (event, newPage) => {
    const offset = (newPage - 1) * rowsPerPage;
    setPage(newPage);
    setRowId([]);
    setCheckedItems([]);
    fetchTestCasesData(rowsPerPage, offset);
  };

  //API to change the status of a particular test-case.
  const handleStatusChange = (val, id) => {
    const status = {
      status: val,
    };
    statusDropDown(status, id)
      .then((res) => {
        const message =
          res?.data?.message || "Test Suite status updated successfully.";
        socket.emit("onTestcases", {
          command: "testCaseStatus",
          organizationId: userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user: {
            userName: userDetails?.userName,
            userId: userDetails?.userId,
          },
          data: {
            testCaseId: id,
            status: val,
          },
        });
        toast.success(message);
        fetchTestCasesData(rowsPerPage, 0);
        setPage(1);
        setSearchValue("");
        setSearchKey({
          value: "",
          error: null,
        });
        setRowId([]);
        setCheckedItems([]);
        setSelectedStatus((prev) => ({ ...prev, [id]: status }));
      })
      .catch((error) => {
        const message = error?.response?.data?.details;
        toast.error(message || "Error retrieving testcases status Updated");
        setRowId([]);
        setCheckedItems([]);
      });
  };

  //Function to store the searched Value
  const handleSearch = () => {
    const searchValueString = searchKey?.value?.trim();
    setSearchValue(searchValueString);
    setPage(1);
    setRowsPerPage(25);
    setCheckedItems([]);
    setRowId([]);
  };

  //Function to remove the test_case.
  const handleRemoveTestCase = (newId) => {
    const payload = {
      removedTestCases: [newId],
    };
    updateTestSuite(requiredData?.id, payload)
      .then((res) => {
        const message = res?.data?.message;
        socket.emit("onTestsuites", {
          command: "testSuiteCaseDelete",
          organizationId: userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user: {
            userName: userDetails?.userName,
            userId: userDetails?.userId,
          },
          data: {
            testCaseId: newId,
            targetSuiteId: requiredData?.id,
          },
        });
        setSearchValue("");
        toast.success(message);
        const offset = (page - 1) * rowsPerPage;
        fetchTestCasesData(rowsPerPage, offset);
        setRowId([]);
        setCheckedItems([]);
        fetchAllTestCasesData();
        setSearchKey({
          value: "",
          error: null,
        });
        dispatch(setsuiteIsCreated(true));
      })
      .catch((err) => {
        const errMsg = err?.response?.data?.details;
        toast.error(errMsg);
        setRowId([]);
        setCheckedItems([]);
      });
  };

  //Function to duplicate the test cases from test suites
  const handleDuplicateTestSuite = (id, name) => {
    const payload = {
      duplicateTestCaseName: name,
      originalTestCaseId: id,
      targetSuiteId: requiredData?.id,
    };
    getDuplicateList(payload)
      .then((res) => {
        const message = res?.data?.message;
        const offset = (page - 1) * rowsPerPage;
        setRowId([]);
        setCheckedItems([]);
        fetchTestCasesData(rowsPerPage, offset, (response) => {
          const duplicateList = response?.testCases?.filter(
            (testcase) => testcase?.testCaseName === name
          );
          socket.emit("onTestsuites", {
            command: "testSuiteCaseDuplicate",
            organizationId: userDetails?.organizationId,
            applicationId: defaultApplication?.id,
            projectId: defaultApplication?.projectId,
            user: {
              userName: userDetails?.userName,
              userId: userDetails?.userId,
            },
            data: {
              duplicateList: duplicateList,
              targetSuiteId: requiredData?.id,
            },
          });
          fetchAllTestCasesData();
          toast.success(message);
          dispatch(setsuiteIsCreated(true));
        });
      })
      .catch((err) => {
        const errMsg = err?.response?.data?.details;
        toast.error(errMsg);
        setRowId([]);
        setCheckedItems([]);
      });
  };

  const fetchTestCaseInfo = (newID) => {
    setTestCaseInfoLoading(true);
    getTestCaseInfo(newID)
      .then((res) => {
        const data = res?.data?.results;
        setTestCaseInfo(data);
        setTestCaseInfoLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setTestCaseInfoLoading(false);
      });
  };

  //Function to update the rowId of the testcase when selected or deselected.
  const updateRowId = (id, isChecked) => {
    setRowId((prevRowIds) => {
      if (isChecked) {
        // Add id if it's checked and not already in the array
        if (!prevRowIds.includes(id)) {
          return [...prevRowIds, id];
        }
      } else {
        // Remove id if it's unchecked
        return prevRowIds.filter((rowId) => rowId !== id);
      }
      return prevRowIds;
    });
  };

  //Function to handle checkbox change in the list screen.
  const handleCheckboxChange = (rowId, row) => (event) => {
    setCloseActionPopup(!closeActionPopup);
    setSelectedRow(row);
    const isChecked = event?.target?.checked;
    setCheckedItems((prevCheckedItems) => {
      const newCheckedItems = {
        ...prevCheckedItems,
        [rowId]: isChecked,
      };
      updateRowId(rowId, isChecked);
      return newCheckedItems;
    });
  };

  //Function to handle select All check boxes and Deselect all checkboxes.
  const handleSelectAllCheckboxes = () => {
    setCloseActionPopup(!closeActionPopup);
    const newCheckedItems = {};
    const newRowId = [];
    testCasesData?.testCases?.forEach((row) => {
      if (
        row?.noOfSteps >= 1 &&
        row?.status !== "OBSOLETE" &&
        row?.status !== "BLOCKED"
      ) {
        setSelectedRow(row);
        newCheckedItems[row?._id] = !selectAll;
        if (!selectAll) {
          newRowId.push(row?._id);
        }
      }
    });
    setCheckedItems(newCheckedItems);
    setRowId(newRowId);
    setSelectAll(!selectAll);
  };
  const testSuitDefault = () => {
    fetchDefaultData(setDefault, defaultApplication, getuserDetails); 
  }

  const RunTestSuiteData = () => {
    const offset = (page - 1) * rowsPerPage;
    fetchTestCasesData(rowsPerPage, offset);
    setSearchValue("");
    setSearchKey({
      value: "",
      error: null,
    });
    testSuitDefault()
  };

  // Handle for create run test commenting for future Ref
  const handleShowCreateRunModal = () => {
    setOpenCreateRunModal(true);
  };

  const handleCloseCreateRunModal = () => {
    setOpenCreateRunModal(false);
  };

  const closeRunPopup = () => {
    setShowRunPopUp(false);
  };

  const checkBoxesClear = () => {
    setSelectAll(false);
    setCheckedItems({});
    setRowId([]);
  };

  const handleCloseApkModal = () => {
    setOpenApkModal(false);
  };

  const handleOpenApkModal = () => {
    setOpenApkModal(true);
  };

  //useEffect to hit the test-case API, whenever the component re-renders
  useEffect(() => {
    fetchTestCasesData(25, 0);
    setRowsPerPage(25);
  }, [searchValue]);

  useEffect(() => {
    if (
      rowId?.length > 0 &&
      rowId?.length === testCasesData?.testCases?.length
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
      setShowRunPopUp(false);
    }
    setCloseRunPopUp(!closeRunPopUp);
    if (rowId?.length <= 1) {
      setDisableRunImage(false);
    } else {
      setDisableRunImage(true);
    }
  }, [rowId, checkedItems]);

  useOutsideClick(runDropDown, () => {
    if (showRunPopup) {
      setShowRunPopUp(!showRunPopup);
    }
  });

  useEffect(() => {
    fetchAllTestCasesData();
  }, []);

  useEffect(() => {
    if (requiredData?.application?.appData?.dataproviderId) {
      getSpreedsheet(requiredData?.application?.appData?.dataproviderId)
        .then((res) => {
          const data = res?.data?.sheets;
          const list = data.map((sheet) => ({
            id: sheet._id,
            keyword_name: sheet.sheetName,
          }));
          setSheetList(list);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [requiredData?.application]);

  const noEmojiValidation = (value) => {
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    return emojiRegex.test(value);
  };

  const handleRun = () => {
    if (selectedApplication?.type === ApplicationTypeEnum.API) {
      setApiRunModal(true);
    } else if (
      rowId?.length > 1 ||
      selectedApplication?.type === ApplicationTypeEnum?.TV ||
      selectedApplication?.type === ApplicationTypeEnum?.IOS ||
      selectedApplication?.type === ApplicationTypeEnum?.ANDROID
    ) {
      if (
        checkApk === false &&
        (selectedApplication?.type === ApplicationTypeEnum?.IOS ||
          selectedApplication?.type === ApplicationTypeEnum?.TV ||
          selectedApplication?.type === ApplicationTypeEnum?.ANDROID)
      ) {
        handleOpenApkModal();
      } else {
        handleShowCreateRunModal();
      }
    } else {
      setShowRunPopUp(true);
    }
  };

  const toggleDropdown = (id) => {
    setOpenStatusDropdownId((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    if (openStatusDropdownId != null) {
      setActiveRowRunPopup(null);
      setActiveRowMorePopup(null);
    }
  }, [openStatusDropdownId]);

  useEffect(() => {
    if (activeRowRunPopup != null) {
      setOpenStatusDropdownId(null);
    }
  }, [activeRowRunPopup]);

  useEffect(() => {
    if (activeRowMorePopup != null) {
      setOpenStatusDropdownId(null);
    }
  }, [activeRowMorePopup]);

  const closeStatusDropdown = () => {
    setOpenStatusDropdownId(null);
  };

  const closeRunMorePopup = () => {
    setShowRunPopUp(false);
  };

  const closeExportPopup = () => {
    setCheckedItems([]);
    setRowId([]);
  };

  const checkBoxUnCheckInTestCase = () => {
    closeExportPopup();
  };

  const TestCasesSocket = async (response) => {
    const sendUser = response?.user;
    const isAccess = requiredData?.id === response?.data?.targetSuiteId;
    const inList = testCasesDataRef.current?.testCases?.some(
      (obj) =>
        obj?._id ==
        (response?.data?.testCaseId || response?.data?.newObject?._id)
    );
    const { defaultApplication: currentProject } =
      currentStore?.getState()?.userDetails;
    if (
      currentProject?.id == response?.applicationId &&
      currentProject?.projectId === response?.projectId &&
      (isAccess || inList)
    ) {
      if (response?.command === "testCaseCreate") {
        const newItem = response?.data?.data;
        newItem.noOfSteps = newItem?.testSteps?.length || 0;
        const newData = [...testCasesDataRef.current?.testCases, newItem];
        const uniqueData = newData.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t._id === item._id)
        );
        setTestCasesData((pre) => ({
          ...pre,
          testCases: uniqueData,
        }));
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has created New Testcase ${newItem?._id}`
        );
      }

      if (response?.command === "testCaseStatus") {
        const { testCaseId, status } = response?.data;
        const newList = testCasesDataRef.current?.testCases?.map((item) =>
          item._id === testCaseId
            ? {
                ...item,
                status: status,
              }
            : item
        );
        setTestCasesData((pre) => ({
          ...pre,
          testCases: newList,
        }));
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has Updated ${testCaseId} TestCase Status`
        );
      }

      // TestCase update listener
      if (response?.command === "testCaseUpdate") {
        const { stepsList, testCaseId, newObject, type } = response?.data;
        console.log("1234", stepsList, testCaseId, newObject, type);
        if (type == "Replace") {
          const newList = testCasesDataRef.current?.testCases?.map((item) =>
            item._id === newObject?._id
              ? {
                  ...item,
                  ...newObject,
                  noOfSteps: newObject.testSteps?.length || 0,
                  testSteps: undefined,
                }
              : item
          );
          setTestCasesData((pre) => ({
            ...pre,
            testCases: newList,
          }));
        } else {
          const newList = testCasesDataRef.current?.testCases?.map((item) =>
            item._id === testCaseId
              ? {
                  ...item,
                  noOfSteps: stepsList?.length || 0,
                }
              : item
          );
          setTestCasesData((pre) => ({
            ...pre,
            testCases: newList,
          }));
        }
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has updated ${testCaseId} Testcase`
        );
      }
    }
  };

  const TestSuiteCaseSocket = async (response) => {
    const sendUser = response?.user;
    const isAccess =
      testCasesDataRef?.current?._id === response?.data?.targetSuiteId ||
      response?.data?.testsuiteId;
    const { defaultApplication: currentProject } =
      currentStore?.getState()?.userDetails;
    if (
      currentProject?.id == response?.applicationId &&
      currentProject?.projectId === response?.projectId &&
      isAccess
    ) {
      if (response?.command === "testSuiteCaseDelete") {
        const { testCaseId } = response?.data;
        const newData = testCasesDataRef.current?.testCases?.filter(
          (testCase) => testCase && testCase._id !== testCaseId
        );
        setTestCasesData((pre) => ({
          ...pre,
          testCases: newData,
        }));
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has Deleted ${testCaseId} Testcase`
        );
      }

      if (response?.command === "testSuiteUpdate") {
        const { TestCaseData } = response?.data;
        const newData = [
          ...testCasesDataRef.current?.testCases,
          ...TestCaseData,
        ];
        const uniqueData = newData.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t._id === item._id)
        );
        setTestCasesData((pre) => ({
          ...pre,
          testCases: uniqueData,
        }));
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has updated ${response?.data?.targetSuiteId} TestSuite`
        );
      }
      if (response?.command === "testSuiteCaseDuplicate") {
        const { duplicateList } = response?.data;
        const newData = [
          ...testCasesDataRef.current?.testCases,
          ...duplicateList,
        ];
        const uniqueData = newData.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t._id === item._id)
        );
        setTestCasesData((pre) => ({
          ...pre,
          testCases: uniqueData,
        }));
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has updated ${response?.data?.targetSuiteId} TestSuite`
        );
      }
    }
  };

  const spreadsheetSocket = async (response) => {
    const sendUser = response?.user;
    const { defaultApplication: currentProject } =
      currentStore?.getState()?.userDetails;
    if (
      currentProject?.id == response?.applicationId &&
      currentProject?.projectId === response?.projectId &&
      selectedApplication?.application?.appData?.dataproviderId ==
        response?.data?.spreadsheetId
    ) {
      if (response?.command == "renameSheet") {
        const { newData } = response?.data;
        const list = newData?.sheets?.map((sheet) => ({
          id: sheet._id,
          keyword_name: sheet.sheetName,
        }));
        setSheetList(list);
      }

      if (response?.command == "addSheet") {
        const { newSpreadsheet } = response?.data;
        const list = newSpreadsheet?.sheets?.map((sheet) => ({
          id: sheet._id,
          keyword_name: sheet.sheetName,
        }));
        setSheetList(list);
      }
    }
  };
  useEffect(() => {
    if (socket) {
      socket.on("onTestcasesResponse", TestCasesSocket);
      socket.on("onTestsuitesResponse", TestSuiteCaseSocket);
      socket.on("onSpreadsheetResponse", spreadsheetSocket);
      return () => {
        socket.off("onTestcasesResponse", TestCasesSocket);
        socket.off("onTestsuitesResponse", TestSuiteCaseSocket);
        socket.off("onSpreadsheetResponse", spreadsheetSocket);
      };
    }
  }, []);

  useEffect(() => {
    testCasesDataRef.current = testCasesData;
  }, [testCasesData]);

  return (
    <div>
      <div className="lg:flex items-center justify-between">
        <div className="flex items-center gap-4 mb-5 lg:mb-0">
          <div
            onClick={() =>
              navigateTo("/projects/test-suites", {
                state: {
                  id: requiredData?.project?.id,
                  keyword_name: requiredData?.project?.keyword_name,
                  defaultApplication: requiredData?.application,
                },
              })
            }
            className="cursor-pointer"
            data-testid="arrow_back_icon"
          >
            <ArrowBackIcon />
          </div>
          <>
            <p
              data-tooltip-id="testSuiteName"
              data-tooltip-content={
                testSuiteName?.length > 30 ? testSuiteName : ""
              }
              className={
                testSuiteName?.length > 30 ? "cursor-pointer" : undefined
              }
            >
              {`${textEllipsis(testSuiteName, 30)} Test Suite`}
            </p>
            <Tooltip
              id="testSuiteName"
              noArrow
              place="top"
              className="!text-[11px] max-w-[280px] break-all z-[999]"
            />
          </>
        </div>
        <div className="mdMax:grid grid-cols-2 grid-rows-auto flex items-center gap-4">
          <div className="w-full md:w-[296px] md:col-span-2 col-start-1 col-end-3">
            <SearchInput
              placeHolder="Search"
              maxLength={255}
              onIconClick={handleSearch}
              onChange={(e) => {
                const value = e?.target?.value;

                if (value.trim() === "") {
                  setSearchKey({ value: "", error: null });
                } else if (noEmojiValidation(value)) {
                  setSearchKey({ value, error: "Emojis are not allowed." });
                } else {
                  setSearchKey({ value, error: null });
                  handleSearch();
                }
              }}
              value={searchKey.value}
              error={searchKey.error}
            />
          </div>
          <div ref={runDropDown} className="col-start-1 col-end-2">
            {/* {rowId?.length > 1 ||
            selectedApplication.type === "TV" ||
            selectedApplication.type === "IOS" ||
            selectedApplication.type === "ANDROID" ? (
              <CustomButton
                className="!w-[91px] h-10"
                label="Run"
                isRunIcon={true}
                onClick={handleShowCreateRunModal}
              />
            ) : (
              <CustomButton
                className="!w-[91px] h-10"
                label="Run"
                isRunIcon={true}
                onClick={() => setShowRunPopUp(true)}
                disable={rowId?.length === 0}
              />
            )} */}
            <CustomButton
              className="!w-[91px] h-10"
              label="Run"
              isRunIcon={true}
              onClick={handleRun}
              disable={rowId?.length === 0}
            />

            <div className={`${styles.card_container}`}>
              {showRunPopup && (
                <div className={`${styles.runpopup}`}>
                  <RunPopUp
                    id={rowId}
                    type={"suite-test-cases"}
                    onCloseRunPopup={() => {
                      setShowRunPopUp(false);
                      setCheckedItems([]);
                      setRowId([]);
                      // closeRunPopup;
                    }}
                    selectedApplication={location?.state?.application}
                    nameData={selectedRow}
                    onRunCreated={RunTestSuiteData}
                    clearCheckBoxes={checkBoxesClear}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="col-start-2 col-end-3">
            <CustomButton
              label="Add Test Case"
              className="w-[181px]"
              isFocused
              onClick={() => setStep(1)}
              isAddBtn={true}
            />
            <Modal isOpen={step === 1} onClose={() => setStep(0)}>
              <div className="flex items-center justify-center w-auto h-full">
                <div className="w-[520px] h-[350px] rounded-2xl shadow-2xl flex flex-col items-center">
                  <div className="flex bg-ibl7 w-full rounded-t-[10px]">
                    <div className="w-full h-[80px] flex items-center">
                      <div
                        className="text-[18px] font-medium leading-7 w-[90%] text-center ml-[55px]"
                        data-testid="modal_heading"
                      >
                        Add Test Case
                      </div>

                      <div className="flex justify-end !pr-6">
                        <CloseIcon
                          onClick={() => setStep(0)}
                          className="cursor-pointer"
                          data-testid="close_Icon"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mx-12 text-center mt-10">
                    Are you creating a new test case or adding an existing test
                    case?
                  </p>
                  <div className="w-full flex items-center justify-center gap-4 mt-10">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-[220px] h-[65px] p-2 font-semibold border-2 border-solid border-ibl1 rounded-xl text-ibl1 hover:text-ibl3 hover:border-ibl3 hover:bg-ibl3 hover:bg-opacity-10 hover:transition-all hover:duration-300 hover:ease-in"
                    >
                      New Test Case
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-[220px] h-[65px] p-2 font-semibold border-2 border-solid border-ibl1 rounded-xl text-ibl1 hover:text-ibl3 hover:border-ibl3 hover:bg-ibl3 hover:bg-opacity-10 hover:transition-all hover:duration-300 hover:ease-in"
                    >
                      Existing Test Case
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
            <Modal isOpen={step === 2} onClose={() => setStep(0)}>
              <AddTestCaseModal
                onClick={() => setStep(0)}
                selectedProject={requiredData?.project}
                selectedApplication={requiredData?.application}
                testSuiteData={requiredData}
                type={"suite-test-cases"}
                sheetList={sheetList}
                backArrow={true}
                onBackNavigation={() => setStep(1)}
              />
            </Modal>
            <Modal isOpen={step === 3} onClose={() => setStep(0)}>
              <AddNewTestSuiteModal
                onClick={() => setStep(0)}
                getTestSuiteAPI={() => {
                  fetchTestCasesData(25, 0);
                  fetchAllTestCasesData();
                }}
                selectedProject={requiredData?.project}
                selectedApplication={requiredData?.application}
                backArrow={true}
                onBackNavigation={() => setStep(1)}
                existingTestCases={allTestCasesData}
                testSuiteName={testSuiteName}
                testSuiteId={requiredData?.id}
              />
            </Modal>
          </div>
          <Modal
            isOpen={openCreateRunModal}
            onClose={handleCloseCreateRunModal}
            isstopPropagationReq={true}
          >
            <CreateRunModal
              onClick={handleCloseCreateRunModal}
              id={rowId}
              onCloseRunPopup={() => {
                setShowRunPopUp(false);
                setCheckedItems([]);
                setRowId([]);
                // closeRunPopup;
              }}
              selectedApplication={location?.state?.application}
              onRunCreated={RunTestSuiteData}
              type={"suite-test-cases"}
              clearCheckBoxes={checkBoxesClear}
            />
          </Modal>

          <Modal
            isOpen={openApkModal}
            onClose={handleCloseApkModal}
            className="rounded-[16px]"
          >
            <ApkFileAlertModal
              onClick={handleCloseApkModal}
              projectId={requiredData?.project?.projectId}
              applicationId={requiredData?.application?.id}
              projectName={requiredData?.projectName}
              applicationName={requiredData?.applicationName}
              applicationType={requiredData?.applicationType}
            />
          </Modal>

          <Modal isOpen={apiRunModal} onClose={() => setApiRunModal(false)}>
            <CreateApiRunModal
              onClick={() => setApiRunModal(false)}
              runIds={rowId}
              type={"suite-test-cases"}
              onRunCreated={RunTestSuiteData}
              clearCheckBoxes={checkBoxesClear}
            />
          </Modal>
          {/* <div
            className="w-10 h-10  rounded-[10px] bg-iwhite border border-ibl1 flex justify-center items-center hover:bg-ibl24 cursor-pointer"
            // onMouseEnter={() => handleDropDownShow()}
            // onMouseLeave={() => handleDropDownHide()}
          >
            <DownloadForOfflineOutlinedIcon className="text-ibl1" />
            <div>
              {dropdown && (
                <DropLoadDropdown
                // options={downloadOptions}
                // onMouseLeave={() => handleDropDownHide()}
                // onChange={(option) => handleSelectExport(option)}
                // selectedOption={selectExportType}
                />
              )}
            </div>
          </div> */}
        </div>
      </div>
      <div className="mt-4 bg-iwhite p-5 rounded-[8px] table-div">
        <div className="tableScroll">
          <Table
            isLoading={isLoading}
            data={testCasesData?.testCases}
            checkbox={true}
            handleCheckboxChange={handleCheckboxChange}
            handleSelectAllCheckboxes={handleSelectAllCheckboxes}
            selectAll={selectAll}
            checkedItems={checkedItems}
            onRowClick={(row) => {
              const state = {
                testCaseId: row?._id,
                project: requiredData?.project,
                application: requiredData?.application,
                isEditRequired: true,
                isRunRequired: true,
                testSuiteData: requiredData,
                sheet_name: row?.testData?.sheetName,
                start_row: row?.testData?.startRow,
                end_row: row?.testData?.endRow,
                dependency_id: row?.dependencyId,
                test_case_name: row?.testCaseName,
                default_browser: row?.default_browser,
              };

              setStorage("ATC", JSON.stringify(state));
              navigateTo("/projects/test-suites/test-cases/add-test-steps", {
                state,
              });
            }}
            onRowClickPointer={true}
            columns={[
              {
                label: "",
                tHeadClass: "w-[5%]",
              },
              {
                tHeadClass: "w-[8%]",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "ID",
                column: "id",
                cell: (row) => (
                  <div className="flex items-center justify-center row-id">
                    {row?._id}
                  </div>
                ),
              },
              {
                tHeadClass: "w-[14%] text-left pl-4",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "Name",
                column: "test_case_name",
                cell: (row) => (
                  <>
                    <div
                      className={`!text-left w-fit ${
                        row?.testCaseName?.length > 30 && "cursor-pointer"
                      }`}
                    >
                      <div
                        data-tooltip-id="testCaseName"
                        data-tooltip-content={
                          row?.testCaseName?.length > 30
                            ? row?.testCaseName
                            : ""
                        }
                      >
                        {textEllipsis(row?.testCaseName, 30)}
                      </div>
                    </div>
                    <Tooltip
                      id="testCaseName"
                      place="bottom"
                      className="!text-[11px] max-w-[300px] break-all !text-left"
                    />
                  </>
                ),
              },
              {
                tHeadClass: "w-[14%]",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "No. Of Test Steps",
                column: "noOfSteps",
              },
              {
                tHeadClass: "w-[14%]",
                label: "Status",
                column: "status",
                cell: (row) => (
                  <div className="flex items-center justify-center">
                    <StatusDropDown
                      options={statusOptions}
                      data={row}
                      isOpen={openStatusDropdownId === row?._id}
                      toggleDropdown={() => toggleDropdown(row?._id)}
                      statusDropdownAPi={(val) =>
                        handleStatusChange(val, row?._id)
                      }
                      className="!ml-0"
                      selectedStatus={selectedStatus}
                    />
                  </div>
                ),
              },
              // {
              //   tHeadClass: "w-[14%]",
              //   tbodyClass: "text-igy1 text-sm font-normal",
              //   label: "Last Run History",
              //   column: "last run history",
              //   cell: (row) => (
              //     <div>
              //       <LastRunHistory row={row} />
              //     </div>
              //   ),
              // },
              {
                tHeadClass: "w-[14%]",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "Actions",
                column: "actions",
                cell: (row) => (
                  <div className="flex items-center justify-center">
                    <ActionIcons
                      data={row}
                      fetchDuplicateRow={handleDuplicateTestSuite}
                      fetchDeleteTestCase={() => handleRemoveTestCase(row?._id)}
                      transferData={() => {
                        fetchTestCasesData(25, 0);
                      }}
                      selectedProject={requiredData?.project}
                      selectedApplication={requiredData?.application}
                      id={row?._id}
                      paramType="suite-test-cases"
                      isRemove={true}
                      testSuiteData={requiredData}
                      testCaseLoading={testCaseInfoLoading}
                      testCaseInfo={row}
                      fetchTestCaseInfo={fetchTestCaseInfo}
                      onRowCheckBoxClear={() => {
                        setRowId([]);
                        setCheckedItems([]);
                      }}
                      testSuiteRowId={testSuiteId}
                      fetchTestCasesData={RunTestSuiteData}
                      checkApk={selectedApplication?.appData?.apkFile}
                      projectName={requiredData?.projectName}
                      applicationName={requiredData?.applicationName}
                      applicationType={requiredData?.applicationType}
                      setActiveRowRunPopup={setActiveRowRunPopup}
                      activeRowRunPopup={activeRowRunPopup}
                      setActiveRowMorePopup={setActiveRowMorePopup}
                      activeRowMorePopup={activeRowMorePopup}
                      closeStatusDropdown={closeStatusDropdown}
                      closeRunPopup={closeRunMorePopup}
                      setRunPopUpClear={() => setActiveRowRunPopup(null)}
                      setMorePopUpClear={() => setActiveRowMorePopup(null)}
                      suiteDetailsRunPopUp={closeRunPopUp}
                      disableRunImage={disableRunImage}
                      closeActionPopup={closeActionPopup}
                      closeExportPopup={closeExportPopup}
                      checkBoxUnCheckInTestCase={checkBoxUnCheckInTestCase}
                    />
                  </div>
                ),
              },
            ]}
          />
          <div className="flex items-center justify-between mt-8 mb-[10px]">
            {!isLoading && dataCount > 0 && (
              <div className="text-sm text-ibl1">{`Showing ${
                currentOffset + testCasesData?.testCases?.length
              } out of ${dataCount}`}</div>
            )}
            {!isLoading && dataCount > 25 && (
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
  );
};

export default TestSuiteDetails;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#052C85",
      contrastText: "#ffffff", // or any contrasting color
    },
  },
});
