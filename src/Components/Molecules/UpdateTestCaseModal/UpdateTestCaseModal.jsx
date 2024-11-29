import CloseIcon from "@mui/icons-material/Close";
import InputField from "../../Atoms/InputField/InputField";
import SearchDropdown from "../../Atoms/SearchDropdown/SearchDropdown";
import SelectDropdown from "../../Atoms/SelectDropdown/SelectDropdown";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useContext, useEffect, useMemo, useState } from "react";
import { getTestCasesList } from "../../../Services/API/Projects/Projects";
import { toast } from "react-toastify";
import chrome from "Assets/Images/google.svg";
import safari from "Assets/Images/safari.svg";
import firefox from "Assets/Images/firefox.svg";
import edge from "Assets/Images/edge.svg";
import PropTypes from "prop-types";
import { updateTestCase } from "../../../Services/API/TestCase/TestCase";
import { setStorage } from "../../../Storage";
import { setTestCasesList } from "Store/ducks/testCases";
import { useDispatch, useSelector } from "react-redux";
import { WebsocketContext } from "Services/Socket/socketProvider";
import CustomToggle from "Components/Atoms/CustomToggle/CustomToggle";

export default function UpdateTestCaseModal({
  testCaseName,
  dependency_id,
  default_browser,
  sheet_name,
  start_row,
  end_row,
  onClick,
  selectedProject,
  selectedApplication,
  sheetList = [],
  id,
  isEditable,
  mode,
  isPomEnabled,
}) {
  const [selectSheetName, setSelectSheetName] = useState(null);
  const [testCaseList, setTestCaseList] = useState([]);
  const [selectedProjectNew, setSelectedProjectNew] = useState(null);
  const [browserSelect, setBrowserSelect] = useState(null);
  const dispatch = useDispatch();
  const List = useSelector((state) => state?.testCases?.testCases);
  const { defaultApplication, userDetails } = useSelector(
    (state) => state?.userDetails
  );

  // console.log(isPomEnabled);
  const { socket } = useContext(WebsocketContext);

  const [isPom, setIsPom] = useState(isPomEnabled);

  const handleToggle = (state) => {
    setIsPom(state);
  };

  const handleUpdateTestCase = () => {
    let payload = {
      // testCaseId: id,
      // test_case_name: formik?.values?.testCaseName,
      // dependency_id: formik?.values?.dependency?.id
      //   ? formik?.values?.dependency?.id
      //   : null,
      // ...(selectedApplication?.type === "Web" && {
      //   default_browser: formik?.values?.defaultBrowser?.name,
      // }),
      // sheet_name: formik?.values?.sheetName?.keyword_name
      //   ? formik?.values?.sheetName?.keyword_name
      //   : null,
      // start_row: formik?.values?.startRow
      //   ? Number(formik?.values?.startRow)
      //   : null,
      // end_row: formik?.values?.endRow ? Number(formik?.values?.endRow) : null,
      project: selectedProject,
      application: selectedApplication,
      isEditable: true,
      isEditRequired: false,
      isRunRequired: false,
    };

    let updateTestPayload = {
      testCaseId: id,
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
    };

    const requestBody = {
      testCaseName: formik?.values?.testCaseName?.trim(),
      dependencyId: formik?.values?.dependency?.id,
      ...(defaultApplication?.type === "WEB" && {
        defaultBrowser: formik?.values?.defaultBrowser?.name?.toUpperCase(),
      }),
      testData: {
        sheetName: formik?.values?.sheetName?.keyword_name
          ? formik?.values?.sheetName?.keyword_name
          : null,
        startRow: formik?.values?.startRow
          ? Number(formik?.values?.startRow)
          : null,
        endRow: formik?.values?.endRow ? Number(formik?.values?.endRow) : null,
      },
      isPom: isPom,
    };

    if (mode === "Create") {
      setStorage("ATC", JSON.stringify(payload));
      const event = new Event("session-storage-change");
      window.dispatchEvent(event);
      onClick();
    } else {
      setStorage(
        "ATC",
        JSON.stringify({
          ...payload,
          isEditRequired: true,
          isRunRequired: true,
          isEditable: isEditable,
          project: selectedProject,
          application: selectedApplication,
        })
      );
      const event = new Event("session-storage-change");
      window.dispatchEvent(event);
      onClick();
    }

    updateTestCase(requestBody, id)
      .then((res) => {
        // const newList = List?.list?.map((item) =>
        //   item?.id === updateTestPayload?.testCaseId
        //     ? {
        //         ...item,
        //         test_case_name: updateTestPayload?.test_case_name,
        //         dependency_id: updateTestPayload?.dependency_id,
        //         default_browser: updateTestPayload?.default_browser,
        //         start_row: updateTestPayload?.start_row,
        //         end_row: updateTestPayload?.end_row,
        //         sheet_name: updateTestPayload?.sheet_name,
        //       }
        //     : item
        // );
        // dispatch(setTestCasesList({ ...List, list: newList }));
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
            newObject: res?.data?.results,
            type: "Replace",
          },
        });
        toast.success("Test Case Updated Succesfully");
        onClick();
      })
      .catch((err) => {
        const message = err?.response?.data?.details;
        toast.error(message);
      });
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  const formik = useFormik({
    initialValues: {
      testCaseName: testCaseName || "",
      dependency: { id: dependency_id },
      defaultBrowser: default_browser,
      sheetName: sheet_name,
      startRow: start_row ? start_row?.toString() : "",
      endRow: end_row ? end_row?.toString() : "",
      selectedApplication: defaultApplication,
    },
    validationSchema: Yup.object({
      testCaseName: Yup.string()
        .test("no-emojis", "Test case name cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Test case name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .min(2, "Test case name must be at least 2 characters.")
        // .max(50, "Test case name must be at most 50 characters.")
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
          String(originalValue)?.trim() === "" ? null : Number(value)
        )
        .typeError("Start Row must be a number.")
        .when("sheetName", {
          is: (val) => !!val,
          then: (schema) =>
            schema
              .required("Start Row required.")
              .min(1, "Start Row must be greater than 0."),
        }),

      endRow: Yup.number()
        .nullable()
        .transform((value, originalValue) =>
          String(originalValue)?.trim() === "" ? null : Number(value)
        )
        .typeError("End Row must be a number.")
        .when("sheetName", {
          is: (val) => !!val,
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
    onSubmit: handleUpdateTestCase,
  });

  const fetchTestCasesData = (limit, offset) => {
    const requestBody = {
      applicationId: defaultApplication?.id,
      projectId: defaultApplication?.projectId,
      limit,
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
        // console.log(updatedProjectList, "projectLIst");
        const filteredTestcase = updatedProjectList?.find(
          (item) => item?.id == dependency_id
        );
        formik.setFieldValue("dependency", filteredTestcase);
        setSelectedProjectNew(filteredTestcase);
        setTestCaseList(updatedProjectList);
      })
      .catch((error) => {
        const message = error?.response?.data?.details;
        toast.error(message || "Error retrieving testcases list data");
      });
  };

  const handleProjectSelect = (option) => {
    formik.setFieldValue("dependency", option);
    setSelectedProjectNew(option);
  };

  const handleSheetSelect = (option) => {
    formik.setFieldValue("sheetName", option);
    setSelectSheetName(option);
    if (option === null) {
      formik.setFieldValue("startRow", "");
      formik.setFieldValue("endRow", "");
      formik.setFieldTouched("startRow", false);
      formik.setFieldTouched("endRow", false);
    }
  };

  const handleBrowserSelect = (option) => {
    formik.setFieldValue("defaultBrowser", option);
    setBrowserSelect(option);
  };

  useEffect(() => {
    const requiredSheet = sheetList?.find(
      (sheet) => sheet?.keyword_name === sheet_name
    );
    formik.setFieldValue("sheetName", requiredSheet);
    setSelectSheetName(requiredSheet);

    //filtering Default browser
    const requiredBrowser = browserList?.find(
      (item) => item?.name?.toUpperCase() == default_browser
    );
    formik.setFieldValue("defaultBrowser", requiredBrowser);
    setBrowserSelect(requiredBrowser);
  }, []);

  useEffect(() => {
    fetchTestCasesData(25, 0);
  }, [defaultApplication]);

  const isButtonEnabled = useMemo(() => {
    const isWebApp = defaultApplication?.type === "WEB";
    return (
      (testCaseName == formik?.values?.testCaseName &&
        dependency_id == (formik?.values?.dependency?.id ?? null) &&
        sheet_name == (formik?.values?.sheetName?.keyword_name ?? null) &&
        (!isWebApp ||
          default_browser ==
            formik?.values?.defaultBrowser?.name?.toUpperCase()) &&
        (start_row ?? "") == formik?.values?.startRow &&
        (end_row ?? "") == formik?.values?.endRow) ||
      !(formik.isValid && formik.dirty)
    );
  }, [
    formik,
    testCaseName,
    dependency_id,
    default_browser,
    sheet_name,
    end_row,
    start_row,
  ]);

  return (
    <>
      <div className="flex items-center justify-center w-auto h-full">
        <div
          className={`${
            defaultApplication?.type == "WEB" ? "w-[800px]" : "w-[450px]"
          } h-auto rounded-2xl shadow-2xl`}
        >
          <div className="flex flex-row justify-end h-[80px] bg-ibl7 w-full rounded-t-[10px]">
            <div className="h-[80px] flex justify-center items-center w-full">
              <div className="flex justify-start pl-[66px]"></div>
              <div className="text-[18px] font-medium leading-7 flex justify-center items-center w-full">
                Update Test Case
              </div>
              <div
                className="flex justify-end !pr-6 pl-[14px]"
                data-testid="close_icon"
              >
                <CloseIcon onClick={onClick} className="cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center h-auto mt-8 mb-8">
            <div
              className={`flex flex-col ${
                defaultApplication?.type == "WEB" ? "gap-6" : "gap-5"
              }`}
            >
              <div
                className={`${
                  defaultApplication?.type == "WEB"
                    ? "flex gap-5"
                    : "flex flex-col gap-5"
                }`}
              >
                <div>
                  <InputField
                    placeHolderSize={true}
                    isRequired={true}
                    label="Test Case Name"
                    className="w-[352px] h-[52px]"
                    placeHolder="Enter Test Case Name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    {...formik.getFieldProps("testCaseName")}
                    error={
                      formik.touched.testCaseName && formik.errors.testCaseName
                    }
                  />
                </div>
                {defaultApplication?.type !== "RESTAPI" && (
                  <div>
                    <SearchDropdown
                      option={testCaseList}
                      label="Dependencies"
                      className="w-[352px] h-[52px]"
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
                    ? "flex gap-5"
                    : "flex flex-col"
                }`}
              >
                {defaultApplication?.type == "WEB" && (
                  <div>
                    <SelectDropdown
                      iconForApplication={true}
                      id="defaultBrowser"
                      isRequired={true}
                      label={"Default Browser"}
                      className="w-[352px] h-[52px]"
                      placeHolder="Select Browser Type"
                      options={browserList}
                      inputClassName="text-[14px]"
                      value={browserSelect}
                      onBlur={() => {
                        formik.setFieldTouched("defaultBrowser", true);
                      }}
                      onChange={handleBrowserSelect}
                      error={
                        formik.touched.defaultBrowser &&
                        formik.errors.defaultBrowser
                      }
                      // showCross={true}
                    />
                  </div>
                )}
                {defaultApplication?.type !== "RESTAPI" && (
                  <div>
                    <SearchDropdown
                      label={"Sheet Name"}
                      className="w-[352px] h-[52px]"
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

              {selectSheetName && (
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
                      placeHolderSize={true}
                      placeHolder="Enter Row Number"
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
              {defaultApplication?.type == "WEB" && (
                <div className="flex items-center gap-2">
                  Would you like to use locator repository?
                  <CustomToggle initialState={isPom} onToggle={handleToggle} />
                </div>
              )}
            </div>
            <div>
              <CustomButton
                label={"Update"}
                className={`${
                  defaultApplication?.type == "WEB" ? "mt-[56px]" : "mt-[40px]"
                } w-[352px] h-[52px]`}
                onClick={handleUpdateTestCase}
                disable={isButtonEnabled && isPomEnabled === isPom}
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

UpdateTestCaseModal.propTypes = {
  onClick: PropTypes.func,
  testSuiteData: PropTypes.any,
  sheetList: PropTypes.array,
  editTestCase: PropTypes.bool,
  isEditable: PropTypes.bool,
  testCaseName: PropTypes.any,
  dependency_id: PropTypes.any,
  default_browser: PropTypes.any,
  sheet_name: PropTypes.any,
  start_row: PropTypes.any,
  end_row: PropTypes.any,
  sheetId: PropTypes.any,
  selectedApplication: PropTypes.any,
  selectedProject: PropTypes.any,
  type: PropTypes.any,
  id: PropTypes.any,
  mode: PropTypes.string,
};
