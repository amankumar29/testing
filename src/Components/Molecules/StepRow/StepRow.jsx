import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import stepBg from "Assets/Images/stepbg.svg";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import styles from "./StepRow.module.scss";
import ActionInput from "../../Atoms/ActionInput/ActionInput";
import SearchDropdown from "../../Atoms/SearchDropdown/SearchDropdown";
import CustomCheckbox from "../../Atoms/CustomCheckbox/CustomCheckbox";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import { useOutsideClick } from "Hooks/useOutSideClick";
import InputWithSuggestion from "../../Atoms/InputWithSuggestion/InputWithSuggestion";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import { Modal } from "Components/Atoms/Modal/Modal";
import APIRequestModal from "../APIRequestModal/APIRequestModal";
import ConnectDataBaseModal from "../ConnectDataBaseModal/ConnectDataBaseModal";
import AceEditor from "react-ace";
// Import language mode and theme (if required)
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github"; // You can choose any theme you like
import ace from "ace-builds";

// Import a theme and mode
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/theme-monokai";

// If needed, import more features
import "ace-builds/src-noconflict/ext-language_tools";
import { useLazyGetGlobalVariableQuery } from "Services/API/apiHooks";
// Set worker URL for JavaScript
ace.config.setModuleUrl(
  "ace/mode/javascript_worker",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.12/src-noconflict/worker-javascript.js"
);

// Set worker URL for MySQL
ace.config.setModuleUrl(
  "ace/mode/mysql_worker",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.12/src-noconflict/worker-sql.js"
);

const StepRow = ({
  onActionSelect = () => {},
  onInputChange = () => {},
  onLocatorSelect = () => {},
  stepNumber,
  handleAddAbove = () => {},
  onPressKeySelect = () => {},
  onSubActionType = () => {},
  onScreenType = () => {},
  onElementType = () => {},
  handleAddBelow = () => {},
  handleCloneStep = () => {},
  rowData,
  onStepDelete = () => {},
  stepDataLength,
  onCheckBoxSelect = () => {},
  isEditable = false,
  applicationType,
  outputValues = [],
  onOutputValueSelect = () => {},
  onTestCaseSelect = () => {},
  handleMoveTo = () => {},
  handleAddAPIModalData = () => {},
  locatorList = [],
  actionList = [],
  subActionType = [],
  testCasesData = [],
  isPomEnabled = false,
  key,
  onDBSelect,
  handleExecuteJavascriptCode = () => {},
  handleExecuteSQLQueryCode = () => {},
  screenList = [],
  elementList = [],
}) => {
  const moveTo = useRef(null);
  const [deleteHover, setDeleteHover] = useState(false);
  const [isMoveTo, setIsMoveTo] = useState(null);
  const [moveToIndex, setMoveToIndex] = useState("");
  const { defaultApplication } = useSelector((state) => state?.userDetails);
  const [isAPIModalOpen, setIsAPIModalOpen] = useState(false);
  const [isOpenDB, setIsOpenDB] = useState(false);
  const [javascriptCodeEnter, setJavascriptCodeEnter] = useState(false);
  const [showJavascriptExecutionModal, setShowJavascriptExecutionModal] =
    useState(false);
  const [openExecuteSQLQuery, setOpenExecuteSQLQuery] = useState(false);
  const [getGlobalVariableName, setGetGlobalVariableName] = useState([]);
  const [sqlQueryError, setSqlQueryError] = useState(null);

  const [getGlobalVariableList] = useLazyGetGlobalVariableQuery();

  const validateSQLQuery = (query) => {
    const errors = [];

    if (!query?.trim()) {
      errors.push("SQL query cannot be empty");
      return errors;
    }
    const sqlKeywords = [
      "SELECT",
      "INSERT",
      "UPDATE",
      "DELETE",
      "CREATE",
      "DROP",
      "ALTER",
      "TRUNCATE",
      "GRANT",
      "REVOKE",
      "SHOW",
      "SET",
      "CALL",
      "WITH",
      "USE",
      "DESCRIBE",
      "EXPLAIN",
      "BEGIN",
      "COMMIT",
      "ROLLBACK",
    ];

    const firstWord = query?.trim()?.split(/\s+/)[0]?.toUpperCase();

    if (sqlKeywords?.includes(firstWord)) {

      const singleQuotes = (query.match(/'/g) || []).length;
      const doubleQuotes = (query.match(/"/g) || []).length;
      if (singleQuotes % 2 !== 0) {
        errors.push("Unmatched single quotes in query");
      }
      if (doubleQuotes % 2 !== 0) {
        errors.push("Unmatched double quotes in query");
      }

      if (!query.trim().endsWith(";")) {
        errors.push("Query must end with a semicolon (;)");
      }
    } else if (query.trim().length > 3) {
    
      errors.push(
        "Invalid SQL syntax. Query must start with a valid SQL command"
      );
    }

    return errors;
  };

  const handleSelect = (option) => {
    onActionSelect(option, stepNumber);
  };

  const handleLocator = (option) => {
    onLocatorSelect(option, stepNumber);
  };

  const handlePress = (option) => {
    onPressKeySelect(option, stepNumber);
  };

  const handleSubActionType = (option) => {
    onSubActionType(option, stepNumber);
  };

  const handleScreenType = (option) => {
    onScreenType(option, stepNumber);
  };
  const handleElementType = (option) => {
    // console.log(JSON.stringify(option, null, 2));
    onElementType(option, stepNumber);
  };

  const handleCheckbox = useCallback(() => {
    onCheckBoxSelect(!rowData?.is_skipped, stepNumber);
  }, [rowData, stepNumber]);

  const onMoveToClick = () => {
    if (moveToIndex === "") {
      toast.error("No input detected. Please fill in the required fields.");
    } else if (moveToIndex <= 0 || moveToIndex > stepDataLength) {
      toast.error("Step Number is out of range");
    } else {
      handleMoveTo(stepNumber, moveToIndex);
    }
    setMoveToIndex("");
    setIsMoveTo(null);
  };

  const handleInput = (e, type) => {
    const inputValue = e.target.value;
    onInputChange(inputValue, type, stepNumber);
  };

  const fetchAPIModalData = (data) => {
    handleAddAPIModalData(data, stepNumber);
  };

  const handleOpenDataBase = () => {
    setIsOpenDB(true);
  };

  const handleCloseDataBase = () => {
    setIsOpenDB(false);
  };

  const handleOpenSQLQueryModal = () => {
    setOpenExecuteSQLQuery(true);
  };

  const handleCloseSQLQueryModal = () => {
    setOpenExecuteSQLQuery(false);
  };

  const handleDBSelect = useCallback(
    (data) => {
      onDBSelect(stepNumber, data);
    },
    [stepNumber, rowData]
  );

  useOutsideClick(moveTo, () => {
    if (isMoveTo === stepNumber) {
      setIsMoveTo(null);
    }
  });

  const handleJavascriptCodeExecution = () => {
    setShowJavascriptExecutionModal(true);
  };

  const handleChange = useCallback(
    (value) => {
      handleExecuteJavascriptCode(stepNumber, value);
    },
    [stepNumber, rowData]
  );

  const handleChangeSQLQuery = useCallback(
    (value) => {
      if (value.trim()?.length > 0) {
        const validationErrors = validateSQLQuery(value);
        setSqlQueryError(validationErrors?.length > 0 ? validationErrors : null);
      } else {
        setSqlQueryError(null);
      }

      handleExecuteSQLQueryCode(stepNumber, value);
    },
    [stepNumber, handleExecuteSQLQueryCode]
  );

  const apiActions = [
    { id: 1, keyword_name: "Step", value: "STEP" },
    { id: 2, keyword_name: "Test Case", value: "CASE" },
  ];

  const fetchGlobalVariableList = async () => {
    try {
      const body = {
        projectId: defaultApplication?.projectId,
        applicationId: defaultApplication?.id,
      };
      const response = await getGlobalVariableList(body).unwrap();
      const globalVariabledata = response?.results?.variables;
      const matchGlobalVariable = globalVariabledata?.find(
        (item) => item?.variableName === rowData?.action?.keyword_name
      );

      const globalVariableData = Array.isArray(matchGlobalVariable)
        ? matchGlobalVariable
        : [matchGlobalVariable]; // Wrap single object in an array

      const modifiedGlobalVariableData = globalVariableData?.map((item, i) => {
        return {
          id: item._id,
          keyword_name: `in_${item?.variableValue}`,
          keyWordValue: item.variableName,
        };
      });
      setGetGlobalVariableName(modifiedGlobalVariableData);
    } catch (error) {
      toast.error(error.msg);
    }
  };

  useEffect(() => {
    fetchGlobalVariableList();
  }, [rowData.action]);

  const allOutputValue = [...outputValues, ...getGlobalVariableName];

  return (
    <div className={`${styles.stepsContainer} mt-1`} key={key}>
      {/* <p>{JSON.stringify(rowData)}</p> */}
      <div className="flex mb-3 rounded-lg bg-iwhite">
        <div className="relative">
          <img src={stepBg} data-testid="step_bg_img" alt="" />
          <div className="absolute top-0 ">
            <div
              className="flex items-center justify-center w-8 h-[34px] font-medium text-base leading-6 text-ibl1"
              data-testid={`${stepNumber}_number`}
            >
              {stepNumber}
            </div>
          </div>
        </div>
        <div className="w-full p-6 mdMax:p-3 mdMax:pl-0">
          <div
            className={`md:flex items-center ${
              isEditable ? "mt-5" : "mt-[5px]"
            } gap-2.5`}
          >
            <div className="w-full md:w-[204px] relative">
              <ActionInput
                id={`${stepNumber}`}
                label={"Step Name"}
                placeHolder={"Enter Step Name"}
                type={"text"}
                onChange={(e) => handleInput(e, "stepName")}
                value={rowData?.stepName}
                isEditable={isEditable}
              />
            </div>
            {defaultApplication?.type === "RESTAPI" ? (
              <>
                <div className="w-full md:w-[204px] shedular-in mdMax:mt-3">
                  <SearchDropdown
                    id={stepNumber}
                    option={apiActions}
                    placeHolder="Choose Type"
                    label={"Type"}
                    selectedOption={rowData?.action}
                    onSelect={handleSelect}
                    // isEditable={isEditable}
                  />
                </div>
                {rowData?.action?.keyword_name === "Test Case" && (
                  <div className="w-[204px]">
                    <SearchDropdown
                      id={stepNumber}
                      option={testCasesData}
                      placeHolder="Choose Test Case"
                      label={"Test Cases"}
                      selectedOption={rowData?.sharedTestCaseData}
                      onSelect={(option) =>
                        onTestCaseSelect(option, stepNumber)
                      }
                      isEditable={isEditable}
                    />
                  </div>
                )}
                {rowData?.action?.keyword_name === "Step" && (
                  <>
                    {rowData?.apiRequest?.url && (
                      <div className="w-full md:w-[204px]">
                        <ActionInput
                          id={`${stepNumber}`}
                          label={"URL"}
                          placeHolder={"Enter URL"}
                          type={"text"}
                          // onChange={(e) => handleInput(e, "URL")}
                          value={rowData?.apiRequest?.url}
                          isEditable={false}
                        />
                      </div>
                    )}
                    {rowData?.apiRequest?.url && (
                      <div className="w-full md:w-[204px]">
                        <ActionInput
                          id={`${stepNumber}`}
                          label={"Method"}
                          placeHolder={"Enter Method"}
                          type={"text"}
                          // onChange={(e) => handleInput(e, "URL")}
                          value={rowData?.apiRequest?.method?.name}
                          isEditable={false}
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium leading-6 w-fit">
                        API Request
                      </p>
                      <CustomButton
                        className="w-full md:w-[204px] h-[46px] py-2 mt-2"
                        label="Edit API Request"
                        onClick={() => setIsAPIModalOpen(true)}
                        disable={rowData?.stepName ? false : true}
                      />
                      <Modal
                        isOpen={isAPIModalOpen}
                        onClose={() => setIsAPIModalOpen(false)}
                        modalClassName="!cursor-default"
                        isstopPropagationReq={true}
                      >
                        <APIRequestModal
                          onClick={() => setIsAPIModalOpen(false)}
                          apiModalData={rowData?.apiRequest}
                          fetchAPIModalData={fetchAPIModalData}
                        />
                      </Modal>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="w-full md:w-[204px] shedular-in mdMax:mt-3">
                  <SearchDropdown
                    id={stepNumber}
                    option={actionList}
                    placeHolder="Choose Action"
                    label={"Action"}
                    selectedOption={rowData?.action}
                    onSelect={handleSelect}
                    isEditable={isEditable}
                    isStepsMethod={true}
                  />
                </div>
                {rowData?.action?.keyword_name === "Start If Statement" && (
                  <div className="w-[204px]">
                    <SearchDropdown
                      option={subActionType}
                      placeHolder="Choose Type"
                      label={"If Condition Type"}
                      selectedOption={rowData?.subMethod1}
                      onSelect={handleSubActionType}
                      isEditable={isEditable}
                    />
                    {/* <p>{JSON.stringify(subActionType)}</p> */}
                  </div>
                )}

                {rowData?.subMethod1?.isVariableData && (
                  <div className="w-[204px]">
                    <ActionInput
                      id={`${stepNumber}`}
                      label={"Variable"}
                      placeHolder={"Enter Value Here"}
                      type={"text"}
                      onChange={(e) => handleInput(e, "variableValue")}
                      value={rowData?.variableValue}
                      isEditable={isEditable}
                    />
                  </div>
                )}

                {(rowData?.action?.isElementTarget ||
                  rowData?.subMethod1?.isElementTarget) && (
                  <>
                    {!isPomEnabled ? (
                      <>
                        <div className="w-[204px]">
                          <SearchDropdown
                            id={stepNumber}
                            option={locatorList}
                            placeHolder="Choose Locator"
                            label={"Locate Element"}
                            selectedOption={rowData?.locator}
                            onSelect={handleLocator}
                            isEditable={isEditable}
                          />
                        </div>
                        <div className="w-[204px]">
                          <ActionInput
                            id={stepNumber}
                            label={
                              rowData?.locator?.keyword_name
                                ? rowData?.locator?.keyword_name
                                : "Locator Value"
                            }
                            placeHolder={
                              rowData?.locator?.keyword_name
                                ? `Enter ${rowData?.locator?.keyword_name}`
                                : "Enter Locator Value"
                            }
                            type={"text"}
                            onChange={(e) => handleInput(e, "inputPath")}
                            value={rowData?.inputPath}
                            isEditable={isEditable}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-[204px]">
                          <SearchDropdown
                            option={screenList}
                            placeHolder="Choose Screen"
                            label={"Screen"}
                            selectedOption={rowData?.screen}
                            onSelect={handleScreenType}
                            isEditable={isEditable}
                          />
                        </div>
                        <div className="w-[204px]">
                          <SearchDropdown
                            option={elementList}
                            placeHolder="Choose Element"
                            label={"Element"}
                            selectedOption={rowData?.element}
                            onSelect={handleElementType}
                            isEditable={isEditable}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
                {(rowData?.action?.isInputData ||
                  rowData?.subMethod1?.isInputData) &&
                  (rowData?.action?.keyword_name == "Press Key" ? (
                    <div className="w-[204px]">
                      <SearchDropdown
                        id={stepNumber}
                        option={pressOption}
                        placeHolder="Choose Key"
                        label={"Press Key"}
                        selectedOption={rowData?.pressKey}
                        onSelect={handlePress}
                        isEditable={isEditable}
                      />
                    </div>
                  ) : rowData?.action?.keyword_name == "Execute JavaScript" ? (
                    <>
                      <div
                        className="flex flex-col gap-2"
                        onMouseEnter={() => setJavascriptCodeEnter(true)}
                        onMouseLeave={() => setJavascriptCodeEnter(false)}
                      >
                        <div
                          className={`${
                            javascriptCodeEnter ||
                            rowData?.inputData?.keyword_name
                              ? "!text-ibl1 text-sm font-medium leading-6 w-fit"
                              : "text-sm font-medium leading-6 w-fit"
                          }`}
                        >
                          JavaScript Code
                        </div>
                        <CustomButton
                          label="Edit JavaScript Code"
                          className={`${
                            javascriptCodeEnter ||
                            rowData?.inputData?.keyword_name
                              ? "border border-ibl1 !bg-iwhite !text-ibl1 !h-[46px] text-sm"
                              : "h-[46px] !text-iblack bg-iwhite border border-igy1 rounded-lg text-sm hover:bg-iwhite"
                          }`}
                          onClick={() =>
                            handleJavascriptCodeExecution(stepNumber)
                          }
                          disable={
                            (rowData?.length === 1 &&
                              (rowData[0]?.stepName === "" ||
                                rowData[0]?.action == null)) ||
                            !isEditable
                          }
                        />
                      </div>
                      <Modal
                        isOpen={showJavascriptExecutionModal}
                        onClose={showJavascriptExecutionModal}
                      >
                        <div className="w-[800px] h-[600px] bg-iwhite p-6 javascript-execute-ace-editor-styles">
                          <div className="flex flex-col gap-4">
                            <div className="text-[16px] text-igy17">
                              JavaScript Code
                            </div>
                            <div>
                              <AceEditor
                                mode="javascript"
                                theme="github"
                                value={rowData?.inputData?.keyword_name}
                                onChange={handleChange}
                                name="javascript-editor"
                                editorProps={{ $blockScrolling: true }}
                                fontSize={14}
                                style={{
                                  width: "100%",
                                  height: "460px",
                                  border: "1px solid #d1d5db",
                                  borderTopLeftRadius: "0.375rem",
                                  borderTopRightRadius: "0.375rem",
                                  backgroundColor: "#141414",
                                  color: "#fff",
                                  fontFamily: "monospace",
                                  cursor: "text",
                                  overflowY: "auto",
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <CustomButton
                                label="Add"
                                className="!w-[100px] bg-iwhite border border-ibl33 !text-ibl33 hover:bg-iwhite"
                                onClick={() =>
                                  setShowJavascriptExecutionModal(false)
                                }
                              />
                              <CustomButton
                                label="Cancel"
                                className="!w-[120px] bg-iwhite hover:bg-iwhite !text-igy18"
                                onClick={() =>
                                  setShowJavascriptExecutionModal(false)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </Modal>
                    </>
                  ) : rowData?.action?.keyword_name ===
                    "Connect to Database" ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <div className="ml-1 text-sm font-medium leading-6 w-fit text-ibl1">
                          Database Connection
                        </div>
                        <CustomButton
                          onClick={handleOpenDataBase}
                          label={`Edit Connection`}
                          disable={
                            (rowData?.length === 1 &&
                              (rowData[0]?.stepName === "" ||
                                rowData[0]?.dbConnection == null)) ||
                            !isEditable
                          }
                        />
                      </div>
                      <Modal
                        isOpen={isOpenDB}
                        onClose={handleCloseDataBase}
                        isstopPropagationReq={true}
                      >
                        <ConnectDataBaseModal
                          onClick={handleCloseDataBase}
                          setDBData={handleDBSelect}
                          dbData={rowData}
                          isEditable={isEditable}
                        />
                      </Modal>
                    </>
                  ) : rowData?.action?.keyword_name === "Execute SQL Query" ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <div className="ml-1 text-sm font-medium leading-6 w-fit text-ibl1">
                          Execute SQL Query
                        </div>
                        <CustomButton
                          onClick={handleOpenSQLQueryModal}
                          label={`Execute SQL Query`}
                          disable={
                            (rowData?.length === 1 &&
                              (rowData[0]?.stepName === "" ||
                                rowData[0]?.action == null)) ||
                            !isEditable
                          }
                        />
                      </div>
                      <Modal
                        isOpen={openExecuteSQLQuery}
                        onClose={handleCloseSQLQueryModal}
                      >
                        <div className="w-[800px] h-[640px] bg-iwhite p-6 javascript-execute-ace-editor-styles">
                          <div className="flex flex-col gap-4">
                            <div className="text-[16px] text-igy17">
                              Execute SQL Query
                            </div>
                            <div>
                              <AceEditor
                                placeholder="Enter SQL Query"
                                mode="mysql"
                                theme="github"
                                name="blah2"
                                onChange={handleChangeSQLQuery}
                                style={{
                                  width: "100%",
                                  height: "460px",
                                  border: `2px solid ${
                                    sqlQueryError ? "#ef4444" : "#d1d5db"
                                  }`,
                                  borderTopLeftRadius: "0.375rem",
                                  borderTopRightRadius: "0.375rem",
                                  backgroundColor: "#141414",
                                  color: "#fff",
                                  fontFamily: "monospace",
                                  cursor: "text",
                                  overflowY: "auto",
                                }}
                                showPrintMargin={true}
                                showGutter={true}
                                highlightActiveLine={true}
                                value={rowData?.executeSqlQuery}
                                setOptions={{
                                  enableBasicAutocompletion: true,
                                  enableLiveAutocompletion: true,
                                  enableSnippets: true,
                                  enableMobileMenu: true,
                                  showLineNumbers: true,
                                  tabSize: 2,
                                }}
                                annotations={
                                  sqlQueryError
                                    ? sqlQueryError.map((error, index) => ({
                                        row: 0,
                                        column: 0,
                                        type: "error",
                                        text: error,
                                      }))
                                    : []
                                }
                              />
                              {sqlQueryError && (
                                <div className="mt-2 text-sm text-ird3">
                                  {sqlQueryError.map((error, index) => (
                                    <div key={index}>{error}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <CustomButton
                                label="Add"
                                className="!w-[100px] bg-iwhite border border-ibl33 !text-ibl33 hover:bg-iwhite"
                                onClick={() => setOpenExecuteSQLQuery(false)}
                              />
                              <CustomButton
                                label="Cancel"
                                className="!w-[120px] bg-iwhite hover:bg-iwhite !text-igy18"
                                onClick={() => setOpenExecuteSQLQuery(false)}
                              />
                            </div>
                          </div>
                        </div>
                      </Modal>
                    </>
                  ) : (
                    <>
                      <div className="w-[204px]">
                        <InputWithSuggestion
                          id={`${stepNumber}`}
                          label={"Input Data"}
                          placeHolder={"Enter Input"}
                          type={"text"}
                          onInputValueChange={(e) =>
                            handleInput(e, "inputData")
                          }
                          onOptionSelect={(option) =>
                            onOutputValueSelect(option, stepNumber)
                          }
                          value={rowData?.inputData}
                          isEditable={isEditable}
                          outputValues={allOutputValue}
                        />
                      </div>
                    </>
                  ))}
                {rowData?.action?.isOutputValue && (
                  <div className="w-[204px]">
                    <ActionInput
                      id={`${stepNumber}`}
                      label={"Output Value"}
                      placeHolder={"Enter Value Here"}
                      type={"text"}
                      onChange={(e) => handleInput(e, "outputValue")}
                      value={rowData?.output_value}
                      isEditable={isEditable}
                    />
                  </div>
                )}
                {rowData?.action?.keyword_name === "Test Case" && (
                  <div className="w-[204px]">
                    <SearchDropdown
                      id={stepNumber}
                      option={testCasesData}
                      placeHolder="Choose Test Case"
                      label={"Test Cases"}
                      selectedOption={rowData?.shared_test_case_data}
                      onSelect={(option) =>
                        onTestCaseSelect(option, stepNumber)
                      }
                      isEditable={isEditable}
                    />
                  </div>
                )}
              </>
            )}
          </div>
          {isEditable && (
            <div className="flex items-center justify-between mt-4 mdMax:block">
              <div className="mt-3">
                <button
                  className="text-sm font-medium mdMax:text-xs text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in-out"
                  onClick={() => handleAddAbove(stepNumber)}
                  data-testid={`${stepNumber}_add_above`}
                >
                  Add Above
                  <KeyboardArrowUpIcon />
                </button>
                <button
                  className="ml-6 text-sm font-medium mdMax:ml-1 mdMax:text-xs text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in-out"
                  onClick={() => handleAddBelow(stepNumber)}
                  data-testid={`${stepNumber}_add_below`}
                >
                  Add Below
                  <KeyboardArrowDownIcon />
                </button>
                <button
                  className="ml-6 text-sm font-medium mdMax:ml-1 mdMax:text-xs text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in-out"
                  onClick={() => handleCloneStep(stepNumber)}
                  data-testid={`${stepNumber}_add_clone_duplicate`}
                >
                  Duplicate Step
                  <KeyboardArrowDownIcon />
                </button>
              </div>
              <div className="flex items-center gap-6">
                <div
                  className="flex w-12 justify-center items-center mt-[1px]"
                  data-tooltip-id={`${stepNumber}_skip`}
                  data-tooltip-content={"Skip"}
                >
                  <CustomCheckbox
                    id={`${stepNumber}_custom_checkbox`}
                    onChecked={handleCheckbox}
                    isChecked={rowData?.is_skipped}
                  />
                </div>
                <Tooltip
                  id={`skip-${stepNumber}`}
                  noArrow
                  place="bottom"
                  className="!text-[11px]"
                />
                <div
                  className="relative flex items-center justify-center w-12"
                  ref={moveTo}
                >
                  <div
                    className={`${
                      stepDataLength > 1
                        ? "text-ibl1 hover:text-ibl3 cursor-pointer hover:transition-all hover:duration-300 hover:ease-in"
                        : "text-ibl2"
                    }`}
                    data-tooltip-id={`moveTo-${stepNumber}`}
                    data-tooltip-content={"Move To"}
                    onClick={() => {
                      if (isMoveTo !== null || stepDataLength <= 1) {
                        setIsMoveTo(null);
                      } else {
                        setMoveToIndex("");
                        setIsMoveTo(stepNumber);
                      }
                    }}
                    data-testid={`${stepNumber}_right_outlined_icon`}
                  >
                    <ArrowCircleRightOutlinedIcon />
                  </div>
                  {isMoveTo === stepNumber && (
                    <div
                      className={`absolute top-[-81px] left-[-116px] w-[250px] h-[72px] bg-ibl7 rounded-lg p-4 ${styles.moveToContainer}`}
                    >
                      <div className="flex items-center gap-[7px]">
                        <p
                          className="leading-5 text-sm font-medium text-ibl1 -tracking-[0.4px]"
                          data-testid={`${stepNumber}_move_to`}
                        >
                          Move To
                        </p>
                        <div className="w-[108px]">
                          <ActionInput
                            id={`${stepNumber}`}
                            placeHolder={"Enter Step Number"}
                            type={"number"}
                            className="!h-10 !text-[10px] !mt-0 !px-[7px] bg-iwhite"
                            onChange={(e) => setMoveToIndex(e.target.value)}
                            value={moveToIndex}
                            isEditable={true}
                            autoFocus={true}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                onMoveToClick();
                              } else if (
                                e?.key === "e" ||
                                e?.key === "E" ||
                                e?.key === "+" ||
                                e?.key === "-" ||
                                e?.key === "." ||
                                e?.key === ","
                              ) {
                                e?.preventDefault();
                              }
                            }}
                          />
                        </div>
                        <div
                          className={`w-10 h-10 ${styles.moveToIcon} flex items-center justify-center hover:cursor-pointer`}
                          onClick={onMoveToClick}
                          data-testid={`${stepNumber}_forward_outlined_icon`}
                        >
                          <ArrowForwardIosOutlinedIcon className="text-iwhite" />
                        </div>
                      </div>
                    </div>
                  )}
                  <Tooltip
                    id={`moveTo-${stepNumber}`}
                    noArrow
                    place="bottom"
                    className="!text-[11px]"
                  />
                </div>
                <div
                  className="flex items-center justify-center w-12"
                  data-tooltip-id={`delete-${stepNumber}`}
                  data-tooltip-content={"Delete"}
                  data-testid={`${stepNumber}_delete_icon`}
                >
                  <RiDeleteBin6Line
                    style={{
                      ...(stepDataLength > 1 && { cursor: "pointer" }),
                      width: "22px",
                      height: "24px",
                      color:
                        stepDataLength < 2
                          ? "#9BACD2"
                          : deleteHover
                          ? "#1246BC"
                          : "#052C85",
                    }}
                    onMouseEnter={() => setDeleteHover(true)}
                    onMouseLeave={() => setDeleteHover(false)}
                    onClick={() => {
                      stepDataLength > 1 && onStepDelete(rowData);
                    }}
                  />
                </div>
                <Tooltip
                  id={`delete-${stepNumber}`}
                  noArrow
                  place="bottom"
                  className="!text-[11px]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(StepRow);

// export default StepRow;

StepRow.propTypes = {
  onActionSelect: PropTypes.func,
  onInputChange: PropTypes.func,
  stepNumber: PropTypes.number,
  stepDataLength: PropTypes.number,
  handleAddAbove: PropTypes.func,
  handleAddBelow: PropTypes.func,
  onLocatorSelect: PropTypes.func,
  onPressKeySelect: PropTypes.func,
  onStepDelete: PropTypes.func,
  onCheckBoxSelect: PropTypes.func,
  rowData: PropTypes.object,
  isEditable: PropTypes.bool,
  handleMoveTo: PropTypes.func,
  onTestCaseSelect: PropTypes.func,
  onOutputValueSelect: PropTypes.func,
  testCasesData: PropTypes.array,
  actionList: PropTypes.array,
  locatorList: PropTypes.array,
  handleExecuteJavascriptCode: PropTypes.func,
  handleExecuteSQLQueryCode: PropTypes.func,
};
const pressOption = [
  { id: 1, keyword_name: "Up Arrow" },
  {
    id: 2,
    keyword_name: "Down Arrow",
  },
  {
    id: 3,
    keyword_name: "Back Space",
  },
  {
    id: 4,
    keyword_name: "Enter",
  },
  {
    id: 5,
    keyword_name: "Delete",
  },
];
