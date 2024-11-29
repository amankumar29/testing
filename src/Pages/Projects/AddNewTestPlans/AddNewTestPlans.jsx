import { useLocation, useNavigate } from "react-router-dom";
import { CustomButton } from "../../../Components/Atoms/CustomButton/CustomButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InputField from "../../../Components/Atoms/InputField/InputField";
import SearchDropdown from "../../../Components/Atoms/SearchDropdown/SearchDropdown";
import MultiSelectDropdown from "../../../Components/Atoms/MultiSelectDropdown/MultiSelectDropdown";
import { useEffect, useMemo, useState } from "react";
import SelectDaysComponent from "../../../Components/Atoms/SelectDaysComponent/SelectDaysComponent";
import RadioButtons from "../../../Components/Atoms/RadioButtons/RadioButtons";
import SelectDropdown from "../../../Components/Atoms/SelectDropdown/SelectDropdown";
import { getTestSuiteList } from "../../../Services/API/Projects/Projects";
import {
  createTestPlan,
  getTestPlanInfo,
  updateTestPlans,
} from "../../../Services/API/TestPlans/TestPlans";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import TimeNumberInput from "../../../Components/Atoms/TimeNumberInput/TimeNumberInput";

export default function AddNewTestPlans() {
  const navigate = useNavigate();
  const location = useLocation();

  const projectName = location?.state?.testSuiteProject;
  const projectAppId = location?.state?.testSuiteApplication;
  const uniqId = location.state.id;

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedNewOptions, setSelectedNewOptions] = useState([]);
  const [selectTimeInterval, setSelectTimeInterval] = useState(null);
  const [selectNewTimeInterval, setSelectNewTimeInterval] = useState(null);
  const [selectBrowserType, setSelectBrowserType] = useState(null);
  const [selectNewBrowserType, setSelectNewBrowserType] = useState(null);
  const [timeZone, setTimeZone] = useState("Specific Time");
  const [testSuiteList, setTestSuiteList] = useState([]);
  const [isTestSuiteListLoaded, setIsTestSuiteListLoaded] = useState(false);

  const [testPlanName, setTestPlanName] = useState("");
  const [testSpecificTime, setTestSpecificTime] = useState("");
  const [newDaysSelect, setNewDaysSelect] = useState([]);
  const [date, setDate] = useState("");

  const formik = useFormik({
    initialValues: {
      testPlanName: "",
      testSuiteName: [],
      browserName: null,
      selectedDays: [],
      specificTime: "",
      timeInterval: null,
    },
    validationSchema: Yup.object().shape({
      testPlanName: Yup.string()
        .required("Test Plan Name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed."),

      testSuiteName: Yup.array()
        .min(1, "At least one test suite must be selected.")
        .required("Days are required."),
      browserName: Yup.object().required("Browser is required."),
      selectedDays: Yup.array()
        .min(1, "At least one day must be selected.")
        .required("Days are required."),

      specificTime: Yup.string()
        .matches(
          /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
          "Specified Time exceeds allowable limit"
        )
        .test("is-valid-time", "Time must not exceed 24 hours", (value) => {
          if (!value) return true;
          const [hours, minutes, seconds] = value.split(":").map(Number);
          return hours <= 24 && minutes < 60 && seconds < 60;
        }),
      timeInterval: Yup.object().nullable(),
    }),
    onSubmit: (values) => {
      uniqId !== undefined
        ? fetchUpdateTestPlans(values)
        : fetchCreateTestPlan(values);
    },
  });

  const handleTimeIntervalClick = (option) => {
    formik.setFieldValue("timeInterval", option);
    setSelectTimeInterval(option);
  };

  const handleBrowserSelect = (option) => {
    formik.setFieldValue("browserName", option);
    setSelectBrowserType(option);
  };

  const handleTestSuiteSelect = (options) => {
    formik.setFieldValue("testSuiteName", options);
    setSelectedOptions(options);
  };

  const handleSelectedDays = (option) => {
    let previousDays = [...formik.values.selectedDays];
    if (previousDays.includes(option)) {
      previousDays = previousDays?.filter((value) => value !== option);
    } else {
      previousDays = [...previousDays, option];
    }
    formik.setFieldValue("selectedDays", previousDays);
  };

  // Get Test Suites
  const fetchGetTestCases = () => {
    const payload = {
      project_id: projectName?.id,
      application_type_id: projectAppId?.id,
      withoutPagination: true,
    };
    getTestSuiteList(payload)
      .then((res) => {
        const data = res?.data?.results;
        const updatedListTestName = data.map((item) => {
          return {
            id: item?.id,
            keyword_name: item?.name,
            type: item?.type,
          };
        });
        setTestSuiteList(updatedListTestName);
        setIsTestSuiteListLoaded(true);
      })
      .catch((error) => {
        const message = error?.response?.data?.details;
        toast.error(message || "Error retrieving testcases list data");
      });
  };

  const convertToUTC = (date, time) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);

    return date.toISOString().split("T")[1].split(".")[0];
  };

  // Create the Test Plan
  const fetchCreateTestPlan = (values) => {
    const utc =
      timeZone === "Specific Time"
        ? convertToUTC(new Date(date), values?.specificTime)
        : null;

    const testSuiteIds = values?.testSuiteName.map((suite) => suite.id);
    const newResult = {
      test_plan_name: values?.testPlanName,
      test_suites: testSuiteIds,
      browser_type: values?.browserName?.keyword_name,
      application_id: projectAppId.id,
      project_id: projectName.id,
      is_active: true,

      scheduled_days: values?.selectedDays,
      is_interval: timeZone !== "Specific Time" ? true : false,
      time_period:
        timeZone === "Specific Time" ? utc : values?.timeInterval.type,
    };

    createTestPlan(newResult)
      .then((res) => {
        const message = res?.data?.message;
        navigate("/projects/test-scheduler", {
          state: { ...projectName, defaultApplication: projectAppId },
        });
        toast.success(message);
      })
      .catch((err) => {
        const message = err?.response?.data?.details;
        toast.error(message);
      });
  };

  // // Get the Test Plan
  const getTestPlan = () => {
    getTestPlanInfo(uniqId)
      .then((res) => {
        const data = res?.data?.results;
        const isInterval = data?.is_interval
          ? "Time Interval"
          : "Specific Time";
        setTimeZone(isInterval);
        const getDays = data?.scheduled_days;
        const dayMapping = {
          Monday: "Mon",
          Tuesday: "Tue",
          Wednesday: "Wed",
          Thursday: "Thu",
          Friday: "Fri",
          Saturday: "Sat",
          Sunday: "Sun",
        };

        const multiDaysData = getDays?.map((item) => {
          return {
            name: dayMapping[item] || item,
            type: item,
          };
        });

        const getBrowserName = browserList?.find(
          (item) => item.keyword_name === data?.browser_type
        );

        setSelectBrowserType(getBrowserName);
        setSelectNewBrowserType(getBrowserName);

        const testPlanSuite = data?.test_suites?.map((item) => item);

        const newPlanSuiteName = testSuiteList?.map((item) => {
          if (testPlanSuite.includes(item?.id)) {
            return {
              id: item?.id,
              keyword_name: item?.keyword_name,
              type: item?.type,
            };
          }
          return null;
        });

        const filterSuiteName = newPlanSuiteName?.filter(
          (item) => item !== null
        );
        setSelectedOptions(filterSuiteName);
        setSelectedNewOptions(filterSuiteName);

        formik.setFieldValue("testPlanName", data?.test_plan_name);
        setTestPlanName(data?.test_plan_name);

        formik.setFieldValue(
          "selectedDays",
          multiDaysData.map((day) => day.type)
        );

        setNewDaysSelect(multiDaysData.map((day) => day.type));

        formik.setFieldValue("testSuiteName", filterSuiteName);

        formik.setFieldValue("browserName", getBrowserName);

        const convertToIST = (utcTime) => {
          const date = new Date(`1970-01-01T${utcTime}Z`);
          date.setHours(date.getHours() + 5);
          date.setMinutes(date.getMinutes() + 30);
          return date.toISOString().substr(11, 8); // Format as HH:mm:ss
        };

        // Conditionally set the value for the time interval dropdown
        if (isInterval === "Time Interval") {
          const selectedTimeInterval = timeIntervalData.find(
            (item) => item.type === data?.time_period
          );
          formik.setFieldValue("timeInterval", selectedTimeInterval);
          setSelectTimeInterval(selectedTimeInterval);
          setSelectNewTimeInterval(selectedTimeInterval);
        } else {
          const istTime = convertToIST(data?.time_period);
          formik.setFieldValue("specificTime", istTime);
          setTestSpecificTime(istTime);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Update the Test Plans
  const fetchUpdateTestPlans = (values) => {
    const utc =
      timeZone === "Specific Time"
        ? convertToUTC(new Date(date), values?.specificTime)
        : null;

    const testSuiteIds = values?.testSuiteName?.map((suite) => suite.id);

    const payload = {
      test_plan_name: values?.testPlanName,
      test_suites: testSuiteIds,
      browser_type: values?.browserName?.keyword_name,
      application_id: projectAppId.id,
      project_id: projectName.id,

      scheduled_days: values?.selectedDays,
      is_interval: timeZone !== "Specific Time" ? true : false,
      time_period:
        timeZone === "Specific Time" ? utc : values?.timeInterval.type,
    };
    updateTestPlans(payload, uniqId)
      .then((res) => {
        const message = res?.data?.message;
        toast.success(message);
        navigate("/projects/test-scheduler", {
          state: { ...projectName, defaultApplication: projectAppId },
        });
      })
      .catch((err) => {
        const message = err?.response?.data?.details;
        toast.error(message);
      });
  };

  useEffect(() => {
    fetchGetTestCases();
  }, []);

  useEffect(() => {
    if (isTestSuiteListLoaded && uniqId !== undefined) {
      getTestPlan();
    }
  }, [isTestSuiteListLoaded]);

  useEffect(() => {
    const dateData = new Date().toISOString().slice(0, 16);
    setDate(dateData);
  }, []);

  const areArraysEqual = (array1, array2) => {
    if (array1.length !== array2.length) return false;

    const set1 = new Set(array1.map((element) => element?.id));
    const set2 = new Set(array2.map((element) => element?.id));

    return (
      array1.every((element) => set2.has(element?.id)) &&
      array2.every((element) => set1.has(element?.id))
    );
  };

  const areDaysArrayEqual = (array1, array2) => {
    if (array1.length !== array2.length) return false;
    const sortedArray1 = [...array1].sort();
    const sortedArray2 = [...array2].sort();
    return sortedArray1.every(
      (element, index) => element === sortedArray2[index]
    );
  };

  const isButtonEnabled = useMemo(() => {
    const arraysEqual = areArraysEqual(
      selectedNewOptions,
      formik.values.testSuiteName
    );

    const daysEqual = areDaysArrayEqual(
      newDaysSelect,
      formik.values.selectedDays
    );

    return !(
      (testPlanName !== formik.values.testPlanName ||
        !arraysEqual ||
        selectNewBrowserType !== formik.values.browserName ||
        testSpecificTime !== formik.values.specificTime ||
        selectNewTimeInterval !== formik.values.timeInterval ||
        !daysEqual) &&
      formik.dirty &&
      formik.isValid
    );
  }, [
    formik,
    testPlanName,
    selectedNewOptions,
    selectNewBrowserType,
    testSpecificTime,
    selectNewTimeInterval,
  ]);

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="cursor-pointer"
              onClick={() => {
                navigate("/projects/test-scheduler", {
                  state: { ...projectName, defaultApplication: projectAppId },
                });
              }}
              data-testid="arrow_back_icon"
            >
              <ArrowBackIcon />
            </div>
            <div
              className="text-[20px] font-medium leading-7 text-igy1"
              data-testid="new_test_plans"
            >
              Add New Test Plans
            </div>
          </div>

          <CustomButton
            className="!w-[162px] h-10"
            label={`${uniqId !== undefined ? "Save" : "Create"}`}
            onClick={formik.handleSubmit}
            disable={
              isButtonEnabled ||
              (timeZone === "Specific Time" &&
                formik?.values?.specificTime.length === 0) ||
              (timeZone === "Time Interval" &&
                formik?.values?.timeInterval == null)
            }
          />
        </div>
        <div className="flex gap-8 items-center mt-[35px]">
          <div>
            <InputField
              id="testPlanName"
              name="testPlanName"
              isRequired={true}
              label="Test Plan Name"
              placeHolder="Enter Test Plan Name"
              className="w-[320px] h-[52px]"
              inputClassName="text-sm"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              {...formik.getFieldProps("testPlanName")}
              error={formik.touched.testPlanName && formik.errors.testPlanName}
              value={formik.values.testPlanName}
            />
          </div>
          <div>
            <div>
              <MultiSelectDropdown
                isRequired={true}
                label="Select Test Suite"
                className="w-[320px] h-[52px]"
                placeHolder="Select Test Suite Name"
                options={testSuiteList}
                selectedOptions={selectedOptions}
                onSelect={handleTestSuiteSelect}
                onBlur={() => {
                  formik.setFieldTouched("testSuiteName", true);
                }}
                error={
                  formik.touched.testSuiteName && formik.errors.testSuiteName
                }
              />
            </div>
          </div>
          <div>
            <SearchDropdown
              isRequired={true}
              label="Browser Type"
              className="w-[320px] h-[52px]"
              placeHolder="Select Browser Type"
              option={browserList}
              selectedOption={selectBrowserType}
              onSelect={handleBrowserSelect}
              hideCross={true}
              onBlur={() => {
                formik.setFieldTouched("browserName", true);
              }}
              error={formik.touched.browserName && formik.errors.browserName}
            />
          </div>
        </div>
        <div className="flex flex-col mt-10">
          <div className="text-[18px] font-normal">Schedule Run</div>
          <div className="mt-3 text-sm font-medium">Select Days</div>
          <div className="flex mt-3">
            <SelectDaysComponent
              option={daysData}
              selectedDays={formik.values.selectedDays}
              onClick={(item) => handleSelectedDays(item)}
            />
          </div>
        </div>
        <div className="flex gap-10 mt-[28px]">
          <div>
            <RadioButtons
              value={"Specific Time"}
              onClick={(item) => {
                setTimeZone(item);
                if (uniqId === undefined) {
                  formik.setFieldValue("timeInterval", null);
                }
                formik.setFieldTouched("specificTime", false);
              }}
              checked={timeZone === "Specific Time"}
            />
          </div>
          <div>
            <RadioButtons
              value={"Time Interval"}
              onClick={(item) => {
                setTimeZone(item);
                if (uniqId === undefined) {
                  formik.setFieldValue("specificTime", "");
                }
                formik.setFieldTouched("timeInterval", false);
              }}
              checked={timeZone === "Time Interval"}
            />
          </div>
        </div>
        <div className="mt-[20px] flex gap-[20px] items-center">
          {timeZone === "Specific Time" ? (
            <div>
              <TimeNumberInput
                isRequired={true}
                label="Select Time"
                placeHolder="HH:MM"
                format="##:##:00"
                className="w-[320px] h-[52px]"
                inputClassName="text-sm"
                id="specificTime"
                name="specificTime"
                value={formik.values.specificTime}
                {...formik.getFieldProps("specificTime")}
                error={
                  (formik.touched.specificTime && formik.errors.specificTime) ||
                  (formik.touched.specificTime &&
                    formik.values.specificTime?.length < 1 &&
                    "Specific Time Required")
                }
                onBlurCall={() => {
                  formik.setFieldTouched("specificTime", true);
                }}
              />
            </div>
          ) : (
            <div>
              <SelectDropdown
                isRequired={true}
                label="Time Interval"
                inputClassName="text-[14px]"
                id="transferType"
                className="h-[52px] w-[320px]"
                options={timeIntervalData}
                placeHolder="Select Time Interval"
                value={selectTimeInterval}
                onBlur={() => {
                  formik.setFieldTouched("timeInterval", true);
                }}
                onChange={handleTimeIntervalClick}
                error={
                  formik.touched.timeInterval &&
                  formik?.values?.timeInterval == null &&
                  `Time Interval is required`
                }
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const daysData = [
  { name: "Mon", type: "Monday" },
  { name: "Tue", type: "Tuesday" },
  { name: "Wed", type: "Wednesday" },
  { name: "Thu", type: "Thursday" },
  { name: "Fri", type: "Friday" },
  { name: "Sat", type: "Saturday" },
  { name: "Sun", type: "Sunday" },
];

const timeIntervalData = [
  { id: 1, name: "Every 15 Minutes", type: "00:15:00" },
  { id: 2, name: "Every 30 Minutes", type: "00:30:00" },
  { id: 3, name: "Every 1 Hour", type: "01:00:00" },
  { id: 4, name: "Every 2 Hours", type: "02:00:00" },
  { id: 5, name: "Every 4 Hours", type: "04:00:00" },
  { id: 6, name: "Every 6 Hours", type: "06:00:00" },
  { id: 7, name: "Every 8 Hours", type: "08:00:00" },
  { id: 8, name: "Every 12 Hours", type: "12:00:00" },
];

const browserList = [
  { id: 1, keyword_name: "Chrome" },
  { id: 2, keyword_name: "Safari" },
  { id: 3, keyword_name: "Firefox" },
  { id: 4, keyword_name: "Edge" },
];
