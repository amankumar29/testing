import CloseIcon from "@mui/icons-material/Close";
import InputField from "../../Atoms/InputField/InputField";
import RadioButtons from "../../Atoms/RadioButtons/RadioButtons";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import SearchDropdown from "../../Atoms/SearchDropdown/SearchDropdown";
import { useEffect, useState ,useContext} from "react";
import PropTypes, { number } from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { createRunTestPlan } from "../../../Services/API/TestPlans/TestPlans";
import SelectDropdown from "../../Atoms/SelectDropdown/SelectDropdown";
import { useSelector } from "react-redux";
import {
  useCreateTestCaseRunMutation,
  useCreateTestSuiteRunMutation,
  useEmailNotificationMutation
} from "Services/API/apiHooks";
import { ApplicationTypeEnum } from "Enums/ApplicationTypeEnum";
import { WebsocketContext } from "Services/Socket/socketProvider";

export default function CreateRunModal({
  onClick,
  id,
  type,
  clearCheckBoxes = () => { },
  // selectedApplication,
  onRunCreated = () => { }, // Added callback prop
}) {
  const { defaultApplication,userDetails } = useSelector((state) => state?.userDetails);
  const {socket,engineSocket} = useContext(WebsocketContext)
  const selectedApplication = defaultApplication;

  const [createTestCaseRun] = useCreateTestCaseRunMutation();
  const [createTestSuiteRun] = useCreateTestSuiteRunMutation();

  const [runType, setRunType] = useState("SEQUENTIAL");
  const [selectBrowserType, setSelectBrowserType] = useState(null);
  const [executionMode, setExecutionMode] = useState("LOCAL");
  const [selectedApplicationType, setSelectedApplicationType] = useState([]);
  const [newPayload, setNewPayload] = useState({});
  const [emailNotification] = useEmailNotificationMutation();

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  const formik = useFormik({
    initialValues: {
      runName: "",
      threadCountValue: "",
      defaultBrowserValue: null,
      grid: null,
    },
    validationSchema: Yup.object().shape({
      runName: Yup.string()
        .test("no-emojis", "Run name cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Run name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .min(2, "Run name must be at least 2 characters.")
        .max(50, "Run name must be at most 50 characters.")
        .matches(
          /^[a-zA-Z0-9_.\- ]+$/,
          "Enter only letters, numbers, _, -, ., and spaces."
        ),
      threadCountValue: Yup.number().when("runType", {
        is: "PARALLEL",
        then: (schema) =>
          schema
            .required("Thread Count is required.")
            .min(1, "Thread Count must be greater than 0")
            .typeError("Thread Count must be a number.")
            .positive("Thread Count must be a positive number.")
            .integer("Thread Count must be an integer.")
            .min(0, "Thread Count must be non-negative.")
            .max(10, "Thread Count must be less than 5"),
        otherwise: (schema) => schema.nullable(),
      }),

      defaultBrowserValue: Yup.object().required(
        `${selectedApplication?.type === ApplicationTypeEnum?.WEB
          ? "Browser is required."
          : "Device is required."
        } `
      ),

      grid: Yup.object().when(["executionMode", "selectedApplication"], {
        is: () =>
          (selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
            selectedApplication?.type === ApplicationTypeEnum?.IOS ||
            selectedApplication?.type === ApplicationTypeEnum?.TV) &&
          executionMode === "REMOTE",
        then: (schema) => schema.required("Grid data is required."),
        otherwise: (schema) => schema.nullable(),
      }),
    }),

    onSubmit: (values) => {
      fetchhandleCreate(values);
    },
  });
  // const browseData = selectedApplicationType;
  const isMac = navigator.platform.toUpperCase().includes("MAC");

  // Determine the browseData based on selectedApplication type and executionMode
  const browseData = (() => {
    if (selectedApplication?.type === ApplicationTypeEnum?.WEB) {
      // For WEB applications, show browser list and conditionally include Safari
      return (executionMode === "LOCAL" && isMac) && executionMode !== "REMOTE"
        ? browserList
        : browserList.filter((browser) => browser.keyword_name !== "Safari");
    } else if (selectedApplication?.type === ApplicationTypeEnum?.IOS) {
      // For iOS applications, show iOS device list
      return iosData;
    } else if (selectedApplication?.type === ApplicationTypeEnum?.ANDROID) {
      // For Android applications, show Android device list
      return androidData;
    } else if (selectedApplication?.type === ApplicationTypeEnum?.TV) {
      // For TV applications, show TV device list
      return tvData;
    }
    return [];
  })();

  const fetchhandleCreate = (values) => {
    const formData = {
      runName: values?.runName.trim(),
      target: "REMOTE",
      executionType: runType,
      ...(runType === "PARALLEL" && {
        threadCount: Number(values?.threadCountValue),
      }),
      ...((selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
        selectedApplication?.type === ApplicationTypeEnum?.IOS ||
        selectedApplication?.type === ApplicationTypeEnum?.TV) &&
        executionMode === "REMOTE" && {
        grid: formik?.values?.grid?.type,
      }),
      ...newPayload,
    };
    console.log(formData);

    // Define the run creation function based on type
    const runCreationPromise = (() => {
      switch (type) {
        case "test-cases":
        case "suite-test-cases":
        case "projects/test-cases/add-test-steps":
          return createTestCaseRun(formData);
        case "test-suites":
          return createTestSuiteRun(formData);
        default:
          return createRunTestPlan(formData);
      }
    })();

    // Execute the run creation function and handle success/error
    runCreationPromise
      .then((res) => {
        try{
          emailNotification({
            fromUser: {
              firstName: userDetails?.firstName,
              lastName: userDetails?.lastName,
              email: userDetails?.email
            },
            runId: res?.data?.results?._id ? res?.data?.results?._id : res?.data?._id,
            type: 'runDetails',
            toAll: true,
            projectId: defaultApplication?.projectId,
            applicationId: defaultApplication?.id
          }).then((res) => {
            toast.success(res?.data?.message);
          })
        }catch(error){
          toast.error(error?.response?.data?.details);
        }
        
        if(res?.data?._id){
          socket.emit("onTestsuites", {
            command: "createRun-suite",
            organizationId: userDetails?.organizationId,
            applicationId: defaultApplication?.id,
            projectId: defaultApplication?.projectId,
            user: {
            userName: userDetails?.userName,
            userId: userDetails?.userId,
          },
          data:{
            ...res?.data,
            createdBy:{
              _id:userDetails?._id,
              firstName:userDetails?.firstName,
              lastName:userDetails?.lastName
            }
          },
        });
      }
      if(res?.data?.results?._id){
        // engineSocket.emit('runTestCase',JSON.stringify(res?.data?.results))
      }
        const msg = res?.error?.data?.details;
        if (msg) {
          toast.error(msg);
        } else {
          toast.success("Run has been successfully processed");
        }

        onRunCreated(); // Call the callback function here
      })
      .catch(() => {
        toast.error("An error occurred while processing your request");
      });

    onClick();
    clearCheckBoxes();
  };

  const handleBrowserSelect = (item) => {
    setSelectBrowserType(item);
    formik.setFieldValue("defaultBrowserValue", item);
    // Construct the idKey based on type
    let idKey;
    switch (type) {
      case "test-cases":
      case "suite-test-cases":
      case "projects/test-cases/add-test-steps":
        idKey = "testCaseId";
        break;
      case "test-scheduler":
        idKey = "testPlanId";
        break;
      default:
        idKey = "testSuiteId";
        break;
    }

    // Construct the device type based on selectedApplication type
    let deviceType =
      selectedApplication?.type === ApplicationTypeEnum?.WEB
        ? { browser: item?.keyword_name?.toUpperCase() }
        : { device: item?.keyword_name?.toUpperCase() };

    // Construct the platform based on selectedApplication type
    let platform;
    switch (selectedApplication?.type) {
      case "ANDROID":
        platform = "ANDROID";
        break;
      case "IOS":
        platform = "IOS";
        break;
      case "TV":
        platform = "TV";
        break;
      case "WEB":
        platform = "WEB";
        break;
      default:
        platform = "";
        break;
    }

    // Construct the payload object
    let payload = {
      [idKey]: id,
      ...deviceType,
      platform,
    };

    setNewPayload(payload);
  };

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

  const handleClickSequential = () => {
    setRunType("SEQUENTIAL");
    formik.setFieldValue("threadCountValue", "");
    formik.setFieldTouched("threadCountValue", false);
  };

  const isButtonDisabled = () => {
    const { runName, threadCountValue, defaultBrowserValue, grid } =
      formik.values;

    if (
      runType == "PARALLEL" &&
      (!threadCountValue || threadCountValue <= 0 || threadCountValue > 5)
    ) {
      return true;
    }

    if (!runName || !defaultBrowserValue) {
      return true;
    }

    if (
      (selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
        selectedApplication?.type === ApplicationTypeEnum?.IOS ||
        selectedApplication?.type === ApplicationTypeEnum?.TV) &&
      executionMode === "REMOTE" &&
      !grid
    ) {
      return true;
    }

    return false;
  };
  useEffect(() => {
    if (executionMode === "LOCAL") {
      formik.setFieldValue("grid", null);
      formik.setFieldTouched("grid", false);
    }
  }, [executionMode]);

  return (
    <div className="w-[460px] h-auto">
      <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[10px]">
        <div className="w-[300px] h-[80px] flex justify-between items-center">
          <div
            className="text-[18px] font-medium leading-7"
            data-testid="modal_heading"
          >
            Create Test Run
          </div>
          <div className="flex justify-end !pr-6">
            <CloseIcon
              onClick={onClick}
              className="cursor-pointer"
              data-testid="close_Icon"
            />
          </div>
        </div>
      </div>

      {/* Form */}

      <div className="flex flex-col gap-6 mt-[18px]">
        <div className="flex items-center justify-center gap-4">
          <div>
            <InputField
              id="runName"
              label="Run Name"
              placeHolder="Enter Run Name"
              className="w-[352px] h-[52px]"
              inputClassName="text-sm"
              placeHolderSize={true}
              isRequired={true}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              {...formik.getFieldProps("runName")}
              error={formik.touched.runName && formik.errors.runName}
            />
          </div>
        </div>

        {selectedApplication?.type === ApplicationTypeEnum?.WEB && (
          <div className="flex px-[54px]">
            <div className="flex justify-start items-start mr-0.5">
              <div className="text-sm font-medium leading-7 text-start">
                Execution Type
              </div>
              <span className="text-ird3">*</span>
            </div>
            <div className="mr-[10px]">:</div>
            <div className="flex gap-4">
              <div>
                <RadioButtons
                  name="SEQUENTIAL"
                  value="Sequential"
                  onClick={handleClickSequential}
                  checked={runType === "SEQUENTIAL"}
                />
              </div>
              <div>
                <RadioButtons
                  name="PARALLEL"
                  value="Parallel"
                  onClick={() => {
                    setRunType("PARALLEL");
                  }}
                  checked={runType === "PARALLEL"}
                />
              </div>
            </div>
          </div>
        )}

        {/* Execution Mode */}

        {runType === "PARALLEL" && (
          <div className="flex justify-center items-center gap-3">
            <div className="text-sm font-medium mr-1">
              Thread Count <span className="text-ird3">*</span> :
            </div>
            <div>
              <InputField
                type="number"
                id="threadCountValue"
                name="threadCountValue"
                placeHolder="Enter Count"
                className="w-[227px] h-[52px]"
                placeHolderSize={true}
                inputClassName="text-sm"
                {...formik.getFieldProps("threadCountValue")}
                error={
                  (formik.touched.threadCountValue &&
                    formik.errors.threadCountValue) ||
                  (formik.touched.threadCountValue &&
                    formik.values.threadCountValue?.length < 1 &&
                    "Thread Count is Required.") ||
                  (formik.touched.threadCountValue &&
                    formik.values.threadCountValue < 1 &&
                    "Thread Count must be greater than 0.") ||
                  (formik.touched.threadCountValue &&
                    formik.values.threadCountValue > 5 &&
                    "Thread Count must be less than 5.")
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

        <div className="flex px-[54px]">
          <div className="flex justify-start items-start mr-[2px]">
            <div className="text-sm font-medium leading-7 text-start">
              Execution Mode
            </div>
            <span className="text-ird3">*</span>
          </div>
          <div className="mr-[10px]">:</div>
          <div className="flex gap-4">
            <div>
              <RadioButtons
                id="LOCAL"
                value="Local"
                onClick={() => {
                  setExecutionMode("LOCAL");
                }}
                checked={executionMode === "LOCAL"}
              />
            </div>
            <div>
              <RadioButtons
                id="REMOTE"
                value={
                  selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
                    selectedApplication?.type === ApplicationTypeEnum?.IOS ||
                    selectedApplication?.type === ApplicationTypeEnum?.TV
                    ? "Cloud"
                    : "Remote"
                }
                onClick={() => setExecutionMode("REMOTE")}
                checked={
                  executionMode === "REMOTE" ||
                  (executionMode === "Cloud" &&
                    (selectedApplication?.type ===
                      ApplicationTypeEnum?.ANDROID ||
                      selectedApplication?.type === ApplicationTypeEnum?.IOS ||
                      selectedApplication?.type === ApplicationTypeEnum?.TV))
                }
              />
            </div>
          </div>
        </div>

        {/* Browser */}
        <div className="flex justify-center items-center">
          <SearchDropdown
            isRequired={true}
            label={
              selectedApplication?.type === ApplicationTypeEnum?.WEB
                ? "Browser"
                : "Device"
            }
            className="w-[352px] h-[52px]"
            placeHolder={
              selectedApplication?.type === ApplicationTypeEnum?.WEB
                ? "Select Browser Type"
                : "Select Device Type"
            }
            option={browseData}
            hideCross={true}
            selectedOption={selectBrowserType}
            onSelect={handleBrowserSelect}
            onBlur={() => {
              formik.setFieldTouched("defaultBrowserValue", true);
            }}
            error={
              formik.touched.defaultBrowserValue &&
              formik.errors.defaultBrowserValue
            }
          />
        </div>

        {executionMode === "REMOTE" &&
          (selectedApplication?.type === ApplicationTypeEnum?.ANDROID ||
            selectedApplication?.type === ApplicationTypeEnum?.IOS ||
            selectedApplication?.type === ApplicationTypeEnum?.TV) && (
            <div className="flex justify-center items-center">
              <SelectDropdown
                id="grid"
                isRequired={true}
                options={gridData}
                iconForApplication={true}
                label="Grid"
                placeHolder="Select grid Type"
                className="w-[352px] h-[52px]"
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

        {/* Button */}
        <div className="flex justify-center items-center">
          <CustomButton
            label={"Execute"}
            className={`w-[352px] h-[52px] mb-6`}
            onClick={formik.handleSubmit}
            disable={isButtonDisabled() || !formik.isValid}
          />
        </div>
      </div>
    </div>
  );
}

const browserList = [
  { id: 1, keyword_name: "Default" },
  { id: 2, keyword_name: "Firefox" },
  { id: 3, keyword_name: "Edge" },
  { id: 4, keyword_name: "Chrome" },
  { id: 5, keyword_name: "Safari" },
];

const iosData = [
  { id: 1, keyword_name: "iPhone 15" },
  { id: 2, keyword_name: "iPhone 14" },
  { id: 3, keyword_name: "iPhone 13" },
  { id: 4, keyword_name: "iPhone 12" },
  { id: 5, keyword_name: "iPhone SE" },
];

const androidData = [
  { id: 1, keyword_name: "Samsung" },
  { id: 2, keyword_name: "Google Pixel" },
  { id: 4, keyword_name: "Vivo" },
  { id: 5, keyword_name: "Oppo" },
];

const gridData = [
  { id: 1, name: "BrowserStack", type: "browser-stack" },
  { id: 2, name: "Sauce Labs", type: "sauce-labs" },
];

const tvData = [
  { id: 1, keyword_name: "Sony" },
  { id: 2, keyword_name: "Samsung" },
  { id: 3, keyword_name: "LG" },
];

CreateRunModal.propTypes = {
  onClick: PropTypes.func,
  id: PropTypes.array,
  onCloseRunPopup: PropTypes.func,
  clearCheckBoxes: PropTypes.func,
  type: PropTypes.string,
  selectedApplication: PropTypes.any,
  onRunCreated: PropTypes.func,
};
