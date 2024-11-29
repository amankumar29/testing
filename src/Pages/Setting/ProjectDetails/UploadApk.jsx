import React, { useState, useEffect, useCallback } from "react";
import InputField from "../../../Components/Atoms/InputField/InputField";
import { CustomButton } from "../../../Components/Atoms/CustomButton/CustomButton";
import androidIcon from "../../../Assets/Images/androidicon.svg";
import * as Yup from "yup";
import { useFormik } from "formik";
import { removeApp, uploadApp } from "Services/API/Setting/Project";
import axios from "axios";

const UploadApk = () => {
  const formik = useFormik({
    initialValues: {
      package: "",
      activity: "",
    },
    validateSchema: Yup.object().shape({
      package: Yup.string()
        .required("Package is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed."),
      activity: Yup.string()
        .required("Activity is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed."),
    }),
    onSubmit: (values) => {
      handleSave(values);
    },
  });

  function handleSave(values) {
    console.log(values);
  }

  return (
    <div className="w-full mx-auto bg-white p-8">
      <div className="grid grid-cols-12 gap-12">
        {/* Upload Component Section */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <h3 className="mb-4 text-lg font-semibold text-igy1">Upload File</h3>
          <FileUpload />
        </div>

        {/* Text Fields Section */}
        <div className="col-span-12 md:col-span-6 lg:col-span-8 ml-[280px]">
          <h3 className="mb-4 text-lg font-semibold text-igy1">
            Additional Information
          </h3>
          <div className="space-y-6">
            <InputField
              isRequired={true}
              label="Package"
              inputClassName={`!w-[352px] h-[52px]`}
              onChange={formik.handleChange}
              value={formik?.values?.package}
              placeHolder="Enter Package"
              placeHolderSize={true}
              {...formik.getFieldProps(`package`)}
              onBlur={() => formik.handleChange}
              error={
                formik.touched.package && formik.errors.package
                  ? formik.errors.package
                  : ""
              }
            />
            <InputField
              isRequired={true}
              label="Activity"
              inputClassName={`!w-[352px] h-[52px]`}
              value={formik?.values?.activity}
              placeHolder="Enter Activity"
              placeHolderSize={true}
              {...formik.getFieldProps(`activity`)}
              onBlur={() => formik.setFieldTouched(`activity`, true)}
              error={formik.touched.activity && formik.errors.activity}
            />
          </div>
          <CustomButton
            className="mt-12 font-medium leading-6"
            label="Save"
            onClick={() => console.log("downloaded file")}
          />
        </div>
      </div>
    </div>
  );
};

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProgress(0);
      setIsUploading(true);
    }
  };

  useEffect(() => {
    if (file && isUploading) {
      uploadInChunks(file);
    }
  }, [file, isUploading]);

  const applicationId = 5;

  const uploadInChunks = async (selectedFile) => {
    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
      const chunk = selectedFile.slice(start, end);

      await uploadChunk(chunk, chunkIndex, totalChunks);
    }
    setIsUploading(false);
  };

  const uploadChunk = useCallback(
    async (chunk, chunkIndex, totalChunks) => {
      if (!file) return;

      const formData = new FormData();
      formData.append("app_file", chunk, file.name);
      formData.append("current_chunk", chunkIndex + 1);
      formData.append("total_chunks", totalChunks);

      try {
        const res = await uploadApp(applicationId, formData);
        console.log(res);
        setProgress((prevProgress) => prevProgress + 100 / totalChunks);
      } catch (error) {
        console.error("Error uploading chunk:", error);
        setIsUploading(false);
      }
    },
    [file]
  );

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange({ target: { files } });
    }
  };

  const removeFile = () => {
    removeApp(applicationId)
      .then((res) => {
        const data = res?.data?.results;
        console.log(data);
        setFile(null);
        setProgress(0);
        setIsUploading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="w-[650px] mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center border-[#121F57] bg-[#E6EEFF] ${
          isDragging ? "bg-[#D6E2FF]" : ""
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <div className="text-center">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex justify-center mt-2">
                <svg
                  className="w-12 h-12 text-[#9CA3AF]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
              </div>
              <p className="mt-2 text-sm text-[#4B5563]">
                <span className="font-medium text-[#4F46E5] hover:text-[#6366F1]">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">
                APK, IPA up to 100MB
              </p>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[calc(100%-2rem)]">
                {file.name}
              </span>
              <button
                onClick={removeFile}
                className="text-[#EF4444] hover:text-[#B91C1C]"
              >
                x
              </button>
            </div>

            <div className="w-full bg-[#E5E7EB] rounded-full h-3.5 mb-2 overflow-hidden">
              <div
                className="bg-[#1E40AF] h-3.5 rounded-full transition-all duration-500 ease-out flex items-center justify-end whitespace-nowrap"
                style={{ width: `${progress}%` }}
              >
                <span className="text-xs font-bold text-[#ffff] mr-2">
                  {progress.toFixed(0)}%
                </span>
              </div>
            </div>
            <p className="flex justify-start text-xs text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <p
              className={`text-sm text-center font-semibold ${
                isUploading ? "text-[#3B82F6]" : "text-[#10B981]"
              }`}
            >
              {isUploading ? (
                <>
                  <span className="mr-2">Uploading...</span>
                  <svg
                    className="inline-block w-5 h-5 text-blue-500 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="none"
                      d="M4 12a8 8 0 0 1 8-8V4a12 12 0 0 0 0 24v-4a8 8 0 0 1-8-8z"
                    ></path>
                  </svg>
                </>
              ) : (
                "Upload complete!"
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadApk;
