import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import APIRequestModal from "Components/Molecules/APIRequestModal/APIRequestModal";
import { ApkFileAlertModal } from "Components/Molecules/ApkFileAlertModal/ApkFileAlertModal";
import CreateRunModal from "Components/Molecules/CreateRunModal/CreateRunModal";
import GenerateEncryptedDataModal from "Components/Molecules/GenerateEncrytedDataModal/GenerateEncryptedDataModal";
import { ApplicationTypeEnum } from "Enums/ApplicationTypeEnum";
import { useOutsideClick } from "Hooks/useOutSideClick";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { WebsocketContext } from "Services/Socket/socketProvider";
import useGenerateEncryptedData from "Store/useGenerateEncryptedDataModal";
import { CustomButton } from "../../../Components/Atoms/CustomButton/CustomButton";
import { Modal } from "../../../Components/Atoms/Modal/Modal";
import RunPopUp from "../../../Components/Atoms/RunPopUp/RunPopUp";
import StepRow from "../../../Components/Molecules/StepRow/StepRow";
import UpdateTestCaseModal from "../../../Components/Molecules/UpdateTestCaseModal/UpdateTestCaseModal";
import textEllipsis from "../../../Helpers/TextEllipsis/TextEllipsis";
import { getTestCasesList } from "../../../Services/API/Projects/Projects";
import { getSpreedsheet } from "../../../Services/API/Spreadsheet/Spreadsheet";
import {
  createTestSteps,
  getActionKey,
  getCaseInfo,
  getLocator,
  updateTestSteps,
} from "../../../Services/API/TestCase/TestCase";
import { clearStorage, getStorage } from "../../../Storage";
import AddNewAPITestCases from "./AddNewAPITestCases";
import styles from "./AddNewTestCases.module.scss";
import AceEditor from "react-ace";
// Import language mode and theme (if required)
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github"; // You can choose any theme you like
import ace from "ace-builds";
import { fetchDefaultData } from "Helpers/DefaultApi/FetchDefaultApi";
import {
  useLazyGetUserDataQuery,
  useSetDefaultMutation,
} from "Services/API/apiHooks";
import TestPlansToggleButton from "Components/Atoms/TestPlansToggleButton/TestPlansToggleButton";
import CustomToggle from "Components/Atoms/CustomToggle/CustomToggle";
import { getAllElement, getAllPage, getRepo } from "Services/API/Setting/Pom";
import { element } from "prop-types";

// Set worker URL for JavaScript
ace.config.setModuleUrl(
  "ace/mode/javascript_worker",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.12/src-noconflict/worker-javascript.js"
);

export default function AddNewTestCases() {
  const location = useLocation();
  const { defaultApplication, userDetails } = useSelector(
    (state) => state?.userDetails
  );
  const [setDefault] = useSetDefaultMutation();
  const [getuserDetails] = useLazyGetUserDataQuery();
  const testCaseId = location?.state?.testCaseId;
  const mode = location?.state?.mode;
  const status = location?.state?.status;
  const [testCaseData, setTestCaseData] = useState([]);
  const [testCaseDetails, setTestCaseDetails] = useState({});
  const project = testCaseData?.project;
  const applicationId = testCaseData?.application;
  const id = testCaseData?.testCaseId;
  const isEditRequired = testCaseData?.isEditRequired;
  const isRunRequired = testCaseData?.isRunRequired;
  const testSuiteDetails = location?.state?.testSuiteData;
  const sheet_name = testCaseDetails?.sheetData?.sheetName;
  const start_row = testCaseDetails?.sheetData?.startRow;
  const end_row = testCaseDetails?.sheetData?.endRow;
  const dependency_id = testCaseDetails?.dependencyId;
  const default_browser = testCaseDetails?.defaultBrowser;
  const navigateTo = useNavigate();
  const runDropDown = useRef(null);
  const checkApk = applicationId?.appData?.apkFile;
  const { isOpen, setShow, setHide } = useGenerateEncryptedData();
  const projectName = location?.state?.project?.keyword_name;
  const applicationName = location?.state?.application?.keyword_name;
  const { socket } = useContext(WebsocketContext);
  const [selectedScreen, setSelectedScreen] = useState(null);

  const [stepRows, setStepRows] = useState([
    {
      stepName: "",
      stepNumber: 1,
      action: null,
      locator: null,
      inputPath: "",
      inputData: "",
      output_value: "",
      pressKey: null,
      subMethod1: null,
      screen: null,
      element: null,
      isActive: true,
      is_skipped: false,
      shared_test_case_data: null,
      dbConnection: {},
      executeSqlQuery: "",
      variableValue: null,
    },
  ]);
  const [deletedRowsList, setDeletedRowsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [browserOption, setBrowserOption] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [editedTestCaseName, setEditedTestCaseName] = useState("");
  const [finalOutPutValues, setFinalOutPutValues] = useState([]);
  const [locatorList, setLocatorList] = useState([]);
  const [actionList, setActionList] = useState([]);
  const [testCasesData, setTestCasesData] = useState([]);
  const [actionSubType, setActionSubType] = useState([]);
  const [metaData, setMetaData] = useState([]); // collection of meta data
  const [sheetList, setSheetList] = useState([]);
  const [openTestCaseModal, setOpenTestCaseModal] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [openCreateRunModal, setOpenCreateRunModal] = useState(false);
  const [openApkModal, setOpenApkModal] = useState(false);
  const [isAPIModalOpen, setIsAPIModalOpen] = useState(false);
  const [testStepDataLength, setTestStepDataLength] = useState(0);
  const [isPom, setIsPom] = useState(false);

  // console.log(project, "projectId");

  const handleOpenTest = () => {
    setOpenTestCaseModal(true);
  };

  const handleCloseApkModal = () => {
    setOpenApkModal(false);
  };

  const handleOpenApkModal = () => {
    setOpenApkModal(true);
  };

  useEffect(() => {
    const storedData = getStorage("ATC");
    const sessionData = storedData ? JSON.parse(storedData) : null;
    setTestCaseData(sessionData);
    // setEditedTestCaseName(sessionData?.test_case_name);
    setIsEditable(sessionData?.isEditable);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedData = getStorage("ATC");
      const newTestCaseData = storedData ? JSON.parse(storedData) : null;
      setTestCaseData(newTestCaseData);
      setEditedTestCaseName(newTestCaseData?.test_case_name);
      setIsEditable(newTestCaseData?.isEditable);
    };

    // Add custom event listener
    window.addEventListener("session-storage-change", handleStorageChange);

    // Optionally, listen for changes in other tabs/windows
    window.addEventListener("storage", handleStorageChange);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener("session-storage-change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // collection of all  meta Data in selected sheets
  useEffect(() => {
    if (defaultApplication?.appData?.dataproviderId) {
      getSpreedsheet(defaultApplication?.appData?.dataproviderId)
        .then((res) => {
          const data = res?.data?.sheets;
          // Ensure data exists before proceeding
          if (!data) {
            console.error("No sheets data found");
            return;
          }

          const Newlist = data?.map((sheet) => ({
            id: sheet._id,
            keyword_name: sheet.sheetName,
          }));
          setSheetList(Newlist);

          if (sheet_name) {
            const list = data
              .filter((sheet) => sheet?.sheetName === sheet_name)
              .map((sheet) => sheet.data[0].filter((cell) => cell !== null));
            // Assuming list[0] is the array you need to process
            const processedList = list[0].map((keyword, index) => ({
              id: index,
              keyword_name: `in_${keyword}`,
            }));
            setMetaData(processedList);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [applicationId, sheet_name]);

  const updateStepRow = useCallback((index, updatedFields) => {
    setStepRows((prevStepRows) => {
      const updatedStepRows = [...prevStepRows];
      updatedStepRows[index] = {
        ...updatedStepRows[index],
        ...updatedFields,
      };
      return updatedStepRows;
    });
  }, []);

  const handleActionSelect = useCallback(
    (selectedValue, index) => {
      updateStepRow(index - 1, {
        action: selectedValue,
        locator: null,
        inputPath: "",
        inputData: "",
        output_value: "",
        pressKey: null,
        subMethod1: null,
        screen: null,
        element: null,
        shared_test_case_data: null,
        dbConnection: {},
        executeSqlQuery: "",
      });
    },
    [updateStepRow]
  );

  const handleLocatorSelect = useCallback(
    (selectedValue, index) => {
      updateStepRow(index - 1, {
        locator: selectedValue,
        inputPath: "",
        inputData: "",
        pressKey: null,
        output_value: "",
      });
    },
    [updateStepRow]
  );

  const handleTestCaseSelect = useCallback(
    (selectedValue, index) => {
      updateStepRow(index - 1, {
        shared_test_case_data: selectedValue,
      });
    },
    [updateStepRow]
  );

  const hanldePressKeySelect = useCallback(
    (selectedValue, index) => {
      updateStepRow(index - 1, {
        pressKey: selectedValue,
      });
    },
    [updateStepRow]
  );

  const handleSubActionTypeSelect = useCallback(
    (selectedValue, index) => {
      updateStepRow(index - 1, {
        subMethod1: selectedValue,
      });
    },
    [updateStepRow]
  );
  const handleScreenSelect = useCallback(
    (selectedValue, index) => {
      updateStepRow(index - 1, {
        screen: selectedValue,
        locator: null,
        inputPath: "",
        inputData: "",
        output_value: "",
        element: null,
        pressKey: null,
        subMethod1: null,
      });
      setSelectedScreen(selectedValue);
    },
    [updateStepRow]
  );
  const handleElementSelect = useCallback(
    (selectedValue, index) => {
      updateStepRow(index - 1, {
        element: selectedValue,
      });
    },
    [updateStepRow]
  );

  const handleInputChange = useCallback(
    (inputValue, type, index) => {
      let updatedFields = {};
      switch (type) {
        case "stepName":
          updatedFields = { stepName: inputValue };
          break;
        case "variableValue":
          updatedFields = { variableValue: inputValue };
          break;
        case "inputPath":
          updatedFields = { inputPath: inputValue };
          break;
        case "inputData":
          updatedFields = {
            inputData: inputValue ? { id: null, keyword_name: inputValue } : "",
          };
          break;
        case "outputValue":
          updatedFields = { output_value: inputValue };
          break;
        default:
          break;
      }
      updateStepRow(index - 1, updatedFields);
    },
    [updateStepRow]
  );

  const handleOutputValueSelect = useCallback(
    (option, index) => {
      updateStepRow(index - 1, {
        inputData: option,
      });
    },
    [updateStepRow]
  );

  const handleAddAbove = useCallback((stepId) => {
    const index = stepId - 1;
    setStepRows((prevStepRows) => {
      const newStepRows = [...prevStepRows];
      newStepRows.splice(index, 0, {
        stepName: "",
        stepNumber: index + 1,
        action: null,
        locator: null,
        inputPath: "",
        inputData: "",
        output_value: "",
        pressKey: null,
        subMethod1: null,
        screen: null,
        element: null,
        isActive: true,
        is_skipped: false,
        dbConnection: {},
        executeSqlQuery: "",
        variableValue: null,
      });
      for (let i = index + 1; i < newStepRows.length; i++) {
        newStepRows[i].stepNumber++;
      }
      return newStepRows;
    });
  }, []);

  const handleAddBelow = useCallback((index) => {
    setStepRows((prevStepRows) => {
      const newStepRows = [...prevStepRows];
      newStepRows.splice(index, 0, {
        stepName: "",
        stepNumber: index + 1,
        action: null,
        locator: null,
        inputPath: "",
        inputData: "",
        output_value: "",
        pressKey: null,
        subMethod1: null,
        screen: null,
        element: null,
        isActive: true,
        is_skipped: false,
        dbConnection: {},
        executeSqlQuery: "",
        variableValue: null,
      });
      for (let i = index + 1; i < newStepRows?.length; i++) {
        newStepRows[i].stepNumber++;
      }
      return newStepRows;
    });
  }, []);

  const handleCloneStep = useCallback((index) => {
    setStepRows((prevStepRows) => {
      const newStepRows = [...prevStepRows];
      const { id, ...rest } = newStepRows[index - 1];
      const clonedObject = { ...rest };
      newStepRows.splice(index, 0, clonedObject);
      for (let i = index; i < newStepRows.length; i++) {
        newStepRows[i].stepNumber++;
      }
      return newStepRows;
    });
  }, []);

  const handleStepDelete = useCallback((stepData) => {
    setStepRows((prevStepRows) => {
      const stepIndex = stepData?.stepNumber - 1;
      const newStepRows = [...prevStepRows];
      if (stepData?.id) {
        const newlyDeletedRow = { ...newStepRows[stepIndex] };
        newlyDeletedRow.stepNumber = null;
        newlyDeletedRow.isActive = false;
        setDeletedRowsList((prevDeletedRows) => [
          ...prevDeletedRows,
          newlyDeletedRow,
        ]);
      }
      newStepRows.splice(stepIndex, 1);
      for (let i = stepIndex; i < newStepRows.length; i++) {
        newStepRows[i].stepNumber--;
      }
      return newStepRows;
    });
  }, []);

  const handleCheckBoxSelect = useCallback((value, index) => {
    setStepRows((prevStepRows) => {
      const updatedStepRows = [...prevStepRows];
      updatedStepRows[index - 1] = {
        ...updatedStepRows[index - 1],
        is_skipped: value,
      };
      return updatedStepRows;
    });
  }, []);

  const handleMoveTo = useCallback((currentIndex, desiredIndex) => {
    setStepRows((prev) => {
      const newStepRows = [...prev];
      const [currentStep] = newStepRows.splice(currentIndex - 1, 1);
      newStepRows?.splice(desiredIndex - 1, 0, currentStep);
      newStepRows.forEach((step, index) => {
        step.stepNumber = index + 1;
      });

      return newStepRows;
    });
    // }
  }, []);

  const updateDbConnection = (index, updatedDbConnection) => {
    setStepRows((prevStepRows) => {
      const newStepRows = [...prevStepRows];
      newStepRows[index - 1].dbConnection = updatedDbConnection;
      return newStepRows;
    });
  };

  //API call to create the testcase.
  const createTestStepData = () => {
    setIsApiLoading(true);
    let isDataProvider = false;
    if (metaData) {
      isDataProvider = stepRows?.some((item) =>
        metaData?.some(
          (value) => value?.keyword_name === item?.inputData?.keyword_name
        )
      );
    }

    let reusable_tests = [];
    let isDataProviderArray = [];

    const stepData = stepRows?.map((item) => {
      if (item?.shared_test_case_data) {
        isDataProviderArray.push(item?.shared_test_case_data?.isDataProvider);
        const reusable_step = {
          orderId: item?.stepNumber,
          testCaseId: item?.shared_test_case_data?.id,
        };
        reusable_tests.push(reusable_step);
      }

      return {
        testStepName: item?.stepName,
        orderId: item?.stepNumber,
        isSkipped: item?.is_skipped,
        requestType: "WEB",
        stepType: item?.shared_test_case_data !== null ? "CASE" : "STEP",
        isActive: true,
        sharedTestCaseData: item?.shared_test_case_data
          ? {
              _id: item?.shared_test_case_data?.id,
              testCaseName: item?.shared_test_case_data?.keyword_name,
              isDataProvider: item?.shared_test_case_data?.isDataProvider,
            }
          : null,
        webData: {
          inputData: item?.inputData ? item?.inputData?.keyword_name : "",
          outputValue: item?.output_value,
          variableValue: item?.variableValue,
          action: item?.action,
          locateElement: item?.locator
            ? {
                id: item?.locator?.id,
                name: item?.locator?.keyword_name,
                value: item?.inputPath,
              }
            : null,
          pressKey: item?.pressKey,
          subMethod1: item?.subMethod1,
          screen: isPom ? item?.screen : null,
          element: isPom ? item?.element : null,
          dbConnection: item?.dbConnection,
          executeSqlQuery: item?.executeSqlQuery,
        },
      };
    });

    if (!isDataProvider) {
      const hasTrueValue = isDataProviderArray?.some((value) => value === true);
      isDataProvider = hasTrueValue;
    }

    const updatedStepData = {
      ...(testSuiteDetails && { targetSuiteId: testSuiteDetails?.id }),
      testCaseId: testCaseId,
      reusableTests: reusable_tests,
      testSteps: stepData,
      isDataProvider: isDataProvider,
    };

    createTestSteps(updatedStepData)
      .then((res) => {
        clearStorage("ATC");
        const message = res?.data?.message;
        socket.emit("onTestcases", {
          command: "testCaseUpdate",
          organizationId: userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user: {
            userName: userDetails?.userName,
            userId: userDetails?.userId,
          },
          data: {
            stepsList: res?.data?.results?.testSteps,
            testCaseId: testCaseId,
            ...(testSuiteDetails && { targetSuiteId: testSuiteDetails?.id }),
          },
        });
        toast.success(message);
        setStepRows([
          {
            stepName: "",
            stepNumber: 1,
            action: null,
            locator: null,
            inputPath: "",
            inputData: "",
            output_value: "",
            pressKey: null,
            subMethod1: null,
            screen: null,
            element: null,
            isActive: true,
            is_skipped: false,
            dbConnection: {},
            executeSqlQuery: "",
            variableValue: null,
          },
        ]);
        if (testSuiteDetails) {
          navigateTo("/projects/test-suites/test-cases", {
            state: {
              ...testSuiteDetails,
            },
          });
        } else {
          navigateTo("/projects/test-cases");
        }
        setIsApiLoading(false);
      })
      .catch((err) => {
        const message = err?.response?.data?.details;
        toast.error(message);
        setIsApiLoading(false);
      });
  };

  const [projectDetails, setProjectDetails] = useState(null);

  const fetchTestCaseDetails = () => {
    setIsLoading(true);
    getCaseInfo(testCaseId)
      .then((res) => {
        const data = res?.data?.results;
        setIsPom(data?.isPom);
        const details = {
          projectId: data?.projectId,
          applicationId: data?.applicationId,
        };
        setProjectDetails(details);
        const caseData = {
          id: data?._id,
          testCaseName: data?.testCaseName,
          dependencyId: data?.dependencyId,
          sheetData: data?.testData,
          defaultBrowser: data?.defaultBrowser,
          isPom: data?.isPom,
        };
        setTestCaseDetails(caseData);

        setEditedTestCaseName(data?.testCaseName);
        const testStepData = data?.testSteps;
        if (testStepData?.length > 0) {
          const modifiedTestData = testStepData?.map((item) => {
            return {
              id: item?._id,
              stepName: item?.testStepName,
              stepNumber: item?.orderId,
              action: item?.webData?.action,
              dbConnection: item?.webData?.dbConnection,
              executeSqlQuery: item?.webData?.executeSqlQuery,
              variableValue: item?.webData?.variableValue,
              locator: item?.webData?.locateElement
                ? {
                    id: item?.webData?.locateElement?.id,
                    keyword_name: item?.webData?.locateElement?.name,
                  }
                : null,
              inputPath: item?.webData?.locateElement?.value || "",
              inputData: {
                id: item?.orderId,
                keyword_name: item?.webData?.inputData,
              },
              pressKey: item?.webData?.pressKey
                ? item?.webData?.pressKey
                : null,
              subMethod1: item?.webData?.subMethod1
                ? item?.webData?.subMethod1
                : null,
              screen: item?.webData?.screen ? item?.webData?.screen : null,
              element: item?.webData?.element ? item?.webData?.element : null,
              is_skipped: item?.isSkipped,
              isActive: item?.isActive,
              output_value:
                item?.webData?.outputValue !== null
                  ? item?.webData?.outputValue
                  : "",
              shared_test_case_data: item?.sharedTestCaseData
                ? {
                    id: item?.sharedTestCaseData?._id,
                    keyword_name: item?.sharedTestCaseData?.testCaseName,
                    isDataProvider: item?.sharedTestCaseData?.isDataProvider,
                  }
                : null,
            };
          });
          setStepRows(modifiedTestData);
        } else {
          setStepRows([
            {
              stepName: "",
              stepNumber: 1,
              action: null,
              locator: null,
              inputPath: "",
              inputData: "",
              output_value: "",
              pressKey: null,
              subMethod1: null,
              screen: null,
              element: null,
              isActive: true,
              is_skipped: false,
              shared_test_case_data: null,
              dbConnection: {},
              executeSqlQuery: "",
              variableValue: null,
            },
          ]);
        }
        setTestStepDataLength(testStepData?.length);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //API call to update the testcase
  const updateTestStepData = () => {
    setIsApiLoading(true);
    const totalStepRows = [...stepRows, ...deletedRowsList];

    // Array to extract reusable testcase along with their order_id.
    let reusable_tests = [];
    let isDataProviderArray = [];

    const updatedStepData = totalStepRows.map((item) => {
      //Login to fetch the reusable testcase
      if (item?.shared_test_case_data && item?.isActive) {
        isDataProviderArray.push(item?.shared_test_case_data?.isDataProvider);
        const reusable_step = {
          orderId: item?.stepNumber,
          testCaseId: item?.shared_test_case_data?.id,
        };
        reusable_tests.push(reusable_step);
      }

      return {
        ...(item?.id && { _id: item?.id }),
        testStepName: item?.stepName,
        orderId: item?.stepNumber,
        isSkipped: item?.is_skipped,
        isActive: item?.isActive,
        requestType: "WEB",
        stepType: item?.shared_test_case_data !== null ? "CASE" : "STEP",
        sharedTestCaseData: item?.shared_test_case_data
          ? {
              _id: item?.shared_test_case_data?.id,
              testCaseName: item?.shared_test_case_data?.keyword_name,
              isDataProvider: item?.shared_test_case_data?.isDataProvider,
            }
          : null,
        webData: {
          inputData: item?.inputData ? item?.inputData?.keyword_name : "",
          outputValue: item?.output_value !== null ? item?.output_value : "",
          action: item?.action,
          dbConnection: item?.dbConnection,
          executeSqlQuery: item?.executeSqlQuery,
          variableValue: item?.variableValue,
          pressKey: item?.pressKey,
          subMethod1: item?.subMethod1,
          screen: isPom ? item?.screen : null,
          element: isPom ? item?.element : null,
          locateElement: item?.locator
            ? {
                id: item?.locator?.id,
                name: item?.locator?.keyword_name,
                value: item?.inputPath,
              }
            : null,
        },
      };
    });

    // dataProvider flag to know whether user uses metadata or not.
    let isDataProvider = false;
    if (metaData) {
      isDataProvider = stepRows.some((item) =>
        metaData.some(
          (value) => value.keyword_name === item.inputData?.keyword_name
        )
      );
    }

    if (!isDataProvider) {
      const hasTrueValue = isDataProviderArray?.some((value) => value === true);
      isDataProvider = hasTrueValue;
    }

    const payload = {
      testCaseId: testCaseId,
      reusableTests: reusable_tests,
      testSteps: updatedStepData,
      isDataProvider: isDataProvider,
    };

    updateTestSteps(payload)
      .then((res) => {
        const message = res?.data?.message;
        socket.emit("onTestcases", {
          command: "testCaseUpdate",
          organizationId: userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user: {
            userName: userDetails?.userName,
            userId: userDetails?.userId,
          },
          data: {
            stepsList: res?.data?.results?.testSteps,
            testCaseId: testCaseId,
          },
        });
        toast.success(message);
        if (testSuiteDetails) {
          navigateTo("/projects/test-suites/test-cases", {
            state: {
              ...testSuiteDetails,
            },
          });
        } else {
          navigateTo("/projects/test-cases", {
            state: { ...project, defaultApplication: applicationId },
          });
        }
        setIsApiLoading(false);
      })
      .catch((err) => {
        const message = err?.response?.data?.details;
        toast.error(message);
        setIsApiLoading(false);
      });
  };

  // useEffect(() => {
  //   if (id !== undefined) {
  //     getTestStepsData();
  //   }
  // }, [isEditable, id]);

  const handleEditClick = () => {
    setIsLoading((pre) => !pre);
    setIsEditable((pre) => !pre);
  };

  const handleRun = () => {
    setBrowserOption(!browserOption);
  };

  useOutsideClick(runDropDown, () => {
    if (browserOption) {
      setBrowserOption(!browserOption);
    }
  });

  const closeRunPopup = () => {
    setBrowserOption(false);
  };

  const handleShowCreateRunModal = () => {
    setOpenCreateRunModal(true);
  };

  const handleCloseCreateRunModal = () => {
    setOpenCreateRunModal(false);
  };
  const testCaseDefault = () => {
    fetchDefaultData(setDefault, defaultApplication, getuserDetails);
  };

  const handleRunApplication = () => {
    if (
      defaultApplication?.type === "TV" ||
      defaultApplication?.type === "IOS" ||
      defaultApplication?.type === "ANDROID"
    ) {
      if (
        checkApk === false &&
        (defaultApplication?.type === "IOS" ||
          defaultApplication?.type === "TV" ||
          defaultApplication?.type === "ANDROID")
      ) {
        handleOpenApkModal();
      } else {
        handleShowCreateRunModal();
      }
    } else {
      handleRun();
    }
  };

  useEffect(() => {
    const requiredStepRows = [...stepRows];

    const filteredOutPutValues = requiredStepRows
      .filter((item) => item?.output_value !== "")
      .map((item) => ({
        id: item?.stepNumber,
        keyword_name: `out_${item?.output_value}`,
      }))
      .reduce((acc, current) => {
        if (!acc.find((item) => item?.keyword_name === current?.keyword_name)) {
          acc.push(current);
        }
        return acc;
      }, []);

    const updatedInputData = [...filteredOutPutValues, ...metaData];

    if (
      JSON.stringify(updatedInputData) !== JSON.stringify(finalOutPutValues)
    ) {
      setFinalOutPutValues(updatedInputData);
    }
  }, [stepRows, metaData]);

  useEffect(() => {
    if (defaultApplication && defaultApplication?.type !== "RESTAPI") {
      const payload = {
        type:
          defaultApplication?.type === ApplicationTypeEnum?.ANDROID ||
          defaultApplication?.type === ApplicationTypeEnum?.IOS ||
          defaultApplication?.type === ApplicationTypeEnum?.TV
            ? "Mobile"
            : "Web",
      };
      getLocator(payload)
        .then((res) => {
          const locatorList = res?.data?.results;
          const updatedList = locatorList.map((item) => {
            return { id: item?._id, keyword_name: item?.name };
          });
          setLocatorList(updatedList);
        })
        .catch((err) => {
          const message = err?.response?.data?.details;
          console.log(message);
        });
    }
  }, [defaultApplication]);

  // const checkDisableConditions = (stepRows) => {
  //   let shouldDisable = false;

  //   for (const item of stepRows) {
  //     if (shouldDisable) break;

  //     if (item?.action === null) {
  //       shouldDisable = true;
  //       break;
  //     }
  //     if (item?.stepName === "") {
  //       shouldDisable = true;
  //       break;
  //     }

  //     if (
  //       item?.action?.isElementTarget === true &&
  //       item?.action?.isInputData === true
  //     ) {
  //       if (
  //         !item?.inputData?.keyword_name ||
  //         !item?.locator?.keyword_name ||
  //         item?.inputPath === ""
  //       ) {
  //         shouldDisable = true;
  //         break;
  //       }

  //       if (item?.action?.isOutputValue === true) {
  //         if (
  //           !item?.output_value ||
  //           !item?.inputData?.keyword_name ||
  //           !item?.locator?.keyword_name ||
  //           item?.inputPath === ""
  //         ) {
  //           shouldDisable = true;
  //           break;
  //         }
  //       }
  //     }

  //     if (
  //       item?.action?.isInputData === true && item?.inputData &&
  //       !item?.inputData?.keyword_name
  //     ) {
  //       shouldDisable = true;
  //       break;
  //     }
  //   }

  //   return shouldDisable;
  // };

  const [isRepo, setIsRepo] = useState(null);
  const [screenList, setScreenList] = useState([]);
  const [elementList, setElementList] = useState([]);

  useEffect(() => {
    if (!projectDetails) return;
    const projectId = projectDetails?.projectId;
    const applicationId = projectDetails?.applicationId;
    getRepo(projectId, applicationId)
      .then((res) => {
        const data = res?.data?._id;
        setIsRepo(data ? data : null);
      })
      .catch(() => {
        toast.error("Unable to fetch locator Repository");
      });
  }, [projectDetails]);

  const getAllScreen = () => {
    getAllPage(isRepo)
      .then((res) => {
        const data = res?.data.pages;
        const updatedList = data.map((item) => {
          return { id: item?._id, keyword_name: item?.pageName };
        });
        setScreenList(updatedList);
      })
      .catch((error) => {
        toast.error("Unable to fetch Screen List");
      });
  };

  useEffect(() => {
    if (!isRepo) return;
    getAllScreen();
  }, [isRepo]);

  const fetchAllElement = () => {
    const locatorId = isRepo;
    const pageId = selectedScreen?.id;
    getAllElement(locatorId, pageId)
      .then((res) => {
        const data = res?.data;
        const updatedList = data.map((item) => {
          return {
            id: item?._id,
            keyword_name: item?.elementName,
            attributes: item?.attributes,
          };
        });
        setElementList(updatedList);
      })
      .catch((err) => {
        toast.error("Unable to fetch element list");
      });
  };

  useEffect(() => {
    if (!selectedScreen) return;
    fetchAllElement();
  }, [selectedScreen]);

  useEffect(() => {
    if (
      defaultApplication?.id !== undefined &&
      defaultApplication?.type !== "RESTAPI"
    ) {
      const payload = {
        application_type:
          defaultApplication?.type === ApplicationTypeEnum?.ANDROID ||
          defaultApplication?.type === ApplicationTypeEnum?.IOS ||
          defaultApplication?.type === ApplicationTypeEnum?.TV
            ? "Mobile"
            : "Web",
      };
      getActionKey(payload)
        .then((res) => {
          const actionList = res?.data?.results;

          // Define an array of keyword names to remove
          const keywordsToRemove = [
            "Element Is Clickable",
            "Element Is Not Clickable",
            "Element Is Not Present",
            "Element Is Not Visible",
            "Element Is Present",
            "Element Is Visible",
          ];

          const filteredIfType = actionList
            .filter((e) => e?.keyword_name === "Start If Statement")[0]
            ?.sub_methods.map((obj, i) => ({ ...obj, id: i + 1 }));

          setActionList(actionList); // Store the filtered list in the state
          setActionSubType(filteredIfType);
        })
        .catch((err) => {
          const message = err?.response?.data?.details;
          console.log(message);
        });
    }
  }, [defaultApplication]);

  useEffect(() => {
    if (
      defaultApplication?.projectId !== undefined &&
      defaultApplication?.id !== undefined
    ) {
      const requestBody = {
        withoutPagination: true,
        projectId: defaultApplication?.projectId,
        applicationId: defaultApplication?.id,
      };
      getTestCasesList(requestBody)
        .then((res) => {
          const data = res?.data?.results;

          const modifiedTestCaseData = data
            ?.map((item, i) => {
              return {
                id: item?._id,
                keyword_name: item?.testCaseName,
                isDataProvider: item?.testData?.isDataProvider,
              };
            })
            .filter((item) => item?.id !== testCaseId);
          setTestCasesData(modifiedTestCaseData);
        })
        .catch((error) => {
          const message = error?.response?.data?.details;
          toast.error(message || "Error retrieving testcases list data");
        });
    }
  }, [defaultApplication]);

  const memoizedStepRows = useMemo(() => stepRows, [stepRows]);

  const groupByIfStatement = (arr) => {
    let groupedArray = [];
    let tempGroup = [];
    let inIfBlock = false;

    arr.forEach((item) => {
      if (item?.action?.keyword_name === "Start If Statement") {
        inIfBlock = true;

        // Push the current tempGroup to groupedArray if it's not empty, then reset it
        if (tempGroup.length > 0) {
          groupedArray.push(tempGroup);
          tempGroup = [];
        }

        // Start a new group with the current "Start If Statement" item
        tempGroup.push(item);
      } else if (item?.action?.keyword_name === "End If Statement") {
        if (inIfBlock) {
          tempGroup.push(item);
          groupedArray.push(tempGroup); // Push completed if-block group to groupedArray

          // Reset for the next group
          tempGroup = [];
          inIfBlock = false;
        } else {
          groupedArray.push([item]); // End If without Start If, add item as its own group
        }
      } else if (inIfBlock) {
        tempGroup.push(item); // Add to the current if-block group
      } else {
        groupedArray.push(item); // Outside of if-block, add item as its own group
      }
    });

    // Final check: if tempGroup has remaining items, add it to groupedArray
    if (tempGroup.length > 0) {
      groupedArray.push(tempGroup);
    }
    return groupedArray;
  };

  const resulttest = groupByIfStatement(stepRows);

  const handleCloseAPIRequestModal = () => {
    setIsAPIModalOpen(false);
  };

  const handleCloseTest = () => {
    setOpenTestCaseModal(false);
    fetchTestCaseDetails();
  };

  useEffect(() => {
    if (testCaseId && defaultApplication?.type !== "RESTAPI") {
      fetchTestCaseDetails();
    }
  }, [isEditable]);

  const handleJavascriptCodeExecution = useCallback(
    (index, val) => {
      let updatedFields = {
        inputData: { keyword_name: val || "" },
      };
      updateStepRow(index - 1, updatedFields);
    },
    [updateStepRow]
  );

  const handleExecuteSQLQueryCode = useCallback(
    (index, val) => {
      let updatedQueryField = {
        executeSqlQuery: val,
      };
      updateStepRow(index - 1, updatedQueryField);
    },
    [updateStepRow]
  );

  return (
    <>
      {defaultApplication?.type === "RESTAPI" ? (
        <AddNewAPITestCases
          mode={mode}
          testCaseId={testCaseId}
          sheetList={sheetList}
          testSuiteDetails={testSuiteDetails}
          testCasesData={testCasesData}
        />
      ) : (
        <>
          <div className="items-center justify-between mb-8 lg:flex">
            <div className="flex items-center gap-2.5 mdMax:mb-3">
              <div
                className={`cursor-pointer`}
                onClick={() => {
                  if (testSuiteDetails) {
                    navigateTo("/projects/test-suites/test-cases", {
                      state: {
                        ...testSuiteDetails,
                      },
                    });
                  } else {
                    navigateTo("/projects/test-cases", {
                      state: { ...project, defaultApplication: applicationId },
                    });
                  }
                  clearStorage("ATC");
                }}
                data-testid="arrow_back_icon"
              >
                <ArrowBackIcon />
              </div>
              <div className="text-base font-medium leading-6 text-ibl14">
                <div className="min-w-[268px] max-w-[650px]">
                  <div
                    onMouseEnter={() => {
                      setIsHover(true);
                    }}
                    onMouseLeave={() => {
                      setIsHover(false);
                    }}
                    className={`flex justify-between pr-2 items-center h-10 pl-4 transition duration-500 rounded-lg hover:border border-ibl1 hover:cursor-pointer`}
                    data-tooltip-id="testCaseName"
                    data-tooltip-content={
                      editedTestCaseName?.length > 60 ? editedTestCaseName : ""
                    }
                    data-testid={`${editedTestCaseName}_name`}
                  >
                    <div>
                      {textEllipsis(editedTestCaseName, 60)}
                      <Tooltip
                        id="testCaseName"
                        noArrow
                        place="top"
                        className="!text-[11px] max-w-[300px] break-all z-[999]"
                      />
                    </div>
                    {isHover && (
                      <div>
                        <ModeOutlinedIcon
                          className="!w-[20px] !h-[20px] text-ibl1 cursor-pointer"
                          onClick={handleOpenTest}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-1 md:gap-4">
                {isEditRequired && (
                  <CustomButton
                    className="!w-[91px] h-10"
                    label={isEditable ? "Cancel" : "Edit"}
                    onClick={() => handleEditClick()}
                  />
                )}

                {isEditable && (
                  <>
                    <div>
                      <CustomButton
                        label="Generate Encrypted Data"
                        className="md:w-[250px]"
                        onClick={setShow}
                      />
                    </div>
                    <GenerateEncryptedDataModal
                      isOpen={isOpen}
                      onClose={setHide}
                    />{" "}
                  </>
                )}
                {isRunRequired && (
                  <div className="relative" ref={runDropDown}>
                    <CustomButton
                      className="!w-[91px] h-10"
                      label="Run"
                      isRunIcon={true}
                      onClick={handleRunApplication}
                      disable={
                        isEditable ||
                        !stepRows[0]?.id ||
                        status === "BLOCKED" ||
                        status === "OBSOLETE"
                      }
                    />
                    {browserOption && (
                      <div className={`${styles.browserOption}`}>
                        <RunPopUp
                          id={[testCaseId]}
                          onCloseRunPopup={closeRunPopup}
                          type={"test-cases"}
                          onRunCreated={testCaseDefault}
                          selectedApplication={location?.state?.application}
                          nameData={{ testCaseName: editedTestCaseName }}
                        />
                      </div>
                    )}
                  </div>
                )}
                <Modal
                  isOpen={isAPIModalOpen}
                  onClose={handleCloseAPIRequestModal}
                  modalClassName="!cursor-default"
                  isstopPropagationReq={true}
                >
                  <APIRequestModal onClick={handleCloseAPIRequestModal} />
                </Modal>
                <CustomButton
                  className="!w-[162px] h-10"
                  label="Save"
                  onClick={() => {
                    mode === "Create" ||
                    mode === "javascript" ||
                    testStepDataLength === 0
                      ? createTestStepData()
                      : updateTestStepData();
                  }}
                  disable={
                    !isEditable || isApiLoading
                    // || checkDisableConditions(stepRows)
                  }
                />
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <CircularProgress />
            </div>
          ) : (
            <div className={`${styles.scroll} px-2.5 pb-2 statement-row`}>
              {resulttest.map((stepRow, index) => {
                if (typeof stepRow === "object" && !Array.isArray(stepRow)) {
                  // If item is an object
                  return (
                    <div className="mt-4">
                      <StepRow
                        rowData={stepRow}
                        onActionSelect={handleActionSelect}
                        onLocatorSelect={handleLocatorSelect}
                        onPressKeySelect={hanldePressKeySelect}
                        onSubActionType={handleSubActionTypeSelect}
                        onInputChange={handleInputChange}
                        stepNumber={stepRow.stepNumber}
                        handleAddAbove={handleAddAbove}
                        handleAddBelow={handleAddBelow}
                        handleCloneStep={handleCloneStep}
                        onStepDelete={handleStepDelete}
                        stepDataLength={stepRows?.length}
                        onCheckBoxSelect={handleCheckBoxSelect}
                        isEditable={isEditable}
                        applicationType={applicationId?.type}
                        outputValues={finalOutPutValues}
                        onOutputValueSelect={handleOutputValueSelect}
                        onTestCaseSelect={handleTestCaseSelect}
                        handleMoveTo={handleMoveTo}
                        locatorList={locatorList}
                        actionList={actionList}
                        subActionType={actionSubType}
                        testCasesData={testCasesData}
                        key={stepRow.stepNumber}
                        handleJavascriptCodeExecution={
                          handleJavascriptCodeExecution
                        }
                        onDBSelect={updateDbConnection}
                        handleExecuteJavascriptCode={
                          handleJavascriptCodeExecution
                        }
                        handleExecuteSQLQueryCode={handleExecuteSQLQueryCode}
                        isPomEnabled={isPom}
                        screenList={screenList}
                        elementList={elementList}
                        onScreenType={handleScreenSelect}
                        onElementType={handleElementSelect}
                      />
                    </div>
                  );
                } else if (Array.isArray(stepRow)) {
                  // If item is an array
                  return stepRow.map((e, subIndex) => (
                    <div
                      className={`py-2 px-4 bg-iwhite statement-div ${
                        e?.action?.keyword_name === "Start If Statement" ||
                        e?.action?.keyword_name === "End If Statement"
                          ? "pl-4"
                          : "pl-12"
                      }`}
                    >
                      <StepRow
                        rowData={e}
                        onActionSelect={handleActionSelect}
                        onLocatorSelect={handleLocatorSelect}
                        onPressKeySelect={hanldePressKeySelect}
                        onSubActionType={handleSubActionTypeSelect}
                        onInputChange={handleInputChange}
                        stepNumber={e.stepNumber}
                        handleAddAbove={handleAddAbove}
                        handleAddBelow={handleAddBelow}
                        handleCloneStep={handleCloneStep}
                        onStepDelete={handleStepDelete}
                        stepDataLength={stepRows?.length}
                        onCheckBoxSelect={handleCheckBoxSelect}
                        isEditable={isEditable}
                        applicationType={applicationId?.type}
                        outputValues={finalOutPutValues}
                        onOutputValueSelect={handleOutputValueSelect}
                        onTestCaseSelect={handleTestCaseSelect}
                        handleMoveTo={handleMoveTo}
                        locatorList={locatorList}
                        actionList={actionList}
                        subActionType={actionSubType}
                        testCasesData={testCasesData}
                        key={stepRow.stepNumber}
                        handleJavascriptCodeExecution={
                          handleJavascriptCodeExecution
                        }
                        onDBSelect={updateDbConnection}
                        handleExecuteJavascriptCode={
                          handleJavascriptCodeExecution
                        }
                        handleExecuteSQLQueryCode={handleExecuteSQLQueryCode}
                        isPomEnabled={isPom}
                        screenList={screenList}
                        elementList={elementList}
                        onScreenType={handleScreenSelect}
                        onElementType={handleElementSelect}
                      />
                    </div>
                  ));
                }
                return null; // Return null if the item is neither an object nor an array
              })}
              {/* {resulttest.map((stepRow, index) => (
                <StepRow
                  rowData={stepRow}
                  onActionSelect={handleActionSelect}
                  onLocatorSelect={handleLocatorSelect}
                  onPressKeySelect={hanldePressKeySelect}
                  onSubActionType={handleSubActionTypeSelect}
                  onInputChange={handleInputChange}
                  stepNumber={stepRow.stepNumber}
                  handleAddAbove={handleAddAbove}
                  handleAddBelow={handleAddBelow}
                  handleCloneStep={handleCloneStep}
                  onStepDelete={handleStepDelete}
                  stepDataLength={stepRows?.length}
                  onCheckBoxSelect={handleCheckBoxSelect}
                  isEditable={isEditable}
                  applicationType={applicationId?.type}
                  outputValues={finalOutPutValues}
                  onOutputValueSelect={handleOutputValueSelect}
                  onTestCaseSelect={handleTestCaseSelect}
                  handleMoveTo={handleMoveTo}
                  locatorList={locatorList}
                  actionList={actionList}
                  subActionType={actionSubType}
                  testCasesData={testCasesData}
                  key={stepRow.stepNumber}
                  indexData={index}
                  onDBSelect={updateDbConnection}
                  handleExecuteJavascriptCode={handleJavascriptCodeExecution}
                  handleExecuteSQLQueryCode={handleExecuteSQLQueryCode}
                />
              ))} */}
            </div>
          )}

          <Modal
            isOpen={openTestCaseModal}
            onClose={handleCloseTest}
            isstopPropagationReq={true}
          >
            <UpdateTestCaseModal
              testCaseName={editedTestCaseName}
              dependency_id={dependency_id}
              default_browser={default_browser}
              sheet_name={sheet_name}
              start_row={start_row}
              end_row={end_row}
              onClick={handleCloseTest}
              selectedProject={project}
              selectedApplication={applicationId}
              sheetList={sheetList}
              id={testCaseId}
              isEditable={isEditable}
              mode={mode}
              isPomEnabled={isPom}
            />
          </Modal>

          <Modal
            isOpen={openCreateRunModal}
            onClose={handleCloseCreateRunModal}
          >
            <CreateRunModal
              onClick={handleCloseCreateRunModal}
              id={[testCaseId]}
              type={"projects/test-cases/add-test-steps"}
              onCloseRunPopup={handleCloseCreateRunModal}
              // clearCheckBoxes={checkBoxClear}
              selectedApplication={applicationId}
              // onRunCreated={fetchTestCasesData}
            />
          </Modal>
          <Modal
            isOpen={openApkModal}
            onClose={handleCloseApkModal}
            className="rounded-[16px]"
          >
            <ApkFileAlertModal
              onClick={handleCloseApkModal}
              projectId={project?.projectId}
              applicationId={applicationId?.id}
              projectName={projectName}
              applicationName={applicationName}
              applicationType={applicationId?.type}
            />
          </Modal>
        </>
      )}
    </>
  );
}
