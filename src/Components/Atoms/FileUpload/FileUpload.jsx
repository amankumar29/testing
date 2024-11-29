import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useUploadFileChunkMutation } from "Services/API/apiHooks";
import { useRemoveAppFileMutation } from "Services/API/apiHooks";

const FileUpload = ({
  isApk,
  applicationId,
  onFileChange,
  applicationType,
  fileError,
  sendFileUploadStatus,
  initialFileInfo,
  appChange,
  dataFile,
}) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(isApk ? isApk : "");
  const [fileSize, setFileSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStage, setUploadStage] = useState(
    isApk ? "complete" : "initial"
  );
  const [uploadAppChunk] = useUploadFileChunkMutation();
  const [removeAppFile] = useRemoveAppFileMutation();

  const CHUNK_SIZE = 10 * 1024 * 1024;
  const UPLOAD_DELAY = 2000;

  let fileType;
  if (applicationType === "ANDROID") {
    fileType = ".apk";
  } else if (applicationType === "IOS") {
    fileType = ".ipa";
  } else if (applicationType === "TV") {
    fileType = ".apk";
  } else {
    fileType = ".apk,.ipa";
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile?.name);
      setFileSize(selectedFile?.size);
      setProgress(0);
      setUploadStage("preparing");
      onFileChange(selectedFile);
      sendFileUploadStatus("preparing");
      setTimeout(() => {
        setUploadStage("uploading");
        sendFileUploadStatus("uploading");
        setIsUploading(true);
      }, UPLOAD_DELAY);
    }
  };

  useEffect(() => {
    if (file && uploadStage === "uploading") {
      uploadInChunks(file);
    }
  }, [file, uploadStage]);

  useEffect(() => {
    if (initialFileInfo) {
      setFile(initialFileInfo); // Assuming initialFileInfo contains the file object.
      setFileName(initialFileInfo.name);
      setFileSize(initialFileInfo.size);
    }
  }, [initialFileInfo]);

  useEffect(() => {
    if (dataFile) {
      setUploadStage("complete"); // Set stage to complete if a file exists.
    }
  }, [dataFile]);

  const uploadInChunks = async (selectedFile) => {
    if (!selectedFile) return;
    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
    setIsUploading(true);
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
      const chunk = selectedFile.slice(start, end);

      try {
        await uploadChunk(chunk, chunkIndex, totalChunks);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error uploading chunks:", error);
        setIsUploading(false);
        setUploadStage("initial");
        onFileChange(null, "initial");
        return;
      }
    }
    setIsUploading(false);
    setUploadStage("complete");
    onFileChange(selectedFile, "complete");
    sendFileUploadStatus("complete");
  };

  const uploadChunk = useCallback(
    async (chunk, chunkIndex, totalChunks) => {
      if (!file) return;

      try {
        const res = await uploadAppChunk({
          appId: applicationId,
          chunk: chunk,
          appFile: fileName,
          totalChunks: totalChunks,
          currentChunk: chunkIndex + 1,
        }).unwrap();
        setProgress((prevProgress) => prevProgress + 100 / totalChunks);
        onFileChange(file, "uploading");
      } catch (error) {
        console.error("Error uploading chunk:", error);
        setIsUploading(false);
        setUploadStage("initial");
        onFileChange(null, "initial");
      }
    },
    [file, applicationId, onFileChange]
  );

  const removeFile = async () => {
    try {
      const res = await removeAppFile(applicationId).unwrap();
      const data = res?.message;
      setFile(null);
      setFileName("");
      setFileSize(0);
      setProgress(0);
      setIsUploading(false);
      setUploadStage("initial");
      onFileChange(null, "initial");
      toast.success(data || "File removed successfully");
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Error removing the file");
    }
  };
  const commonClasses =
    "border-2 border-dashed rounded-lg p-4 bg-[#E6EEFF] border-[#121F57] transition-colors duration-300 hover:bg-ibl7";

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { delay: 0.2, duration: 0.3 },
    },
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: (custom) => ({
      width: `${custom}%`,
      transition: { duration: 0.5, ease: "easeInOut" },
    }),
  };

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
    if (files && files?.length > 0) {
      handleFileChange({ target: { files } });
    }
  };

  function extractScreenshotFileName(filePath) {
    if (typeof filePath !== "string") {
      setFile(null);
      setFileName("");
      setFileSize(0);
      setProgress(0);
      setIsUploading(false);
      setUploadStage("initial");
      onFileChange(null);
      return "";
    }
    const parts = filePath?.split("/");
    const fileNameWithPrefix = parts?.pop();
    const underscoreIndex = fileNameWithPrefix?.indexOf("_");
    const fileName = fileNameWithPrefix?.substring(underscoreIndex + 1);
    return fileName;
  }

  useEffect(() => {
    if (
      (appChange === "ANDROID" ||
      appChange === "IOS" ||
      appChange === "RESTAPI" ||
      appChange === "TV") && isApk !== null
    ) {
      removeFile();
      setUploadStage("initial");
    }
  }, [appChange]);


  const renderContent = () => {
    switch (uploadStage) {
      case "initial":
        return (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`${commonClasses} text-center ${
              isDragging ? "bg-[#D6E2FF]" : ""
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              <motion.div
                variants={iconVariants}
                initial="initial"
                animate="animate"
                className="flex justify-center mt-2"
              >
                <svg
                  className="w-12 h-12 text-[#4F46E5]"
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
                <span className="text-ird3">*</span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="mt-3 text-base text-[#4B5563]"
              >
                <span className="font-medium text-[#4F46E5] hover:text-[#6366F1]">
                  Click to upload
                </span>{" "}
                or drag and drop
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-1 text-sm text-[#6B7280]"
              >
                APK, IPA up to 100MB
              </motion.p>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept={fileType}
              onChange={handleFileChange}
            />
          </motion.div>
        );
      case "preparing":
      case "uploading":
        return (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={commonClasses}
          >
            {file?.name && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-base font-medium text-[#121F57] truncate max-w-[calc(100%-2rem)]"
                  >
                    {file?.name}
                  </motion.span>
                </div>

                <div className="w-full bg-[#E5E7EB] rounded-full h-3 mb-3 overflow-hidden">
                  <motion.div
                    variants={progressVariants}
                    initial="initial"
                    animate="animate"
                    custom={progress}
                    className="bg-[#4F46E5] h-full rounded-full flex items-center justify-end"
                  >
                    <span className="mr-2 text-xs font-bold text-iwhite">
                      {progress?.toFixed(0)}%
                    </span>
                  </motion.div>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-start text-xs text-[#6B7280]"
                >
                  {(file?.size / (1024 * 1024))?.toFixed(2)} MB
                </motion.p>
              </>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-sm text-center font-semibold mt-2 ${
                isUploading ? "text-[#3B82F6]" : "text-[#10B981]"
              }`}
            >
              {isUploading ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Uploading...
                </motion.span>
              ) : (
                "Preparing upload..."
              )}
            </motion.p>
          </motion.div>
        );
      case "complete":
        return (
          <>
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={commonClasses}
            >
              <div className="relative">
                <div className="absolute top-0 right-0">
                  <div
                    className="flex justify-end items-start cursor-pointer text-[#EF4444] hover:text-[#B91C1C] focus:outline-none p-1 rounded-full hover:bg-red-100 transition-colors duration-300"
                    onClick={removeFile}
                  >
                    <span>x</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <div className="text-center">
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-12 h-12 mx-auto mb-3 text-ibl1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </motion.svg>
                  {fileName && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-base font-semibold text-[#121F57] truncate max-w-[400px]"
                    >
                      {extractScreenshotFileName(fileName)}
                    </motion.p>
                  )}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-[#10B981] mt-1"
                  >
                    {isApk ? "File uploaded" : "File uploaded successfully"}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full xl:w-[798px]">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      {fileError && (
        <p
          className="text-ird3 text-[10px] font-medium"
          data-testid="error_name"
        >
          {fileError}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
