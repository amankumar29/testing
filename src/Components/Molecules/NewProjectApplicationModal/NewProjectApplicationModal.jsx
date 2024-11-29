import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import { Modal } from "../../Atoms/Modal/Modal";
import InputField from "../../Atoms/InputField/InputField";
import SelectDropdown from "../../Atoms/SelectDropdown/SelectDropdown";
import { useEffect, useMemo, useRef, useState } from "react";
import RadioButtons from "../../Atoms/RadioButtons/RadioButtons";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import styles from "./NewProjectApplicationModal.module.scss";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import deleteicon from "Assets/Images/delete.svg";
import { ReactMultiEmail } from "react-multi-email";
import "react-multi-email/dist/style.css";
import extraIcon from "../../../Assets/Images/extraicon.svg";

const options = [
  { id: 1, name: "Web", type: "WEB" },
  { id: 2, name: "Android", type: "ANDROID" },
  { id: 3, name: "iOS", type: "IOS" },
  { id: 4, name: "REST API", type: "RESTAPI" },
  { id: 5, name: "TV", type: "TV" },
];

const reportOptions = [
  { id: 1, name: "Telegram", type: "Telegram" },
  { id: 2, name: "Teams", type: "Teams" },
  { id: 3, name: "Slack", type: "Slack" },
];

const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .test("no-emojis", "Application name cannot contain emojis.", (val) => {
      return !emojiRegex.test(val);
    })
    .required("Application name is required.")
    .matches(/^(?!\s+$)/, "Spaces are not allowed.")
    .min(2, "Application name must be at least 2 characters.")
    .max(50, "Application name must be at most 50 characters.")
    .matches(
      /^[a-zA-Z0-9_.\- ]+$/,
      "Enter only letters, numbers, _, -, ., and spaces."
    ),
  selectedOption: Yup.mixed().required("Application type is required."),
  retryTestFail: Yup.number()
    .min(0, "Retry count must be non-negative.")
    .max(10, "Retry count must be less than 10.")
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? null : Number(value)
    )
    .typeError("Retry Test Fail Count must be a number."),
  email: Yup.array().of(Yup.string().email("Invalid email address")),

  components: Yup.array().of(
    Yup.object().shape({
      reportChatID: Yup.string().when("reportDelivery", {
        is: (val) => val !== null,
        then: (schema) =>
          schema
            .required("Chat ID is required.")
            .max(200, "Max 200 characters.")
            .matches(/^(?!\s+$)/, "Spaces are not allowed."),
        otherwise: (schema) => schema.nullable(),
      }),
      reportToken: Yup.string().when("reportDelivery", {
        is: (val) => val !== null,
        then: (schema) =>
          schema
            .required("Token is required.")
            .max(200, "Max 200 characters.")
            .matches(/^(?!\s+$)/, "Spaces are not allowed."),
        otherwise: (schema) => schema.nullable(),
      }),
    })
  ),
});

const NewProjectApplicationModal = ({
  isOpen,
  onClose,
  addedValues = () => {},
  initialValues,
  isEdit,
  applicationModal,
  callApplicationList = () => {},
  selectedProject,
  onCreateApplication,
  projectApplicationModalOpen,
  displayModalName,
}) => {
  const components = initialValues?.components;
  const emailId = initialValues?.emailId;
  const name = initialValues?.name;
  const retryTestFail = initialValues?.retryTestFail;
  const selectedOption = initialValues?.selectedOption;
  const selectedScreenshot = initialValues?.selectedScreenshot;
  const selectedVideoRecording = initialValues?.selectedVideoRecording;

  const [selectApplicationType, setSelectApplicationType] = useState(null);
  const [reportDelivery, setReportDelivery] = useState(false);
  const [isAddClicked, setIsAddClicked] = useState(false);
  const [emails, setEmails] = useState([]);
  const [focused, setFocused] = useState(false);
  const [retryFailedTest, setRetryFailedTest] = useState(false);
  const [emailIds, setEmailIds] = useState(false);
  const [disable, setDisbale] = useState(false);
  const [tokenDisable, setTokenDisable] = useState(false);
  const [hovered, setHovered] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || "",
      selectedOption: initialValues?.selectedOption || options[0],
      selectedScreenshot: initialValues?.selectedScreenshot || "FAILED",
      selectedVideoRecording: initialValues?.selectedVideoRecording || "false",
      retryTestFail: initialValues?.retryTestFail || 0,
      emailId: initialValues?.emailId || [],
      components: initialValues?.components || [
        // { reportChatID: "", reportToken: "", reportDelivery: null },
      ],
    },
    validationSchema,
    onSubmit: (values) => {
      // Check if retryTestFail is empty or undefined, set it to 0
      const retryTestFailValue = values?.retryTestFail
        ? Number(values?.retryTestFail)
        : 0;
      // Process emailId field to convert it into an array
      const processedValues = {
        ...values,
        retryTestFail: retryTestFailValue,
        emailId: emails?.length > 0 ? emails : [],
      };
      addedValues(processedValues);
      handleClose();
      formik.resetForm();
    },
  });

  const addNewProject = (values) => {
    values.emailId = emails?.length > 0 ? emails : [];
    onCreateApplication([values]);
    handleClose();
  };

  useEffect(() => {
    if (initialValues) {
      formik.setValues({
        name: initialValues?.name || "",
        selectedOption: initialValues?.selectedOption || options[0],
        selectedScreenshot: initialValues?.selectedScreenshot || "FAILED",
        selectedVideoRecording: initialValues?.selectedVideoRecording || "false",
        retryTestFail: initialValues?.retryTestFail || 0,
        emailId: initialValues?.emailId || [],
        components: initialValues?.components || [
          // { reportChatID: "", reportToken: "", reportDelivery: null },
        ],
      });

      // Set the emails state with the initial emailId value from initialValues
      setEmails(initialValues?.emailId || []);

      setSelectApplicationType(initialValues?.selectedOption);
      setReportDelivery(!!initialValues?.components?.length);
    }
  }, [initialValues, isOpen]);

  const handleOptionClick = (option) => {
    setSelectApplicationType(option);
    formik.setFieldValue("selectedOption", option);
    formik.setFieldTouched("selectedOption", true, false);
  };

  const handleAddClick = () => {
    const newComponents = [
      ...formik.values.components,
      { reportChatID: "", reportToken: "", reportDelivery: null },
    ];
    formik.setFieldValue("components", newComponents);
    setReportDelivery(true);
    setIsAddClicked(true);
  };

  const handleClose = () => {
    if (!isEdit) {
      formik.resetForm();
      setEmails([]);
      setSelectApplicationType(null);
    }
    onClose();
  };

  const handleScreenshotChange = (value) => {
    formik.setFieldValue("selectedScreenshot", value);
  };

  const handleVideoRecordingChange = (value) => {
    formik.setFieldValue("selectedVideoRecording", value);
  };

  const handleKeyDown = () => {
    if (!isEdit) {
      formik.resetForm();
      setEmails([]);
      setSelectApplicationType(null);
    }
  };

  // Comparing array for the Report Delivery

  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (
      typeof obj1 !== "object" ||
      obj1 === null ||
      typeof obj2 !== "object" ||
      obj2 === null
    )
      return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1?.length !== keys2?.length) return false;

    for (const key of keys1) {
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  };

  const arraysAreEqual = (arr1, arr2) => {
    if (arr1?.length !== arr2?.length) return false;
    return arr1?.every((item, index) => deepEqual(item, arr2[index]));
  };

  const formValuesComponents = formik?.values?.components || [];
  const currentComponents = components || [];
  const componentsEqual = arraysAreEqual(
    formValuesComponents,
    currentComponents
  );

  const isButtonEnabled = useMemo(() => {
    return (
      (name == formik?.values?.name &&
        retryTestFail == formik?.values?.retryTestFail &&
        selectedScreenshot == formik?.values?.selectedScreenshot &&
        selectedVideoRecording == formik?.values?.selectedVideoRecording &&
        selectedOption == formik?.values?.selectedOption &&
        emailId == formik?.values?.emailId &&
        componentsEqual) ||
      !(formik?.dirty && formik?.isValid) ||
      disable || tokenDisable
    );
  }, [
    formik,
    name,
    retryTestFail,
    selectedScreenshot,
    selectedVideoRecording,
    emailId
  ]);

  const handleDelete = (index) => {
    if (formik?.values?.components?.length > 0) {
      const updatedComponents = [...formik.values.components];
      updatedComponents.splice(index, 1);
      formik.setFieldValue("components", updatedComponents);
    }
  };

  const handleCloseModal = () => {
    handleKeyDown();
    onClose();
  };

  const clearSelectionCallback = (index) => {
    // Clear reportChatID field
    formik.setFieldValue(`components.${index}.reportChatID`, "");
    // Clear reportToken field
    formik.setFieldValue(`components.${index}.reportToken`, "");

    formik.setFieldTouched(`components.${index}.reportChatID`, false);
    formik.setFieldTouched(`components.${index}.reportToken`, false);
  };

  const ShowRetryFailedTestTooltip = () => {
    setRetryFailedTest(true);
  };

  const HideRetryFailedTestTooltip = () => {
    setRetryFailedTest(false);
  };

  const ShowEmailIdTooltip = () => {
    setEmailIds(true);
  };

  const HideEmailIdTooltip = () => {
    setEmailIds(false);
  };

  const isAddButtonDisabled = () => {
    return formik?.values?.components?.some(
      (comp) =>
        !comp?.reportDelivery ||
        !comp?.reportChatID?.trim() ||
        !comp?.reportToken?.trim()
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      isstopPropagationReq={true}
    >
      <div className="flex items-center justify-center h-full w-[722px]">
        <div className="w-full min-h-[548px] rounded-2xl shadow-2xl">
          <div className="flex flex-row justify-center items-center bg-ibl7 w-full rounded-t-[10px] h-[80px] relative">
            <div
              className="text-[18px] font-medium leading-7"
              data-testid="modal_heading"
            >
              {displayModalName
                ? "Edit New Application"
                : "Add New Application"}
            </div>
            <div className="flex justify-end !pr-6 absolute right-0">
              <CloseIcon
                onClick={handleClose}
                className="cursor-pointer"
                data-testid="closeIcon"
              />
            </div>
          </div>

          <div
            className={` ${
              isAddClicked && formik?.values?.components?.length > 0
                ? `${styles.scroll} max-h-[465px] p-5 md:p-10 overflow-y-auto`
                : `${styles.scroll} p-5 md:p-10 overflow-y-auto max-h-[calc(100vh-100px)]`
            }`}
          >
            <div className="grid md:grid-cols-2 gap-[10px] md:gap-[26px]">
              <InputField
                isRequired={true}
                label="Application Name"
                inputClassName={`h-[40px]`}
                placeHolder="Enter Application Name"
                placeHolderSize={true}
                {...formik.getFieldProps(`name`)}
                onBlur={() => formik.setFieldTouched(`name`, true)}
                error={formik.touched.name && formik.errors.name}
              />
              <SelectDropdown
                iconForApplication={true}
                isRequired={true}
                label="Application Type"
                inputClassName="text-sm"
                id="applicationType"
                className={"h-[40px]"}
                options={options}
                value={selectApplicationType || options[0]}
                placeHolder="Select Application"
                placeHolderSize={true}
                onBlur={() => formik.setFieldTouched(`selectedOption`, true)}
                onChange={handleOptionClick}
                error={
                  formik.touched.selectedOption && formik.errors.selectedOption
                }
                // showCross={true}
              />
            </div>
            <div className="grid md:grid-cols-2 pt-4 gap-[26px]">
              <div className="flex flex-col gap-4">
                <InputField
                  label={
                    <div className="flex items-center gap-1">
                      Retry Failed Test
                      <span
                        className="ml-1 cursor-pointer text-ird3"
                        onMouseEnter={() => ShowRetryFailedTestTooltip()}
                        onMouseLeave={() => HideRetryFailedTestTooltip()}
                      >
                        <img src={extraIcon} className="w-4 h-4" />
                      </span>
                      {retryFailedTest && (
                        <HoverCard
                          content={
                            <div className="text-iwhite text-xs font-normal leading-[18px] px-[10px]">
                              Enter the number of times you want the test cases
                              to be retried in case of failures.
                            </div>
                          }
                        />
                      )}
                    </div>
                  }
                  id="retryTestFail"
                  placeHolder="Enter Retry Failed Test Count"
                  className="h-[40px]"
                  placeHolderSize={true}
                  type="number"
                  {...formik.getFieldProps("retryTestFail")}
                  onBlur={() => formik.setFieldTouched("retryTestFail", true)}
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
                  error={
                    formik.touched.retryTestFail && formik.errors.retryTestFail
                  }
                />
                <div className="flex flex-row gap-5 pt-1">
                  <span className="w-[130px] mdMax:w-[80px] text-sm font-medium leading-5 text-igy1">
                    Screenshot
                  </span>
                  <span className="w-[70px] flex">
                    <RadioButtons
                      id="screenshot-all"
                      value="All"
                      className="text-sm font-normal leading-[22px] text-iblack"
                      onClick={() => handleScreenshotChange("ALL")}
                      checked={formik.values.selectedScreenshot === "ALL"}
                    />
                  </span>
                  <span className="w-[70px] flex">
                    <RadioButtons
                      id="screenshot-failed"
                      value="Failed"
                      className="text-sm font-normal leading-[22px] text-iblack"
                      onClick={() => handleScreenshotChange("FAILED")}
                      checked={formik.values.selectedScreenshot === "FAILED"}
                    />
                  </span>
                </div>
                <div className="flex flex-row gap-5 pt-1">
                  <span className="w-[130px] mdMax:w-[80px] text-sm font-medium leading-5 text-igy1">
                    Video Recording
                  </span>
                  <span className="w-[70px] flex">
                    <RadioButtons
                      id="video-yes"
                      value="Yes"
                      className="text-sm font-normal leading-[22px] text-iblack"
                      onClick={() => handleVideoRecordingChange("true")}
                      checked={formik.values.selectedVideoRecording === "true"}
                    />
                  </span>
                  <span className="w-[70px] flex">
                    <RadioButtons
                      id="video-no"
                      value="No"
                      className="text-sm font-normal leading-[22px] text-iblack"
                      onClick={() => handleVideoRecordingChange("false")}
                      checked={formik.values.selectedVideoRecording === "false"}
                    />
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="emailId"
                  className={`text-sm font-medium leading-6 ${hovered ? 'text-ibl1' : 'text-igy1'}`}
                  onClick={(e) => e?.preventDefault()}
                >
                  <div className="flex items-center gap-1">
                    Email IDs
                    <span
                      className="ml-1 cursor-pointer text-ird3"
                      onMouseEnter={() => ShowEmailIdTooltip()}
                      onMouseLeave={() => HideEmailIdTooltip()}
                    >
                      <img src={extraIcon} className="w-4 h-4" />
                    </span>
                    {emailIds && (
                      <HoverCard
                        content={
                          <div className="text-iwhite text-xs font-normal leading-[18px] px-[10px]">
                            Enter the email IDs for report delivery.
                          </div>
                        }
                        emailIds={emailIds}
                      />
                    )}
                  </div>
                </label>
               <div 
                onMouseEnter = {() => setHovered(true)}
                onMouseLeave = {() => setHovered(false)}
               >
               <ReactMultiEmail
                  placeholder="Enter Email IDs"
                  id="emailId"
                  className={`${
                    styles.emailScrollBar
                  } h-[132px] w-full flex-auto text-ibl1 rounded-lg break-all ${
                    styles.customPlaceHolder
                  } ${styles.reactMultiEmailBorder} ${
                    emails?.length > 0 ? styles.borderIbl1 : styles.borderIgy6
                  }`}
                  emails={emails}
                  onChange={(emails) => {
                    setEmails(emails);
                    formik.setFieldValue("emailId", emails);
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  getLabel={(email, index, removeEmail) => (
                    <div data-tag key={index} className={`${styles.userEmail}`}>
                      <div data-tag-item>{email}</div>
                      <span data-tag-handle onClick={() => removeEmail(index)}>
                        ×
                      </span>
                    </div>
                  )}
                />
               </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-4">
              {formik.values.components.map((comp, index) => (
                <div className="grid gap-4 md:grid-cols-3 relative" key={index}>
                  <SelectDropdown
                    label={index === 0 ? "Channel Hub" : ""}
                    inputClassName="text-sm"
                    id="reportDelivery"
                    className={"h-[40px] cursor-pointer"}
                    options={reportOptions}
                    value={comp.reportDelivery}
                    placeHolder="Select"
                    placeHolderSize={true}
                    onBlur={() =>
                      formik.setFieldTouched(
                        `components.${index}.reportDelivery`,
                        true
                      )
                    }
                    onChange={(value) => {
                      formik.setFieldValue(
                        `components.${index}.reportDelivery`,                      
                        value                                            // when ever we editing the application save button is enabling if we fill report chat id or report token without filling the report delivery for fixing that isue i used this condition  
                      );
                      setDisbale(false);
                      setTokenDisable(false);
                    }}
                    error={
                      formik.touched.components?.[index]?.reportDelivery &&
                      formik.errors.components?.[index]?.reportDelivery
                    }
                    removeContainer={true}
                    iconForApplication={true}
                    showCross={true}
                    clearSelectionCallback={() => clearSelectionCallback(index)}
                  />
                  <InputField
                    label={index === 0 ? "Chat ID" : ""}
                    // isRequired={true}
                    id={`components.${index}.reportChatID`}
                    placeHolder="Enter Chat ID"
                    className="h-[40px]"
                    placeHolderSize={true}
                    disabled={!formik.values.components?.[index]?.reportDelivery}
                    {...formik.getFieldProps(
                      `components.${index}.reportChatID`
                    )}
                    onChange={(e) => {
                      formik.setFieldValue(
                        `components.${index}.reportChatID`,
                        e?.target?.value
                      );
                      if (
                        formik?.values?.components?.[index]?.reportChatID
                        ?.length >= 0 &&
                        formik?.dirty &&
                        formik?.isValid &&                                                        // when ever we editing the application save button is enabling if we fill report chat id or report token without filling the report delivery for fixing that isue i used this condition this is the only one approach we have  
                        formik?.values?.components?.[index]?.reportDelivery ==
                          undefined
                      ) {
                        setDisbale(true);
                      } else {
                        setDisbale(false);
                      }
                      if (
                        formik?.values?.components?.[index]?.reportToken
                          ?.length >= 0 &&                                                         // when ever we editing the application save button is enabling if we fill report chat id or report token without filling the report delivery for fixing that isue i used this condition this is the only one approach we have 
                          formik?.dirty &&
                          formik?.isValid &&
                        formik?.values?.components?.[index]?.reportDelivery ==
                          undefined
                      ) {
                        setTokenDisable(true);
                      } else {
                        setTokenDisable(false);
                      }
                    }}
                    onBlur={() => {
                      formik.setFieldTouched(
                        `components.${index}.reportChatID`,
                        true
                      );
                      if (
                        formik?.values?.components?.[index]?.reportChatID
                          ?.length >= 0 &&
                          formik?.dirty &&                                                               // when ever we editing the application save button is enabling if we fill report chat id or report token without filling the report delivery for fixing that isue i used this condition  this is the only one approach we have
                          formik?.isValid &&
                        formik?.values?.components?.[index]?.reportDelivery ==                       
                          undefined
                      ) {
                        setDisbale(true);
                      } else {
                        setDisbale(false);
                      }
                      if (
                        formik?.values?.components?.[index]?.reportToken
                          ?.length >= 0 &&
                          formik?.dirty &&                                                        // when ever we editing the application save button is enabling if we fill report chat id or report token without filling the report delivery for fixing that isue i used this condition this is the only one approach we have 
                          formik?.isValid &&
                        formik?.values?.components?.[index]?.reportDelivery ==
                          undefined
                      ) {
                        setTokenDisable(true);
                      } else {
                        setTokenDisable(false);
                      }
                    }}
                    error={
                      formik.touched.components?.[index]?.reportChatID &&
                      formik.errors.components?.[index]?.reportChatID
                    }
                  />
                  <InputField
                    label={index === 0 ? "Token" : ""}
                    // isRequired={true}
                    id={`components.${index}.reportToken`}
                    placeHolder="Enter Token"
                    className="h-[40px]"
                    placeHolderSize={true}
                    disabled={!formik.values.components?.[index]?.reportDelivery}
                    {...formik.getFieldProps(`components.${index}.reportToken`)}
                    onBlur={() =>
                      formik.setFieldTouched(
                        `components.${index}.reportToken`,
                        true
                      )
                    }
                    onChange={(e) => {
                      if (
                        formik?.values?.components?.[index]?.reportChatID
                          ?.length >= 0 &&                                                           // when ever we editing the application save button is enabling if we fill report chat id or report token without filling the report delivery for fixing that isue i used this condition this is the only one approach we have 
                             formik?.dirty &&
                        formik?.isValid &&
                        formik?.values?.components?.[index]?.reportDelivery ==
                          undefined
                      ) {
                        setDisbale(true);
                      } else {
                        setDisbale(false);
                      }
                      if (
                        formik?.values?.components?.[index]?.reportToken
                          ?.length >= 0 &&
                          formik?.dirty &&
                          formik?.isValid &&                                              // when ever we editing the application save button is enabling if we fill report chat id or report token without filling the report delivery for fixing that isue i used this condition this is the only one approach we have 
                        formik?.values?.components?.[index]?.reportDelivery ==
                          undefined
                      ) {
                        setTokenDisable(true);
                      } else {
                        setTokenDisable(false);
                      }
                      formik.setFieldValue(
                        `components.${index}.reportToken`,
                        e?.target?.value
                      );
                    }}
                    error={
                      formik.touched.components?.[index]?.reportToken &&
                      formik.errors.components?.[index]?.reportToken
                    }
                  />

                  {/* Show delete icon if isAddClicked is true, index > 0, and components length == 1 we are not showing delete icon */}
                  { isAddClicked && (formik?.values?.components?.length > 0 )  &&
                    (<CustomTooltip
                        title="Delete"
                        placement="bottom"
                        offset={[0, -14]}
                        height={"28px"}
                        fontSize="11px"
                      >
                        <img
                          src={deleteicon}
                          alt="delete icon"
                          className={`absolute -right-[20px] md:-right-[30px] top-2 ${
                            index > 0 ? "pt-[10px]" : "mt-[34px]"
                          } hover:cursor-pointer`}
                          onClick={() => handleDelete(index)}
                        />
                      </CustomTooltip>
                    )}
                </div>
              ))}
            </div>
            <div className="relative">
              <button
                 className={`absolute top-[6px] right-[0px] flex flex-row gap-1 font-medium text-xs ${
                  isAddButtonDisabled()
                    ? "!text-igy5 !cursor-not-allowed"
                    : "text-ibl1 cursor-pointer hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in-out hover:underline hover:opacity-90"
                }`}
                onClick={handleAddClick}
                disabled={isAddButtonDisabled()}
              >
                Add Channel
              </button>
            </div>

            <div
              className={`flex justify-center gap-2 pt-[45px] ${
                isAddClicked && formik?.values?.components?.length > 1 && "mb-6"
              }`}
            >
              <CustomButton
                onClick={handleClose}
                label="Cancel"
                className="w-[162px] h-10 !text-ibl3 bg-iwhite border border-ibl1 hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1"
              />
              <CustomButton
                disable={isButtonEnabled}
                label={isEdit ? "Save" : "Add"}
                onClick={
                  projectApplicationModalOpen
                    ? formik.handleSubmit
                    : (e) => addNewProject(formik?.values, e)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

NewProjectApplicationModal.propTypes = {
  onClick: PropTypes.func,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  applicationModal: PropTypes.bool,
  addedValues: PropTypes.func,
  initialValues: PropTypes.array,
  isEdit: PropTypes.bool,
  callApplicationList: PropTypes.func,
  selectedProject: PropTypes.any,
};

export default NewProjectApplicationModal;

const HoverCard = ({ content, emailIds }) => {
  return (
    <div className="relative flex items-center">
      <div
        className={`absolute -left-[11px] transform -translate-x-1/2 mt-2 ${
          emailIds
            ? "w-[193px] h-[63px] bottom-6"
            : "w-[235px] h-[81px] -top-[115px]"
        } p-3 bg-igy13 z-10 rounded-lg ${styles.cardShadow}`}
      >
        {content}
      </div>
    </div>
  );
};

HoverCard.propTypes = {
  content: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};
