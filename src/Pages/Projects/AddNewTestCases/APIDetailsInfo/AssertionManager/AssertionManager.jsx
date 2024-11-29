import React, { useState, useEffect } from "react";
import IntegrationInstructionsOutlinedIcon from "@mui/icons-material/IntegrationInstructionsOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import HttpsOutlinedIcon from "@mui/icons-material/HttpsOutlined";
import SafetyCheckIcon from "@mui/icons-material/SafetyCheck";
import TuneTwoToneIcon from "@mui/icons-material/TuneTwoTone";
import SearchInput from "Components/Atoms/SearchInput/SearchInput";
import InputField from "Components/Atoms/InputField/InputField";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import styles from "./AssertionManager.module.scss";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import { FiChevronRight } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import { BsPlus } from "react-icons/bs";

const AssertionCategories = {
  STATUS: { name: "Status", icon: <SafetyCheckIcon /> },
  // HEADERS: { name: "Headers & Cookies", icon: <HttpsOutlinedIcon /> },
  BODY: {
    name: "Response Body",
    icon: <IntegrationInstructionsOutlinedIcon />,
  },
  DATA: { name: "Data Validation", icon: <CodeOutlinedIcon /> },
  // ADVANCED: { name: "Advanced", icon: <TuneTwoToneIcon /> },
};

const AssertionTypes = {
  STATUS: {
    // STATUS: {
    //   name: "Status",
    //   description: "Validates the status code.",
    //   type: "equal",
    // },
    // PERFORMANCE: {
    //   name: "Performance",
    //   description: "Validates the response time.",
    // },
  },
  // HEADERS: {
  //   HEADER: {
  //     name: "Header",
  //     description:
  //       "Validates the presence and value of a specific HTTP header.",
  //   },
  //   COOKIE: {
  //     name: "Cookie",
  //     description: "Checks for the existence and value of a specific cookie.",
  //   },
  // },
  BODY: {
    BODY_CONTAINS: {
      name: "Body Contains",
      description:
        "Checks if the response body contains a specific string or pattern.",
      type: "includes",
    },
    BODY_EQUALS: {
      name: "Body Equals",
      description:
        "Checks if the response body equals a specific string or pattern.",
      type: "equal",
    },
    JSON_PATH: {
      name: "JSON Path",
      description:
        "Extracts and validates a value from the JSON response using JSONPath.",
      type: "equal",
    },
    ARRAY_LENGTH: {
      name: "Array Length",
      description: "Validates the length of an array in the JSON response.",
      type: "lengthOf",
    },
    // SCHEMA_VALIDATION: {
    //   name: "Schema Validation",
    //   description: "Validates the JSON response against a specified schema.",
    //   type: "",
    // },
  },
  DATA: {
    KEY_EXISTENCE: {
      name: "Key Existence",
      description:
        "Checks for the existence of a specific key in the response.",
      type: "exists",
    },
    // VALUE_COMPARISON: {
    //   name: "Value Comparison",
    //   description: "Compares a value in the response to an expected value.",
    //   type: "",
    // },
    DATA_TYPE: {
      name: "Data Type",
      description:
        "Checks if a value in the response is of the expected data type.",
      type: "type",
    },
  },
  // ADVANCED: {
  //   // ERROR_HANDLING: {
  //   //   name: "Error Handling",
  //   //   description: "Validates error responses and handling.",
  //   // },
  //   DYNAMIC_VALUE: {
  //     name: "Dynamic Value",
  //     description: "Validates dynamic or calculated values in the response.",
  //     type: "",
  //   },
  // },
};

export const AssertionManager = ({
  onClose,
  handleAssertions = () => {},
  assertionsData = [],
}) => {
  const [assertions, setAssertions] = useState(assertionsData);
  const [selectedAssertion, setSelectedAssertion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleOnClose = () => {
    setSelectedAssertion(null);
  };

  const addAssertion = (type, assertionName, description) => {
    const newAssertion = {
      id: Date.now(),
      type,
      assertionName,
      description,
      fieldPath: "",
      expectedValue: "",
      actualValue: "",
      status: "New",
      error: "",
    };
    setAssertions((prevAssertions) => [...prevAssertions, newAssertion]);
    setSelectedAssertion(newAssertion);
  };

  const updateAssertion = (id, field, value) => {
    setAssertions((prevAssertions) =>
      prevAssertions?.map((assertion) =>
        assertion?.id === id ? { ...assertion, [field]: value } : assertion
      )
    );
    if (selectedAssertion && selectedAssertion?.id === id) {
      setSelectedAssertion((prevSelected) => ({
        ...prevSelected,
        [field]: value,
      }));
    }
  };

  const removeAssertion = (id) => {
    setAssertions((prevAssertions) =>
      prevAssertions?.filter((assertion) => assertion.id !== id)
    );
    if (selectedAssertion && selectedAssertion.id === id) {
      setSelectedAssertion(null);
    }
  };

  const validateAssertions = () => {
    setAssertions((prevAssertions) =>
      prevAssertions?.map((assertion) => {
        if (assertion?.status === "New") {
          const passed = Math.random() < 0.8;
          let actual, error;
          if (passed) {
            actual = assertion?.expectedValue;
            error = "";
          } else {
            actual = `Unexpected value: ${Math.random()
              .toString(36)
              .substring(7)}`;
            error = `Assertion failed: Expected "${assertion?.expectedValue}", but got "${actual}"`;
          }

          return {
            ...assertion,
            status: passed ? "Passed" : "Failed",
            actual: actual,
            error: error,
          };
        }
        return assertion;
      })
    );
  };

  // const filteredAssertions = assertions?.filter(
  //   (assertion) =>
  //     assertion?.type?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
  //     assertion?.fieldPath
  //       ?.toLowerCase()
  //       ?.includes(searchTerm?.toLowerCase()) ||
  //     assertion?.expectedValue
  //       ?.toLowerCase()
  //       ?.includes(searchTerm?.toLowerCase())
  // );

  const renderAssertionInput = (assertion) => {
    // switch (assertion.name) {
    //   // case AssertionTypes?.HEADERS?.HEADER?.name:
    //   // case AssertionTypes?.HEADERS?.COOKIE?.name:
    //   case AssertionTypes?.BODY?.JSON_PATH?.name:
    return (
      <>
        <InputField
          className="w-full  p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#ffff]"
          inputClassName="bg-[#ffff]"
          placeholder="Enter Field Path"
          value={assertion?.fieldPath}
          onChange={(e) =>
            updateAssertion(assertion?.id, "fieldPath", e.target.value)
          }
        />
        {assertion?.assertionName !== "Key Existence" && (
          <InputField
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Expected Value"
            value={assertion?.expectedValue}
            onChange={(e) =>
              updateAssertion(assertion?.id, "expectedValue", e.target.value)
            }
          />
        )}
      </>
    );
    // default:
    //   return (
    //     <InputField
    //       className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    //       placeholder="Expected Value"
    //       value={assertion.expected}
    //       onChange={(e) =>
    //         updateAssertion(assertion.id, "expected", e.target.value)
    //       }
    //     />
    //   );
    // }
  };

  const modifiedAssertions = (item) => {
    let parsedValue = item?.expectedValue;

    if (typeof parsedValue === "string") {
      try {
        parsedValue = JSON.parse(parsedValue);
      } catch {
        // Keep parsedValue as a string if JSON parsing fails
      }
    }

    return parsedValue;
  };

  const AssertionCard = ({ assertion }) => (
    <div
      className={`p-4 border rounded-lg shadow-sm cursor-pointer transition-all ${
        selectedAssertion && selectedAssertion?.id === assertion?.id
          ? `${styles.stepsContainer} border-[#3B82F6] bg-[#EFF6FF] ring-2 ring-[#93C5FD] border-none`
          : `${styles.stepsContainer} !shadow-[0_0_4px_0_rgba(12,86,255,0.72)] hover:border-[#93C5FD] hover:shadow border-none`
      }`}
      onClick={() => setSelectedAssertion(assertion)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-ibl1">
          {assertion?.assertionName}
        </span>
        <span
          className={`px-3 rounded-md py-1 text-xs font-medium ${
            assertion?.status === "New"
              ? "bg-[#FFEDE2] text-[#F48333]"
              : assertion?.status === "Passed"
              ? "bg-[#D1F1E4] text-[#089E61]"
              : "bg-ird5 text-ird3"
          }`}
        >
          {assertion?.status}
        </span>
      </div>
      <div className="text-sm text-[#4B5563] truncate max-h-[80px] !overflow-y-auto">
        <pre className="break-all whitespace-pre-wrap">
          {assertion?.expectedValue !== ""
            ? JSON.stringify(modifiedAssertions(assertion), null, 2)
            : assertion?.assertionName == "Key Existence"
            ? ""
            : "No expected value set"}
        </pre>
      </div>
      {assertion?.status === "Failed" && assertion?.error && (
        <div className="mt-2 p-2 bg-[#FEF2F2] border border-[#FECACA] text-[#C71A25] rounded text-xs">
          <p className="truncate">{assertion?.error}</p>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    handleAssertions(assertions);
  }, [assertions]);

  return (
    <div className="flex flex-col -mt-[12px] h-[510px]">
      <div className="flex-grow flex overflow-hidden relative">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`absolute top-0 left-0 z-10 flex items-center justify-center w-[17px] h-[30px] rounded-tr-lg rounded-br-lg bg-ibl1 shadow-md text-[#4B5563] hover:text-[#1F2937] ring-[#3B82F6] transition-colors focus:outline-none`}
        >
          {showSidebar ? (
            <FiChevronRight size={16} className="font-bold text-[#ffff]" />
          ) : (
            <FiChevronDown size={16} className="font-semibold text-[#ffff]" />
          )}
        </button>

        {showSidebar && (
          <div className="w-1/4 bg-[#F9FAFB] flex flex-col border-r border-solid border-igy12 overflow-hidden rounded-bl-lg shrink-0">
            <div className="p-4 pt-6 overflow-y-auto flex-grow">
              <SearchInput
                placeHolder="Search"
                maxLength={255}
                className="!border !border-solid !border-ibl1 h-8 mb-4"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
              {Object.entries(AssertionCategories).map(
                ([key, { name, icon }]) => (
                  <div key={key} className="mb-2">
                    <button
                      className={`w-full px-4 py-3 rounded-lg hover:bg-[#E6EEFF] transition-colors focus:outline-none focus:bg-[#E6EEFF] text-left flex items-center justify-between ${
                        activeCategory === key
                          ? "bg-[#D6E2FF] text-ibl1"
                          : "text-ibl1"
                      }`}
                      onClick={() => {
                        if (key === "STATUS") {
                          addAssertion(
                            "equal",
                            name,
                            "Validates the status code."
                          );
                        }
                        setActiveCategory(activeCategory === key ? null : key);
                      }}
                    >
                      <span className="flex items-center">
                        {icon}
                        <span className="ml-2 font-medium">{name}</span>
                      </span>
                    </button>
                    {activeCategory === key && (
                      <div className="ml-6 mt-2 space-y-1">
                        {Object.entries(AssertionTypes[key]).map(
                          ([typeKey, { name, description, type }]) => (
                            <CustomTooltip
                              key={typeKey}
                              title={description}
                              placement="top"
                            >
                              <button
                                onClick={() =>
                                  addAssertion(type, name, description)
                                }
                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                              >
                                <BsPlus className="mr-1" />
                                {name}
                              </button>
                            </CustomTooltip>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
            <div className="border-t border-igy12 bg-[#F9FAFB] p-2 flex items-center rounded-bl-lg justify-center">
              <span className="ml-3 text-sm text-ibl1 text-center">
                {assertions?.length} assertion(s)
              </span>
            </div>
          </div>
        )}
        <div className="flex-grow flex flex-col overflow-hidden">
          {assertions?.length === 0 && (
            <div className="flex items-center justify-center h-[1000px] w-[700px] text-center font-medium text-base text-[#767676] italic ml-6">
              Choose the appropriate assertion types from the API dropdown,
              enter the relevant data, and view the status in the Result tab.
            </div>
          )}
          <div className={`flex-grow overflow-y-auto p-4 h-[282px]`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assertions
                ?.filter(
                  (assertion) =>
                    assertion?.assertionName
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    assertion?.expectedValue
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                ?.map((assertion) => (
                  <AssertionCard key={assertion.id} assertion={assertion} />
                ))}
            </div>
          </div>
          {selectedAssertion && (
            <div className="border-t-2 bg-white border-[#E5E5E5] h-[300px] bg-[#F9FAFB]">
              <div className="sticky top-0 bg-white z-10 px-4 py-2 border-b-2 border-[#E5E5E5]">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#1F2937]">
                    {selectedAssertion?.assertionName}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div>
                      <div className="flex flex-row justify-between border-2 rounded-xl border-[#E5E5E5] w-[180px] p-[2px] bg-[#D6E2FF]">
                        <div
                          className={`rounded-md py-[1px] text-sm px-5 ${
                            activeTab === "details"
                              ? "bg-ibl1 text-[#ffffff]"
                              : "hover:cursor-pointer"
                          }`}
                          onClick={() => setActiveTab("details")}
                        >
                          Details
                        </div>
                        <div
                          className={`rounded-md py-[1px] text-sm px-5 ${
                            activeTab === "error"
                              ? "bg-ibl1 text-[#ffffff]"
                              : "hover:cursor-pointer"
                          }`}
                          onClick={() => setActiveTab("error")}
                        >
                          Result
                        </div>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1 text-[#ffffff] rounded-md text-sm bg-[#C53030] transition-colors"
                      onClick={() => removeAssertion(selectedAssertion?.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <div
                  className="p-4 overflow-y-auto h-[158px]"
                  style={{ height: "158px" }}
                >
                  {activeTab === "details" && (
                    <div className="h-full flex flex-col">
                      <p className="text-sm text-gray-600">
                        {selectedAssertion?.description}
                      </p>
                      <div className="flex-grow mt-1.5">
                        {renderAssertionInput(selectedAssertion)}
                      </div>
                    </div>
                  )}
                  {activeTab === "error" && (
                    <div className="space-y-2 h-full overflow-y-auto">
                      <div className="flex space-x-4">
                        <div className="flex-1 p-3 bg-[#EFF6FF] rounded-md shadow-md">
                          <h4 className="font-semibold mb-2 text-sm text-[#1E40AF]">
                            Expected:
                          </h4>
                          <p className="text-sm text-[#1D4ED8]">
                            <pre className="break-all whitespace-pre-wrap">
                              {selectedAssertion?.expectedValue !== ""
                                ? JSON.stringify(
                                    modifiedAssertions(selectedAssertion),
                                    null,
                                    2
                                  )
                                : selectedAssertion?.assertionName ==
                                  "Key Existence"
                                ? "NA"
                                : "No expected value set"}
                            </pre>
                          </p>
                        </div>
                        <div className="flex-1 p-3 bg-[#ECFDF5] rounded-md shadow-md">
                          <h4 className="font-semibold mb-2 text-sm text-[#065F46]">
                            Actual:
                          </h4>
                          <p className="text-sm text-[#15803D]">
                            <pre className="break-all whitespace-pre-wrap">
                              {JSON.stringify(
                                selectedAssertion?.actualValue,
                                null,
                                2
                              ) || "No actual value available"}
                            </pre>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {selectedAssertion?.status === "Failed" &&
                  activeTab === "error" &&
                  selectedAssertion?.error && (
                    <div className="p-3 bg-[#FEF2F2] rounded-md mt-4">
                      <h4 className="font-semibold mb-2 text-sm text-red-800">
                        Error Details:
                      </h4>
                      <p className="text-sm font-semibold text-[#C71A25] break-words">
                        {selectedAssertion?.error}
                      </p>
                    </div>
                  )}
                {selectedAssertion?.status !== "Failed" &&
                  activeTab === "error" && (
                    <div className="p-3 font-semibold bg-[#F0FDF4] rounded-md mt-4 shadow-md">
                      <p className="text-sm text-[#047857]">
                        No errors. Assertion passed successfully.
                      </p>
                    </div>
                  )}
              </div>
              {/* <div className="flex flex-row gap-4 items-end justify-end pr-4">
                <CustomButton onClick={validateAssertions} label="Validate" />
                <CustomButton
                  onClick={handleOnClose}
                  label="Close"
                  className="w-[160px] h-10 !text-ibl3 bg-iwhite border border-ibl1 hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1"
                />
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
