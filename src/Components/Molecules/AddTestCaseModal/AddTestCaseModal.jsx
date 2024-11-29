import CloseIcon from "@mui/icons-material/Close";

import { useFormik } from "formik";
import * as Yup from "yup";

import chrome from "Assets/Images/google.svg";
import safari from "Assets/Images/safari.svg";
import firefox from "Assets/Images/firefox.svg";
import edge from "Assets/Images/edge.svg";

import PropTypes, { number } from "prop-types";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { setStorage } from "Storage";
import { getTestCasesList } from "Services/API/Projects/Projects";
import { toast } from "react-toastify";
import InputField from "Components/Atoms/InputField/InputField";
import SearchDropdown from "Components/Atoms/SearchDropdown/SearchDropdown";
import SelectDropdown from "Components/Atoms/SelectDropdown/SelectDropdown";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import { setcaseCreated } from "Store/ducks/testCases";
import { createTestCase } from "Services/API/TestCase/TestCase";
import { WebsocketContext } from "Services/Socket/socketProvider";
import CustomToggle from "Components/Atoms/CustomToggle/CustomToggle";

export default function AddTestCaseModal({
  onClick,
  selectedProject,
  selectedApplication,
  payload,
  type,
  testSuiteData,
  sheetList = [],
  backArrow = false,
  onBackNavigation = () => {},
}) {
  const navigate = useNavigate();

  const [selectSheetName, setSelectSheetName] = useState(null);
  const [testCaseList, setTestCaseList] = useState([]);
  const [selectedProjectNew, setSelectedProjectNew] = useState(null);
  const [selectSheet, setSelectSheet] = useState(false);
  const dispatch = useDispatch();
  const { defaultApplication, userDetails } = useSelector(
    (state) => state?.userDetails
  );
  const { socket } = useContext(WebsocketContext);

  const [isPom, setIsPom] = useState(false);

  const handleToggle = (state) => {
    setIsPom(state);
  };

  const handleAdd = () => {
    let data = {
      test_case_name: formik?.values?.testCaseName?.trim(),
      dependency_id: formik?.values?.dependency?.id
        ? formik?.values?.dependency?.id
        : null,
      ...(defaultApplication?.type === "WEB" && {
        default_browser: formik?.values?.defaultBrowser?.name,
      }),
      sheet_name: formik?.values?.sheetName?.keyword_name
        ? formik?.values?.sheetName?.keyword_name
        : null,
      start_row: formik?.values?.startRow
        ? Number(formik?.values?.startRow)
        : null,
      end_row: formik?.values?.endRow ? Number(formik?.values?.endRow) : null,
      project: selectedProject,
      application: selectedApplication,
      isEditable: true,
      isEditRequired: false,
      isRunRequired: false,
    };

    const requestPayload = {
      ...(testSuiteData?.id && { targetSuiteId: testSuiteData?.id }),
      testCaseName: formik?.values?.testCaseName?.trim(),
      // status: "ACTIVE",
      status: "DRAFT", //  Initially, the status must be set to 'Draft' as per the QA requirements.
      applicationId: defaultApplication?.id,
      projectId: defaultApplication?.projectId,
      dependencyId: formik?.values?.dependency?.id,
      testData: {
        sheetName: formik?.values?.sheetName?.keyword_name
          ? formik?.values?.sheetName?.keyword_name
          : null,
        startRow: formik?.values?.startRow
          ? Number(formik?.values?.startRow)
          : null,
        endRow: formik?.values?.endRow ? Number(formik?.values?.endRow) : null,
        isDataProvider: false,
      },
      defaultBrowser: formik?.values?.defaultBrowser?.name?.toUpperCase(),
      caseType: defaultApplication?.type === "WEB" ? "WEB" : "API",
      isPom: isPom,
    };

    createTestCase(requestPayload)
      .then((res) => {
        const testCaseId = res?.data?.results?._id;
        // console.log(res?.data?.results?._id);
        socket.emit("onTestcases", {
          command: "testCaseCreate",
          organizationId: userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user: {
            userName: userDetails?.userName,
            userId: userDetails?.userId,
          },
          data: {
            data: res?.data?.results,
            ...(testSuiteData?.id && { targetSuiteId: testSuiteData?.id }),
          },
        });
        if (type === "test-cases") {
          navigate(`/projects/${type}/add-test-steps`, {
            state: { ...data, testCaseId, mode: "Create" },
          });
        } else if (type === "suite-test-cases") {
          navigate(`/projects/test-suites/test-cases/add-test-steps`, {
            state: {
              ...data,
              testCaseId,
              testSuiteData: testSuiteData,
              mode: "Create", // this is to differentiate the create and update in teststeps screen
            },
          });
        }
        dispatch(setcaseCreated(true));
        setStorage("ATC", JSON.stringify(data));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  const formik = useFormik({
    initialValues: {
      testCaseName: "",
      dependency: null,
      defaultBrowser: browserList[0] || null,
      sheetName: null,
      startRow: "",
      endRow: "",
      selectedApplication: defaultApplication,
    },
    validationSchema: Yup.object({
      testCaseName: Yup.string()
        .test("no-emojis", "Test case name cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Test case name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .min(2, "Test case name must be least 2 characters.")
        .max(50, "Test case name must be at most 50 characters.")
        .matches(
          /^[a-zA-Z0-9_.\- ]+$/,
          "Enter only letters, numbers, _, -, ., and spaces."
        ),
      defaultBrowser: Yup.object()
        .nullable()
        .when("selectedApplication", {
          is: (val) => val?.type == "WEB",
          then: (schema) => schema.required("Default Browser is required"),
        }),
      startRow: Yup.number()
        .nullable()
        .transform((value, originalValue) =>
          String(originalValue).trim() === "" ? null : Number(value)
        )
        .typeError("Start Row must be a number.")
        .when("sheetName", {
          is: (val) => val !== null,
          then: (schema) =>
            schema
              .required("Start Row required.")
              .min(1, "Start Row must be greater than 0."),
        }),

      endRow: Yup.number()
        .nullable()
        .transform((value, originalValue) =>
          String(originalValue).trim() === "" ? null : Number(value)
        )
        .typeError("End Row must be a number.")
        .when("sheetName", {
          is: (val) => val !== null,
          then: (schema) =>
            schema
              .required("End Row required.")
              .min(1, "End Row must be greater than 0.")
              .test(
                "is-not-less-than-startRow",
                "End Row must be greater than Start Row.",
                function (value) {
                  const { startRow } = this.parent;
                  return value >= startRow;
                }
              ),
        }),
    }),
    onSubmit: handleAdd,
  });

  const fetchTestCasesData = (limit, offset) => {
    const requestBody = {
      applicationId: defaultApplication?.id,
      projectId: defaultApplication?.projectId,
      offset,
      includeCount: true,
      sortColumn: "id",
      sortOrder: "Desc",
      withoutPagination: false,
    };

    getTestCasesList(requestBody)
      .then((res) => {
        const data = res?.data?.results;
        const updatedProjectList = data?.map((item) => {
          return {
            id: item?._id,
            keyword_name: item?.testCaseName,
          };
        });
        setTestCaseList(updatedProjectList);
      })
      .catch((error) => {
        const message = error?.response?.data?.details;
        if (message != "No test cases found") {
          toast.dismiss();
          toast.error(message || "Error retrieving testcases list data");
        }
      });
  };

  const handleProjectSelect = (option) => {
    formik.setFieldValue("dependency", option);
    setSelectedProjectNew(option);
  };

  const handleSheetSelect = (option) => {
    formik.setFieldValue("sheetName", option);
    setSelectSheetName(option);
    if (option !== null) {
      setSelectSheet(true);
    } else {
      setSelectSheet(false);
      formik.setFieldValue("startRow", "");
      formik.setFieldValue("endRow", "");
      formik.setFieldTouched("startRow", false);
      formik.setFieldTouched("endRow", false);
    }
  };

  useEffect(() => {
    fetchTestCasesData(25, 0, payload);
  }, [25, 0, payload, defaultApplication]);

  const isAddButtonDisabled = () => {
    const { testCaseName, defaultBrowser, sheetName, startRow, endRow } =
      formik.values;

    // Check if testCaseName and defaultBrowser are filled
    if (
      !testCaseName ||
      (defaultApplication?.type == "Web" && !defaultBrowser)
    ) {
      return true;
    }

    // Check if sheetName is selected and both startRow and endRow are filled and valid
    if (sheetName) {
      const startRowNumber = Number(startRow);
      const endRowNumber = Number(endRow);

      if (
        isNaN(startRowNumber) ||
        isNaN(endRowNumber) ||
        !startRow ||
        !endRow ||
        startRowNumber < 1 ||
        endRowNumber < 1 ||
        endRowNumber < startRowNumber
      ) {
        return true;
      }
    }

    return false; // Enable the button
  };

  return (
    <>
      <div className="flex items-center justify-center w-auto model-popup">
        <div
          className={`${
            defaultApplication?.type == "WEB" ? "w-full" : "w-[450px]"
          } h-auto rounded-2xl shadow-2xl`}
        >
          <div className="flex flex-row justify-end h-[80px] bg-ibl7 w-full rounded-t-[10px]">
            <div
              className={`${
                backArrow || defaultApplication?.type !== "WEB"
                  ? "w-full"
                  : "w-[720px]"
              } h-[80px]  flex justify-between items-center`}
            >
              {backArrow && (
                <div className="ml-[19px] cursor-pointer">
                  <ArrowBackIcon onClick={onBackNavigation} />
                </div>
              )}
              <div
                className={`${
                  defaultApplication?.type !== "WEB" &&
                  !backArrow &&
                  "ml-[66px]"
                } text-[18px] font-medium leading-7 flex justify-center items-center w-full`}
              >
                Add New Test Case
              </div>
              <div
                className="flex justify-end !pr-6 pl-[14px]"
                data-testid="close_icon"
              >
                <CloseIcon onClick={onClick} className="cursor-pointer" />
              </div>
            </div>
          </div>
          <div
            className={`flex items-center flex-col my-8 px-8 overflow-y-auto max-h-[calc(100vh-100px)] test-model`}
          >
            <div
              className={`flex flex-col w-full ${
                defaultApplication?.type == "WEB"
                  ? "gap-6"
                  : "gap-5 model-other"
              }`}
            >
              <div
                className={`${
                  defaultApplication?.type == "WEB"
                    ? "md:flex gap-5"
                    : "flex flex-col gap-5"
                }`}
              >
                <div className="md:w-[50%] mdMax:mb-5 input-full">
                  <InputField
                    isRequired={true}
                    label="Test Case Name"
                    className="w-full h-[52px]"
                    placeHolderSize={true}
                    placeHolder="Enter Test Case Name"
                    inputClassName="text-sm"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    {...formik.getFieldProps("testCaseName")}
                    error={
                      formik.touched.testCaseName && formik.errors.testCaseName
                    }
                  />
                </div>
                {defaultApplication?.type !== "RESTAPI" && (
                  <div className="md:w-[50%] input-full">
                    <SearchDropdown
                      option={testCaseList}
                      label="Dependencies"
                      className="h-[52px]"
                      placeHolder="Select Test Case"
                      selectedOption={selectedProjectNew}
                      onSelect={handleProjectSelect}
                      // hideCross={true}
                      onBlur={() => {
                        formik.setFieldTouched("dependency", true);
                      }}
                    />
                  </div>
                )}
              </div>
              <div
                className={`${
                  defaultApplication?.type == "WEB"
                    ? "md:flex gap-5"
                    : "flex flex-col"
                }`}
              >
                {defaultApplication?.type == "WEB" && (
                  <div className="md:w-[50%] mdMax:mb-5">
                    <SelectDropdown
                      iconForApplication={true}
                      id="defaultBrowser"
                      isRequired={true}
                      label={"Default Browser"}
                      className="h-[52px]"
                      placeHolder="Select Browser Type"
                      options={browserList}
                      inputClassName="text-[14px]"
                      value={formik.values.defaultBrowser}
                      onBlur={() => {
                        formik.setFieldTouched("defaultBrowser", true);
                      }}
                      onChange={(option) => {
                        formik.setFieldValue("defaultBrowser", option);
                      }}
                      error={
                        formik.touched.defaultBrowser &&
                        formik.errors.defaultBrowser
                      }
                    />
                  </div>
                )}
                {defaultApplication?.type !== "RESTAPI" && (
                  <div className="md:w-[50%] input-full">
                    <SearchDropdown
                      label={"Sheet Name"}
                      className="h-[52px]"
                      placeHolder="Select Sheet"
                      option={sheetList}
                      // hideCross={true}
                      selectedOption={selectSheetName}
                      onSelect={handleSheetSelect}
                      onBlur={() => {
                        formik.setFieldTouched("sheetName", true);
                      }}
                    />
                  </div>
                )}
              </div>
              {selectSheet && (
                <div className="flex gap-5">
                  <div>
                    <InputField
                      type="number"
                      isRequired={true}
                      label={"Start Row"}
                      className={`${
                        defaultApplication?.type == "WEB"
                          ? "w-[352px]"
                          : "w-[166px]"
                      } h-[52px]`}
                      placeHolder="Enter Row Number"
                      placeHolderSize={true}
                      inputClassName="text-sm"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      {...formik.getFieldProps("startRow")}
                      error={
                        formik?.touched?.startRow && formik?.errors?.startRow
                      }
                      onKeyDown={(e) => {
                        if (
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
                  <div>
                    <InputField
                      type="number"
                      label={"End Row"}
                      isRequired={true}
                      className={`${
                        defaultApplication?.type == "WEB"
                          ? "w-[352px]"
                          : "w-[166px]"
                      } h-[52px]`}
                      placeHolder="Enter Row Number"
                      placeHolderSize={true}
                      inputClassName="text-sm"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      {...formik.getFieldProps("endRow")}
                      error={formik?.touched?.endRow && formik?.errors?.endRow}
                      onKeyDown={(e) => {
                        if (
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
                </div>
              )}
              {defaultApplication?.type === "WEB" && (
                <div className="flex items-center gap-2">
                  Would you like to use locator repository?
                  <CustomToggle initialState={false} onToggle={handleToggle} />
                </div>
              )}
            </div>
            <div>
              <CustomButton
                label="Add"
                className={`${
                  defaultApplication?.type == "WEB" ? "mt-[56px]" : "mt-[40px]"
                } w-[352px] h-[52px]`}
                disable={isAddButtonDisabled() || !formik.isValid}
                onClick={handleAdd}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const browserList = [
  { id: 1, name: "Chrome", type: "Chrome", img: chrome },
  { id: 2, name: "Safari", type: "Safari", src: safari },
  { id: 3, name: "Firefox", type: "Firefox", src: firefox },
  { id: 4, name: "Edge", type: "Edge", src: edge },
];

AddTestCaseModal.propTypes = {
  onClick: PropTypes.func,
  selectedApplication: PropTypes.any,
  selectedProject: PropTypes.any,
  testSuiteData: PropTypes.any,
  sheetList: PropTypes.array,
  payload: PropTypes.any,
  type: PropTypes.any,
};
