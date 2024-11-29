import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import PendingIcon from "@mui/icons-material/Pending";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import edge from "Assets/Images/edge.svg";
import firefox from "Assets/Images/firefox.svg";
import chrome from "Assets/Images/google.svg";
import nullImage from "Assets/Images/nullImage.png";
import mobileIcon from "Assets/Images/runsMobileIcon.svg";
import safari from "Assets/Images/safari.svg";
import tvIcon from "Assets/Images/tv.svg";
import axios from "axios";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import { useOutsideClick } from "Hooks/useOutSideClick";
import { useContext, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";
import videoThumbnail from "../../../Assets/Images/default-video-thumbnail.jpg";
import { DrawerComponent } from "../../../Components/Atoms/DrawerComponent/DrawerComponent";
import { Modal } from "../../../Components/Atoms/Modal/Modal";
import TextLink from "../../../Components/Atoms/TextLink/TextLink";
import { calculateDuration } from "../../../Helpers/CalculateDuration/CalculateDuration";
import { downloadAssets, getStepsDetails } from "../../../Services/API/Run/Run";
import styles from "./TestCaseTestHealth.module.scss";
import { useParams } from "react-router-dom";
import CancelIcon from "@mui/icons-material/Cancel";
import { useSelector, useStore } from "react-redux";
import { WebsocketContext } from "Services/Socket/socketProvider";

const TestCaseTestHealth = ({ data = [], platform = "" }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [stepData, setStepData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssertionModal, setIsAssertionModal] = useState(false);
  const [assertionsList, setAssertionsList] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoDownload, setVideoDownload] = useState(null);
  const modalRef = useRef();
  const errorRef = useRef();
  const assetsURL = process.env.REACT_APP_ASSETS_URL;
  const { id } = useParams();
  const { defaultApplication } = useSelector((state) => state?.userDetails);
  const { socket } = useContext(WebsocketContext);
  const currentStore = useStore();
  const stepDataRef = useRef();
  useOutsideClick(modalRef, () => {
    if (isModalOpen) {
      setIsModalOpen(!isModalOpen);
      setOpenDrawer(!openDrawer);
    }
  });

  useOutsideClick(errorRef, () => {
    if (displayError) {
      setDisplayError(false);
    }
  });

  const handleDrawer = (item) => {
    const runId = id;
    const testCaseId = item?.testCaseId;
    getStepsDetails(runId, testCaseId)
      .then((res) => {
        const data = res?.data?.results;

        setStepData(data);
        setOpenDrawer(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleImageEnlarge = (image) => {
    setIsModalOpen(true);
    setModalData(image);
    setOpenDrawer(!openDrawer);
  };

  const onModalClose = () => {
    setOpenDrawer(!openDrawer);
    setIsModalOpen(false);
  };

  const handleVideo = (e, item) => {
    console.log("item: ", item);
    e.stopPropagation();
    setVideoModalOpen(true);
    setVideoDownload(item?.videoUrl);
    const videoUrl = item?.videoUrl ? `${assetsURL}${item?.videoUrl}` : null;
    setVideo(videoUrl);
  };

  const onVideoModalClose = () => {
    setVideoModalOpen(false);
  };

  const handleDownload = async () => {
    // const data = "/media/videos/30072024/1633_131.mp4";

    try {
      const token = localStorage.getItem("ilAuth");
      const response = await axios({
        url: `${process.env.REACT_APP_LOW_CODE_URL}/api/download${modalData}`,
        method: "GET",
        responseType: "blob", // Ensure that the response is treated as a blob
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Create a URL for the image blob
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers["content-type"] })
      );

      // Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "image.png"); // Set the filename for the downloaded image

      // Append the link to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while downloading the asset."
      );
    } finally {
      toast.success("Download complete!");
    }
  };

  const borderRadiusClasses = (index, length) => {
    if (length === 1) {
      // If there's only one item, apply rounded corners on all sides
      return "rounded-2xl";
    } else if (index === 0) {
      // If it's the first item and there are multiple items, apply top rounding
      return "rounded-t-2xl";
    } else if (index === length - 1) {
      // If it's the last item and there are multiple items, apply bottom rounding
      return "rounded-b-2xl";
    } else {
      // For all other items, no rounding
      return "";
    }
  };

  const handlePdf = (pdf) => {
    const url = `${assetsURL}${pdf}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleVideoDownload = () => {
    const path = videoDownload;
    downloadAssets(path).then((response) => {
      // Create a URL for the video blob
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers["content-type"] })
      );

      // Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "video.mp4"); // Set the filename for the downloaded image

      // Append the link to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    });
  };

  const getDevice = (item) => {
    if (item?.caseType === "WEB") {
      const browserType =
        item?.browser === "DEFAULT" ? item?.defaultBrowser : item?.browser;
      switch (browserType) {
        case "CHROME":
          return "Chrome";
        case "SAFARI":
          return "Safari";
        case "FIREFOX":
          return "Firefox";
        default:
          return "Edge";
      }
    }

    if (item?.platform !== "web") {
      return item?.device;
    }

    return null;
  };

  const getIconSrc = (item) => {
    if (item?.caseType === "WEB") {
      const browserType =
        item?.browser === "DEFAULT" ? item?.defaultBrowser : item?.browser;
      switch (browserType) {
        case "CHROME":
          return chrome;
        case "SAFARI":
          return safari;
        case "FIREFOX":
          return firefox;
        default:
          return edge;
      }
    }

    if (item?.platform === "android" || item?.platform === "iOS") {
      return mobileIcon;
    }

    if (item?.platform === "tv") {
      return tvIcon;
    }

    return null; // Fallback in case platform is undefined or another value
  };

  const handleTestcaseSocket = async (response) => {
    try {
      const { defaultApplication: currentProject } =
        currentStore?.getState()?.userDetails;
      if (
        currentProject?.id == response?.applicationId &&
        currentProject?.projectId === response?.projectId
      ) {
        if (response?.command == "testStepRun") {
          const { stepId, status, message, Run_Id } = response?.data;
          const updatedData = stepDataRef?.current?.map((item) => {
            if (item._id === Run_Id) {
              return {
                ...item,
                testSteps: item.testSteps.map((step) => {
                  if (step._id === stepId) {
                    return {
                      ...step,
                      executionStatus: status,
                      ...(message && { stepError: message }),
                    };
                  }
                  return step;
                }),
              };
            }
            return item;
          });
          setStepData(updatedData);
          stepDataRef.current = updatedData;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("onTestcasesResponse", handleTestcaseSocket);
      return () => {
        socket.off("onTestcasesResponse", handleTestcaseSocket);
      };
    }
  }, []);

  useEffect(() => {
    stepDataRef.current = stepData;
  }, [stepData, data]);

  return (
    <div className="overflow-x-auto">
      <div className="shadow-[0_0_4px_0_rgba(12,86,255,0.72)] rounded-2xl lgMax:min-w-[1000px]">
        {data?.map((item, index) => (
          <div key={index} onClick={() => handleDrawer(item)}>
            <div
              className={`flex h-16 items-center justify-between cursor-pointer group px-6 py-2 bg-iwhite hover:bg-ibl12  hover:transition-all hover:ease-in hover:duration-300 ${borderRadiusClasses(
                index,
                data.length
              )}`}
            >
              <div className="flex items-center gap-3 text-sm leading-5">
                <div>
                  {item?.executionStatus === "FAILED" ? (
                    <HighlightOffIcon fontSize="small" className="text-ird1" />
                  ) : item?.executionStatus === "PASSED" ? (
                    <CheckCircleIcon fontSize="small" className="text-ign1" />
                  ) : item?.executionStatus === "SKIPPED" ? (
                    <BlockIcon fontSize="small" className="text-[#1f2937]" />
                  ) : (
                    <PendingIcon fontSize="small" className="text-[#767676]" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{item?.testCaseName}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {defaultApplication?.type !== "RESTAPI" && (
                  <>
                    <div
                      className="w-10 text-igy5 hover:text-ibl1 hover:transition-all hover:duration-300 hover:ease-in "
                      onClick={(e) => handleVideo(e, item)}
                    >
                      <CustomTooltip
                        title="Video"
                        offset={[0, -8]}
                        height={"28px"}
                        fontSize="11px"
                      >
                        <VideocamOutlinedIcon fontSize="medium" />
                      </CustomTooltip>
                    </div>
                    <div className="flex items-center w-40 gap-3">
                      <img alt={""} src={getIconSrc(item)} />
                      <p>{getDevice(item)}</p>
                    </div>
                  </>
                )}
                <div className="flex items-center  gap-2 text-[#6b7280] w-32">
                  <AccessAlarmIcon fontSize="small" />
                  {calculateDuration(
                    item?.executionStartTime,
                    item?.executionEndTime
                  )}
                </div>

                <div>
                  <StatusBadge status={item?.executionStatus} />
                </div>
              </div>
            </div>
            {index < data.length - 1 && (
              <hr className="w-full text-[#D8E2F0]" />
            )}
          </div>
        ))}
      </div>
      <DrawerComponent
        show={openDrawer}
        className={`${
          platform === "android" || platform === "iOS"
            ? "-right-[825px] w-[825px]"
            : "-right-[1000px] w-full lg:w-[1000px]"
        }`}
        onClose={() => setOpenDrawer(!openDrawer)}
      >
        <div className="p-6">
          <div className="relative flex items-center justify-center text-lg font-bold">
            <p>Test Execution Results</p>
            <div className="absolute right-0 mb-1 cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
              <CloseIcon
                onClick={() => setOpenDrawer(!openDrawer)}
                data-testid="close_Icon"
              />
            </div>
          </div>

          <hr className="text-[#D8E2F0] rounded-[25%] mt-2" />
          <div className={`h-[91vh] ${styles.drawerScroll}`}>
            {defaultApplication?.type === "RESTAPI" ? (
              <>
                {stepData &&
                  stepData[0]?.testSteps?.map((item, index) => {
                    const assertions = item?.apiRequest?.assertions;
                    const totalAssertions = assertions?.length;
                    const passedAssertions = assertions?.filter(
                      (assertion) => assertion?.pass
                    )?.length;
                    const failedAssertions = totalAssertions - passedAssertions;

                    return (
                      <div
                        className="flex justify-between p-6 shadow-[0_1px_1px_0px_rgba(12,86,255,0.3)]"
                        key={item?._id}
                      >
                        <div className="flex w-full gap-4">
                          <div className="w-full">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium leading-5">
                                <span className="font-bold">{index + 1}.</span>{" "}
                                {item?.testStepName}
                              </p>
                            </div>
                            <p className="mt-2 text-sm font-bold md:flex text-cgy5">
                              Actual:{" "}
                              <span className="ml-1 font-medium ">
                                {item?.executionStatus === "FAILED"
                                  ? "Step failed to execute"
                                  : item?.executionStatus === "PASSED"
                                  ? "Step executed successfully"
                                  : item?.executionStatus === "SKIPPED"
                                  ? "Step execution is skipped"
                                  : "Step yet to execute"}
                              </span>
                            </p>
                            <p className="mt-2 text-sm font-bold md:flex text-cgy5">
                              Status:{" "}
                              <span
                                className={`ml-1 font-medium ${
                                  item?.executionStatus === "PASSED"
                                    ? "text-ign1"
                                    : item?.executionStatus === "FAILED"
                                    ? "text-ird1"
                                    : item?.executionStatus === "SKIPPED"
                                    ? "text-ior1"
                                    : ""
                                }`}
                              >
                                {item?.executionStatus}
                              </span>
                            </p>
                            {item?.executionStatus !== "SKIPPED" && (
                              <button
                                className={`${styles.assertionsCard} mt-5`}
                                onClick={() => {
                                  setIsAssertionModal(true);
                                  setAssertionsList(assertions);
                                }}
                              >
                                <h1 className="text-lg font-semibold text-center mb-3">
                                  Assertions Summary
                                </h1>
                                <h1 className="text-center mb-3">
                                  Total Assertions: {totalAssertions}
                                </h1>
                                <div className="flex items-center justify-center gap-5 mb-3">
                                  <h1 className="text-ign1 flex items-center">
                                    <CheckCircleIcon sx={{ mr: 0.5 }} />
                                    Passed Assertions: {passedAssertions}
                                  </h1>
                                  <h1 className="text-ird1 flex items-center">
                                    <CancelIcon sx={{ mr: 0.5 }} />
                                    Failed Assertions: {failedAssertions}
                                  </h1>
                                </div>
                                <AssertionsModal
                                  isOpen={isAssertionModal}
                                  setIsOpen={() => {
                                    setIsAssertionModal(false);
                                    setAssertionsList([]);
                                  }}
                                  assertions={assertionsList}
                                />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="mr-2 ml-8">
                          {item?.executionStatus === "FAILED" ? (
                            <HighlightOffIcon
                              fontSize="small"
                              className="text-ird1"
                            />
                          ) : item?.executionStatus === "PASSED" ? (
                            <CheckCircleIcon
                              fontSize="small"
                              className="text-ign1"
                            />
                          ) : item?.executionStatus === "SKIPPED" ? (
                            <BlockIcon
                              fontSize="small"
                              className="text-[#1f2937]"
                            />
                          ) : (
                            <PendingIcon
                              fontSize="small"
                              className="text-[#767676]"
                            />
                          )}
                        </p>
                      </div>
                    );
                  })}
              </>
            ) : (
              <>
                {stepData &&
                  stepData[0]?.testSteps?.map((item, index) => (
                    <div
                      className="flex justify-between p-6 shadow-[0_1px_1px_0px_rgba(12,86,255,0.3)]"
                      key={item?._id}
                    >
                      <div className="flex w-full gap-4">
                        <div
                          className={` ${
                            platform === "ANDROID" || platform === "IOS"
                              ? "w-[124px] h-full border border-solid border-ibl17 flex items-center"
                              : "w-[300px]"
                          }`}
                        >
                          <img
                            alt=""
                            src={
                              item?.stepImage
                                ? `${assetsURL}${item.stepImage}`
                                : nullImage
                            }
                            onClick={() => handleImageEnlarge(item?.stepImage)}
                            className={`${
                              item?.stepImage
                                ? "cursor-pointer"
                                : "pointer-events-none "
                            }`}
                          />
                        </div>
                        <div className="w-[600px]">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium leading-5">
                              <span className="font-bold">{index + 1}.</span>{" "}
                              {item?.testStepName}
                            </p>
                            {item?.stepPdf && (
                              <p>
                                <TextLink
                                  label={"View PDF"}
                                  className={`text-sm`}
                                  onClick={() => handlePdf(item?.stepPdf)}
                                />
                              </p>
                            )}
                          </div>
                          {item?.webData?.inputData && (
                            <p className="mt-2 text-sm font-bold md:flex text-cgy5">
                              Expected:{" "}
                              <span className="ml-1 font-medium break-all">
                                {item?.webData?.action?.keyword_name} :{" "}
                                {item?.webData?.inputData}
                              </span>
                            </p>
                          )}
                          <p className="mt-2 text-sm font-bold md:flex text-cgy5">
                            Actual:{" "}
                            <span className="ml-1 font-medium ">
                              {item?.executionStatus === "FAILED"
                                ? "Step failed to execute"
                                : item?.executionStatus === "PASSED"
                                ? "Step executed successfully"
                                : "Step yet to execute"}
                            </span>
                          </p>
                          <p className="mt-2 text-sm font-bold md:flex text-cgy5">
                            Action:{" "}
                            <span className="ml-1 font-medium ">
                              {item?.webData?.action?.keyword_name}
                            </span>
                          </p>
                          {item?.webData?.locateElement && (
                            <p className="mt-2 text-sm font-bold md:flex text-cgy5">
                              <span className="w-[121px]">
                                Locate Element:{" "}
                              </span>
                              <span className="ml-1 font-medium capitalize w-[72%] break-all">
                                {item?.webData?.locateElement?.name} :{" "}
                                {item?.webData?.locateElement?.value}
                              </span>
                            </p> 
                          )}
                          {item?.webData?.executeSqlQuery && (
                            <p className="mt-2 text-sm font-bold md:flex text-cgy5">
                              <span className="w-[80px]">SQL Query:</span>
                              <span className="ml-1 font-medium capitalize w-[72%] break-all">
                                {item?.webData?.executeSqlQuery}
                              </span>
                            </p>
                          )}
                          {item?.webData?.inputData && (
                            <p className="mt-2 text-sm font-bold md:flex text-cgy5">
                              Value:{" "}
                              <span className="ml-1 font-medium break-all">
                                {item?.webData?.inputData}
                              </span>
                            </p>
                          )}
                          {item?.stepError &&
                            item?.executionStatus === "FAILED" && (
                              <p className="mt-2 text-sm font-bold md:flex text-ird1">
                                Error:{" "}
                                <span className="ml-1 font-medium break-all">
                                  {item?.stepError}
                                </span>
                              </p>
                            )}
                        </div>
                      </div>

                      <p className="mr-2">
                        {item?.executionStatus === "FAILED" ? (
                          <HighlightOffIcon
                            fontSize="small"
                            className="text-ird1"
                          />
                        ) : item?.executionStatus === "PASSED" ? (
                          <CheckCircleIcon
                            fontSize="small"
                            className="text-ign1"
                          />
                        ) : item?.executionStatus === "SKIPPED" ? (
                          <BlockIcon
                            fontSize="small"
                            className="text-[#1f2937]"
                          />
                        ) : (
                          <PendingIcon
                            fontSize="small"
                            className="text-[#767676]"
                          />
                        )}
                      </p>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </DrawerComponent>
      <Modal
        isOpen={isModalOpen}
        onClose={onModalClose}
        className={`px-6 pb-6 pt-2 ${
          platform === "android" || platform === "iOS"
            ? ""
            : "xl:max-w-5xl w-[50%]"
        }`}
      >
        <div
          className={`${
            (platform === "android" || platform === "iOS") && "w-[300px]"
          }`}
        >
          <div className="flex justify-end mb-2 ">
            <div className="mr-4 cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
              <DownloadRoundedIcon onClick={handleDownload} />
            </div>
            <div className="cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
              <CloseIcon onClick={onModalClose} data-testid="close_Icon" />
            </div>
          </div>
          <img
            src={`${assetsURL}${modalData}`}
            alt=""
            onClick={() => setIsModalOpen(false)}
            style={{ width: "100%" }}
          />
        </div>
      </Modal>
      <Modal
        isOpen={videoModalOpen}
        onClose={onVideoModalClose}
        className={`px-6 pb-6 pt-2`}
      >
        <div>
          <div className="flex justify-end mb-2 ">
            <div className="mr-4 cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
              {video && <DownloadRoundedIcon onClick={handleVideoDownload} />}
            </div>
            <div className="cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
              <CloseIcon onClick={onVideoModalClose} data-testid="close_Icon" />
            </div>
          </div>
          {video ? (
            <ReactPlayer url={video} playing={true} controls />
          ) : (
            <img src={videoThumbnail} alt="" />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TestCaseTestHealth;

// dummy data

const StatusBadge = ({ status }) => {
  let bgColor, textColor;

  switch (status) {
    case "IN_PROGRESS":
      bgColor = "bg-ior2";
      textColor = "text-iro4";
      break;
    case "FAILED":
      bgColor = "bg-ird5";
      textColor = "text-ird3";
      break;
    case "PASSED":
      bgColor = "bg-ign5";
      textColor = "text-ign1";
      break;
    case "QUEUED":
      bgColor = "bg-[#e4d9f7]";
      textColor = "text-[#8A2BE2]";
      break;
    default:
      return null;
  }

  return (
    <div className="flex items-center justify-center cursor-default">
      <div
        className={`w-[120px] h-[30px] ${bgColor} ${textColor} text-[14px] font-medium flex justify-center items-center rounded-[4px]`}
      >
        {status === "IN_PROGRESS" ? status.replace(/_/g, " ") : status}
      </div>
    </div>
  );
};

const AssertionCard = ({ assertion }) => (
  <div
    className={`${styles.cardAssertion} ${
      assertion.pass ? styles.pass : styles.fail
    }`}
  >
    <div className="flex justify-between items-center mb-3">
      <span className="text-lg">
        <span className="font-semibold">Assertion Name: </span>
        {assertion.assertionName}
      </span>
      <span
        className={`px-3 rounded-md py-1 text-xs font-medium ${
          assertion.pass ? "bg-[#D1F1E4] text-[#089E61]" : "bg-ird5 text-ird3"
        }`}
      >
        {assertion.pass ? "PASSED" : "FAILED"}
      </span>
    </div>
    <div className="text-left mb-3">
      <span className="font-semibold">Expected Value: </span>
      {assertion.expectedValue ? (
        <pre className="break-all whitespace-pre-wrap">
          {JSON.stringify(assertion.expectedValue, null, 2)}
        </pre>
      ) : (
        "No value set"
      )}
    </div>
    {assertion.type !== "exists" && (
      <>
        {
          <div className="break-all text-left mb-3">
            <span className="font-semibold">Actual Value: </span>
            {assertion?.actualValue ? (
              <pre className="break-all whitespace-pre-wrap">
                {JSON.stringify(assertion.actualValue, null, 2)}
              </pre>
            ) : (
              "No value set"
            )}
          </div>
        }
      </>
    )}
    <h1 className="mb-1 text-left">
      <span className="font-semibold">Error: </span>
      {assertion.pass && "NA"}
    </h1>
    {!assertion.pass && (
      <div className="mt-2 p-2 bg-[#FEF2F2] border border-[#FECACA] text-[#C71A25] rounded text-xs">
        <p className="break-all">{assertion?.reason}</p>
      </div>
    )}
  </div>
);

export const AssertionsModal = ({ isOpen, setIsOpen, assertions = [] }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={setIsOpen}
      className="w-[700px] p-4"
      modalClassName="!bg-[#00000020]"
    >
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Assertions</h1>
        <div className="cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
          <CloseIcon onClick={setIsOpen} data-testid="close_Icon" />
        </div>
      </div>
      <div
        className={`flex flex-col gap-4 max-h-[500px] p-4 ${styles.drawerScroll}`}
      >
        {assertions?.map((item) => (
          <AssertionCard assertion={item} />
        ))}
      </div>
    </Modal>
  );
};