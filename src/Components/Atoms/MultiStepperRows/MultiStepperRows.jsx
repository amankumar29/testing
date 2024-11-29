import React, { useRef, useEffect, useState, useCallback } from "react";
import InputField from "../InputField/InputField";
import deleteicon from "Assets/Images/delete.svg";
import { Checkbox } from "../Checkbox/Checkbox";
import styles from "./MultiStepperRows.module.scss";
import SelectDropdown from "../SelectDropdown/SelectDropdown";
import { CustomButton } from "../CustomButton/CustomButton";
import { useFormik } from "formik";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useUploadFileChunkMutation } from "Services/API/apiHooks";
import { useSelector } from "react-redux";

export const MultiStepperRows = ({
  label,
  params,
  setParams = () => {},
  paramCount,
  setParamCount = () => {},
  headerStep,
  setHeaderStep = () => {},
  onParamsChange = () => {},
  selectedOptionValue = () => {},
}) => {
  const fileInputRef = useRef({});
  const [uploadAppChunk] = useUploadFileChunkMutation();
  const { defaultApplication } = useSelector((state) => state?.userDetails);
  const [isUploading, setIsUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);

  const options = [
    { id: 1, name: "Text", value: "TEXT" },
    { id: 2, name: "File", value: "FILE" },
  ];

  const formik = useFormik({
    initialValues: {
      params: params,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const handleInputChange = (id, field, value) => {
    const updatedParams = params?.map((param) =>
      param?.id === id
        ? {
            ...param,
            [field]: value,
            isChecked: field === "key" ? !!value : param?.isChecked,
          }
        : param
    );

    if (
      field === "key" &&
      value !== "" &&
      id === formik?.values?.params[formik?.values?.params?.length - 1]?.id
    ) {
      updatedParams.push({
        id: formik?.values?.params?.length + 1,
        key: "",
        value: "",
        description: "",
        isChecked: false,
        filePath: null,
        fileName: null,
        type: options[0], // Set default selected option as "Text"
      });
    }
    // formik.setFieldValue("params", updatedParams);
    setParams(updatedParams);
    setParamCount(updatedParams.length + 2);
  };

  const handleRemoveParam = (id) => {
    if (params?.length > 1) {
      const updatedParams = params?.filter((param) => param?.id !== id);
      for (let i = id; i <= updatedParams?.length; i++) {
        updatedParams[i - 1].id--;
      }
      setParams(updatedParams);
      setParamCount(paramCount - 1);
    }
  };

  const handleCheckBox = (id) => {
    const updatedParams = formik.values.params?.map((param) =>
      param?.id === id ? { ...param, isChecked: !param?.isChecked } : param
    );
    // formik.setFieldValue("params", updatedParams);
    setParams(updatedParams);
  };

  const handleOptionClick = (id, option) => {
    const updatedParams = params?.map((param) =>
      param?.id === id ? { ...param, type: option } : param
    );
    setParams(updatedParams);
    selectedOptionValue(option);

    if (option?.name === "File") {
      // Clear text-specific fields when switching to "File" mode
      const updatedParamsForFile = updatedParams?.map((param) =>
        param?.id === id
          ? {
              ...param,
              key: "",
              value: "",
              description: "",
              filePath: param?.filePath || null,
              fileName: param?.fileName || null,
            }
          : param
      );
      setParams(updatedParamsForFile);
    } else if (option?.name === "Text") {
      // Clear file-specific fields when switching to "Text" mode
      const updatedParamsForText = updatedParams?.map((param) =>
        param?.id === id
          ? {
              ...param,
              key: "",
              filePath: null,
              fileName: null,
              description: "",
            }
          : param
      );
      setParams(updatedParamsForText);
    }
  };

  // Function to trigger file input
  const handleFileUploadClick = (id) => {
    if (fileInputRef.current[id]) {
      fileInputRef.current[id].click();
    }
  };

  const uploadChunk = useCallback(
    async (chunk, chunkIndex, totalChunks, selectedFile) => {
      if (!selectedFile) return {};

      try {
        const res = await uploadAppChunk({
          appId: defaultApplication?.id,
          chunk: chunk,
          appFile: selectedFile.name,
          totalChunks: totalChunks,
          currentChunk: chunkIndex + 1,
          isFormData: true,
        }).unwrap();
        return res;
      } catch (error) {
        console.error("Error uploading chunk:", error);
        setIsUploading(false);
        return {};
      }
    },
    []
  );

  const uploadInChunks = async (selectedFile) => {
    let apiResponse = {};
    if (!selectedFile) return apiResponse;

    const CHUNK_SIZE = 10 * 1024 * 1024;
    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
    // setIsUploading(true);
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
      const chunk = selectedFile.slice(start, end);

      try {
        const res = await uploadChunk(
          chunk,
          chunkIndex,
          totalChunks,
          selectedFile
        );
        apiResponse = res;
      } catch (error) {
        console.error("Error uploading chunks:", error);
        setIsUploading(false);
        return {};
      }
    }
    return apiResponse;
  };

  // Function to handle file input change
  const handleFileChange = async (id, event) => {
    const file = event?.target?.files[0];
    setCurrentIndex(id);
    if (file) {
      setIsUploading(true);
      const fileData = await uploadInChunks(file);
      const updatedParams = params.map((param) =>
        param.id === id
          ? {
              ...param,
              filePath: fileData ? fileData?.results?.pathToDBFormData : null,
              fileName: fileData ? fileData?.results?.fileName : null,
            }
          : param
      );
      setIsUploading(false);
      setParams(updatedParams);
    }
  };

  useEffect(() => {
    if (params && formik.values.params !== params) {
      onParamsChange(params);
      formik.setFieldValue("params", params);
    }
  }, [params, onParamsChange, formik]);

  const truncate = (str, maxLength) => {
    if (!str) return ""; // If no string, return empty
    return str?.length > maxLength ? str?.substring(0, maxLength) + "..." : str;
  };

  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = () => {
    setIsVisible((prev) => !prev);
  };

  const rows = [
    {
      id: 1,
      checkboxChecked: true,
      placeholders: ["Host", "<Calculated when request is sent>", ""],
    },
    {
      id: 2,
      checkboxChecked: true,
      placeholders: ["User Agent", "PostmanRuntime/7.42.0", ""],
    },
    {
      id: 3,
      checkboxChecked: true,
      placeholders: ["Accept", "*/*", ""],
    },
  ];

  return (
    <div className={`${label === "form-data" ? "" : ""}`}>
      <div className={`overflow-y-auto  ${styles.scroll}`}>
        {headerStep && (
          <div className="px-1">
            <p>
              <button
                className="cursor-pointer flex items-center font-medium transition-all ease bg-ibl21 hover:bg-ibl29 py-2 px-3 rounded-[8px] text-sm"
                onClick={handleToggle}
              >
                {isVisible ? (
                  <span>
                    <RemoveRedEyeOutlinedIcon className="mr-1 w-[25px]" /> Hide
                    Auto Generated Headers
                  </span>
                ) : (
                  <span>
                    <VisibilityOffOutlinedIcon className="mr-1 w-[25px]" /> Show
                    Auto Generated Headers
                  </span>
                )}
              </button>
            </p>
            {isVisible && (
              <div>
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="flex justify-center items-center  bg-iwhite p-2 rounded-lg shadow mt-3"
                  >
                    <div>
                      <Checkbox
                        data-testid=""
                        id={`checkbox_${row.id}`}
                        isHeaderCheck={true}
                        checked={row.checkboxChecked}
                        className="relative ml-6 cursor-no-drop"
                      />
                    </div>
                    <div className="flex justify-center items-center gap-5 ml-4 mr-2 mb-[7px]">
                      {row.placeholders.map((placeHolder, index) => (
                        <input
                          key={index}
                          value=""
                          placeholder={placeHolder}
                          disabled
                          className="border flex border-solid rounded-lg px-4 mt-2 focus:outline-none font-normal text-sm leading-7 placeholder:text-igy5 text-ibl1 border-igy6  w-[280px] h-[40px] cursor-no-drop"
                        />
                      ))}
                    </div>
                    <div className="min-w-[24px]"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="space-y-3 px-1 mt-2">
          {params?.map((param, index) => (
            <div
              key={param?.id}
              className={`flex justify-center items-center request-model-box ${
                label === "form-data" ? "" : " bg-iwhite p-2 rounded-lg shadow"
              }`}
            >
              {label === "form-data" ? (
                <div>
                  <SelectDropdown
                    inputClassName="text-sm"
                    className={
                      "h-[40px] !w-[100px] hover: cursor-pointer search-mt-0"
                    }
                    options={options}
                    onChange={(option) => handleOptionClick(param?.id, option)}
                    value={param?.type || { id: 1, name: "Text" }} // Use the row-specific selected option
                    removeContainer={true}
                    formDataOption={true}
                  />
                </div>
              ) : (
                <div className="">
                  <Checkbox
                    data-testid={`checkbox_value_${param?.id}`}
                    id={`checkbox_${param?.id}`}
                    isHeaderCheck={true}
                    checked={param?.isChecked}
                    onChange={() => handleCheckBox(param?.id)}
                    className="cursor-pointer relative ml-6 "
                  />
                </div>
              )}
              <div className="flex justify-center items-center gap-5 ml-4 mr-2 mb-[7px]">
                <InputField
                  placeHolder="Enter Key"
                  placeHolderSize={true}
                  inputClassName={`${
                    label === "form-data" ? "w-[265px]" : "w-[280px]"
                  } h-[40px]`}
                  value={param?.key}
                  onChange={(e) =>
                    handleInputChange(param?.id, "key", e?.target?.value)
                  }
                />
                {param?.type?.name === "File" ? (
                  <div className="pt-[6px]">
                    <CustomButton
                      label={
                        isUploading && currentIndex == param?.id
                          ? "Uploading..."
                          : param?.fileName
                          ? truncate(param?.fileName, 32)
                          : "+ New file from local machine"
                      }
                      className="flex flex-col !w-[265px] !h-[40px] bg-ibl12 border border-dashed border-ibl19 !text-igy16 text-xs hover:!text-iwhite"
                      onClick={() => handleFileUploadClick(param?.id)}
                    />
                    <input
                      ref={(ref) => (fileInputRef.current[param?.id] = ref)}
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(param?.id, e)}
                    />
                  </div>
                ) : (
                  <InputField
                    placeHolder="Enter Value"
                    placeHolderSize={true}
                    inputClassName={`${
                      label === "form-data" ? "w-[265px]" : "w-[280px]"
                    } h-[40px]`}
                    value={param?.value}
                    onChange={(e) =>
                      handleInputChange(param?.id, "value", e?.target?.value)
                    }
                  />
                )}
                <InputField
                  placeHolder="Enter Description"
                  placeHolderSize={true}
                  inputClassName={`${
                    label === "form-data" ? "w-[265px]" : "w-[280px]"
                  } h-[40px]`}
                  value={param?.description}
                  onChange={(e) =>
                    handleInputChange(
                      param?.id,
                      "description",
                      e?.target?.value
                    )
                  }
                />
              </div>
              <button
                onClick={() => handleRemoveParam(param?.id)}
                className="w-6 h-6 flex items-center justify-center min-w-[18px]"
              >
                <img
                  src={deleteicon}
                  alt="delete icon"
                  className={`${
                    index === formik?.values?.params?.length - 1
                      ? "opacity-50"
                      : ""
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
