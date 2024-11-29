import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import InputField from "Components/Atoms/InputField/InputField";
import MultiSelectDropdown from "Components/Atoms/MultiSelectDropdown/MultiSelectDropdown";
import RadioButtons from "Components/Atoms/RadioButtons/RadioButtons";
import SearchDropdown from "Components/Atoms/SearchDropdown/SearchDropdown";
import SelectDropdown from "Components/Atoms/SelectDropdown/SelectDropdown";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getTestSuiteList } from "Services/API/Projects/Projects";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./CreateSchedulerModal.module.scss";
import * as React from "react";
import NewSelectTimeDropdown from "Components/Atoms/NewSelectTimeDropdown/NewSelectTimeDropdown";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector, useStore } from "react-redux";
import { setschedulerModifed } from "Store/ducks/testCases";
import {
  useCreateSchedulerMutation,
  useLazyGetUserDataQuery,
  useSetDefaultMutation,
  useUpdateSchedulerMutation,
} from "Services/API/apiHooks";
import { useLazyGetTestPlanInformationQuery, useEmailNotificationMutation } from "Services/API/apiHooks";
import { ApplicationTypeEnum } from "Enums/ApplicationTypeEnum";
import { useContext } from "react";
import { WebsocketContext } from "Services/Socket/socketProvider";

const CreateSchedulerModal = ({
  setOpenDrawer,
  openDrawer,
  setCallTestPlan,
  callTestPlan,
  isEditMode,
  setIsEditMode,
  onClose,
  uniqId,
}) => {
  const navigate = useNavigate();
  const [getuserDetails] = useLazyGetUserDataQuery();
  const [setDefault] = useSetDefaultMutation();
  const [testSuiteList, setTestSuiteList] = useState([]);
  const [date, setDate] = useState("");
  const [isTestSuiteListLoaded, setIsTestSuiteListLoaded] = useState(false);
  const [testPlanName, setTestPlanName] = useState("");
  const [selectNewBrowserType, setSelectNewBrowserType] = useState(null);
  const [testSpecificTime, setTestSpecificTime] = useState("");
  const [selectNewTimeInterval, setSelectNewTimeInterval] = useState(null);
  const [selectedNewOptions, setSelectedNewOptions] = useState([]);
  const [newDaysSelect, setNewDaysSelect] = useState([]);
  const [newScheduler, setNewScheduler] = useState(null);
  const [selectedApplicationType, setSelectedApplicationType] = useState([]);
  const [newExecutionTypeValue, setNewExcecutionTypeValue] = useState("");
  const [newExecutionModeValue, setNewExcecutionModeValue] = useState("");
  const [gridValue, setGridValue] = useState(null);
  const [threadCountValue, setThreadCountValue] = useState("");
  const [emailNotification] = useEmailNotificationMutation();

  const browseData = selectedApplicationType;

  const { defaultApplication ,userDetails } = useSelector((state) => state?.userDetails);
  const selectedProject = defaultApplication;
  const selectedApplication = defaultApplication;

  const dispatch = useDispatch();

  const [createScheduler] = useCreateSchedulerMutation();
  const [updateScheduler] = useUpdateSchedulerMutation();

  // const { data } = useGetTestPlanInformationQuery(uniqId ,{ skip: !uniqId });
  const [getInfo] = useLazyGetTestPlanInformationQuery()
  const {socket} = useContext(WebsocketContext)

  useEffect(() => {
    if (uniqId) {
      getInfo(uniqId)
        .unwrap()
        .then((response) => {
          const getTestPlanData = response?.results;
          console.log("getTestPlanData: ", getTestPlanData);
          formik.setFieldValue("schedulerName", getTestPlanData?.name);
          setTestPlanName(getTestPlanData?.name);

          setThreadCountValue(getTestPlanData?.threadCount);
          formik.setFieldValue(
            "threadCountValue",
            getTestPlanData?.threadCount
          );

          const getBrowserOrDevice =
            selectedApplication?.type === ApplicationTypeEnum?.WEB
              ? getTestPlanData?.browserType
              : getTestPlanData?.device;

          const getBrowserName = browseData?.find(
            (item) => item?.type === getBrowserOrDevice
          );

          setSelectNewBrowserType(getBrowserName);
          formik.setFieldValue("browserName", getBrowserName);

          const excecutionTypeValue = getTestPlanData?.executionType;
          formik.setFieldValue("excecutionType", excecutionTypeValue);
          setNewExcecutionTypeValue(excecutionTypeValue);

          const excecutionModeValue = getTestPlanData?.target;
          formik.setFieldValue("excecutionMode", excecutionModeValue);
          setNewExcecutionModeValue(excecutionModeValue);

          const gridValue = gridData?.find(
            (item) => item?.type === getTestPlanData?.grid
          );
          setGridValue(gridValue);
          formik.setFieldValue("grid", gridValue);

          const testPlanSuite = getTestPlanData?.testSuites?.map(
            (item) => item
          );

          const newPlanSuiteName = testSuiteList?.map((item) => {
            if (testPlanSuite?.includes(item?.id)) {
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

          setSelectedNewOptions(filterSuiteName);
          formik.setFieldValue("testSuiteName", filterSuiteName);

          const isInterval = getTestPlanData?.schedule?.isInterval
            ? "Time Interval"
            : "Specific Time";

          const selectedOption = ScheduleTypeList?.find(
            (option) => option?.name === isInterval
          );
          if (selectedOption) {
            setNewScheduler(selectedOption);
            formik.setFieldValue("scheduleType", selectedOption);
          }

          const convertToIST = (utcTime) => {
            if (utcTime?.length === 4 || utcTime?.length === 5) {
              utcTime += ":00";
            }

            const date = new Date(`1970-01-01T${utcTime}Z`);
            date.setHours(date?.getHours() + 5);
            date.setMinutes(date?.getMinutes() + 30);

            return date?.toISOString().substr(11, 5);
          };

          const existingSelectedDays =
            getTestPlanData?.schedule?.scheduledDays?.map(
              (day) => days?.find((d) => d?.type === day)?.type
            );
          formik.setFieldValue("selectedDays", existingSelectedDays);
          setNewDaysSelect(existingSelectedDays);

          // Conditionally set the value for the time interval dropdown
          if (isInterval === "Time Interval") {
            const selectedTimeInterval = timeIntervalData?.find(
              (item) => item?.type === getTestPlanData?.schedule?.time
            );
            formik.setFieldValue("timeInterval", selectedTimeInterval);
            setSelectNewTimeInterval(selectedTimeInterval);
          } else {
            const istTime = convertToIST(getTestPlanData?.schedule?.time);
            formik.setFieldValue("specificTime", istTime);
            setTestSpecificTime(istTime);
          }
        })
        .catch((error) => {
          console.log(error, "error");
        });
    }
  }, [isTestSuiteListLoaded, openDrawer, uniqId]);

  const handleTimeChange = (time) => {
    const timeSeconds = `${time}`;
    formik.setFieldValue("specificTime", timeSeconds);
    if (formik.values.timeInterval) {
      formik.setFieldValue("timeInterval", null);
    }
  };

  const handleDayClick = (day) => {
    const newSelectedDays = formik?.values?.selectedDays?.includes(day?.type)
      ? formik?.values?.selectedDays?.filter((d) => d !== day?.type)
      : [...formik.values.selectedDays, day?.type];

    formik.setFieldValue("selectedDays", newSelectedDays);
  };

  const handleTestSuiteSelect = (options) => {
    formik.setFieldValue("testSuiteName", options);
  };

  const handleBrowserSelect = (option) => {
    formik.setFieldValue("browserName", option);
  };

  const handleTimeIntervalClick = (option) => {
    formik.setFieldValue("timeInterval", option);
    if (formik.values.specificTime) {
      formik.setFieldValue("specificTime", "");
    }
  };

  const handleScheduleSelect = (option) => {
    formik.setFieldValue("scheduleType", option);
  };

  // Get Test Suites
  const fetchGetTestCases = (limit, offset) => {
    const requestBody = {
      applicationId: defaultApplication?.id,
      projectId: defaultApplication?.projectId,
      limit,
      offset,
      includeCount: true,
      sort: "_id",
      sortDirection: "desc",
    };
    getTestSuiteList(requestBody)
      .then((res) => {
        const data = res?.data?.results;
        const updatedListTestName = data?.map((item) => {
          return {
            id: item?._id,
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
    const [hours, minutes] = time?.split(":").map(Number);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0); // Set seconds to 0 since they're not provided

    return date?.toISOString()?.split("T")[1]?.split(".")[0]; // Returns HH:mm:ss
  };

  const fetchCreateTestPlan = async (values) => {
    const projectName = selectedProject?.projectId;
    const projectAppId = selectedApplication?.id;

    const utc =
      values?.scheduleType?.name === "Specific Time"
        ? convertToUTC(new Date(date), values?.specificTime)
        : null;

    const testSuiteIds = values?.testSuiteName?.map((suite) => suite?.id);
    const selectedDaysList = values?.selectedDays;
    const newResult = {
      name: values?.schedulerName?.trim(),
      testSuites: testSuiteIds,
      ...(selectedApplication?.type === ApplicationTypeEnum?.WEB
        ? {
            browserType: values?.browserName?.keyword_name?.toUpperCase(),
          }
        : {
            device: values?.browserName?.keyword_name?.toUpperCase(),
          }),

      platform: selectedApplication?.type.toUpperCase(),
      applicationId: selectedApplication?.id,
      projectId: selectedProject?.projectId,
      status: "ACTIVE",
      executionType: values?.executionType,
      // target: values?.executionMode,
      target:'REMOTE',

      ...(values?.executionType === "PARALLEL" && {
        threadCount: Number(values?.threadCountValue),
      }),
      ...((selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
        selectedApplication?.type === ApplicationTypeEnum?.IOS ||
        selectedApplication?.type === ApplicationTypeEnum?.TV) &&
        values?.executionMode === "REMOTE" && {
          grid: formik?.values?.grid?.type,
        }),

      schedule: {
        scheduledDays: selectedDaysList,
        time:
          values?.scheduleType?.name === "Specific Time"
            ? utc
            : values?.timeInterval?.type,
        isInterval:
          values?.scheduleType?.name !== "Specific Time" ? true : false,
      },
    };

    try {
      const data = await createScheduler(newResult).unwrap();
      if (data) {
        socket.emit('onTestplans',{
          command:"testPlanCreate",
          organizationId:userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user:{
            userName:userDetails?.userName,
            userId:userDetails?.userId
          },
          data: {
            newtestPlan:{...data,user:{name:userDetails?.userName}}
          }
        })
        setIsEditMode(false);
        dispatch(setschedulerModifed(true));
        navigate("/projects/test-scheduler", {
          state: { ...projectName, defaultApplication: projectAppId },
        });
        setOpenDrawer(!openDrawer);
        setCallTestPlan(!callTestPlan);
        toast.success(data?.message);
        formik.resetForm();
      }
      await sendEmailNotification({
        userDetails,
        runId: data?.results?._id,
        type: 'runDetails',
      });
    } catch (error) {
      toast.error(error?.data?.details);
    }
  };

  const fetchUpdateTestPlans = async (values) => {
    const projectName = selectedProject?.projectId;
    const projectAppId = selectedApplication?.id;

    const utc =
      values?.scheduleType?.name === "Specific Time"
        ? convertToUTC(new Date(date), values?.specificTime)
        : null;

    const testSuiteIds = values?.testSuiteName?.map((suite) => suite?.id);
    const selectedDaysList = values?.selectedDays;

    const payload = {
      name: values?.schedulerName?.trim(),
      testSuites: testSuiteIds,
      ...(selectedApplication?.type === ApplicationTypeEnum?.WEB
        ? {
            browserType: values?.browserName?.keyword_name?.toUpperCase(),
          }
        : {
            device: values?.browserName?.keyword_name?.toUpperCase(),
          }),
      platform: selectedApplication?.type.toUpperCase(),
      applicationId: selectedApplication?.id,
      projectId: selectedProject?.projectId,
      executionType: values?.executionType,
      target: values?.executionMode,

      ...(values?.executionType === "PARALLEL"
        ? { threadCount: Number(values?.threadCountValue) }
        : values?.executionType === "SEQUENTIAL" && { threadCount: 0 }),

      ...((selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
        selectedApplication?.type === ApplicationTypeEnum?.IOS ||
        selectedApplication?.type === ApplicationTypeEnum?.TV) &&
        values?.executionMode === "REMOTE" && {
          grid: formik?.values?.grid?.type,
        }),

      schedule: {
        scheduledDays: selectedDaysList,
        isInterval:
          values?.scheduleType?.name !== "Specific Time" ? true : false,
        time:
          values?.scheduleType?.name === "Specific Time"
            ? utc
            : values?.timeInterval?.type,
      },
    };

    try {
      const data = await updateScheduler({ payload, id: uniqId }).unwrap();
      if (data) {
        dispatch(setschedulerModifed(true));
        navigate("/projects/test-scheduler", {
          state: { ...projectName, defaultApplication: projectAppId },
        });
        socket.emit('onTestplans',{
          command:"testPlanUpdate",
          organizationId:userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user:{
            userName:userDetails?.userName,
            userId:userDetails?.userId
          },
          data: {
            planId:uniqId,
            newtestPlan:{...data?.results,user:{name:userDetails?.userName}}
          }
        })
        setOpenDrawer(!openDrawer);
        setCallTestPlan(!callTestPlan);
        toast.success(data?.message);
        setIsEditMode(!isEditMode);
        // formik.resetForm();
      }
      await sendEmailNotification({
        userDetails,
        runId: data?.results?._id,
        type: 'runDetails',
      });
    } catch (error) {
      toast.error(error?.data?.details);
    }
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;



  const formik = useFormik({
    initialValues: {
      schedulerName: testPlanName || "",
      testSuiteName: selectedNewOptions || [],
      browserName:
        selectedApplication?.type == ApplicationTypeEnum?.WEB && browserList[0],
      selectedDays: newDaysSelect || [],
      scheduleType: newScheduler || null,
      specificTime: testSpecificTime || null,
      timeInterval: selectNewTimeInterval || null,
      threadCountValue: threadCountValue || "",
      // grid: gridValue || null,
      // executionMode: "LOCAL",
      executionType: "SEQUENTIAL",
    },
    validationSchema: Yup.object().shape({
      schedulerName: Yup.string()
        .test("no-emojis", "Scheduler name cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Scheduler name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .min(2, "Scheduler name must be at least 2 characters.")
        .max(50, "Scheduler name must be at most 50 characters.")
        .matches(
          /^[a-zA-Z0-9_.\- ]+$/,
          "Enter only letters, numbers, _, -, ., and spaces."
        ),
      testSuiteName: Yup.array()
        .min(1, "At least one test suite must be selected.")
        .required("Days are required."),
      browserName: Yup.mixed().when(["selectedApplication"], {
        is: () =>
          selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
          selectedApplication?.type === ApplicationTypeEnum?.IOS ||
          selectedApplication?.type === ApplicationTypeEnum?.TV,
        then: (schema) => schema.required("Browser is required."),
        otherwise: (schema) => schema.nullable(),
      }),
      selectedDays: Yup.array()
        .min(1, "At least one day must be selected.")
        .required("Days are required."),
      scheduleType: Yup.object().required("Select a schedule type."),
      timeInterval: Yup.mixed()
        .nullable()
        .when("scheduleType", {
          is: (value) => value?.name === "Time Interval",
          then: (schema) => schema.required("Select a time interval."),
        }),
      specificTime: Yup.string()
        .nullable()
        .when("scheduleType", {
          is: (value) => value?.name === "Specific Time",
          then: (schema) => schema.required("Select a specific time."),
        }),

      threadCountValue: Yup.number().when("executionType", {
        is: "PARALLEL",
        then: (schema) =>
          schema
            .required("Thread Count is required.")
            .min(1, "Thread Count must be greater than 0.")
            .typeError("Thread Count must be a number.")
            // .positive("Thread Count must be a positive number.")
            .integer("Thread Count must be an integer."),
        otherwise: (schema) => schema.nullable(),
      }),
      // grid: Yup.object().when(["executionMode", "selectedApplication"], {
      //   is: () =>
      //     (selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
      //       selectedApplication?.type === ApplicationTypeEnum?.IOS ||
      //       selectedApplication?.type === ApplicationTypeEnum?.TV) &&
      //     formik?.values?.executionMode === "REMOTE",
      //   then: (schema) => schema.required("Grid data is required."),
      //   otherwise: (schema) => schema.nullable(),
      // }),
    }),
    onSubmit: (values) => {
      console.log(values);
      if (uniqId !== null) {
        fetchUpdateTestPlans(values);
        // formik.resetForm();
      } else {
        fetchCreateTestPlan(values);
        formik.resetForm();
      }
    },
  });

  const areArraysEqual = (array1, array2) => {
    if (array1?.length !== array2?.length) return false;

    const set1 = new Set(array1?.map((element) => element?.id));
    const set2 = new Set(array2?.map((element) => element?.id));

    return (
      array1?.every((element) => set2?.has(element?.id)) &&
      array2?.every((element) => set1?.has(element?.id))
    );
  };

  const areDaysArrayEqual = (array1, array2) => {
    if (array1?.length !== array2?.length) return false;
    const sortedArray1 = [...array1].sort();
    const sortedArray2 = [...array2].sort();
    return sortedArray1?.every(
      (element, index) => element === sortedArray2[index]
    );
  };

  // Hook to reset selectNewTimeInterval to null when testSpecificTime changes
  useEffect(() => {
    if (testSpecificTime) {
      setSelectNewTimeInterval(null);
    }
  }, [testSpecificTime]);

  useEffect(() => {
    if (selectNewTimeInterval) {
      setTestSpecificTime(null);
    }
  }, [selectNewTimeInterval]);

  const isButtonEnabled = useMemo(() => {
    const arraysEqual = areArraysEqual(
      selectedNewOptions,
      formik?.values?.testSuiteName
    );

    const daysEqual = areDaysArrayEqual(
      newDaysSelect,
      formik?.values?.selectedDays
    );

    return (
      (testPlanName === formik?.values?.schedulerName &&
        arraysEqual &&
        daysEqual &&
        selectNewBrowserType === formik?.values?.browserName &&
        newScheduler === formik?.values?.scheduleType &&
        ((testSpecificTime === formik?.values?.specificTime &&
          selectNewTimeInterval === null) ||
          (selectNewTimeInterval === formik?.values?.timeInterval &&
            testSpecificTime === null)) &&
        newExecutionTypeValue == formik?.values?.executionType &&
        newExecutionModeValue == formik?.values?.executionMode &&
        gridValue === formik?.values?.grid &&
        threadCountValue === formik?.values?.threadCountValue) ||
      !(formik.dirty && formik.isValid)
    );
  }, [
    formik,
    testPlanName,
    selectedNewOptions,
    newDaysSelect,
    selectNewBrowserType,
    newScheduler,
    testSpecificTime,
    selectNewTimeInterval,
    newExecutionTypeValue,
    newExecutionModeValue,
    gridValue,
    threadCountValue,
  ]);

  useEffect(() => {
    if (
      uniqId &&
      newExecutionModeValue &&
      formik.values.executionMode !== newExecutionModeValue
    ) {
      formik.setFieldValue("executionMode", newExecutionModeValue); // Set the radio button based on `res`
    }
  }, [newExecutionModeValue, uniqId]);

  useEffect(() => {
    if (
      uniqId &&
      newExecutionTypeValue &&
      formik.values.executionType !== newExecutionTypeValue
    ) {
      formik.setFieldValue("executionType", newExecutionTypeValue); // Set the radio button based on `res`
    }
  }, [newExecutionTypeValue, uniqId]);

  useEffect(() => {
    const dateData = new Date()?.toISOString()?.slice(0, 16);
    setDate(dateData);
  }, []);

  useEffect(() => {
    if (selectedProject?.id && selectedApplication?.id && openDrawer) {
      fetchGetTestCases();
    }
  }, [selectedProject, selectedApplication, openDrawer]);

  useEffect(() => {
    if (uniqId === null) {
      formik.resetForm();
    }
  }, [uniqId, openDrawer]);

  useEffect(() => {
    if (!selectedApplication?.type) return;
    switch (selectedApplication?.type) {
      case "WEB":
        setSelectedApplicationType(browserList);
        break;
      case "IOS":
        setSelectedApplicationType(iosData);
        break;
      case "TV":
        setSelectedApplicationType(tvData);
        break;
      case "ANDROID":
        setSelectedApplicationType(androidData);
        break;

      default:
        break;
    }
  }, [selectedApplication]);

  useEffect(() => {
    formik.validateForm();
  }, [formik.values, formik.errors]);

  useEffect(() => {
    if (newExecutionModeValue) {
      formik.setFieldValue("executionMode", newExecutionModeValue);
    }
  }, [newExecutionModeValue]);

  useEffect(() => {
    if (newExecutionTypeValue) {
      formik.setFieldValue("executionType", newExecutionTypeValue);
    }
  }, [newExecutionTypeValue]);

  const sendEmailNotification = async({ userDetails, runId, type, toAll = true }) => {
    try {
      const response = await emailNotification({
        fromUser: {
          firstName: userDetails?.firstName,
          lastName: userDetails?.lastName,
          email: userDetails?.email,
        },
        runId,
        type,
        toAll,
        projectId: defaultApplication?.projectId,
        applicationId: defaultApplication?.id
      });
      toast.success(response?.data?.message);
    } catch (error) {
      toast.error(error?.response?.data?.details);
    }
  }

  return (
    <>
      <div className="flex flex-row justify-end bg-ibl7">
        <div className="w-full md:w-[450px] h-20 flex justify-between items-center pl-5">
          <div
            className="text-[18px] font-medium leading-7"
            data-testid="modal_heading"
          >
            {uniqId !== null ? "Update Scheduler" : "Create Scheduler"}
          </div>

          <div className="flex justify-end !pr-6">
            <CloseIcon
              onClick={onClose}
              className="cursor-pointer"
              data-testid="close_Icon"
            />
          </div>
        </div>
      </div>
      <div className={`h-[calc(100vh-80px)] p-6 `}>
        <div className="">
          <div
            className={`flex flex-col md:mt-[45px] ml-2 h-[calc(100vh-170px)] md:h-[calc(100vh-225px)] ${styles.drawerScroll}`}
          >
            {/* Scheduler Name & Test Suite Name */}
            <div className="md:flex gap-5">
              <div className="mdMax:mb-3">
                <InputField
                  id="schedulerName"
                  name="schedulerName"
                  isRequired={true}
                  label="Scheduler Name"
                  placeHolder="Enter Scheduler Name"
                  className="w-full md:w-[320px] h-[52px]"
                  placeHolderSize={true}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  {...formik.getFieldProps("schedulerName")}
                  value={formik.values.schedulerName}
                  error={
                    formik.touched.schedulerName && formik.errors.schedulerName
                  }
                />
              </div>
              <div>
                <MultiSelectDropdown
                  isRequired={true}
                  label="Select Test Suite"
                  className="w-full md:w-[320px] h-[52px]"
                  placeHolder="Select Test Suite Name"
                  options={testSuiteList}
                  selectedOptions={formik.values.testSuiteName}
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
            {/* Browser Type & Schedule type */}
            <div className="md:flex gap-5 mt-8">
              {(selectedApplication?.type === ApplicationTypeEnum.ANDROID ||
                selectedApplication?.type === ApplicationTypeEnum.IOS ||
                selectedApplication?.type === ApplicationTypeEnum.WEB ||
                selectedApplication?.type === ApplicationTypeEnum.TV) && (
                <div className="md:w-[50%] shedular-in">
                  <SearchDropdown
                    isBlock={true}
                    isRequired={true}
                    label={
                      selectedApplication?.type === ApplicationTypeEnum?.WEB
                        ? "Browser"
                        : "Device"
                    }
                    className="w-full md:w-[320px] h-[52px]"
                    placeHolder={
                      selectedApplication?.type === ApplicationTypeEnum?.WEB
                        ? "Select Browser Type"
                        : "Select Device Type"
                    }
                    option={browseData}
                    selectedOption={
                      formik.values.browserName ||
                      (selectedApplication?.type == ApplicationTypeEnum?.WEB &&
                        browserList[0])
                    }
                    onSelect={handleBrowserSelect}
                    hideCross={true}
                    onBlur={() => {
                      formik.setFieldTouched("browserName", true);
                    }}
                    error={
                      formik.touched.browserName &&
                      formik.errors.browserName &&
                      (selectedApplication?.type === ApplicationTypeEnum?.WEB
                        ? "Browser is required"
                        : "Device is required")
                    }
                  />
                </div>
              )}
              <div>
                <SelectDropdown
                  isBlock={true}
                  isRequired={true}
                  label="Schedule Type"
                  inputClassName="text-[14px]"
                  id="scheduleType"
                  className="h-[52px] w-full md:w-[320px]"
                  placeHolder="Select Schedule Type"
                  options={ScheduleTypeList}
                  value={formik.values.scheduleType}
                  onBlur={() => {
                    formik.setFieldTouched("scheduleType", true);
                  }}
                  onChange={(option) => {
                    handleScheduleSelect(option);
                  }}
                  error={
                    formik?.touched?.scheduleType &&
                    formik?.errors?.scheduleType
                  }
                />
              </div>
            </div>
            {/* Days Selection */}
            <div className="mt-8">
              <div className="text-sm font-medium leading-5">
                Schedule Day <span className="text-ird3">*</span>
              </div>
              <div className="flex gap-3 mt-4">
                {days?.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`w-[84px] h-[30px] rounded-[30px] cursor-pointer flex justify-center items-center 
                      ${
                        formik.values.selectedDays?.includes(day?.type)
                          ? "bg-ibl1 text-iwhite"
                          : "bg-igy12 text-igy1"
                      } 
                     hover:bg-ibl7 active:bg-ibl1 text-sm`}
                  >
                    {day?.name}
                  </div>
                ))}
              </div>
            </div>

            {/* For Future Purpose We are Commented Below Code */}

            {/* Mode Selection */}
             {/* <div className="mt-8">
              <div className="flex gap-[220px]">
                {(selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
                  selectedApplication?.type === ApplicationTypeEnum?.IOS ||
                  selectedApplication?.type === ApplicationTypeEnum?.TV) && (
                  <>
                    <div className="flex flex-col gap-[19px] justify-start">
                      <div className="flex items-center">
                        <div className="flex justify-start items-start mr-[2px]">
                          <div className="text-sm font-medium leading-7 text-start">
                            Execution Mode
                          </div>
                          <span className="text-ird3">*</span>
                        </div>
                        <div className="mr-[10px]">:</div>
                      </div>
                      <div className="flex gap-8">
                        <div>
                          <RadioButtons
                            id="LOCAL"
                            value="LOCAL"
                            onClick={() => {
                              formik.setFieldValue("executionMode", "LOCAL");
                              if (uniqId === null) {
                                formik.setFieldValue("grid", "");
                                formik.setFieldTouched("grid", false);
                              }
                            }}
                            checked={formik?.values?.executionMode === "LOCAL"}
                          />
                        </div>
                        <div>
                          <RadioButtons
                            id="REMOTE"
                            value="Remote"
                            onClick={() => {
                              formik.setFieldValue("executionMode", "REMOTE");
                            }}
                            checked={formik?.values?.executionMode === "REMOTE"}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-[19px] justify-start">
                      <div className="flex items-center">
                        <div className="flex justify-start items-start mr-[2px]">
                          <div className="text-sm font-medium leading-7 text-start">
                            Execution Type
                          </div>
                          <span className="text-ird3">*</span>
                        </div>
                        <div className="mr-[10px]">:</div>
                      </div>
                      <div className="flex gap-8">
                        <div>
                          <RadioButtons
                            id="SEQUENTIAL"
                            value="Sequential"
                            onClick={() => {
                              formik.setFieldValue(
                                "executionType",
                                "SEQUENTIAL"
                              );
                              if (uniqId === null) {
                                formik.setFieldValue("threadCountValue", "");
                                formik.setFieldTouched(
                                  "threadCountValue",
                                  false
                                );
                              }
                            }}
                            checked={
                              formik?.values?.executionType === "SEQUENTIAL"
                            }
                          />
                        </div>
                        <div>
                          <RadioButtons
                            id="PARALLEL"
                            value="Parallel"
                            onClick={() => {
                              formik.setFieldValue("executionType", "PARALLEL");
                            }}
                            checked={
                              formik?.values?.executionType === "PARALLEL"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div>
                {selectedApplication?.type === ApplicationTypeEnum?.WEB && (
                  <div className="flex flex-col gap-[19px] justify-start">
                    <div className="flex items-center">
                      <div className="flex justify-start items-start mr-[2px]">
                        <div className="text-sm font-medium leading-7 text-start">
                          Execution Type
                        </div>
                        <span className="text-ird3">*</span>
                      </div>
                      <div className="mr-[10px]">:</div>
                    </div>
                    <div className="flex gap-8">
                      <div>
                        <RadioButtons
                          id="SEQUENTIAL"
                          value="Sequential"
                          onClick={() => {
                            formik.setFieldValue("executionType", "SEQUENTIAL");
                            if (uniqId === null) {
                              formik.setFieldValue("threadCountValue", "");
                              formik.setFieldTouched("threadCountValue", false);
                            }
                          }}
                          checked={
                            formik?.values?.executionType === "SEQUENTIAL"
                          }
                        />
                      </div>
                      <div>
                        <RadioButtons
                          id="PARALLEL"
                          value="Parallel"
                          onClick={() => {
                            formik.setFieldValue("executionType", "PARALLEL");
                          }}
                          checked={formik?.values?.executionType === "PARALLEL"}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>  */}

             {/* <div
              className={`flex ${
                formik?.values?.executionMode === "LOCAL" &&
                formik?.values?.executionType === "PARALLEL"
                  ? "justify-end items-end"
                  : "justify-between items-center gap-2"
              } mt-5`}
            >
              {(selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
                selectedApplication?.type === ApplicationTypeEnum?.IOS ||
                selectedApplication?.type === ApplicationTypeEnum?.TV) &&
                formik?.values?.executionMode === "REMOTE" && (
                  <div className="flex items-start justify-start">
                    <SelectDropdown
                      isBlock={true}
                      id="grid"
                      isRequired={true}
                      options={gridData}
                      iconForApplication={true}
                      label="Grid"
                      placeHolder="Select grid Type"
                      className="w-[320px] h-[52px]"
                      inputClassName="text-sm"
                      value={formik.values.grid}
                      onBlur={() => {
                        formik.setFieldTouched("grid", true);
                      }}
                      onChange={(option) => {
                        formik.setFieldValue("grid", option);
                      }}
                      error={formik?.touched?.grid && formik?.errors?.grid}
                    />
                  </div>
                )}

              {formik?.values?.executionType === "PARALLEL" && (
                <div className="flex items-center justify-end gap-3">
                  <div>
                    <InputField
                      isRequired={true}
                      label="Thread Count"
                      type="number"
                      id="threadCountValue"
                      name="threadCountValue"
                      placeHolder="Enter Count"
                      className="w-full md:w-[320px] h-[52px]"
                      placeHolderSize={true}
                      inputClassName="text-sm"
                      {...formik.getFieldProps("threadCountValue")}
                      error={
                        (formik.touched.threadCountValue &&
                          formik.errors.threadCountValue) ||
                        (formik.touched.threadCountValue &&
                          formik.values.threadCountValue?.length < 1 &&
                          "Thread Count is Required") ||
                        (formik.touched.threadCountValue &&
                          formik.values.threadCountValue < 1 &&
                          "Thread Count must be greater than 0") ||
                        (formik.touched.threadCountValue &&
                          formik.values.threadCountValue > 20 &&
                          "Thread Count must be less than 21.")
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
                      onBlurCall={() => {
                        formik.setFieldTouched("threadCountValue", true);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>  */}

            <div className="mt-8">
              <div>
                <div className="flex flex-col gap-[19px] justify-start">
                  <div className="flex items-center">
                    <div className="flex justify-start items-start mr-[2px]">
                      <div className="text-sm font-medium leading-7 text-start">
                        Execution Type
                      </div>
                      <span className="text-ird3">*</span>
                    </div>
                    <div className="mr-[10px]">:</div>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <RadioButtons
                        id="SEQUENTIAL"
                        value="Sequential"
                        onClick={() => {
                          formik.setFieldValue("executionType", "SEQUENTIAL");
                          if (uniqId === null) {
                            formik.setFieldValue("threadCountValue", "");
                            formik.setFieldTouched("threadCountValue", false);
                          }
                        }}
                        checked={formik?.values?.executionType === "SEQUENTIAL"}
                      />
                    </div>
                    <div>
                      <RadioButtons
                        id="PARALLEL"
                        value="Parallel"
                        onClick={() => {
                          formik.setFieldValue("executionType", "PARALLEL");
                        }}
                        checked={formik?.values?.executionType === "PARALLEL"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specific Time & Time Interval */}
            <div className="flex gap-2">
              <div className="mt-[20px] flex gap-[20px] items-center">
                {formik?.values?.scheduleType?.name === "Specific Time" && (
                  <NewSelectTimeDropdown
                    isBlock={true}
                    label="Select Time"
                    placeHolder="Select Schedule Time"
                    value={formik.values.specificTime}
                    onChange={handleTimeChange}
                    isRequired={true}
                    className="w-[320px] h-[52px]"
                    onBlurCall={() => {
                      formik.setFieldTouched("specificTime", true);
                    }}
                    error={
                      formik.touched.specificTime && formik.errors.specificTime
                    }
                  />
                )}
                {formik?.values?.scheduleType?.name === "Time Interval" && (
                  <div>
                    <SelectDropdown
                      isBlock={true}
                      isRequired={true}
                      label="Time Interval"
                      inputClassName="text-[14px]"
                      id="transferType"
                      className="h-[52px] w-[320px]"
                      options={timeIntervalData}
                      placeHolder="Select Time Interval"
                      value={formik.values.timeInterval}
                      onBlur={() => {
                        formik.setFieldTouched("timeInterval", true);
                      }}
                      onChange={handleTimeIntervalClick}
                      error={
                        formik?.touched?.timeInterval &&
                        formik?.errors?.timeInterval
                      }
                    />
                  </div>
                )}
              </div>
              <div className="mt-[20px]">
                {formik?.values?.executionType === "PARALLEL" && (
                  <div className="flex items-center">
                    <div>
                      <InputField
                        isRequired={true}
                        label="Thread Count"
                        type="number"
                        id="threadCountValue"
                        name="threadCountValue"
                        placeHolder="Enter Count"
                        className="w-full md:w-[320px] h-[52px]"
                        placeHolderSize={true}
                        inputClassName="text-sm"
                        {...formik.getFieldProps("threadCountValue")}
                        error={
                          (formik.touched.threadCountValue &&
                            formik.errors.threadCountValue) ||
                          (formik.touched.threadCountValue &&
                            formik.values.threadCountValue?.length < 1 &&
                            "Thread Count is Required") ||
                          (formik.touched.threadCountValue &&
                            formik.values.threadCountValue < 1 &&
                            "Thread Count must be greater than 0") ||
                          (formik.touched.threadCountValue &&
                            formik.values.threadCountValue > 20 &&
                            "Thread Count must be less than 21.")
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
                        onBlurCall={() => {
                          formik.setFieldTouched("threadCountValue", true);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={`flex justify-center items-center`}>
            <CustomButton
              label={`${isEditMode && uniqId !== null ? "Save" : "Create"}`}
              className="w-[320px] h-[52px]"
              onClick={formik.handleSubmit}
              disable={isButtonEnabled}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateSchedulerModal;

const days = [
  { name: "Mon", type: "Monday" },
  { name: "Tue", type: "Tuesday" },
  { name: "Wed", type: "Wednesday" },
  { name: "Thu", type: "Thursday" },
  { name: "Fri", type: "Friday" },
  { name: "Sat", type: "Saturday" },
  { name: "Sun", type: "Sunday" },
];

const browserList = [
  { id: 1, type: "CHROME", keyword_name: "Chrome" },
  { id: 2, type: "SAFARI", keyword_name: "Safari" },
  { id: 3, type: "FIREFOX", keyword_name: "Firefox" },
  { id: 4, type: "EDGE", keyword_name: "Edge" },
];

const ScheduleTypeList = [
  { id: 1, name: "Specific Time", type: "Specific Time" },
  { id: 2, name: "Time Interval", type: "Time Interval" },
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

const iosData = [
  { id: 1, type: "IPHONE 15", keyword_name: "iPhone 15" },
  { id: 2, type: "IPHONE 14", keyword_name: "iPhone 14" },
  { id: 3, type: "IPHONE 13", keyword_name: "iPhone 13" },
  { id: 4, type: "IPHONE 12", keyword_name: "iPhone 12" },
  { id: 5, type: "IPHONE SE", keyword_name: "iPhone SE" },
];

const androidData = [
  { id: 1, type: "SAMSUNG", keyword_name: "Samsung" },
  { id: 2, type: "GOOGLE PIXEL", keyword_name: "Google Pixel" },
  { id: 4, type: "VIVO", keyword_name: "Vivo" },
  { id: 5, type: "OPPO", keyword_name: "Oppo" },
];

const gridData = [
  { id: 1, name: "BrowserStack", type: "browser-stack" },
  { id: 2, name: "Sauce Labs", type: "sauce-labs" },
];

const tvData = [
  { id: 1, keyword_name: "SONY" },
  { id: 2, keyword_name: "SAMSUNG" },
  { id: 3, keyword_name: "LG" },
];
