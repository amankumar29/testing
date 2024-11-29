import CloseIcon from "@mui/icons-material/Close";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import Papa from "papaparse";
import { Modal } from "Components/Atoms/Modal/Modal";
import { useRef, useState } from "react";
import { useFormik } from "formik";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import * as Yup from "yup";
import { createTestCase, importTestCase } from "Services/API/TestCase/TestCase";
import textEllipsis from "Helpers/TextEllipsis/TextEllipsis";
import { toast } from "react-toastify";

// Define required headers
const REQUIRED_HEADERS = [
  "ID",
  "Test Case Name",
  "Test Step Name",
  "Order ID",
  "Action",
  "Locate Element",
  "Input Data",
  "Output Value",
  "Status",
];

// Define required keys for Action and Locate Element JSON
const REQUIRED_ACTION_KEYS = [
  "_id",
  "isInputData",
  "isOutputValue",
  "isElementTarget",
  "keyword_name",
  "application_type",
];
const REQUIRED_LOCATE_ELEMENT_KEYS = ["id", "name", "value"];

const ImportCsvModal = ({
  isOpen,
  onClose,
  projectData = null,
  onCrossClick = () => {},
}) => {
  const [parsedData, setParsedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const handleCreate = async () => {
    setLoading(true); // Show loader

    try {
      for (let obj of parsedData) {
        const dataarr = {
          testCaseName: "MainMethods",
          status: "ACTIVE",
          caseType: "WEB",
          defaultBrowser: "CHROME",
          applicationId: "6715e167db95c505357094c3",
          projectId: "6715e167db95c505357094bb",
          testStepsToCreate: [
            {
              testStepName: "Navigate to URL",
              orderId: 1,
              stepType: "STEP",
              requestType: "WEB",
              webData: {
                inputData: "https://qa-iltaf.ideyalabs.com",
                outputValue: null,
                subMethod1: null,
                subMethod2: null,
                action: {
                  _id: "67384bec48bec656794e8f4a",
                  keyword_name: "Navigate To Url",
                  is_deleted: false,
                  application_type: "Web",
                  isInputData: true,
                  isElementTarget: false,
                  isOutputValue: false,
                  sub_methods: [],
                },
                locateElement: null,
              },
            },
            {
              testStepName: "Enter email",
              orderId: 2,
              stepType: "STEP",
              requestType: "WEB",
              webData: {
                inputData: "venuvasanthg@ideyalabs.com",
                outputValue: null,
                subMethod1: null,
                subMethod2: null,
                action: {
                  _id: "67384bec48bec656794e901d",
                  keyword_name: "Set Text Using Actions",
                  is_deleted: false,
                  application_type: "Web",
                  isInputData: true,
                  isElementTarget: true,
                  isOutputValue: false,
                  sub_methods: [],
                },
                locateElement: {
                  id: "66fce8824008100793ac3cf5",
                  name: "Id",
                  value: "email",
                },
              },
            },
            {
              testStepName: "Enter //input[@id='Password']",
              orderId: 3,
              stepType: "STEP",
              requestType: "WEB",
              webData: {
                inputData: "Admin@123",
                outputValue: null,
                subMethod1: null,
                subMethod2: null,
                action: {
                  _id: "67384bec48bec656794e901d",
                  keyword_name: "Set Text Using Actions",
                  is_deleted: false,
                  application_type: "Web",
                  isInputData: true,
                  isElementTarget: true,
                  isOutputValue: false,
                  sub_methods: [],
                },
                locateElement: {
                  id: "66fce8824008100793ac3cf5",
                  name: "Xpath",
                  value: "//input[@id='Password']",
                },
              },
            },
            {
              testStepName: "Click on //button[contains(text(),'Sign In')]",
              orderId: 4,
              stepType: "STEP",
              requestType: "WEB",
              webData: {
                inputData: null,
                outputValue: null,
                subMethod1: null,
                subMethod2: null,
                action: {
                  _id: "67384bec48bec656794e8f53",
                  keyword_name: "Click Element",
                  is_deleted: false,
                  application_type: "Web",
                  isInputData: false,
                  isElementTarget: true,
                  isOutputValue: false,
                  sub_methods: [],
                },
                locateElement: {
                  id: "66fce8824008100793ac3cf9",
                  name: "Xpath",
                  value: "//button[contains(text(),'Sign In')]",
                },
              },
            },
          ],
        };
        const res = await importTestCase(dataarr); // Wait for the response
        console.log("Response:", res); // Handle the response
      }
    } catch (error) {
      toast.error("Unable to import. Please try again");
    } finally {
      setLoading(false); // Hide loader
      handleClose();
    }
  };

  const formik = useFormik({
    initialValues: {
      value: null,
      fileName: null,
    },
    validationSchema: Yup.object({
      value: Yup.array().required("CSV is required."),
    }),
  });

  // Function to handle file upload and parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          const { data, meta } = result;

          // Step 1: Validate headers
          const headerValidationErrors = validateHeaders(meta.fields);

          // Step 2: Validate data
          const rowValidationErrors = validateRows(data);

          setErrors([...headerValidationErrors, ...rowValidationErrors]);

          if (!headerValidationErrors.length && !rowValidationErrors.length) {
            const processedData = processCSVData(data);
            setParsedData(processedData);
            formik.setFieldValue("value", processedData);
            formik.setFieldValue("fileName", file.name);
          }
        },
        skipEmptyLines: true,
      });
    }
  };

  // Function to validate headers
  const validateHeaders = (headers) => {
    const missingHeaders = REQUIRED_HEADERS.filter(
      (header) => !headers.includes(header)
    );
    if (missingHeaders.length > 0) {
      return [`Missing headers: ${missingHeaders.join(", ")}`];
    }
    return [];
  };

  // Function to validate rows
  const validateRows = (rows) => {
    const errors = [];
    rows.forEach((row, index) => {
      // Validate Action JSON
      if (row["Action"] && row["Action"] !== "null") {
        try {
          const actionJson = JSON.parse(row["Action"]);
          const missingKeys = REQUIRED_ACTION_KEYS.filter(
            (key) => !(key in actionJson)
          );
          if (missingKeys.length > 0) {
            errors.push(
              `Row ${index + 1}: Action missing keys: ${missingKeys.join(", ")}`
            );
          }
        } catch (e) {
          errors.push(`Row ${index + 1}: Invalid JSON format in Action field`);
        }
      }

      // Validate Locate Element JSON
      if (row["Locate Element"] && row["Locate Element"] !== "null") {
        try {
          const locateElementJson = JSON.parse(row["Locate Element"]);
          const missingKeys = REQUIRED_LOCATE_ELEMENT_KEYS.filter(
            (key) => !(key in locateElementJson)
          );
          if (missingKeys.length > 0) {
            errors.push(
              `Row ${
                index + 1
              }: Locate Element missing keys: ${missingKeys.join(", ")}`
            );
          }
        } catch (e) {
          errors.push(
            `Row ${index + 1}: Invalid JSON format in Locate Element field`
          );
        }
      }
    });

    return errors;
  };

  // Updated function to process CSV data into the desired JSON format
  const processCSVData = (data) => {
    const testCasesMap = {};

    data.forEach((row) => {
      const testCaseName = row["Test Case Name"];
      const testStep = {
        testStepName: row["Test Step Name"],
        orderId: parseInt(row["Order ID"], 10),
        stepType: "STEP", // Assuming "STEP" as the default for stepType
        requestType: "WEB", // Assuming "WEB" for requestType as mentioned in the example

        // Constructing webData with nested action and locateElement
        webData: {
          inputData: row["Input Data"] || null,
          outputValue: row["Output Value"] || null,
          action: row["Action"] ? JSON.parse(row.Action) : null,
          subMethod1: null, // As per example, defaulting these fields to null
          subMethod2: null,
          locateElement:
            row["Locate Element"] !== "null"
              ? JSON.parse(row["Locate Element"])
              : null,
        },
      };

      // If the test case does not exist, initialize it
      if (!testCasesMap[testCaseName]) {
        testCasesMap[testCaseName] = {
          testCaseName: testCaseName,
          status: "ACTIVE", // Assuming "ACTIVE" as the status
          caseType: "WEB",
          defaultBrowser: "CHROME", // Assuming "WEB" as the case type based on the example
          applicationId: projectData?.id || null,
          projectId: projectData?.projectId || null,
          testStepsToCreate: [], // Initializing an empty array for test steps
        };
      }

      // Push the test step into the respective test case
      testCasesMap[testCaseName].testStepsToCreate.push(testStep);
    });

    // Returning the test cases in the desired structure
    return Object.values(testCasesMap);
  };

  // // Function to process CSV data into the desired JSON format
  // const processCSVData = (data) => {
  //   const testCasesMap = {};

  //   data.forEach((row) => {
  //     const testCaseName = row["Test Case Name"];
  //     const testStep = {
  //       test_step_name: row["Test Step Name"],
  //       action: row["Action"] ? JSON.parse(row.Action) : null,
  //       order_id: parseInt(row["Order ID"], 10),
  //       locate_element:
  //         row["Locate Element"] !== "null"
  //           ? JSON.parse(row["Locate Element"])
  //           : null,
  //       input_data: row["Input Data"] || "",
  //       is_deleted: false,
  //       is_disabled: false,
  //       output_value: row["Output Value"] || "",
  //       shared_test_case_data: null,
  //     };
  //     if (!testCasesMap[testCaseName]) {
  //       testCasesMap[testCaseName] = {
  //         test_case_name: testCaseName,
  //         status: "Draft",
  //         application_id: projectData?.applicationId,
  //         project_id: projectData?.projectId,
  //         dependency_id: null,
  //         default_browser: "Chrome",
  //         reusable_tests: [],
  //         test_steps: [],
  //       };
  //     }

  //     testCasesMap[testCaseName].test_steps.push(testStep);
  //   });

  //   return Object.values(testCasesMap);
  // };

  // Handle modal close, reset form and errors
  const handleClose = () => {
    onClose();
    setErrors([]);
    formik.resetForm();
    setParsedData(null);
  };

  // Handle file input click
  const handleContainerClick = () => {
    if (!formik.values.value) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  // Remove file and reset value
  const handleRemoveFile = (e) => {
    e.stopPropagation();
    formik.setFieldValue("value", null);
    setErrors(["CSV is Required"]);
  };
  const crossHandler = () => {
    onCrossClick();
    setErrors([]);
    formik.resetForm();
    setParsedData(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={crossHandler}>
      <div className="w-[450px]">
        {/* <p>{JSON.stringify(parsedData)}</p> */}
        <div className="flex items-center justify-center h-20 bg-ibl7 rounded-t-[10px] relative">
          <p className="text-lg font-medium leading-7">Import Test Cases</p>
          <CloseIcon
            onClick={crossHandler}
            className="absolute right-0 mr-8 cursor-pointer"
          />
        </div>
        <div className="flex justify-center mt-8">
          <p className="max-w-[350px] text-center">
            Import Test Cases by uploading a CSV File
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mt-4 px-14">
          <div className="group">
            <div
              className={`border-[2px] border-dashed rounded-[10px] hover:border-ibl1 flex items-center justify-center h-14 relative ${
                formik.values.value
                  ? "border-ibl1"
                  : "border-igy6 cursor-pointer"
              } ${errors?.length > 0 && "border-ird1"}`}
              onClick={handleContainerClick}
            >
              {formik.values.value ? (
                <div>
                  <div
                    className=" rounded-full w-3 h-3 text-ird1 flex justify-center items-center hover:text-iwhite cursor-pointer hover:bg-ird1 absolute top-[4px] right-[4px] text-xs"
                    onClick={handleRemoveFile}
                  >
                    <ClearRoundedIcon style={{ fontSize: "12px" }} />
                  </div>
                  <div className="text-lg text-blue-500">
                    {textEllipsis(formik.values.fileName, 25)}
                  </div>
                </div>
              ) : (
                <div className="text-lg text-igy5">+ Upload File</div>
              )}
              <input
                type="file"
                name="value"
                accept=".csv"
                onChange={handleFileUpload}
                className="cursor-pointer "
                ref={fileInputRef}
                hidden
              />
            </div>

            {/* Validation Errors Section */}
            {errors.length > 0 && (
              <div className="text-ird3 text-[10px] font-medium mt-1">
                <ul>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-8 mb-6">
          <CustomButton
            type="submit"
            label="Import"
            className="w-[246px]"
            onClick={handleCreate}
            disable={
              errors.length > 0 || formik.values.value == null || loading
            }
          />
        </div>
      </div>
    </Modal>
  );
};

export default ImportCsvModal;
