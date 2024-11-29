import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Tooltip } from "react-tooltip";
import textEllipsis from "Helpers/TextEllipsis/TextEllipsis";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import { useNavigate } from "react-router-dom";
import StepRow from "Components/Molecules/StepRow/StepRow";
import styles from "./AddNewTestCases.module.scss";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import { useOutsideClick } from "Hooks/useOutSideClick";
import UpdateTestCaseModal from "Components/Molecules/UpdateTestCaseModal/UpdateTestCaseModal";
import { Modal } from "Components/Atoms/Modal/Modal";
import {
  createTestSteps,
  getCaseInfo,
  updateTestSteps,
} from "Services/API/TestCase/TestCase";
import { toast } from "react-toastify";
import CreateRunModal from "Components/Molecules/CreateRunModal/CreateRunModal";
import CreateApiRunModal from "Components/Molecules/CreateApiRunModal/CreateApiRunModal";

const AddNewAPITestCases = ({
  testSuiteDetails,
  mode = "",
  testCaseId,
  sheetList = [],
  testCasesData = [],
}) => {
  const [isHover, setIsHover] = useState(false);
  const [apiTestcaseName, setAPITestcaseName] = useState("");
  const [deletedRowsList, setDeletedRowsList] = useState([]);
  const [openTestCaseModal, setOpenTestCaseModal] = useState(false);
  const [testCaseDetails, setTestCaseDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [openCreateRunModal, setOpenCreateRunModal] = useState(false);
  const [testStepDataLength, setTestStepDataLength] = useState(0);

  const runDropDown = useRef(null);
  const [browserOption, setBrowserOption] = useState(false);
  useOutsideClick(runDropDown, () => {
    if (browserOption) {
      setBrowserOption(!browserOption);
    }
  });
  const [stepRows, setStepRows] = useState([
    {
      stepNumber: 1,
      stepName: "",
      isActive: true,
      is_skipped: false,
      apiRequest: {},
      sharedTestCaseData: null,
      action: null,
    },
  ]);
  const navigateTo = useNavigate();

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

  const handleAddAbove = useCallback((stepId) => {
    const index = stepId - 1;
    setStepRows((prevStepRows) => {
      const newStepRows = [...prevStepRows];
      newStepRows.splice(index, 0, {
        stepNumber: stepId,
        stepName: "",
        isActive: true,
        is_skipped: false,
        apiRequest: {},
        sharedTestCaseData: null,
        action: null,
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
        stepNumber: index + 1,
        stepName: "",
        isActive: true,
        is_skipped: false,
        apiRequest: {},
        sharedTestCaseData: null,
        action: null,
      });
      for (let i = index + 1; i < newStepRows?.length; i++) {
        newStepRows[i].stepNumber++;
      }
      return newStepRows;
    });
  }, []);

  const handleActionSelect = useCallback(
    (selectedValue, index) => {
      updateStepRow(index - 1, {
        action: selectedValue,
        apiRequest: {},
        sharedTestCaseData: null,
      });
    },
    [updateStepRow]
  );

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

  const handleInputChange = useCallback(
    (inputValue, type, index) => {
      let updatedFields = {};
      switch (type) {
        case "stepName":
          updatedFields = { stepName: inputValue };
          break;
        default:
          break;
      }
      updateStepRow(index - 1, updatedFields);
    },
    [updateStepRow]
  );

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

  const handleAddAPIModalData = useCallback((data, index) => {
    const updatedFields = { apiRequest: data };
    updateStepRow(index - 1, updatedFields);
  }, []);

  const handleTestCaseSelect = useCallback(
    (selectedValue, index) => {
      updateStepRow(index - 1, {
        sharedTestCaseData: selectedValue,
      });
    },
    [updateStepRow]
  );

  const createTestStepData = () => {
    const modifiedSteps = stepRows?.map((step) => {
      let headers = [];
      let paramsArray = [];
      let requiredAssertions = [];
      let requiredExtractData = [];
      if (step?.action?.value == "STEP") {
        const getAuthorizationHeader = (auth) => {
          if (auth?.username && auth?.password) {
            const credentials = `${auth?.username}:${auth?.password}`;
            const encodedCredentials = btoa(credentials); // Base64 encode
            return `Basic ${encodedCredentials}`;
          } else if (auth?.token) {
            return `Bearer ${auth?.token}`;
          }
          return "";
        };

        const headerKey = step?.apiRequest?.headers?.paramHeader || [];
        headers = [
          {
            id: "1", // Start with id "1" for Authorization
            key: "Authorization",
            value: getAuthorizationHeader(
              step?.apiRequest?.headers?.authorization
            ),
            description: "",
            isChecked: true,
          },
          ...headerKey
            .filter((header) => header?.key && header?.value) // Filter out items with empty key or value
            .map((header, index) => ({
              id: (index + 2).toString(), // Start from id "2" and increment
              key: header?.key,
              value: header?.value,
              description: header?.description,
              isChecked: header?.isChecked,
            })),
        ];

        paramsArray = step?.apiRequest?.params;
        if (paramsArray?.length) {
          const lastElement = paramsArray[paramsArray?.length - 1];
          if (lastElement?.key === "" && lastElement?.value === "") {
            paramsArray.pop(); // Remove the last element if key and value are empty
          }
        }

        const modifiedAssertions = (item) => {
          let parsedValue = item?.expectedValue;

          if (typeof parsedValue === "string" && parsedValue !== "") {
            try {
              parsedValue = JSON.parse(parsedValue);
            } catch {
              // Keep parsedValue as a string if JSON parsing fails
            }
          }

          return parsedValue;
        };

        requiredAssertions =
          step?.apiRequest?.assertions?.map((item) => ({
            id: item?.id,
            assertionName: item?.assertionName,
            type: item?.type,
            fieldPath: item?.fieldPath,
            expectedValue: modifiedAssertions(item),
            description: item?.description,
          })) || [];

        requiredExtractData = step?.apiRequest?.extract;
        if (requiredExtractData?.length) {
          const lastExtractElement =
            requiredExtractData[requiredExtractData?.length - 1];
          if (
            lastExtractElement?.key === "" &&
            lastExtractElement?.value === ""
          ) {
            requiredExtractData?.pop(); // Remove the last element if key and value are empty
          }
        }
      }

      return {
        testStepName: step?.stepName,
        orderId: step?.stepNumber,
        isSkipped: step?.is_skipped,
        requestType: "API",
        stepType: step?.action?.value,
        sharedTestCaseData:
          step?.action?.value == "CASE"
            ? {
                _id: step?.sharedTestCaseData?.id,
                testCaseName: step?.sharedTestCaseData?.keyword_name,
              }
            : null,
        isActive: step?.isActive,
        apiRequest:
          step?.action?.value == "STEP"
            ? {
                method: step?.apiRequest?.method?.name,
                url: step?.apiRequest?.url,
                authorization: {
                  type: step?.apiRequest?.authType?.value,
                  credentials: {
                    basicAuth: {
                      username:
                        step?.apiRequest?.headers?.authorization?.username,
                      password:
                        step?.apiRequest?.headers?.authorization?.password,
                    },
                    bearerToken: {
                      token: step?.apiRequest?.headers?.authorization?.token,
                    },
                  },
                },
                headers: headers,
                bodyType: step?.apiRequest?.bodyType,
                body: step?.apiRequest?.body,
                formData: step?.apiRequest?.formData,
                params: paramsArray,
                assertions: requiredAssertions,
                extract: requiredExtractData,
              }
            : {},
      };
    });

    const testSteps = {
      testCaseId: testCaseId,
      isDataProvider: false,
      testSteps: modifiedSteps,
    };

    createTestSteps(testSteps)
      .then((res) => {
        const message = res?.data?.message;
        toast.success(message);
        setStepRows([
          {
            stepNumber: 1,
            stepName: "",
            isActive: true,
            is_skipped: false,
            apiRequest: {},
            sharedTestCaseData: null,
            action: null,
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
      })
      .catch((error) => {
        toast.error(error?.response?.data?.details);
      });
  };

  const fetchTestCaseDetails = () => {
    setIsLoading(true);
    getCaseInfo(testCaseId)
      .then((res) => {
        const data = res?.data?.results;
        const caseData = {
          id: data?._id,
          testCaseName: data?.testCaseName,
          dependencyId: data?.dependencyId,
          sheetData: data?.testData,
          defaultBrowser: data?.defaultBrowser,
        };
        setTestCaseDetails(caseData);
        setAPITestcaseName(data?.testCaseName);
        const testStepData = data?.testSteps;
        if (testStepData?.length > 0) {
          const modifiedTestData = testStepData?.map((item) => {
            const methodList = [
              { id: 1, name: "GET" },
              { id: 2, name: "POST" },
              { id: 3, name: "PUT" },
              { id: 4, name: "DELETE" },
              { id: 5, name: "HEAD" },
              { id: 6, name: "PATCH" },
            ];
            const requiredMethod = methodList?.find(
              (data) => data?.name === item?.apiRequest?.method
            );

            const authenticationList = [
              { id: 1, name: "No Auth", type: "No Auth", value: "noAuth" },
              {
                id: 2,
                name: "Basic Auth",
                type: "Basic Auth",
                value: "basicAuth",
              },
              {
                id: 3,
                name: "Bearer Token",
                type: "Bearer Token",
                value: "bearerToken",
              },
            ];
            const requiredAuth = authenticationList?.find(
              (data) => data?.value === item?.apiRequest?.authorization?.type
            );

            const requiredAssertions =
              item?.apiRequest?.assertions?.map((data) => ({
                id: data?.id,
                assertionName: data?.assertionName,
                type: data?.type,
                fieldPath: data?.fieldPath,
                expectedValue: data?.expectedValue
                  ? JSON.stringify(data?.expectedValue, null, 2)
                  : "",
                description: data?.description,
                status: "New",
                error: "",
                actualValue: "",
              })) || [];

            let filteredHeaders = item?.apiRequest?.headers.filter(
              (header) => header.key !== "Authorization"
            );

            if (filteredHeaders.length === 0) {
              filteredHeaders = [
                {
                  id: "1",
                  key: "",
                  value: "",
                  description: "",
                  isChecked: true,
                },
              ];
            }

            const reorderedHeaders = filteredHeaders.map((header, index) => ({
              ...header,
              id: (index + 1).toString(), // Set id starting from 1 and convert to string
            }));

            return {
              id: item?._id,
              stepName: item?.testStepName,
              stepNumber: item?.orderId,
              isActive: item?.isActive,
              is_skipped: item?.isSkipped,
              action:
                item?.stepType == "CASE"
                  ? { id: 2, keyword_name: "Test Case", value: "CASE" }
                  : { id: 1, keyword_name: "Step", value: "STEP" },
              sharedTestCaseData: item?.sharedTestCaseData
                ? {
                    id: item?.sharedTestCaseData?._id,
                    keyword_name: item?.sharedTestCaseData?.testCaseName,
                  }
                : null,
              apiRequest: item?.apiRequest
                ? {
                    params: item?.apiRequest?.params,
                    url: item?.apiRequest?.url,
                    body: item?.apiRequest?.body,
                    formData: item?.apiRequest?.formData,
                    bodyType: item?.apiRequest?.bodyType,
                    method: requiredMethod,
                    headers: {
                      authorization:
                        item?.apiRequest?.authorization?.type === "bearerToken"
                          ? item?.apiRequest?.authorization?.credentials
                              ?.bearerToken
                          : item?.apiRequest?.authorization?.credentials
                              ?.basicAuth,
                      paramHeader: reorderedHeaders,
                    },
                    authType: requiredAuth,
                    assertions: requiredAssertions,
                    extract: item?.apiRequest?.extract,
                  }
                : {},
            };
          });
          setStepRows(modifiedTestData);
        } else {
          setStepRows([
            {
              stepNumber: 1,
              stepName: "",
              isActive: true,
              is_skipped: false,
              apiRequest: {},
              sharedTestCaseData: null,
              action: null,
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

  const updateTestStepData = () => {
    const totalStepRows = [...stepRows, ...deletedRowsList];
    let headers = [];
    let paramsArray = [];
    let requiredAssertions = [];
    let requiredExtractData = [];
    const modifiedSteps = totalStepRows?.map((step) => {
      if (step?.action?.value == "STEP") {
        const getAuthorizationHeader = (auth) => {
          if (auth?.username && auth?.password) {
            const credentials = `${auth?.username}:${auth?.password}`;
            const encodedCredentials = btoa(credentials); // Base64 encode
            return `Basic ${encodedCredentials}`;
          } else if (auth?.token) {
            return `Bearer ${auth?.token}`;
          }
          return "";
        };

        const headerKey = step?.apiRequest?.headers?.paramHeader || [];
        headers = [
          {
            id: "1", // Start with id "1" for Authorization
            key: "Authorization",
            value: getAuthorizationHeader(
              step?.apiRequest?.headers?.authorization
            ),
            description: "",
            isChecked: true,
          },
          ...headerKey
            .filter((header) => header?.key && header?.value) // Filter out items with empty key or value
            .map((header, index) => ({
              id: (index + 2).toString(), // Start from id "2" and increment
              key: header?.key,
              value: header?.value,
              description: header?.description,
              isChecked: header?.isChecked,
            })),
        ];

        paramsArray = step?.apiRequest?.params;
        if (paramsArray?.length) {
          const lastElement = paramsArray[paramsArray?.length - 1] || {};
          if (lastElement?.key === "" && lastElement?.value === "") {
            paramsArray.pop(); // Remove the last element if key and value are empty
          }
        }

        //Login for Assertions
        const modifiedAssertions = (item) => {
          let parsedValue = item?.expectedValue;

          if (typeof parsedValue === "string" && parsedValue !== "") {
            try {
              parsedValue = JSON.parse(parsedValue);
            } catch {
              // Keep parsedValue as a string if JSON parsing fails
            }
          }

          return parsedValue;
        };

        requiredAssertions =
          step?.apiRequest?.assertions?.map((item) => ({
            id: item?.id,
            assertionName: item?.assertionName,
            type: item?.type,
            fieldPath: item?.fieldPath,
            expectedValue: modifiedAssertions(item),
            description: item?.description,
          })) || [];

        requiredExtractData = step?.apiRequest?.extract;
        if (requiredExtractData?.length) {
          const lastExtractElement =
            requiredExtractData[requiredExtractData?.length - 1];
          if (
            lastExtractElement?.key === "" &&
            lastExtractElement?.value === ""
          ) {
            requiredExtractData?.pop(); // Remove the last element if key and value are empty
          }
        }
      }

      return {
        ...(step?.id && { _id: step?.id }),
        testStepName: step?.stepName,
        orderId: step?.stepNumber,
        isSkipped: step?.is_skipped,
        requestType: "API",
        stepType: step?.action?.value,
        isActive: step?.isActive,
        sharedTestCaseData:
          step?.action?.value == "CASE"
            ? {
                _id: step?.sharedTestCaseData?.id,
                testCaseName: step?.sharedTestCaseData?.keyword_name,
              }
            : null,
        apiRequest:
          step?.action?.value == "STEP"
            ? {
                method: step?.apiRequest?.method?.name,
                url: step?.apiRequest?.url,
                authorization: {
                  type: step?.apiRequest?.authType?.value,
                  credentials: {
                    basicAuth: {
                      username:
                        step?.apiRequest?.headers?.authorization?.username,
                      password:
                        step?.apiRequest?.headers?.authorization?.password,
                    },
                    bearerToken: {
                      token: step?.apiRequest?.headers?.authorization?.token,
                    },
                  },
                },
                headers: headers,
                bodyType: step?.apiRequest?.bodyType,
                body: step?.apiRequest?.body,
                formData: step?.apiRequest?.formData,
                params: paramsArray,
                assertions: requiredAssertions,
                extract: requiredExtractData,
              }
            : {},
      };
    });

    const payload = {
      testCaseId: testCaseId,
      testSteps: modifiedSteps,
      isDataProvider: false,
    };

    updateTestSteps(payload)
      .then((res) => {
        const message = res?.data?.message;
        toast.success(message);
        if (testSuiteDetails) {
          navigateTo("/projects/test-suites/test-cases", {
            state: {
              ...testSuiteDetails,
            },
          });
        } else {
          navigateTo("/projects/test-cases");
        }
        // setIsApiLoading(false);
      })
      .catch((err) => {
        const message = err?.response?.data?.details;
        toast.error(message);
        // setIsApiLoading(false);
      });
  };

  const memoizedStepRows = useMemo(() => stepRows, [stepRows]);

  useEffect(() => {
    fetchTestCaseDetails();
  }, []);

  return (
    <>
      <div className="lg:flex items-center justify-between mb-8">
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
                navigateTo("/projects/test-cases");
              }
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
                  apiTestcaseName?.length > 60 ? apiTestcaseName : ""
                }
                data-testid={`${apiTestcaseName}_name`}
              >
                <div>
                  {textEllipsis(apiTestcaseName, 60)}
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
                      onClick={() => setOpenTestCaseModal(true)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex gap-1 md:gap-4">
            <div className="relative" ref={runDropDown}>
              <CustomButton
                className="!w-[91px] h-10"
                label="Run"
                isRunIcon={true}
                onClick={() => setOpenCreateRunModal(true)}
                disable={!stepRows[0]?.id}
              />
            </div>
            <CustomButton
              className="!w-[162px] h-10"
              label="Save"
              onClick={() => {
                mode === "Create" || testStepDataLength === 0
                  ? createTestStepData()
                  : updateTestStepData();
              }}
              disable={stepRows?.length === 1 && stepRows[0]?.stepName === ""}
            />
          </div>
        </div>
      </div>
      <div className={`${styles.scroll} px-2.5 pb-2`}>
        {memoizedStepRows.map((stepRow, index) => (
          <StepRow
            rowData={stepRow}
            onInputChange={handleInputChange}
            stepNumber={stepRow.stepNumber}
            handleAddAbove={handleAddAbove}
            handleAddBelow={handleAddBelow}
            handleCloneStep={handleCloneStep}
            onStepDelete={handleStepDelete}
            stepDataLength={memoizedStepRows?.length}
            onCheckBoxSelect={handleCheckBoxSelect}
            handleMoveTo={handleMoveTo}
            isEditable={true}
            key={stepRow?.stepNumber}
            handleAddAPIModalData={handleAddAPIModalData}
            onActionSelect={handleActionSelect}
            onTestCaseSelect={handleTestCaseSelect}
            testCasesData={testCasesData}
          />
        ))}
      </div>
      <Modal
        isOpen={openTestCaseModal}
        onClose={() => setOpenTestCaseModal(false)}
        isstopPropagationReq={true}
      >
        <UpdateTestCaseModal
          testCaseName={apiTestcaseName}
          dependency_id={testCaseDetails?.dependencyId}
          default_browser={testCaseDetails?.defaultBrowser}
          sheet_name={testCaseDetails?.sheetData?.sheetName}
          start_row={testCaseDetails?.sheetData?.startRow}
          end_row={testCaseDetails?.sheetData?.endRow}
          onClick={() => {
            setOpenTestCaseModal(false);
            fetchTestCaseDetails();
          }}
          id={testCaseId}
          mode={mode}
        />
      </Modal>
      <Modal
        isOpen={openCreateRunModal}
        onClose={() => setOpenCreateRunModal(false)}
      >
        <CreateApiRunModal
          onClick={() => setOpenCreateRunModal(false)}
          runIds={[testCaseId]}
          type="test-cases"
        />
      </Modal>
    </>
  );
};

export default AddNewAPITestCases;
