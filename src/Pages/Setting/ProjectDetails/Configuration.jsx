import { useState, useEffect, useMemo } from "react";
import {  useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import InputField from "../../../Components/Atoms/InputField/InputField";
import SelectDropdown from "../../../Components/Atoms/SelectDropdown/SelectDropdown";
import RadioButtons from "../../../Components/Atoms/RadioButtons/RadioButtons";
import { ReactMultiEmail } from "react-multi-email";
import styles from "./ProjectDetails.module.scss";
import deleteicon from "Assets/Images/delete.svg";
import webicon from "../../../Assets/Images/webicon.svg";
import android from "../../../Assets/Images/androidicon.svg";
import ios from "../../../Assets/Images/iosicon.svg";
import rest from "../../../Assets/Images/apiicon.svg";
import tvIcon from "../../../Assets/Images/tv.svg";
import { toast } from "react-toastify";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import FileUpload from "Components/Atoms/FileUpload/FileUpload";
import { useGetApplicationDetailsByIdQuery } from "Services/API/apiHooks";
import { useUpdateApplicationByIdMutation } from "Services/API/apiHooks";
import { unstable_batchedUpdates } from "react-dom";

const options = [
  { id: 1, name: "Web", type: "WEB", img: webicon },
  { id: 2, name: "Android", type: "ANDROID", img: android },
  { id: 3, name: "iOS", type: "IOS", img: ios },
  { id: 4, name: "REST API", type: "RESTAPI", img: rest },
  { id: 5, name: "TV", type: "TV", img: tvIcon },
];

const reportOptions = [
  { id: 1, name: "Telegram", type: "Telegram" },
  { id: 2, name: "Teams", type: "Teams" },
  { id: 3, name: "Slack", type: "Slack" },
];

function Configuration() {
  const { projectId: projectId, applicationId: appId } = useParams(); // Retrieve params from the URL
  const [emails, setEmails] = useState([]);
  const [savedDetails, setSavedDetails] = useState(null);
  const [focused, setFocused] = useState(false);
  const [fileError, setFileError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("initial");
  const navigate = useNavigate();
  const [fileUploadedStatus, setFileUploadedStatus] = useState(null);
  // const [isCurrentFormSaved, setIsCurrentFormSaved] = useState(true);
  const [lastSavedFile, setLastSavedFile] = useState(null);
  const [isFileSaved, setIsFileSaved] = useState(true);
  const [updateApplicationById] = useUpdateApplicationByIdMutation();
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [newUrl, setNewUrl] = useState("");
  const [appChange, setAppChange] = useState(false);
  const [changeType, setChangeType] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: applicationDetail,
    error: apiError,
    refetch: refetchApplicationDetails,
  } = useGetApplicationDetailsByIdQuery({
    id: appId,
    params: {},
    // limit: 25,
    // offset: 0,
    // sortDirection: "asc",
    // sortColumn: "name",
    // searchKey:null
  });

  useEffect(() => {
    if (applicationDetail) {
      const data = applicationDetail?.results;
      const fileInfo = data?.appData?.apkFile || null;
      setApplicationDetails(data);
      setSavedDetails(data);
      setEmails(data.channels.email || []);
      setNewUrl(fileInfo);
      setLastSavedFile(fileInfo);
      setIsFileSaved(true);

      // Update formik form values
      formik.setValues({
        name: data?.name || "", // Map name from data
        type: data?.type || "", // Map type from data
        retryCount: data?.retryCount || 0, // Retry count from response

        channels: {
          email: data?.channels?.email || [], // Map channels.email
          reportDelivery:
            Array.isArray(data?.channels?.reportDelivery) &&
            data.channels.reportDelivery?.length > 0
              ? data.channels.reportDelivery.map((delivery) => ({
                  type: delivery?.type || "", // Map type
                  spec: {
                    tokenId: delivery?.spec?.token || "", // Map tokenId (nested in spec)
                    chatId: delivery?.spec?.chatId || "", // Map chatId (nested in spec)
                  },
                }))
              : [{ type: "", spec: { tokenId: "", chatId: "" } }],
        },

        appData: {
          apkFile: fileInfo, // Map apkFile from appData
        },
        appSettings: {
          videoRecord: data?.appSettings?.videoRecord || false, // Map videoRecord from appSettings
          screeShotType: data?.appSettings?.screeShotType || "Failed", // Map screeShotType from appSettings
          appActivity: data?.appSettings?.appActivity || "", // Map appActivity from appSettings
          appPackage: data?.appSettings?.appPackage || "", // Map appPackage from appSettings
        },
      });
    }
    if (apiError) {
      // Handle error case and show a toast
      const message =
        apiError?.data?.details ||
        "Error while fetching the application details";
      toast.error(message);
    }
  }, [appId, apiError, applicationDetail]); // Runs whenever applicationDetail or apiError changes

  // New function to handle file changes
  const handleFileChange = (file) => {
    formik.setFieldValue("appData.apkFile", file);
    setIsFileSaved(false);
  };

  // Updated function to handle file upload status
  const handleFileUploadChange = (uploadedFile, status) => {
    formik.setFieldValue("appData.apkFile", uploadedFile);
    formik.setFieldTouched("appData.apkFile", true);
    setUploadStatus(status);
    setIsFileSaved(false);
    setLastSavedFile(uploadedFile);
  };

  const handleUpdateConfiguration = async (values) => {
    setIsUpdating(true);
  
    const updatePayload = {
      projectId: projectId,
      name: values.name,
      type: values.type || "",
      retryCount: Number(values.retryCount),
      channels: {
        email: values.channels.email || [],
        reportDelivery: values.channels.reportDelivery
          .filter((delivery) => delivery.type)
          .map((delivery) => ({
            type: delivery.type || "",
            spec:
              delivery.spec && (delivery.spec.chatId || delivery.spec.tokenId)
                ? {
                    tokenId: delivery?.spec?.tokenId || "",
                    chatId: delivery?.spec?.chatId || "",
                  }
                : null,
          })),
      },
      appSettings: {
        videoRecord: values.appSettings?.videoRecord || false,
        screeShotType: values.appSettings?.screeShotType || "FAILED",
        appActivity:
          values.type !== "WEB" && values.type !== "API"
            ? values.appSettings.appActivity
            : "",
        appPackage:
          values.type !== "WEB" && values.type !== "API"
            ? values.appSettings.appPackage
            : "",
      },
    };
  
    if (updatePayload.channels?.reportDelivery?.length === 0) {
      updatePayload.channels.reportDelivery = [{ type: "", spec: null }];
    }
  
    try {
      const response = await updateApplicationById({
        applicationId: appId,
        payload: updatePayload,
      }).unwrap();
  
      const updatedData = await refetchApplicationDetails().unwrap();
  
      unstable_batchedUpdates(() => {
        const updatedFileInfo = updatedData?.results?.appData?.apkFile || null;
        setLastSavedFile(updatedFileInfo);
        setApplicationDetails(updatedData?.results);
        setSavedDetails(updatedData?.results);
        setIsFileSaved(true);
      });
  
      formik.resetForm({ values: updatedData?.results });
  
      toast.success(
        response?.message || "Application Details updated successfully!"
      );
    } catch (error) {
      const message =
        error?.data?.details || "Error updating the application details";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: applicationDetails?.name || "",
      type: applicationDetails?.type || "",
      retryCount: applicationDetails?.retryCount || 0,
      channels: {
        email: applicationDetails?.channels?.email || [],

        reportDelivery:
          applicationDetails?.channels?.reportDelivery?.length > 0
            ? applicationDetails.channels.reportDelivery.map((delivery) => ({
                ...delivery,
                spec: delivery.spec || { tokenId: "", chatId: "" },
              }))
            : [{ type: "", spec: { tokenId: "", chatId: "" } }],
      },
      appData: {
        apkFile: applicationDetails?.appData?.apkFile || null,
      },
      appSettings: {
        videoRecord: applicationDetails?.appSettings?.videoRecord || false,
        screeShotType:
          applicationDetails?.appSettings?.screeShotType || "FAILED",
        appActivity: applicationDetails?.appSettings?.appActivity || "",
        appPackage: applicationDetails?.appSettings?.appPackage || "",
      },
    },

    validationSchema: Yup.object().shape({
      name: Yup.string()
        .required("Application name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .min(2, "Application name must be at least 2 characters.")
        .max(50, "Application name must be at most 50 characters.")
        .matches(
          /^[a-zA-Z0-9_.\- ]+$/,
          "Enter only letters, numbers, _, -, ., and spaces."
        ),
      type: Yup.string().required("Application type is required."),
      retryCount: Yup.number()
        .min(0, "Retry count must be non-negative.")
        .max(10, "Retry count must be less than 10"),

      channels: Yup.object().shape({
        email: Yup.array().of(Yup.string().email("Invalid email address")),
        reportDelivery: Yup.array().of(
          Yup.object().shape({
            type: Yup.string().nullable(),
            spec: Yup.object()
              .shape({
                chatId: Yup.string().when("type", {
                  is: (type) => type && type !== "",
                  then: (schema) =>
                    schema
                      .required("Chat ID is required.")
                      .max(200, "Chat ID must be at most 200 characters.")
                      .matches(/^(?!\s+$)/, "Spaces are not allowed.")
                      .test(
                        "no-emojis",
                        "Invalid Chat ID.",
                        (val) => !emojiRegex.test(val)
                      ),
                }),
                tokenId: Yup.string().when("type", {
                  is: (type) => type && type !== "",
                  then: (schema) =>
                    schema
                      .required("Token is required.")
                      .max(200, "Token must be at most 200 characters.")
                      .matches(/^(?!\s+$)/, "Spaces are not allowed.")
                      .test(
                        "no-emojis",
                        "Invalid Token.",
                        (val) => !emojiRegex.test(val)
                      ),
                }),
              })
              .nullable(false), // Ensure spec is never null
          })
        ),
      }),

      appSettings: Yup.object().shape({
        videoRecord: Yup.boolean(),
        screeShotType: Yup.string().oneOf(["FAILED", "ALL"]),
        appActivity: Yup.string().when("type", {
          is: (type) => ["ANDROID", "TV", "IOS"].includes(type),
          then: (schema) =>
            schema
              .required("Activity is required.")
              .max(200, "Activity must be at most 200 characters.")
              .matches(/^(?!\s+$)/, "Spaces are not allowed."),
          otherwise: () => Yup.string().notRequired(),
        }),

        appPackage: Yup.string().when("type", {
          is: (type) => ["ANDROID", "TV", "IOS"].includes(type),
          then: (schema) =>
            schema
              .max(200, "Package must be at most 200 characters.")
              .required("Package is required.")
              .matches(/^(?!\s+$)/, "Spaces are not allowed."),
          otherwise: () => Yup.string().notRequired(),
        }),
      }),
    }),
    onSubmit: handleUpdateConfiguration,
    onChange: () => {
      // setIsCurrentFormSaved(false);
    },
  });

  useEffect(() => {
    if (applicationDetails) {
      setEmails(applicationDetails.channels?.email || []);
      formik.setValues({
        projectId: applicationDetails.projectId || "",
        name: applicationDetails.name || "",
        type: applicationDetails.type || "",
        retryCount: applicationDetails.retryCount || 0,
        channels: {
          email: applicationDetails.channels?.email || [],
          reportDelivery: applicationDetails.channels?.reportDelivery?.map(
            (delivery) => ({
              type: delivery.type || "",
              spec: delivery.spec
                ? {
                    tokenId: delivery?.spec?.tokenId || "",
                    chatId: delivery?.spec?.chatId || "",
                  }
                : null,
            })
          ) || [{ type: "", spec: null }],
        },
        appData: {
          apkFile: applicationDetails.appData?.apkFile || null,
        },
        appSettings: {
          videoRecord: applicationDetails.appSettings?.videoRecord || false,
          screeShotType:
            applicationDetails.appSettings?.screeShotType || "FAILED",
          appActivity: applicationDetails.appSettings?.appActivity || "",
          appPackage: applicationDetails.appSettings?.appPackage || "",
        },
      });
      setSavedDetails(applicationDetails);
    }
  }, [applicationDetails, appId]);

  useEffect(() => {
    const validateFileType = () => {
      const existingFile = formik?.values?.appData.apkFile;
      const newType = formik?.values?.type;

      if (existingFile) {
        let fileExtension = "";
        if (typeof existingFile === "string") {
          fileExtension = existingFile?.split(".")?.pop()?.toLowerCase();
        } else if (existingFile instanceof File) {
          fileExtension = existingFile?.name?.split(".")?.pop().toLowerCase();
        }

        if (
          (newType === "ANDROID" || newType === "TV") &&
          fileExtension !== "apk"
        ) {
          setFileError(
            "Please upload an .apk file for Android/TV application."
          );
        } else if (newType === "IOS" && fileExtension !== "ipa") {
          setFileError("Please upload an .ipa file for iOS application.");
        } else if (newType === "WEB" || newType === "API") {
          setFileError("");
          formik.setFieldValue("appData.apkFile", ""); // Clear the file for WEB or API
        } else if (newType === "IOS" && fileExtension === "ipa") {
          setFileError("");
        } else {
          setFileError("");
        }
      } else {
        if (newType === "ANDROID" || newType === "TV" || newType === "IOS") {
          setFileError(
            `Please upload ${
              newType === "iOS" ? "an .ipa" : "an .apk"
            } file for ${newType} application.`
          );
        } else {
          setFileError("");
        }
      }
    };

    if (formik?.values?.type !== "WEB" && formik?.values?.type !== "API") {
      validateFileType();
    } else {
      setFileError("");
    }
  }, [formik?.values?.type, formik?.values?.appData.apkFile]);

  const isReportDeliveryValid = (delivery, index) => {
    if (index === 0 && !delivery.type) {
      return true;
    }
    // If type is specified, both chatId and tokenId should be non-empty
    if (delivery?.type) {
      return delivery?.spec?.chatId?.trim() && delivery?.spec?.tokenId?.trim();
    }

    // If no type is specified, it's considered invalid if it's not the first item
    return false;

  };

  const isFormChanged = useMemo(() => {
    if (!savedDetails || !formik.dirty) return false;
    const isMobileApp = ["ANDROID", "TV", "IOS"].includes(formik.values.type);

    const isReportDeliveryChanged =
      JSON.stringify(savedDetails?.channels?.reportDelivery) !=
      JSON.stringify(formik?.values?.channels?.reportDelivery);

    const isEmailsChanged =
      JSON.stringify(formik.values.channels.email) !==
      JSON.stringify(savedDetails.channels?.email || []);

    const isFileChanged =
      formik.values.appData.apkFile !== lastSavedFile || !isFileSaved;

    const isAppSpecificFieldsChanged =
      isMobileApp &&
      (formik.values.appSettings.appActivity !==
        savedDetails.appSettings?.appActivity ||
        formik.values.appSettings.appPackage !==
          savedDetails.appSettings?.appPackage ||
        isFileChanged);

    return (
      formik.values.name !== savedDetails.name ||
      formik.values.type !== savedDetails.type ||
      formik.values.retryCount !== savedDetails.retryCount ||
      formik.values.appSettings.screeShotType !==
        savedDetails.appSettings?.screeShotType ||
      formik.values.appSettings.videoRecord !==
        savedDetails.appSettings?.videoRecord ||
      isEmailsChanged ||
      isReportDeliveryChanged ||
      isAppSpecificFieldsChanged
    );
  }, [formik.values, savedDetails, lastSavedFile, isFileSaved, formik.dirty]);

  const handleScreenshotChange = (value) => {
    formik.setFieldValue("appSettings.screeShotType", value);
  };

  const handleVideoRecordingChange = (value) => {
    formik.setFieldValue("appSettings.videoRecord", value === "Yes");
  };

  const handleAddReportDelivery = () => {
    const reportDelivery = formik.values.channels.reportDelivery || [];
    
    // Remove validation check and always add new row
    const newReportDelivery = [
      ...reportDelivery,
      { type: "", spec: { tokenId: "", chatId: "" } }
    ];

    // Set new report delivery field value
    formik.setFieldValue("channels.reportDelivery", newReportDelivery);

    // Set fields of newly added row as untouched
    const newIndex = reportDelivery?.length;
    formik.setFieldTouched(`channels.reportDelivery[${newIndex}].type`, false);
    formik.setFieldTouched(`channels.reportDelivery[${newIndex}].spec.chatId`, false);
    formik.setFieldTouched(`channels.reportDelivery[${newIndex}].spec.tokenId`, false);
  };

  const handleFileStatusData = (data) => {
    setFileUploadedStatus(data);
    setUploadStatus(data === "uploaded" ? "complete" : "initial");
  };

  // const handleFileRemove = () => {
  //   // Implement the logic to remove the file from the server
  //   // You might want to make an API call here
  //   // After successful removal, update the state
  //   setApplicationDetails((prev) => ({ ...prev, apk_file: null }));
  //   toast.success("File removed successfully!");
  // };

  const handleDeleteReportDelivery = (index) => {
    const { reportDelivery } = formik.values.channels;

          // Create a new array that excludes the item at the specified index
          const newReportDelivery = reportDelivery?.filter((item, currentIndex) => {
            // Only keep items where the currentIndex does not match the index to be deleted
            return currentIndex !== index;
          });
    
          // Update Formik state with the modified array
          formik.setFieldValue("channels.reportDelivery", newReportDelivery);
    
          // Clear touched state for the deleted row to remove errors
          formik.setFieldTouched(
            `channels.reportDelivery[${index}].spec.chatId`,
            false
          );
          formik.setFieldTouched(
            `channels.reportDelivery[${index}].spec.tokenId`,
            false
          );
    
          // Optionally, clear errors for the deleted index if needed
          formik.setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`channels.reportDelivery[${index}].spec.chatId`];
            delete newErrors[`channels.reportDelivery[${index}].spec.tokenId`];
            return newErrors;
          });
  };

  const isAddButtonDisabled = () => {
    return formik.values.channels.reportDelivery?.some(
      (item) => !item?.spec?.chatId.trim() || !item?.spec?.tokenId.trim()
    );
 
  };
  const handleFieldChange = (field, value) => {
    formik.setFieldValue(field, value);
    if (field === "type") {
      setChangeType(value);
    }
  };

  const clearSelectionCallback = (index) => {
    formik.setFieldValue(`channels.reportDelivery[${index}].spec.chatId`, "");

    formik.setFieldValue(`channels.reportDelivery[${index}].spec.tokenId`, "");

    formik.setFieldTouched(
      `channels.reportDelivery[${index}].spec.chatId`,
      false
    );
    formik.setFieldTouched(
      `channels.reportDelivery[${index}].spec.tokenId`,
      false
    );
  };

  return (
    <div className="flex flex-grow mdMax:h-auto h-[calc(100vh-360px)] tableScroll pr-2">
      <>
        <div className="w-[100%]">
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-igy1 mb-2">
              Application Details
            </h3>
            <p className="text-sm text-igy5">
              Update your application information
            </p>
          </div>
          <div className="w-full border-t text-ibl7 my-8"></div>
          <div className="flex-grow">
            <form onSubmit={formik.handleSubmit} className="h-full pb-4">
              <div className="xl:flex flex-row justify-between">
                <div className="w-full xl:w-[45%]">
                  <h3 className="text-lg font-semibold text-igy1 mb-2">
                    Basic Information
                  </h3>
                  <p className="text-sm text-igy5">
                    Configure app details of your application.
                  </p>
                </div>
                <div className="w-full xl:w-[55%] lg:flex gap-8 mt-5 xl:mt-0">
                  <div className="flex-1 lgMax:w-full w-[50%]">
                    <InputField
                      isRequired={true}
                      label="Application Name"
                      inputClassName={`w-full h-[52px]`}
                      value={formik.values.name}
                      placeHolder="Enter Application Name"
                      placeHolderSize={false}
                      onChange={(e) =>
                        handleFieldChange("name", e.target.value)
                      }
                      {...formik.getFieldProps("name")}
                      isEditable={true}
                      showCharCount={false}
                      error={formik.touched.name && formik.errors.name}
                    />
                  </div>
                  <div className="flex-1 lgMax:w-full w-[50%] lgMax:mt-3">
                    <SelectDropdown
                      isEditable={false}
                      iconForApplication={true}
                      isRequired={true}
                      label="Application Type"
                      inputClassName="text-base"
                      id="type"
                      className={"h-[52px] w-full"}
                      placeHolderSize={true}
                      options={options}
                      value={
                        options.find(
                          (option) => option.type === formik.values.type
                        ) || null
                      }
                      placeHolder="Select Application"
                      onChange={(val) => {
                        handleFieldChange("type", val.type);
                        formik.setFieldTouched("type", true);

                        setAppChange(true);
                      }}
                      error={formik.touched.type && formik.errors.type}
                    />
                  </div>
                </div>
              </div>
              <div className="w-full border-t text-ibl7 my-8"></div>

              <div className="xl:flex flex-row justify-between items-start">
                <div className="w-full xl:w-[45%]">
                  <h3 className="text-lg font-semibold text-igy1 mb-2">
                    Test Configuration
                  </h3>
                  <p className="text-sm text-igy5 break-words">
                    Set preferences for screenshots and video capture.
                  </p>
                </div>

                <div className="w-full xl:w-[55%] mt-5 xl:mt-0">
                  <div className="flex flex-row items-start">
                    <div className="lg:flex flex-row justify-between gap-[45px]">
                      {/* Screenshot Section */}
                      <div className="flex items-center">
                        <span className="text-sm font-medium leading-5 text-igy1 gap-5">
                          Screenshot :
                        </span>
                        <span className="ml-2.5">
                          <RadioButtons
                            id="screenshot-all"
                            value="All"
                            className="text-sm font-normal leading-[22px] text-iblack"
                            onClick={() => handleScreenshotChange("ALL")}
                            checked={
                              formik.values?.appSettings?.screeShotType ===
                              "ALL"
                            }
                          />
                        </span>
                        <span className="ml-5">
                          <RadioButtons
                            id="screenshot-failed"
                            value="Failed"
                            className="text-sm font-normal leading-[22px] text-iblack"
                            onClick={() => handleScreenshotChange("FAILED")}
                            checked={
                              formik.values.appSettings.screeShotType ===
                              "FAILED"
                            }
                          />
                        </span>
                      </div>

                      {/* Video Recording Section */}
                      <div className="flex items-center lgMax:mt-3">
                        <span className="text-sm font-medium leading-5 text-igy1 md:gap-3">
                          Video Recording :
                        </span>
                        <span className="ml-2.5">
                          <RadioButtons
                            id="video-yes"
                            value="Yes"
                            className="text-sm font-normal leading-[22px] text-iblack"
                            onClick={() => handleVideoRecordingChange("Yes")}
                            checked={formik.values?.appSettings.videoRecord}
                          />
                        </span>
                        <span className="ml-5">
                          <RadioButtons
                            id="video-no"
                            value="No"
                            className="text-sm font-normal leading-[22px] text-iblack"
                            onClick={() => handleVideoRecordingChange("No")}
                            checked={!formik.values?.appSettings.videoRecord}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Retries Test Fail Section */}
                  <div className="mt-5 flex flex-row items-start gap-8">
                    <div className="w-[50%]">
                      <InputField
                        type="number"
                        showCharCount={false}
                        isRequired={false}
                        label="Retry Failed Test"
                        inputClassName="w-full h-[52px]"
                        value={formik.values.retryCount}
                        onChange={(e) =>
                          handleFieldChange("number", e.target.value)
                        }
                        max={10}
                        charLimit={10}
                        placeHolder={"Enter Retry Failed Test Count"}
                        placeHolderSize={false}
                        isEditable={true}
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
                        {...formik.getFieldProps("retryCount")}
                        error={
                          formik.touched.retryCount && formik.errors.retryCount
                        }
                      />
                    </div>
                    <div className="w-[50%]"></div>
                  </div>
                </div>
              </div>

              {formik?.values?.type !== "WEB" &&
                formik?.values?.type !== "RESTAPI" && (
                  <div>
                    <div className="w-full border-t text-ibl7 my-8"></div>
                    <div className="xl:flex flex-row">
                      <div className="w-full xl:w-[45%]">
                        <div className="text-lg font-semibold text-igy1 mb-2">
                          Upload Apps
                        </div>
                        <p className="text-sm text-igy5">
                          Upload APK/IPA files and define activity and package
                          details.
                        </p>
                      </div>
                      <div className="w-full xl:w-[55%] flex flex-col mt-5 xl:mt-0">
                        <div className="flex flex-row">
                          <FileUpload
                            isApk={formik.values.appData.apkFile}
                            applicationId={appId}
                            onFileUploadChange={(file, status) => {
                              handleFileUploadChange(file, status);
                              setIsFileSaved(false);
                            }}
                            onFileChange={handleFileChange}
                            applicationType={formik.values.type}
                            fileError={fileError}
                            sendFileUploadStatus={handleFileStatusData}
                            onBlur={() =>
                              formik.setFieldTouched("appData.apkFile", true)
                            }
                            initialFileInfo={formik.values.appData.apkFile}
                            appChange={changeType}
                            dataFile={applicationDetails?.appData?.apkFile}
                          />
                        </div>
                        <div className="flex flex-row pt-4 gap-8 mt-3">
                          <div className="w-[50%]">
                            <InputField
                              isRequired={true}
                              label="Package"
                              inputClassName={`h-[52px]`}
                              value={formik?.values?.appSettings?.appPackage}
                              onChange={(e) =>
                                handleFieldChange(
                                  "appSettings?.appPackage",
                                  e.target.value
                                )
                              }
                              placeHolder="Enter Package"
                              placeHolderSize={true}
                              {...formik.getFieldProps(
                                `appSettings.appPackage`
                              )}
                              error={
                                (formik.touched.appSettings?.appPackage &&
                                  formik.errors.appSettings?.appPackage) ||
                                (formik.touched.appSettings?.appPackage &&
                                  (!formik.values.appSettings.appPackage ||
                                    formik.values.appSettings.appPackage ===
                                      "") &&
                                  "Package is required.") ||
                                (formik.touched.appSettings?.appPackage &&
                                  formik.values.appSettings.appPackage?.length >
                                    200 &&
                                  "Package must be at most 200 characters.") ||
                                (formik.touched.appSettings?.appPackage &&
                                  formik.values.appSettings.appPackage?.startsWith(
                                    " "
                                  ) &&
                                  "No start spaces allowed.") ||
                                (formik.touched.appSettings?.appPackage &&
                                  formik.values.appSettings.appPackage?.endsWith(
                                    " "
                                  ) &&
                                  "No end spaces allowed.")
                              }
                            />
                          </div>
                          <div className="w-[50%]">
                            <InputField
                              isRequired={true}
                              label="Activity"
                              inputClassName={`h-[52px]`}
                              value={formik?.values?.appSettings?.appActivity}
                              onChange={(e) =>
                                handleFieldChange(
                                  "appSettings?.appActivity",
                                  e.target.value
                                )
                              }
                              placeHolder="Enter Activity"
                              placeHolderSize={true}
                              {...formik.getFieldProps(
                                `appSettings.appActivity`
                              )}
                              error={
                                (formik.touched.appSettings?.appActivity &&
                                  formik.errors.appSettings?.appActivity) ||
                                (formik.touched.appSettings?.appActivity &&
                                  (!formik.values.appSettings.appActivity ||
                                    formik.values.appSettings.appActivity ===
                                      "") &&
                                  "Activity is required.") ||
                                (formik.touched.appSettings?.appActivity &&
                                  formik.values.appSettings.appActivity
                                    ?.length > 200 &&
                                  "Activity must be at most 200 characters.") ||
                                (formik.touched.appSettings?.appActivity &&
                                  formik.values.appSettings.appActivity?.startsWith(
                                    " "
                                  ) &&
                                  "No start spaces allowed.") ||
                                (formik.touched.appSettings?.appActivity &&
                                  formik.values.appSettings.appActivity?.endsWith(
                                    " "
                                  ) &&
                                  "No end spaces allowed.")
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              <div className="w-full border-t text-ibl7 my-8"></div>
              <div className="xl:flex justify-between">
                <div className="w-full xl:w-[45%]">
                  <div className="text-lg font-semibold text-igy1 mb-2">
                    Report Delivery
                  </div>
                  <p className="text-sm text-igy5">
                    Configure Mail, Chat and Token-based Integrations.
                  </p>
                </div>
                <div className="w-full xl:w-[55%] mt-5 xl:mt-0">
                  <label
                    htmlFor="emailId"
                    className={`text-sm font-medium leading-6 ${
                      emails?.length > 0 ? "text-ibl1" : "text-iblack"
                    } ${focused ? "text-ibl1" : ""}`}
                  >
                    Email IDs
                  </label>
                  <ReactMultiEmail
                    placeholder="Enter Email IDs"
                    id="emailId"
                    className={`${
                      styles.emailScrollBar
                    } h-[132px] w-full flex-auto text-ibl1 rounded-lg mt-2 ${
                      styles.customPlaceHolder
                    } ${styles.reactMultiEmailBorder} ${
                      emails?.length > 0 ? styles.borderIbl1 : styles.borderIgy6
                    }`}
                    emails={emails}
                    onChange={(newEmails) => {
                      setEmails(newEmails);
                      formik.setFieldValue("channels.email", newEmails);
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    getLabel={(email, index, removeEmail) => (
                      <div
                        data-tag
                        key={index}
                        className={`${styles.userEmail} p-4`}
                      >
                        <div data-tag-item className="text-[16px] px-1 py-1">
                          {email}
                        </div>
                        <span
                          data-tag-handle
                          onClick={() => removeEmail(index)}
                        >
                          ×
                        </span>
                      </div>
                    )}
                  />
                  <div className="flex flex-col pt-4 gap-7 mt-3">
                    {formik.values?.channels?.reportDelivery?.map(
                      (delivery, index) => (
                        <div key={index} className="lg:flex gap-6 item w-full">
                          <div className="w-[33%] lgMax:w-full lgMax:mb-3">
                            <SelectDropdown
                              label="Channel Hub"
                              inputClassName="text-base"
                              id={`channels.reportDelivery.${index}.type`}
                              className={"h-[40px] w-full cursor-pointer"}
                              options={reportOptions}
                              value={
                                reportOptions.find(
                                  (option) =>
                                    option.type ===
                                    formik.values.channels.reportDelivery[index]
                                      ?.type
                                ) || null
                              }
                              placeHolder="Select"
                              placeHolderSize={true}
                              onChange={(selectedOption) => {
                                formik.setFieldValue(
                                  `channels.reportDelivery[${index}]`,
                                  {
                                    type: selectedOption
                                      ? selectedOption.type
                                      : "",
                                    spec: {
                                      tokenId:
                                        formik.values.channels.reportDelivery[
                                          index
                                        ]?.spec?.tokenId || "",
                                      chatId:
                                        formik.values.channels.reportDelivery[
                                          index
                                        ]?.spec?.chatId || "",
                                    },
                                  }
                                );
                              }}
                              removeContainer={true}
                              iconForApplication={true}
                              showCross={true}
                              error={
                                formik.touched.channels?.reportDelivery?.[index]
                                  ?.type &&
                                formik.errors.channels?.reportDelivery?.[index]
                                  ?.type
                              }
                              clearSelectionCallback={() =>
                                clearSelectionCallback(index)
                              }
                            />
                          </div>
                          <div className="w-[33%] lgMax:w-full lgMax:mb-3">
                            <InputField
                              label="Chat ID"
                              id={`channels.reportDelivery[${index}].spec.chatId`}
                              isEditable={true}
                              placeHolder="Enter Chat ID"
                              className="w-full h-10"
                              placeHolderSize={true}
                              disabled={!formik.values.channels.reportDelivery[index]?.type}
                              onChange={(e) => {
                                formik.setFieldValue(
                                  `channels.reportDelivery[${index}].spec.chatId`,
                                  e.target.value
                                );
                                formik.setFieldTouched(
                                  `channels.reportDelivery[${index}].spec.chatId`,
                                  true
                                );
                              }}
                              value={
                                formik.values.channels.reportDelivery[index]
                                  ?.spec?.chatId || ""
                              }
                              onBlur={() => {
                                formik.setFieldTouched(
                                  `channels.reportDelivery[${index}].spec.chatId`,
                                  true
                                );
                              }}
                              error={
                                formik.touched.channels?.reportDelivery?.[index]?.spec?.chatId &&
                                (
                                  (formik.errors.channels?.reportDelivery?.[index]?.spec?.chatId) ||
                                  (formik.values.channels?.reportDelivery?.[index]?.spec?.chatId?.length < 1 && "Chat ID is required.") ||
                                  (formik.values.channels?.reportDelivery?.[index]?.spec?.chatId?.length > 200 && "Chat ID must be at most 200 characters.") ||
                                  (/^(?!\s+$)/.test(formik.values.channels?.reportDelivery?.[index]?.spec?.chatId) === false && "Spaces are not allowed.") ||
                                  (emojiRegex.test(formik.values.channels?.reportDelivery?.[index]?.spec?.chatId) && "Invalid Chat ID. Emojis are not allowed.")
                                ) || null
                              }
                            />
                          </div>
                          <div className="w-[33%] lgMax:w-full">
                            <InputField
                              label="Token"
                              placeHolder="Enter Token"
                              id={`channels.reportDelivery[${index}].spec.tokenId`}
                              className="w-full h-10"
                              isEditable={true}
                              placeHolderSize={true}
                              disabled={!formik.values.channels.reportDelivery[index]
                                ?.type}
                              onChange={(e) => {
                                formik.setFieldValue(
                                  `channels.reportDelivery[${index}].spec.tokenId`,
                                  e.target.value
                                );
                                formik.setFieldTouched(
                                  `channels.reportDelivery[${index}].spec.tokenId`,
                                  true
                                );
                              }}
                              value={
                                formik.values.channels.reportDelivery[index]
                                  ?.spec?.tokenId || ""
                              }
                              onBlur={() => {
                                formik.setFieldTouched(
                                  `channels.reportDelivery[${index}].spec.tokenId`,
                                  true
                                );
                              }}
                              error={
                                formik.touched.channels?.reportDelivery?.[index]?.spec?.tokenId &&
                                (
                                  formik.errors.channels?.reportDelivery?.[index]?.spec?.tokenId ||
                                  (formik.values.channels?.reportDelivery?.[index]?.spec?.tokenId?.length < 1 && "Token ID is required.") ||
                                  (formik.values.channels?.reportDelivery?.[index]?.spec?.tokenId?.length > 200 && "Token ID must be at most 200 characters.") ||
                                  (/^(?!\s+$)/.test(formik.values.channels?.reportDelivery?.[index]?.spec?.tokenId) === false && "Spaces are not allowed.") ||
                                  (emojiRegex.test(formik.values.channels?.reportDelivery?.[index]?.spec?.tokenId) && "Invalid Token ID. Emojis are not allowed.")
                                ) || null
                              }
                            />
                          </div>
                           <img
                                src={deleteicon}
                                alt="delete icon"
                                className="pt-[30px] hover:cursor-pointer"
                                onClick={() =>
                                  handleDeleteReportDelivery(index)
                                }
                              />
                        </div>
                      )
                    )}
                    <div className="flex justify-end mt-6">
                      <CustomButton
                        onClick={handleAddReportDelivery}
                        label="Add Channel"
                        disable={isAddButtonDisabled()}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full border-t text-ibl7 my-8"></div>
              <div className="flex flex-row justify-end gap-6">
                <CustomButton
                  onClick={() => navigate("/setting/project-list")}
                  label="Cancel"
                  className="w-[162px] h-10 !text-ibl3 bg-iwhite border border-ibl1 hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1"
                />
                <CustomButton
                  className="font-medium leading-6"
                  label={isUpdating ? 'Saving...' : "Save"}
                  type="submit"
                  disable={
                    !isFormChanged ||
                    !formik.isValid ||
                    formik.values.channels.reportDelivery.some(
                      (delivery) => !isReportDeliveryValid(delivery)
                    ) ||
                    (["ANDROID", "TV", "IOS"].includes(formik.values.type) &&
                      (!formik.values.appSettings.appPackage ||
                        !formik.values.appSettings.appActivity ||
                        fileError)) ||
                    fileUploadedStatus === "preparing" ||
                    fileUploadedStatus === "uploading"
                  }
                />
              </div>
            </form>
          </div>
        </div>
      </>
    </div>
  );
}

export default Configuration;
