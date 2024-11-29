import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PendingIcon from "@mui/icons-material/Pending";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import edge from "Assets/Images/edge.svg";
import firefox from "Assets/Images/firefox.svg";
import chrome from "Assets/Images/google.svg";
import nullImage from "Assets/Images/nullImage.png";
import safari from "Assets/Images/safari.svg";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import { useOutsideClick } from "Hooks/useOutSideClick";
import { useRef, useState } from "react";
import ReactPlayer from "react-player";
import videoThumbnail from "../../../Assets/Images/default-video-thumbnail.jpg";
import { DrawerComponent } from "../../../Components/Atoms/DrawerComponent/DrawerComponent";
import { Modal } from "../../../Components/Atoms/Modal/Modal";
import { calculateDuration } from "../../../Helpers/CalculateDuration/CalculateDuration";
import CloseIcon from "@mui/icons-material/Close";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import styles from "./TestPlanHealth.module.scss";
import { toast } from "react-toastify";
import axios from "axios";
import TextLink from "../../../Components/Atoms/TextLink/TextLink";
import { StatusBadge } from "../TestSuiteHealth/TestSuiteHealth";
import { downloadAssets, getStepsDetails } from "../../../Services/API/Run/Run";
import mobileIcon from "Assets/Images/runsMobileIcon.svg";
import tvIcon from "Assets/Images/tv.svg";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import CancelIcon from "@mui/icons-material/Cancel";
import { AssertionsModal } from "../TestCaseTestHealth/TestCaseTestHealth";

const TestPlanHealth = ({ data = [] }) => {
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [stepData, setStepData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayError, setDisplayError] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [videoDownload, setVideoDownload] = useState(null);
  const [video, setVideo] = useState(null);
  const [platform, setPlatform] = useState(null);
  const modalRef = useRef();
  const errorRef = useRef();
  const assetsURL = process.env.REACT_APP_ASSETS_URL;
  const { defaultApplication } = useSelector((state) => state?.userDetails);
  const [isAssertionModal, setIsAssertionModal] = useState(false);
  const [assertionsList, setAssertionsList] = useState([]);

  const handleAccordion = (index) => {
    if (isOpen === index && !displayError) {
      setIsOpen(null);
    } else {
      setIsOpen(index);
    }
  };

  useOutsideClick(modalRef, () => {
    if (isModalOpen) {
      setIsModalOpen(!isModalOpen);
      setOpenDrawer(!openDrawer);
    }
  });

  useOutsideClick(errorRef, () => {
    if (displayError) {
      setDisplayError(null);
    }
  });

  const handleDrawer = (e, item) => {
    const runId = id;
    const testCaseId = e?.testCaseId;
    const testSuiteId = item?._id;
    getStepsDetails(runId, testCaseId, testSuiteId)
      .then((res) => {
        const data = res?.data?.results;
        setStepData(data);
        setOpenDrawer(true);
      })
      .catch((error) => {
        console.log(error);
      });

    // setPlatform(e?.platform);
    // setStepData(e?.test_steps_runs);
    // if (!displayError) {
    //   setOpenDrawer(!openDrawer);
    // }
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
  const handleVideo = (event, video) => {
    event.stopPropagation();
    setVideoModalOpen(true);
    const videoURL = video ? video : null;
    setVideoDownload(videoURL);
    setVideo(`${assetsURL}${video}`);
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

    if (item?.platform !== "Web") {
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

  return (
    <div>
      <div className="rounded-[10px] shadow-xl">
        {data?.map((item, index) => (
          <div key={index} className="mt-1">
            <div
              className={`flex h-16 items-center justify-between cursor-pointer group  px-6 py-2 border-b border-solid border-[#D8E2F0] bg-ibl12 ${
                isOpen === index ? "rounded-t-[10px]" : "rounded-[10px]"
              }`}
              onClick={() => handleAccordion(index)}
            >
              <div className="flex items-center gap-3 text-sm leading-5">
                <div
                  className={`group-hover:text-ibl1 group-hover:transition-all group-hover:duration-300 group-hover:ease-in ${
                    isOpen === index ? "text-ibl1" : "text-igy5"
                  }`}
                >
                  <KeyboardArrowDownIcon
                    className={`${
                      isOpen === index
                        ? styles.isOpenIcon
                        : styles.isNotOpenIcon
                    } `}
                  />
                </div>
                <div>
                  <p className="font-semibold">{item?.testSuiteName}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center justify-center gap-2 text-base font-semibold">
                  <CustomTooltip title="Passed" placement="top">
                    <p className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center">
                      {item?.testStats?.passedTests}
                    </p>
                  </CustomTooltip>
                  <CustomTooltip title="Failed" placement="top">
                    <p className="w-6 h-6 rounded-full bg-[#FEE2E1] text-[#991b1b] flex items-center justify-center">
                      {item?.testStats?.failedTests}
                    </p>
                  </CustomTooltip>
                  <CustomTooltip title="Skipped" placement="top">
                    <p className="w-6 h-6 rounded-full bg-[#F3F4F6] text-[#1f2937] flex items-center justify-center">
                      {item?.testStats?.skippedTests}
                    </p>
                  </CustomTooltip>
                  <CustomTooltip title="Unknown" placement="top">
                    <p className="w-6 h-6 rounded-full bg-[#fef3c7] text-[#92400D] flex items-center justify-center">
                      {item?.testStats?.totalTests -
                        (item?.testStats?.passedTests +
                          item?.testStats?.failedTests +
                          item?.testStats.skippedTests)}
                    </p>
                  </CustomTooltip>
                </div>
              </div>
            </div>
            {/* When accordion is open  */}
            {isOpen === index && (
              <div>
                {item?.testCases?.map((e, i) => (
                  <>
                    <div
                      className="px-[30px] flex justify-between gap-3 items-center py-5 hover:bg-ibl12 cursor-pointer hover:transition-all hover:ease-in hover:duration-300"
                      key={i}
                      onClick={() => handleDrawer(e, item)}
                    >
                      <div className="flex items-center gap-2">
                        {e?.executionStatus === "FAILED" ? (
                          <HighlightOffIcon
                            fontSize="small"
                            className="text-ird1"
                          />
                        ) : e?.executionStatus === "PASSED" ? (
                          <CheckCircleIcon
                            fontSize="small"
                            className="text-ign1"
                          />
                        ) : e?.executionStatus === "SKIPPED" ? (
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
                        <div>
                          <p className="text-sm font-medium leading-5">
                            {e?.testCaseName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {defaultApplication?.type !== "RESTAPI" && (
                          <>
                            <div
                              className="w-10 text-igy5 hover:text-ibl1 hover:transition-all hover:duration-300 hover:ease-in "
                              onClick={(event) =>
                                handleVideo(event, e?.videoUrl)
                              }
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
                              <img alt={""} src={getIconSrc(e)} />
                              <p>{getDevice(e)}</p>
                            </div>
                          </>
                        )}
                        <div className="flex items-center  gap-2 text-[#6b7280] w-32">
                          <AccessAlarmIcon fontSize="small" />
                          {calculateDuration(
                            e?.executionStartTime,
                            e?.executionEndTime
                          )}
                        </div>

                        <div>
                          <StatusBadge status={e?.executionStatus} />
                        </div>
                      </div>
                    </div>
                    <hr className="w-full text-[#D8E2F0]" />
                  </>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <DrawerComponent
        show={openDrawer}
        className={`${
          platform === "android" || platform === "iOS"
            ? "-right-[825px] w-[825px]"
            : "-right-[1000px] w-[1000px]"
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
                    const assertions = item.apiRequest.assertions;
                    const totalAssertions = assertions.length;
                    const passedAssertions = assertions.filter(
                      (assertion) => assertion.pass
                    ).length;
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
                    <div className="flex justify-between mt-6" key={item?._id}>
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
                          {" "}
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
                            <p className="flex mt-2 text-sm font-bold text-cgy5">
                              Expected:{" "}
                              <span className="ml-1 font-medium break-all">
                                {item?.webData?.action?.keyword_name} :{" "}
                                {item?.webData?.inputData}
                              </span>
                            </p>
                          )}
                          <p className="flex mt-2 text-sm font-bold text-cgy5">
                            Actual:{" "}
                            <span className="ml-1 font-medium ">
                              {item?.executionStatus === "FAILED"
                                ? "Step failed to execute"
                                : item?.executionStatus === "PASSED"
                                ? "Step executed successfully"
                                : "Step yet to execute"}
                            </span>
                          </p>
                          <p className="flex mt-2 text-sm font-bold text-cgy5">
                            Action:{" "}
                            <span className="ml-1 font-medium ">
                              {item?.webData?.action?.keyword_name}
                            </span>
                          </p>
                          {item?.webData?.locateElement && (
                            <p className="flex mt-2 text-sm font-bold text-cgy5">
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
                            <p className="flex mt-2 text-sm font-bold text-cgy5">
                              Value:{" "}
                              <span className="ml-1 font-medium break-all">
                                {item?.webData?.inputData}
                              </span>
                            </p>
                          )}
                          {item?.stepError &&
                            item?.executionStatus === "FAILED" && (
                              <p className="flex mt-2 text-sm font-bold text-ird1">
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
            alt=""
            src={`${assetsURL}${modalData}`}
            onClick={() => setIsModalOpen(false)}
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
            {videoDownload && (
              <div className="mr-4 cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
                {video && <DownloadRoundedIcon onClick={handleVideoDownload} />}
              </div>
            )}
            <div className="cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
              <CloseIcon onClick={onVideoModalClose} data-testid="close_Icon" />
            </div>
          </div>
          {videoDownload ? (
            <ReactPlayer url={video} playing={true} controls />
          ) : (
            <img src={videoThumbnail} alt="" />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TestPlanHealth;
