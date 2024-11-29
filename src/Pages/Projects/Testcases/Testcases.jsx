import { ThemeProvider } from "@emotion/react";
import DownloadForOfflineOutlinedIcon from "@mui/icons-material/DownloadForOfflineOutlined";
import Pagination from "@mui/material/Pagination";
import DropLoadDropdown from "Components/Atoms/DownLoadDropDown/DownLoadDropDown";
import SearchInput from "Components/Atoms/SearchInput/SearchInput";
import StatusDropDown from "Components/Atoms/StatusDropDown/StatusDropDown";
import NewProjectApplicationModal from "Components/Molecules/NewProjectApplicationModal/NewProjectApplicationModal";
import { useOutsideClick } from "Hooks/useOutSideClick";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteTestCase } from "Services/API/DeleteTestCase/DeleteTestCase";
import styles from "./Testcases.module.scss";
import { createMuiTheme } from "@mui/material";
import ActionIcons from "Components/Atoms/ActionIcons/ActionIcons";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import { DrawerComponent } from "Components/Atoms/DrawerComponent/DrawerComponent";
import LastRunHistory from "Components/Atoms/LastRunHistory/LastRunHistory"; // this is usefull for feature reference
import { Modal } from "Components/Atoms/Modal/Modal";
import RunPopUp from "Components/Atoms/RunPopUp/RunPopUp";
import Table from "Components/Atoms/Table/Table";
import AddNewTestSuiteModal from "Components/Molecules/AddNewTestSuiteModal/AddNewTestSuiteModal";
import AddTestCaseModal from "Components/Molecules/AddTestCaseModal/AddTestCaseModal";
import { ApkFileAlertModal } from "Components/Molecules/ApkFileAlertModal/ApkFileAlertModal";
import CreateRunModal from "Components/Molecules/CreateRunModal/CreateRunModal";
import CreateSchedulerModal from "Components/Molecules/CreateSchedulerModal/CreateSchedulerModal";
import textEllipsis from "Helpers/TextEllipsis/TextEllipsis";
import { Tooltip } from "react-tooltip";
import {
  getDuplicateList,
  getTestCasesList,
  statusDropDown,
} from "Services/API/Projects/Projects";
import { getSpreedsheet } from "Services/API/Spreadsheet/Spreadsheet";
import { testCaseExport } from "Services/API/TestCase/TestCase";
import { setStorage } from "Storage";
import { ReactComponent as DisableDownloadForOfflineOutlinedIcon } from "../../../Assets/Images/DisableDownloadForOfflineOutlinedIcon.svg";
import TestCasesTabs from "../TestCasesTabs/TestCasesTabs";
import TestPlan from "../TestPlan/TestPlan";
import TestSuites from "../TestSuites/TestSuites";
import {
  setcaseCreated,
  setIsrunned,
  setTestCasesList,
} from "Store/ducks/testCases";
import { useDispatch, useSelector, useStore } from "react-redux";
import ImportCsvModal from "Components/Molecules/ImportCsvModal/ImportCsvModal";
import useImportCsvModal from "Store/useImportCsvModal";
import Switcher from "Components/Molecules/Switcher/Switcher";
import {
  useCreateApplicationMutation,
  useGetProjectListQuery,
  useGetUserDataQuery,
  useLazyGetUserDataQuery,
  useSetDefaultMutation,
} from "Services/API/apiHooks";
import {
  setGetAllProjects,
  setProjectList,
} from "Store/ducks/projectListSlice";
import {
  setDefaultApplication,
  setError,
  setLoading,
  setUserDetails,
} from "Store/ducks/userDetailsSlice";
import { ApplicationTypeEnum } from "Enums/ApplicationTypeEnum";
import { WebsocketContext } from "Services/Socket/socketProvider";
import CreateApiRunModal from "Components/Molecules/CreateApiRunModal/CreateApiRunModal";
import { fetchDefaultData } from "Helpers/DefaultApi/FetchDefaultApi";
import Cookies from "js-cookie";

const Testcases = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const runDropDown = useRef(null);

  const params = useParams();
  const { type } = params;
  const [searchValue, setSearchValue] = useState({
    value: "",
    error: null,
  });
  const List = useSelector((state) => state?.testCases?.testCases);
  const { defaultApplication, userDetails } = useSelector(
    (state) => state?.userDetails
  );
  const storedUser = localStorage.getItem("defaultApp");
  const storedProjectId = Cookies.get("projectId");
  const storedApplicationId = Cookies.get("applicationId");
  const { caseRunned, caseCreated } = useSelector((state) => state?.testCases);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [testcasesdata, setTestCasesData] = useState(List?.list || []);
  const [createApplication] = useCreateApplicationMutation();
  // const [page, setPage] = useState(
  //   List?.currentOffset ? Math.floor(List?.currentOffset / rowsPerPage) + 1 : 0   // this is usefull for feature purpose
  // );
  const [page, setPage] = useState(1); // for now i am mentioning like this later narendhra will change in the redux
  const [payload, setPayload] = useState("");
  const [isLoading, setIsLoading] = useState(
    List?.list?.length > 0 ? false : true
  );
  const [totalPages, setTotalPages] = useState(
    List?.totalCount ? Math.ceil(List?.totalCount / rowsPerPage) : 0
  );
  const [dropdown, setDropDown] = useState(false);
  const [openTestCaseModal, setOpenTestCaseModal] = useState(false);

  let selectedProject = (() => {
    try {
      return storedUser && storedUser !== "undefined"
        ? JSON.parse(storedUser)
        : null;
    } catch (error) {
      console.error("Error parsing storedUser:", error);
      return null;
    }
  })();

  let selectedApplication = selectedProject;
  // const [selectedProject, setSelectedProject] = useState(defaultApplication);
  // const [selectedApplication, setSelectedApplication] = useState(defaultApplication);
  const [showRunPopup, setShowRunPopUp] = useState(false);
  const [rowId, setRowId] = useState([]);
  const [applicationModal, setApplicationModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [checkedItems, setCheckedItems] = useState({}); // Initialize as empty object
  const [dataCount, setDataCount] = useState(List?.totalCount || 0);
  const [isCheckedRow, setIsCheckedRow] = useState(false);
  const [testCaseLoading, setTestCaseLoading] = useState(true);
  const [openTestSuite, setOpenTestSuite] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [selectExportType, setSelectExportType] = useState(null);
  const [testSuiteIds, setTestSuiteIds] = useState([]);
  const [allTestSuites, setAllTestSuites] = useState([]);
  const [testPlanIds, setTestPlanIds] = useState([]);
  const [testSuiteData, setTestSuiteData] = useState(false);
  const [clearCheckBox, setClearCheckBox] = useState(false);
  const [testPlanCheckBoxClear, setTestPlanCheckBoxClear] = useState(false);
  const [openCreateRunModal, setOpenCreateRunModal] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState({}); // New state for selected row data
  const [sheetList, setSheetList] = useState([]); // New state for selected row data
  const [openDrawer, setOpenDrawer] = useState(false);
  const [getPlanId, setGetPlanId] = useState(null);
  const [callTestPlan, setCallTestPlan] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openApkModal, setOpenApkModal] = useState(false);
  const [projectName, setProjectName] = useState({});
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);
  const [activeRowRunPopup, setActiveRowRunPopup] = useState(null);
  const [activeRowMorePopup, setActiveRowMorePopup] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [closeRunPopUp, setCloseRunPopUp] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [disableRunImage, setDisableRunImage] = useState(false);
  const dispatch = useDispatch();
  const [rowChanged, setRowChanged] = useState(false);
  const [pageChanged, setPageChanged] = useState(false);
  const [closeActionPopup, setCloseActionPopup] = useState(false);
  const { isOpen, setShow, setHide } = useImportCsvModal();
  const uniqId = getPlanId;
  // Commenting for future refrence
  const transferData = location;
  // const selectedProject = defaultApplication;
  // const selectedApplication = defaultApplication;
  const { socket } = useContext(WebsocketContext);
  const currentStore = useStore();
  const [apiRunModal, setApiRunModal] = useState(false);
  const [setDefault] = useSetDefaultMutation();
  const [getuserDetails] = useLazyGetUserDataQuery();

  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
  } = useGetUserDataQuery();

  useEffect(() => {
    if (
      !isUserLoading &&
      userData &&
      storedUser &&
      storedUser !== "undefined"
    ) {
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
        }
      }

      if (List?.list) {
        const filteredData = List?.list?.filter(
          (testCase) =>
            testCase?.projectId === selectedApplication?.projectId &&
            testCase?.applicationId === selectedApplication?.id
        );

        setTestCasesData(filteredData);
        setDataCount(filteredData?.length);
      }
    }
  }, [
    userData,
    storedApplicationId,
    storedProjectId,
    isUserLoading,
    userDetails,
    defaultApplication,
    List,
  ]);

  useEffect(() => {
    if (selectedProject?.appData?.dataproviderId) {
      getSpreedsheet(defaultApplication?.appData?.dataproviderId)
        .then((res) => {
          const data = res?.data?.sheets;
          const list = data?.map((sheet) => ({
            id: sheet?._id,
            keyword_name: sheet?.sheetName,
          }));
          setSheetList(list);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [defaultApplication]);

  // Update selectAll state when all checkboxes are checked/unchecked
  useEffect(() => {
    if (Object?.values(checkedItems)?.length) {
      const allValuesTrue = Object?.values(checkedItems)?.every(
        (value) => value === true
      );
      if (Object.keys(checkedItems)?.length == testcasesdata?.length) {
        setSelectAll(allValuesTrue);
      }
      if (Object?.values(checkedItems)?.some((value) => value === true)) {
        setIsCheckedRow(true);
        setIsChecked(true);
      } else {
        setIsCheckedRow(false);
        setIsChecked(false);
        setShowRunPopUp(false);
        setDisableRunImage(false);
      }
      setCloseRunPopUp(!closeRunPopUp);
    }
  }, [checkedItems]);

  // Function to handle checkbox change in table data rows
  const handleCheckboxChange = (rowId, row) => (event) => {
    setCloseActionPopup(!closeActionPopup);
    setDisableRunImage(false);
    setSelectedRowData(row);
    setDropDown(false);
    setOpenStatusDropdownId(null);
    const isChecked = event?.target?.checked;
    setCheckedItems((prevCheckedItems) => {
      const newCheckedItems = {
        ...prevCheckedItems,
        [rowId]: isChecked,
      };

      /* 
      Count how many checkboxes are checked:
      Object.values(newCheckedItems) returns an array that contains true or false values.
      Using filter(Boolean), we filter out only the true values (checked checkboxes).
      We then count how many checkboxes are checked.
      If more than one checkbox is checked, we disable the run image in the table row.
    */

      const checkedCount =
        Object?.values(newCheckedItems)?.filter(Boolean)?.length;
      if (checkedCount > 1) {
        setDisableRunImage(true);
      } else {
        setDisableRunImage(false);
      }

      updateRowId(rowId, isChecked);
      return newCheckedItems;
    });
  };

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

  // Function to check or uncheck all checkboxes in tbody
  const handleSelectAllCheckboxes = () => {
    setCloseActionPopup(!closeActionPopup);
    setDropDown(false);
    setShowRunPopUp(false);
    setOpenStatusDropdownId(null);
    const newCheckedItems = {};
    const newRowId = [];
    testcasesdata.forEach((row) => {
      if (
        row?.testSteps?.length >= 1 &&
        row?.status !== "BLOCKED" &&
        row?.status !== "OBSOLETE"
      ) {
        setSelectedRowData(row);
        newCheckedItems[row?._id] = !selectAll;
        if (!selectAll) {
          newRowId.push(row?._id);
        }
      }
    });
    setCheckedItems(newCheckedItems);
    setRowId(newRowId);
    setSelectAll(!selectAll);
    if (newRowId?.length <= 1) {
      setDisableRunImage(false);
    } else {
      setDisableRunImage(true);
    }
  };

  const handleDropDownShow = () => {
    setOpenStatusDropdownId(null);
    setDropDown(!dropdown);
  };

  const handleSearch = (value) => {
    const searchValueString = value?.trim();
    setPayload(searchValueString);
    setPage(1);
  };

  const fetchTestCasesData = (limit, offset) => {
    const offSet =
      List?.projectId != defaultApplication?.projectId ||
      List?.applicationId != defaultApplication?.id
        ? 0
        : offset;
    if (
      List?.list?.length == 0 ||
      rowChanged ||
      pageChanged ||
      List?.projectId != defaultApplication?.projectId ||
      List?.applicationId != defaultApplication?.id ||
      caseRunned ||
      caseCreated
    ) {
      const requestBody = {
        applicationId: defaultApplication?.id,
        projectId: defaultApplication?.projectId,
        limit,
        offset: offSet,
        search: payload ? payload : "",
        includeCount: true,
        sort: "_id",
        sortDirection: "desc",
      };
      setIsLoading(true);
      getTestCasesList(requestBody)
        .then((res) => {
          const data = res?.data?.results;
          setTestCasesData(data);
          dispatch(
            setTestCasesList({
              projectId: selectedProject?.projectId,
              applicationId: selectedApplication?.id,
              currentOffset: offSet,
              totalCount: res?.data?.count,
              list: data,
            })
          );
          if (
            List?.projectId != defaultApplication?.projectId ||
            List?.applicationId != defaultApplication?.id
          ) {
            setPage(1);
          }
          setDataCount(res?.data?.count);
          setIsLoading(false);
          setTotalPages(Math.ceil(res?.data?.count / limit));
          setCurrentOffset(res?.data?.offset);
          setSelectAll(false);
          setCheckedItems({});
          setIsCheckedRow(false);
          setDisableRunImage(false);
          setIsChecked(false);
          setPageChanged(false);
          setRowChanged(false);
        })
        .catch((error) => {
          const message = error?.response?.data?.details;
          setTestCasesData([]);
          dispatch(
            setTestCasesList({
              projectId: selectedProject?.projectId,
              applicationId: selectedApplication?.id,
              currentOffset: offSet,
              totalCount: "",
              list: "",
            })
          );
          if (message !== "No test cases found") {
            toast.dismiss();
            toast.error(message || "Error retrieving testcases list data");
          }
          setIsLoading(false);
        });
      dispatch(setIsrunned({ type: type, value: false }));
      dispatch(setcaseCreated(true));
      setDataCount(0);
    }
  };

  const statusDropdownAPi = (val, id) => {
    const status = {
      status: val,
    };
    statusDropDown(status, id)
      .then((res) => {
        const message =
          res?.data?.message || "Test Case status updated successfully.";
        const offset = (page - 1) * rowsPerPage;
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
        const newList = List?.list?.map((item) =>
          item?.id === id ? { ...item, status: status?.status } : item
        );
        dispatch(setTestCasesList({ ...List, list: newList }));
        setTestCasesData(newList);
        setRowsPerPage(rowsPerPage, offset);
        toast.success(message);
        setRowId([]);
        setPage(1);
        setPayload("");
        setSelectedStatus((prev) => ({ ...prev, [id]: status }));
        fetchTestCaseAPI();
      })
      .catch((error) => {
        const message = error?.response?.data?.details;
        toast.error(message || "Error retrieving testcases status Updated");
      });
  };

  useEffect(() => {
    const offset = (page - 1) * rowsPerPage;
    if (defaultApplication?.id && type === "test-cases") {
      fetchTestCasesData(rowsPerPage, offset);
    }
  }, [rowsPerPage, page, payload, type, defaultApplication]);

  const handleChangePage = (event, newPage) => {
    const offset = (newPage - 1) * rowsPerPage;
    setPage(newPage);
    setCheckedItems({});
    setRowId([]);
    setSelectAll(false);
    setIsCheckedRow(false);
    setPageChanged(true);
    setIsLoading(true);
    fetchTestCasesData(rowsPerPage, offset);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 10);
    setPage(1);
    setCheckedItems({});
    setRowId([]);
    setSelectAll(false);
    setIsCheckedRow(false);
    setRowsPerPage(newRowsPerPage);
    setRowChanged(true);
    setIsLoading(true);
  };

  const handleOpenTest = () => {
    setDropDown(false);
    setOpenTestCaseModal(true);
  };

  const handleCloseTest = () => {
    setOpenTestCaseModal(false);
  };

  const handleOpenTestCaseProject = () => {
    navigate(`/projects/add-new-project`, {
      state: {
        paramType: params?.type,
      },
    });
  };

  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Blocked", value: "BLOCKED" },
    { label: "Draft", value: "DRAFT" },
    { label: "Obsolete", value: "OBSOLETE" },
  ];

  useOutsideClick(dropdownRef, () => {
    if (dropdown) {
      setDropDown(false);
    }
  });

  const runHandleClick = () => {
    setShowRunPopUp(true);
  };

  const closeRunPopup = () => {
    setShowRunPopUp(false);
  };

  // Navigated to Test Plans
  const handleAddNewTestPlans = () => {
    if (
      selectedApplication?.appData?.apkFile === null &&
      (selectedApplication?.type === ApplicationTypeEnum?.IOS ||
        selectedApplication?.type === ApplicationTypeEnum?.TV ||
        selectedApplication?.type === ApplicationTypeEnum?.ANDROID)
    ) {
      handleOpenApkModal();
    } else {
      setOpenDrawer(true);
      setGetPlanId(null);
    }
  };

  // Navigate to Test Suite
  const handleAddTestSuite = () => {
    setOpenTestSuite(true);
  };

  useOutsideClick(runDropDown, () => {
    if (showRunPopup) {
      setShowRunPopUp(!showRunPopup);
    }
  });

  const fetchDuplicateRow = (id, name) => {
    const payload = {
      originalTestCaseId: id,
      duplicateTestCaseName: name,
    };
    getDuplicateList(payload)
      .then((res) => {
        const message = res?.data?.message;
        const offset = (page - 1) * rowsPerPage;
        socket.emit("onTestcases", {
          command: "testCaseDuplicate",
          organizationId: userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user: {
            userName: userDetails?.userName,
            userId: userDetails?.userId,
          },
          data: {
            testCase: res?.data?.results,
          },
        });
        dispatch(setTestCasesList({ ...List, list: [] }));
        setRowsPerPage(rowsPerPage, offset);
        setPage(1);
        setPayload({});
        toast.success(message);
        setIsCheckedRow(false);
        setRowId([]);
        setSearchValue({
          value: "",
          error: null,
        });
      })
      .catch((err) => {
        const errMsg = err?.response?.data?.details;
        toast.error(errMsg);
      });
  };

  const fetchDeleteTestCase = (newId) => {
    deleteTestCase(newId)
      .then((res) => {
        const message = res?.data?.message;
        const offset = (page - 1) * rowsPerPage;
        socket.emit("onTestcases", {
          command: "testCaseDelete",
          organizationId: userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user: {
            userName: userDetails?.userName,
            userId: userDetails?.userId,
          },
          data: {
            testCaseId: newId,
          },
        });
        dispatch(
          setTestCasesList({
            ...List,
            currentOffset: 0,
            totalCount: 0,
            list: [],
          })
        );
        setRowsPerPage(rowsPerPage, offset);
        setPage(1);
        setPayload({});
        toast.success(message);
        setIsCheckedRow(false);
        setRowId([]);
      })
      .catch((err) => {
        console.log(err);
        const errMsg = err?.response?.data?.details;
        toast.error(errMsg);
      });
  };

  const fetchExportResult = (payload) => {
    setIsLoading(true);
    testCaseExport(payload)
      .then((res) => {
        if (!(res.data instanceof Blob)) {
          throw new Error("Response is not a Blob");
        }

        const blob = res?.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download =
          payload?.exportType === "csv" ? "test_cases.csv" : "test_cases.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        console.log("File downloaded successfully");
        setIsLoading(false);
        setIsChecked(false);
        setDisableRunImage(false);
      })
      .catch((err) => {
        console.log("Error occurred:", err);
        setIsLoading(false);
        setIsChecked(false);
      });
  };

  const handleCloseTestSuite = () => {
    setOpenTestSuite(false);
  };

  const handleSelectExport = (option) => {
    setSelectExportType(option);
    const payload = {
      exportType: option?.value,
      testCaseIds: rowId,
    };

    if (rowId?.length > 0) {
      fetchExportResult(payload);
    } else {
      const message = "Please Select for downloading";
      toast.error(message);
    }
    setSelectAll(false);
    setIsCheckedRow(false);
    resetCheckboxes();
  };

  useEffect(() => {
    setSearchValue({
      value: "",
      error: null,
    });
    setPayload((prev) => {
      if (prev && Object.keys(prev).length > 0) {
        return {};
      }
      return prev;
    });
    setPage(1);
    setTestCasesData(List?.list || []);
    setPayload("");
    setPage(
      List?.currentOffset
        ? Math.floor(List?.currentOffset / rowsPerPage) + 1
        : 1
    );
    setSelectAll(false);
    setIsCheckedRow(false);
    setRowsPerPage(25);
  }, [type]);

  // Function to reset checkboxes
  const resetCheckboxes = () => {
    setCheckedItems({});
    setSelectAll(false);
    setRowId([]);
  };

  // Handle Export for Test Suite Need to Integrate
  const handleExportSuite = () => {};

  // Handle Export for Test Plan Need to Integrate
  const handleExportPlan = () => {};

  // Handle for create run test commenting for future Ref
  const handleShowCreateRunModal = () => {
    setOpenCreateRunModal(true);
    setShowRunPopUp(false);
    setDropDown(false);
  };

  const handleCloseCreateRunModal = () => {
    setOpenCreateRunModal(false);
  };

  const handleCloseApkModal = () => {
    setOpenApkModal(false);
  };

  const handleOpenApkModal = () => {
    setOpenApkModal(true);
  };

  useEffect(() => {
    if (rowId?.length > 0 && rowId?.length === testcasesdata?.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [rowId]);

  const getTestSuiteAPI = () => {
    setTestSuiteData(!testSuiteData);
    setPayload({});
    setSearchValue({
      value: "",
      error: null,
    });
  };

  const checkBoxesClear = () => {
    setSelectAll(false);
    setCheckedItems({});
    setIsCheckedRow(!isCheckedRow);
    setClearCheckBox(!clearCheckBox);
    setTestPlanCheckBoxClear(!testPlanCheckBoxClear);
    setRowId([]);
    setDisableRunImage(false);
  };

  const rowCheckBoxClear = () => {
    setCheckedItems({});
    setIsCheckedRow(false);
    setSelectAll(false);
    const offset = (page - 1) * rowsPerPage;
    setRowsPerPage(rowsPerPage, offset);
  };

  // run button enable default api call for specific run, multiple selected run button
  const enableRunButtonDefault = () => {
    fetchDefaultData(setDefault, defaultApplication, getuserDetails);
  };

  const RunTestCasesData = () => {
    setSearchValue({
      value: "",
      error: null,
    });
    setPayload({});
    const offset = (page - 1) * rowsPerPage;
    setRowsPerPage(rowsPerPage, offset);
    enableRunButtonDefault();
  };

  const clearCheckBoxValues = () => {
    const offset = (page - 1) * rowsPerPage;
    setRowsPerPage(rowsPerPage, offset);
    setRowId([]);
    setCheckedItems({});
    setIsCheckedRow(false);
    setSelectAll(false);
  };

  const handleOpenApplicationModal = () => {
    setApplicationModal(true);
  };

  const hideApplicationModal = () => {
    setApplicationModal(false);
  };

  const callApplicationList = () => {
    // getAllApplicationList();
  };

  const noEmojiValidation = (value) => {
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    return emojiRegex.test(value);
  };

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    if (value === " " && value?.length === 1) {
      setSearchValue({ value: "", error: null });
    } else if (noEmojiValidation(value)) {
      setSearchValue({ value, error: "Emojis are not allowed." });
    } else {
      setSearchValue({ value, error: null });
      handleSearch(value); // Trigger search immediately without delay
    }

    // Reset checkboxes if search value is cleared
    if (value.trim() === "") {
      resetCheckboxes();
    }
  };

  const toggleDropdown = (id) => {
    setDropDown(false);
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
    setDropDown(false);
    setOpenStatusDropdownId(null);
  };

  const closeRunMorePopup = () => {
    setShowRunPopUp(false);
  };

  const setRowRunImage = () => {
    setDisableRunImage(false);
  };

  const handleImportCsvModal = () => {
    setShow();
    setDropDown(false);
  };

  const handleCloseImportModal = () => {
    const offset = (page - 1) * rowsPerPage;
    setHide();
    fetchTestCasesData(rowsPerPage, offset);
  };

  const closehandlerImportModal = () => {
    setHide();
  };

  const fetchTestCaseAPI = () => {
    const offset = (page - 1) * rowsPerPage;
    fetchTestCasesData(rowsPerPage, offset);
  };

  const closeExportPopup = () => {
    setDropDown(false);
    clearTestCasesValues();
  };

  const {
    data: projectData,
    error: projectError,
    isLoading: isProjectLoading,
    refetch: fetchProjectData,
  } = useGetProjectListQuery({});

  const createNewApplication = async (values) => {
    const transformedData = values?.map((item, index) => {
      return {
        projectId: defaultApplication?.projectId,
        name: item?.name?.trim(),
        type: item?.selectedOption?.type.toUpperCase(),
        isActive: true,
        appSettings: {
          videoRecord: item?.selectedVideoRecording,
          screenShotType: item?.selectedScreenshot,
        },
        retryCount: item?.retryTestFail,
        channels: {
          email: item?.emailId,
          reportDelivery: item?.components?.map((val) => ({
            type: val?.reportDelivery?.type,
            spec: {
              tokenId: val?.reportToken,
              chatId: val?.reportChatID,
            },
          })),
        },
      };
    });

    const totalPayload = transformedData[0];

    try {
      const data = await createApplication([totalPayload]).unwrap();
      socket.emit("onProjects", {
        command: "appCreate",
        organizationId: userDetails?.organizationId,
        user: {
          userName: userDetails?.userName,
          userId: userDetails?.userId,
        },
        data: {
          projectId: defaultApplication?.projectId,
          newAppData: data?.results[0],
        },
      });
      fetchProjectData();
      toast.success(data?.message);
    } catch (error) {
      toast.error(error?.data?.details);
    }
  };

  useEffect(() => {
    if (isProjectLoading) {
      dispatch(setLoading(true));
    } else {
      dispatch(setLoading(false));
    }

    if (projectError) {
      dispatch(setError(projectError?.message));
      toast.error(projectError?.message);
    }

    if (projectData) {
      dispatch(setProjectList(projectData?.results));
      dispatch(setGetAllProjects(projectData?.results?.projects));
    }
  }, [fetchProjectData, isProjectLoading, projectError, projectData, dispatch]);

  const clearTestCasesValues = () => {
    setCheckedItems({});
    setIsCheckedRow(false);
    setIsChecked(false);
    setSelectAll(false);
  };

  const checkBoxUnCheckInTestCase = () => {
    clearTestCasesValues();
    setDisableRunImage(false);
  };

  const handleTestcaseSocket = async (response) => {
    const sendUser = response?.user;
    const { defaultApplication: currentProject } =
      currentStore?.getState()?.userDetails;
    const { targetProjectId, targetApplicationId } = response?.data;
    if (
      currentProject?.id == (response?.applicationId || targetApplicationId) &&
      currentProject?.projectId === (response?.projectId || targetProjectId)
    ) {
      // TestCase Create listener
      if (response?.command === "testCaseCreate") {
        setDataCount((prev) => prev + 1);
        const newItem = response?.data?.data;
        setTestCasesData((prev) => {
          const newData = [...prev, newItem];
          const uniqueData = newData.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t._id === item._id)
          );
          return uniqueData;
        });
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has created New Testcase ${newItem?._id}`
        );
      }
      // TestCase update listener
      if (response?.command === "testCaseUpdate") {
        const { stepsList, testCaseId, newObject, type } = response?.data;
        if (type == "Replace") {
          setTestCasesData((prevItems) =>
            prevItems.map((item) =>
              item._id === newObject?._id ? { ...item, ...newObject } : item
            )
          );
        } else {
          setTestCasesData((prevItems) =>
            prevItems.map((item) =>
              item._id === testCaseId
                ? {
                    ...item,
                    testSteps: stepsList,
                  }
                : item
            )
          );
        }
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has updated ${testCaseId} Testcase`
        );
      }

      //TestCase delete listener
      if (response?.command === "testCaseDelete") {
        setDataCount((prev) => (prev > 0 ? prev - 1 : 0));
        const { testCaseId } = response?.data;
        setTestCasesData((prevItems) =>
          prevItems.filter((item) => item._id !== testCaseId)
        );
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has deleted ${testCaseId} Testcase`
        );
      }

      // TestCase Duplicate
      if (response?.command === "testCaseDuplicate") {
        setDataCount((prev) => prev + 1);
        setTestCasesData((prev) => {
          const newItem = response?.data?.testCase;
          const newData = [...prev, newItem];
          const uniqueData = newData.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t._id === item._id)
          );
          return uniqueData;
        });
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has created New Testcase ${response?.data?.testCaseName}`
        );
      }

      // TestCase Status Update
      if (response?.command === "testCaseStatus") {
        const { testCaseId, status } = response?.data;
        setTestCasesData((prevItems) =>
          prevItems.map((item) =>
            item._id === testCaseId
              ? {
                  ...item,
                  status: status,
                }
              : item
          )
        );
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has Updated ${testCaseId} TestCase Status`
        );
      }

      if (response?.command === "testCaseTransfer") {
        setDataCount((prev) => prev + 1);
        setTestCasesData((prev) => {
          const newItem = response?.data?.data;
          const newData = [...prev, newItem];
          const uniqueData = newData.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t._id === item._id)
          );
          return uniqueData;
        });
        toast.dismiss();
        toast.success(
          `Hello Team! ${sendUser?.userName} has transfer Testcase ${response?.data?.testCaseName}`
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
      selectedApplication?.appData?.dataproviderId ==
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
      socket.on("onTestcasesResponse", handleTestcaseSocket);
      socket.on("onSpreadsheetResponse", spreadsheetSocket);
      return () => {
        socket.off("onTestcasesResponse", handleTestcaseSocket);
        socket.off("onSpreadsheetResponse", spreadsheetSocket);
      };
    }
  }, []);

  return (
    <>
      <div className="items-end justify-between gap-4 md:flex testcase-search">
        <div className="items-center gap-4 md:flex left">
          <Switcher
            shouldSetCookies={true}
            isPlusRequired={true}
            addProject={handleOpenTestCaseProject}
            addApplication={handleOpenApplicationModal}
            setSearchValue={setSearchValue}
            setPayload={setPayload}
          />

          <NewProjectApplicationModal
            isOpen={applicationModal}
            onClose={hideApplicationModal}
            selectedProject={selectedProject}
            callApplicationList={callApplicationList}
            onCreateApplication={createNewApplication}
          />
        </div>
        <div className="w-full md:w-[296px] right">
          <SearchInput
            placeHolder="Search"
            maxLength={255}
            onChange={handleInputChange}
            value={searchValue.value}
            error={searchValue.error}
          />
        </div>
      </div>
      <div
        className="xl:flex justify-between items-center mdMax:mt-0 mt-[16px] lgMax:overflow-x-auto"
        ref={dropdownRef}
      >
        <TestCasesTabs tabdata={params?.type} />
        <div className="flex gap-2 lgMax:w-[700px] import-button-auto">
          {params?.type === "test-cases" && (
            <>
              <CustomButton
                label="Import Test Cases"
                onClick={handleImportCsvModal}
              />
              <ImportCsvModal
                isOpen={isOpen}
                onClose={handleCloseImportModal}
                onCrossClick={closehandlerImportModal}
                projectData={defaultApplication}
              />
            </>
          )}
          {params?.type === "test-cases" &&
            defaultApplication?.type !== "RESTAPI" && (
              <a
                href={`/projects/${type}/workbook/${defaultApplication?.projectId}/${defaultApplication?.appData?.dataproviderId}/${defaultApplication?.keyword_name}`}
                target="_blank"
                rel="noreferrer"
              >
                <CustomButton
                  label="Manage Test Data"
                  onClick={closeExportPopup}
                />
              </a>
            )}
          {(params.type === "test-cases" || params.type === "test-suites") && (
            <div ref={runDropDown}>
              {(params?.type === "test-suites" && testSuiteIds?.length > 0) ||
              (rowId?.length > 0 &&
                (selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
                  selectedApplication?.type === ApplicationTypeEnum?.IOS ||
                  selectedApplication?.type === ApplicationTypeEnum?.TV)) ||
              (rowId?.length > 1 &&
                selectedApplication?.type === ApplicationTypeEnum.WEB) ? (
                <CustomButton
                  className="!w-[91px] h-10"
                  label="Run"
                  isRunIcon={true}
                  onClick={() =>
                    selectedApplication?.type === ApplicationTypeEnum.API
                      ? setApiRunModal(true)
                      : selectedApplication?.appData?.apkFile === null &&
                        (selectedApplication?.type ===
                          ApplicationTypeEnum?.IOS ||
                          selectedApplication?.type ===
                            ApplicationTypeEnum?.TV ||
                          selectedApplication?.type ===
                            ApplicationTypeEnum?.ANDROID)
                      ? handleOpenApkModal()
                      : handleShowCreateRunModal()
                  }
                  disable={
                    params?.type === "test-suites"
                      ? testSuiteIds?.length === 0
                      : !isCheckedRow
                  }
                />
              ) : (
                <CustomButton
                  className="!w-[91px] h-10"
                  label="Run"
                  isRunIcon={true}
                  onClick={() =>
                    selectedApplication?.type === ApplicationTypeEnum.API
                      ? setApiRunModal(true)
                      : selectedApplication?.appData?.apkFile === null &&
                        (selectedApplication?.type ===
                          ApplicationTypeEnum?.IOS ||
                          selectedApplication?.type ===
                            ApplicationTypeEnum?.TV ||
                          selectedApplication?.type ===
                            ApplicationTypeEnum?.ANDROID)
                      ? handleOpenApkModal()
                      : runHandleClick()
                  }
                  disable={
                    params?.type === "test-suites"
                      ? testSuiteIds?.length === 0
                      : !isCheckedRow
                  }
                />
              )}

              <div className={`${styles.card_container}`}>
                {showRunPopup && (
                  <div className={`${styles.runpopup}`}>
                    <RunPopUp
                      id={params?.type == "test-suites" ? testSuiteIds : rowId}
                      type={params?.type}
                      onCloseRunPopup={closeRunPopup}
                      clearCheckBoxes={checkBoxesClear}
                      selectedApplication={selectedApplication}
                      onRunCreated={RunTestCasesData}
                      nameData={selectedRowData}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <div>
            <CustomButton
              label={` ${
                params?.type == "test-cases"
                  ? "Add Test Case"
                  : params?.type == "test-suites"
                  ? "Add Test Suite"
                  : "Schedule a Run"
              }  `}
              className="w-[181px]"
              isFocused
              onClick={() => {
                if (params?.type === "test-cases") {
                  handleOpenTest();
                } else if (params?.type === "test-suites") {
                  handleAddTestSuite();
                } else {
                  handleAddNewTestPlans();
                }
              }}
              isAddBtn={true}
            />
            <Modal
              isOpen={openTestCaseModal}
              onClose={handleCloseTest}
              isstopPropagationReq={true}
            >
              <AddTestCaseModal
                onClick={handleCloseTest}
                selectedProject={selectedProject}
                selectedApplication={selectedApplication}
                payload={payload}
                type={type}
                sheetList={sheetList}
              />
            </Modal>
          </div>
          {params?.type === "test-cases" ? (
            isChecked ? (
              <div
                className="w-10 h-10  rounded-[10px] bg-iwhite border border-ibl1 flex justify-center items-center hover:bg-ibl24 cursor-pointer"
                onClick={() => handleDropDownShow()}
              >
                <DownloadForOfflineOutlinedIcon className="text-ibl1" />
                <div>
                  {dropdown && (
                    <DropLoadDropdown
                      options={downloadOptions}
                      onChange={
                        params?.type === "test-cases"
                          ? (option) => handleSelectExport(option)
                          : params?.type === "test-suites"
                          ? handleExportSuite()
                          : handleExportPlan()
                      }
                      selectedOption={selectExportType}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div>
                <DisableDownloadForOfflineOutlinedIcon />
              </div>
            )
          ) : null}
        </div>
        {/* Commented for future refernce */}
        <Modal
          isOpen={openCreateRunModal}
          onClose={handleCloseCreateRunModal}
          isstopPropagationReq={true}
        >
          <CreateRunModal
            onClick={handleCloseCreateRunModal}
            id={params?.type === "test-suites" ? testSuiteIds : rowId}
            type={params?.type}
            onCloseRunPopup={closeRunPopup}
            clearCheckBoxes={checkBoxesClear}
            selectedApplication={selectedApplication}
            onRunCreated={RunTestCasesData}
          />
        </Modal>
        <Modal isOpen={apiRunModal} onClose={() => setApiRunModal(false)}>
          <CreateApiRunModal
            onClick={() => setApiRunModal(false)}
            runIds={params?.type === "test-suites" ? testSuiteIds : rowId}
            type={params?.type}
            onRunCreated={RunTestCasesData}
            clearCheckBoxes={checkBoxesClear}
          />
        </Modal>
      </div>
      <div className="mt-4 mdMax:mt-0">
        {params?.type === "test-cases" && (
          <>
            <div className="mdMax:mt-0 mt-4 bg-iwhite p-5 rounded-[8px] table-div run-Test-mobile-full">
              <div className="tableScroll tableScrollNew">
                <Table
                  isDisableCheckbox={true}
                  isLoading={isLoading}
                  data={testcasesdata}
                  checkbox={true}
                  handleCheckboxChange={handleCheckboxChange}
                  handleSelectAllCheckboxes={handleSelectAllCheckboxes}
                  selectAll={selectAll}
                  checkedItems={checkedItems}
                  onRowClick={(row) => {
                    const state = {
                      testCaseId: row?._id,
                      project: selectedProject,
                      application: selectedApplication,
                      isEditRequired: true,
                      isRunRequired: true,
                      sheet_name: row?.sheet_name,
                      start_row: row?.start_row,
                      end_row: row?.end_row,
                      dependency_id: row?.dependency_id,
                      test_case_name: row?.test_case_name,
                      default_browser: row?.default_browser,
                      status: row?.status,
                    };

                    setStorage("ATC", JSON.stringify(state));
                    navigate("/projects/test-cases/add-test-steps", { state });
                  }}
                  onRowClickPointer={true}
                  columns={[
                    {
                      label: "",
                      tHeadClass: "w-[5%]",
                      cell: (row) => {
                        handleCheckboxChange(row?._id, row);
                      },
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
                      tHeadClass: "pl-[95px] text-left",
                      tbodyClass: "text-igy1 text-sm font-normal",
                      label: "Name",
                      column: "test_case_name",
                      cell: (row) => (
                        <>
                          <div
                            className={`!text-left ${
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
                              className="w-fit"
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
                      column: "testSteps",
                      cell: (row) => (
                        <div className="flex items-center justify-center">
                          {row?.testSteps?.length}
                        </div>
                      ),
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
                            statusDropdownAPi={(val, id) =>
                              statusDropdownAPi(val, id)
                            }
                            selectedStatus={selectedStatus}
                          />
                        </div>
                      ),
                    },
                    {
                      tHeadClass: "w-[14%]",
                      tbodyClass: "text-igy1 text-sm font-normal",
                      label: "Last Run History",
                      column: "last run history",
                      cell: (row) => (
                        <div>
                          <LastRunHistory row={row} />
                        </div>
                      ),
                    },
                    {
                      tHeadClass: "w-[14%]",
                      tbodyClass: "text-igy1 text-sm font-normal",
                      label: "Actions",
                      column: "actions",
                      cell: (row) => (
                        <div className="flex items-center justify-center">
                          <ActionIcons
                            data={row}
                            transferData={transferData}
                            selectedProject={selectedProject}
                            selectedApplication={selectedApplication}
                            id={row?._id}
                            fetchDuplicateRow={fetchDuplicateRow}
                            fetchDeleteTestCase={fetchDeleteTestCase}
                            testCaseLoading={testCaseLoading}
                            testCaseInfo={testcasesdata}
                            paramType={params?.type}
                            onRowCheckBoxClear={rowCheckBoxClear}
                            fetchTestCasesData={RunTestCasesData}
                            removeCheckBoxValues={clearCheckBoxValues}
                            checkApk={selectedApplication?.appData?.apkFile}
                            projectName={projectName}
                            applicationName={selectedApplication?.keyword_name}
                            applicationType={selectedApplication?.type}
                            setActiveRowMorePopup={setActiveRowMorePopup}
                            activeRowMorePopup={activeRowMorePopup}
                            setActiveRowRunPopup={setActiveRowRunPopup}
                            activeRowRunPopup={activeRowRunPopup}
                            closeStatusDropdown={closeStatusDropdown}
                            closeRunPopup={closeRunMorePopup}
                            setRunPopUpClear={() => setActiveRowRunPopup(null)}
                            setMorePopUpClear={() =>
                              setActiveRowMorePopup(null)
                            }
                            clearRunPopUp={closeRunPopUp}
                            disableRunImage={disableRunImage}
                            setRowRunImage={setRowRunImage}
                            fetchTestCaseAPI={fetchTestCaseAPI}
                            closeExportPopup={closeExportPopup}
                            closeActionPopup={closeActionPopup}
                            checkBoxUnCheckInTestCase={
                              checkBoxUnCheckInTestCase
                            }
                          />
                        </div>
                      ),
                    },
                  ]}
                />
                <div className="flex items-center justify-between mt-8 mb-[10px] pagination-row">
                  {!isLoading && dataCount > 0 && (
                    <div className="text-sm text-ibl1">{`Showing ${testcasesdata?.length} out of ${dataCount}`}</div>
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
          </>
        )}
        {params?.type == "test-suites" && (
          <>
            <TestSuites
              selectedProject={selectedProject}
              selectedApplication={selectedApplication}
              searchKey={payload}
              selectTestSuiteCheckBox={(id) => {
                setTestSuiteIds(id);
              }}
              selectAllTestSuites={(data) => {
                setAllTestSuites(data);
              }}
              testSuiteModal={openTestSuite}
              testSuiteModalData={testSuiteData}
              allCheckBoxes={clearCheckBox}
              onRowData={(row) => setSelectedRowData(row)}
              projectName={projectName}
              applicationName={selectedApplication?.keyword_name}
              applicationType={selectedApplication?.type}
              onTestSuiteRun={() => {
                setPayload({});
                setSearchValue({
                  value: "",
                  error: null,
                });
              }}
            />
            <Modal isOpen={openTestSuite} onClose={handleCloseTestSuite}>
              <AddNewTestSuiteModal
                onClick={handleCloseTestSuite}
                selectedProject={selectedProject}
                selectedApplication={selectedApplication}
                getTestSuiteAPI={getTestSuiteAPI}
              />
            </Modal>
          </>
        )}

        {params?.type === "test-scheduler" && (
          <TestPlan
            paramType={params?.type}
            selectedProject={selectedProject}
            selectedApplication={selectedApplication}
            searchKey={payload}
            selectTestPlansCheckBox={(id) => {
              setTestPlanIds(id);
            }}
            checkBoxClear={testPlanCheckBoxClear}
            setPayload={setPayload}
            onRowData={(row) => setGetPlanId(row)}
            callTestPlan={callTestPlan}
            setOpenDrawer={setOpenDrawer}
            openDrawer={openDrawer}
            setIsEditMode={setIsEditMode}
          />
        )}
      </div>

      <DrawerComponent
        isstopPropagationReq={true}
        show={openDrawer}
        className={"-right-[1000px] w-full max-w-[720px]"}
        onClose={() => {
          setOpenDrawer(!openDrawer);
        }}
      >
        <CreateSchedulerModal
          selectedProject={selectedProject}
          selectedApplication={selectedApplication}
          setOpenDrawer={setOpenDrawer}
          openDrawer={openDrawer}
          uniqId={uniqId}
          setCallTestPlan={setCallTestPlan}
          callTestPlan={callTestPlan}
          setIsEditMode={setIsEditMode}
          isEditMode={isEditMode}
          onClose={() => {
            setOpenDrawer(!openDrawer);
          }}
        />
      </DrawerComponent>

      <Modal
        isOpen={openApkModal}
        onClose={handleCloseApkModal}
        className="rounded-[16px]"
      >
        <ApkFileAlertModal
          onClick={handleCloseApkModal}
          projectId={selectedProject?.projectId}
          applicationId={selectedApplication?.id}
          projectName={projectName}
          applicationName={selectedApplication?.keyword_name}
          applicationType={selectedApplication?.type}
        />
      </Modal>
    </>
  );
};

export default Testcases;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#052C85",
      contrastText: "#ffffff", // or any contrasting color
    },
  },
});

const downloadOptions = [
  { label: "Download As Excel File", value: "excel" },
  { label: "Download As CSV File", value: "csv" },
];
