import CloseIcon from "@mui/icons-material/Close";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CircularProgress from "@mui/material/CircularProgress";
import failedIcon from "Assets/Images/Failed.png";
import passedIcon from "Assets/Images/passed.png";
import skippedIcon from "Assets/Images/skipped.png";
import timeIcon from "Assets/Images/time.png";
import totalIcon from "Assets/Images/total.svg";
import axios from "axios";
import { Modal } from "Components/Atoms/Modal/Modal";
import TextLink from "Components/Atoms/TextLink/TextLink";
import Switcher from "Components/Molecules/Switcher/Switcher";
import {
  calculateDuration,
  calculateTimeDuration,
} from "Helpers/CalculateDuration/CalculateDuration";
import ConvertToLocalTimeZone from "Helpers/ConvertTolocalTimeZone/ConvertToLocalTimeZone";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getError,
  getLastRunHistory,
  getLastRunSuite,
} from "Services/API/Dashboard/Dashboard";
import SearchDropdown from "../../Components/Atoms/SearchDropdown/SearchDropdown";
import styles from "./Dashboard.module.scss";
import "./Dashboard.style.scss";

const Dashboard = () => {
  const [lastRunSuiteLlist, setLastRunSuiteList] = useState([]);
  const [selectedTestSuite, setSelectedTestSuite] = useState(null);
  const [kpiCount, setKpiCount] = useState(null);
  const [lastRunHistory, setLastRunHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorsData, setErrorsData] = useState([]);
  const [image, setImage] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorParameter, setErrorParameter] = useState(null);
  const navigateTo = useNavigate();
  const assetsURL = process.env.REACT_APP_ASSETS_URL;
  const { loading, userDetails, defaultApplication } = useSelector(
    (state) => state?.userDetails
  );
  useEffect(() => {
    if (defaultApplication?.id) {
      setIsLoading(true);
      const type = "TEST_SUITE";
      getLastRunSuite(defaultApplication?.id, type)
        .then((res) => {
          const testSuiteList = res?.data?.results;
          const updatedApplicationList = testSuiteList.map((item) => {
            return {
              id: item?._id,
              keyword_name: item?.testSuiteName,
              total: item?.testStats?.totalTests,
              passed: item?.testStats?.passedTests,
              failed: item?.testStats?.failedTests,
              skipped: item?.testStats?.skippedTests,
              start: item?.testSuiteExecutionStartTime,
              end: item?.testSuiteExecutionEndTime,
              suiteName: item?.testSuiteName,
              suiteId: item?.testSuiteId,
              runId: item?.runId,
            };
          });
          setLastRunSuiteList(updatedApplicationList);
          setSelectedTestSuite(updatedApplicationList[0]);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    }
  }, [defaultApplication]);

  useEffect(() => {
    if (selectedTestSuite?.suiteId) {
      setIsLoading(true);

      getLastRunHistory(selectedTestSuite?.suiteId)
        .then((res) => {
          const data = res?.data?.results;
          setLastRunHistory(data);
          if (selectedTestSuite?.id) {
            const filteredData = data?.filter(
              (e) => e?.runId === selectedTestSuite?.runId
            );
            const requiredData = {
              runType:
                filteredData[0]?.runType === "TEST_SUITE"
                  ? "test-suite"
                  : "test-scheduler",
              runId: filteredData[0]?.runId,
            };
            setErrorParameter(requiredData);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    } else {
      setLastRunHistory([]);
    }
  }, [selectedTestSuite]);

  useEffect(() => {
    if (selectedTestSuite?.suiteId) {
      setErrorsData([]);
      const payload = selectedTestSuite?.id;
      getError(payload)
        .then((res) => {
          const data = res?.data?.results;
          setErrorsData(data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setErrorsData([]);
    }
  }, [selectedTestSuite]);

  const historyData = lastRunHistory.map((item) => ({
    name: item.runId,
    uv:
      item.totalCasesInSuites &&
      isFinite(item?.testStats?.passedTests / item.totalCasesInSuites)
        ? (item?.testStats?.passedTests / item.totalCasesInSuites) * 100
        : 0,
    type: item?.runType === "TEST_SUITE" ? "test-suite" : "test-scheduler",
    executedAt: item?.testSuiteExecutionStartTime
      ? ConvertToLocalTimeZone(item?.testSuiteExecutionStartTime)
      : null,
    duration: item?.testSuiteExecutionEndTime
      ? calculateTimeDuration(
          item?.testSuiteExecutionStartTime,
          item?.testSuiteExecutionEndTime
        )
      : null,
    total: item?.totalCasesInSuites,
    passed: item?.testStats?.passedTests,
    failed: item?.testStats?.failedTests,
    skipped: item?.testStats?.skippedTests,
  }));

  useEffect(() => {
    setKpiCount({
      total: selectedTestSuite?.total,
      passed: selectedTestSuite?.passed,
      failed: selectedTestSuite?.failed,
      skipped: selectedTestSuite?.skipped,
      executedAt: selectedTestSuite?.start
        ? ConvertToLocalTimeZone(selectedTestSuite?.start)
        : null,
      duration: selectedTestSuite?.end
        ? calculateDuration(selectedTestSuite?.start, selectedTestSuite?.end)
        : null,
    });
  }, [selectedTestSuite]);

  const testCaseData = [
    { name: "Skipped", value: kpiCount?.skipped },
    { name: "Passed", value: kpiCount?.passed },
    { name: "Failed", value: kpiCount?.failed },
  ];
  const COLORS = ["#E0E0E0", "#089E61", "#F45A5A"];

  const formatPercent = (value) => `${value}%`;

  const PieCustomTooltip = ({ active, payload = [] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="custom-tooltip">
          <p className="flex items-center text-xs ">
            <span className="mr-1 font-bold">{data?.name} :</span>{" "}
            <span className="font-semibold">{data?.value}</span>
          </p>
        </div>
      );
    }

    return null;
  };

  const CustomTooltip = ({ active, payload = [] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="custom-tooltip">
          <p className="flex items-center text-xs ">
            <span className="mr-1 font-bold">Run Id:</span>{" "}
            <span className="font-semibold">{data.name}</span>
          </p>

          <p className="flex items-center mt-1 text-xs text-cgy4">
            <span className="mr-1 font-bold">Executed on:</span>{" "}
            <span className="font-semibold">{data?.executedAt}</span>
          </p>
          <p className="flex items-center mt-1 text-xs text-cgy4">
            <span className="mr-1 font-bold">Duration:</span>{" "}
            <span className="font-semibold">
              {data?.duration ? data?.duration : " - -"}
            </span>
          </p>
          <p className="flex items-center mt-1 text-xs text-cgy4">
            <span className="mr-1 font-bold">Total Test Cases:</span>{" "}
            <span className="font-semibold">
              {data?.total ? data?.total : 0}
            </span>
          </p>

          <p className="flex items-center mt-1 text-xs text-cgy4">
            <span className="mr-1 font-bold">Passed:</span>{" "}
            <span className="font-semibold">
              {data?.passed ? data?.passed : 0}
            </span>
          </p>
          <p className="flex items-center mt-1 text-xs text-cgy4">
            <span className="mr-1 font-bold">Failed:</span>{" "}
            <span className="font-semibold">
              {data?.failed ? data?.failed : 0}
            </span>
          </p>
          <p className="flex items-center mt-1 text-xs text-cgy4">
            <span className="mr-1 font-bold">Skipped:</span>{" "}
            <span className="font-semibold">
              {data?.skipped ? data?.skipped : 0}
            </span>
          </p>
          <p className="flex items-center mt-1 text-xs text-cgy4">
            <span className="mr-1 font-bold">Pass Percentage:</span>{" "}
            <span className="font-semibold">{data?.uv?.toFixed(2)} %</span>
          </p>
        </div>
      );
    }

    return null;
  };

  const handleSelectTestSuite = (option) => {
    setSelectedTestSuite(option);
  };

  const allTestCasesZero =
    (kpiCount?.passed === 0 || kpiCount?.passed === null) &&
    (kpiCount?.failed === 0 || kpiCount?.failed === null) &&
    (kpiCount?.skipped === 0 || kpiCount?.skipped === null);

  const handleChartClick = (e) => {
    const { payload } = e.activePayload[0];
    if (payload) {
      navigateTo(`/runs/${payload.type}/${payload.name}/summary`);
    }
  };

  const handleImage = (e, error) => {
    e.stopPropagation();
    setModalData(error?.stepImage);
    const imageURL = `${assetsURL}${error?.stepImage}`;
    setImage(imageURL);
    setIsModalOpen(true);
  };

  const onModalClose = () => {
    setIsModalOpen(false);
  };
  const handleDownload = async () => {
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

  const handleNavigate = (error) => {
    if (errorParameter) {
      navigateTo(
        `/runs/${errorParameter?.runType}/${errorParameter?.runId}/summary`
      );
    }
  };

  return (
    <div className="overflow-y-auto h-[calc(100vh-160px)]">
      <div className="xl:flex justify-between md:mb-[34px] mb-0">
        <div>
          <div data-testid="dashboard" className="mdMax:text-[20px] text-[26px] font-semibold">
            Welcome back,
            {!loading && (
              <span className="font-semibold capitalize text-ibl1">
                {" "}
                {userDetails?.firstName + " " + userDetails?.lastName}
              </span>
            )}
          </div>
          <div className="mdMax:text-sm text-base text-[#64748B] mt-1">
            Summary of latest test suite results.
          </div>
        </div>

        {/* Project and Application Switcher  */}
        <div className="items-center gap-4 md:flex xlMax:mt-2 dashboard-search">
          <Switcher />

          {lastRunSuiteLlist?.length > 0 && (
            <SearchDropdown
              option={lastRunSuiteLlist}
              label={"Test Suite"}
              className={`h-10 w-[276px] bg-iwhite mb-3 md:mb-0 select-full`}
              hideCross={true}
              isEditable={true}
              selectedOption={selectedTestSuite}
              onSelect={handleSelectTestSuite}
            />
          )}
        </div>
      </div>
      {/* KPI Area  */}
      <div className="dashboard-box xl:flex w-full xl:gap-3 2xl:gap-12 mdMax:mt-[15px] mt-[34px]">
        <div className="w-full xl:w-1/5 mb-4 xl:mb-0 rounded-[10px] px-7 py-5 bg-[#E3EBFF] h-[148px] mdMax:h-auto flex justify-between shadow-[0_4px_4.4px_0px_rgba(12,86,255,0.3)]">
          <div>
            <p className="mdMax:text-xl text-2xl font-medium text-[#000088] leading-9">
              Total
            </p>
            <p className="mt-4 mdMax:text-[26px] text-[36px] font-semibold leading-10">
              {kpiCount?.total ? kpiCount?.total : 0}
            </p>
          </div>
          <div>
            <img src={totalIcon} alt="" />
          </div>
        </div>
        <div className="w-full xl:w-1/5 mb-4 xl:mb-0 rounded-[10px] px-7 py-5 bg-[#E7F8F1] h-[148px] mdMax:h-auto flex justify-between shadow-[0_4px_4.4px_0px_rgba(15,162,102,0.39)]">
          <div>
            <p className="mdMax:text-xl text-2xl font-medium text-[#089E61] leading-9">
              Passed
            </p>
            <p className="mt-4 mdMax:text-[26px] text-[36px] font-semibold leading-10">
              {kpiCount?.passed ? kpiCount?.passed : 0}
            </p>
          </div>
          <div>
            <img src={passedIcon} alt="" />
          </div>
        </div>
        <div className="w-full xl:w-1/5 mb-4 xl:mb-0 rounded-[10px] px-7 py-5 bg-[#FFEDEE] h-[148px] mdMax:h-auto flex justify-between shadow-[0_4px_4.4px_0px_rgba(220,0,0,0.25)]">
          <div>
            <p className="mdMax:text-xl text-2xl font-medium text-[#E35050] leading-9">
              Failed
            </p>
            <p className="mt-4 mdMax:text-[26px] text-[36px] font-semibold leading-10">
              {kpiCount?.failed ? kpiCount?.failed : 0}
            </p>
          </div>
          <div>
            <img src={failedIcon} alt="" />
          </div>
        </div>
        <div className="w-full xl:w-1/5 mb-4 md:mb-0 rounded-[10px] px-7 py-5 bg-[#EBEBEB] h-[148px] mdMax:h-auto flex justify-between shadow-[0_4px_4.4px_0px_rgba(0,0,0,0.25)]">
          <div>
            <p className="mdMax:text-xl text-2xl font-medium leading-9">Skipped</p>
            <p className="mt-4 mdMax:text-[26px] text-[36px] font-semibold leading-10">
              {kpiCount?.skipped ? kpiCount?.skipped : 0}
            </p>
          </div>
          <div>
            <img src={skippedIcon} alt="" />
          </div>
        </div>
        <div className="w-full xl:w-1/5 rounded-[10px] px-7 py-5 bg-[#FFEFFD] h-[148px] mdMax:h-auto flex justify-between shadow-[0_4px_4.4px_0px_rgba(197,37,225,0.42)]">
          <div className="w-full">
            <div className="">
              <div className="flex justify-between w-full">
                <p className="mdMax:text-xl text-2xl font-medium text-[#c026d3]">
                  Executed on
                </p>
                <div>
                  <img src={timeIcon} alt="" />
                </div>
              </div>
              <p className="mt-1.5 text-base flex items-center gap-2">
                <p className="text-base font-medium">
                  {kpiCount?.executedAt ? kpiCount?.executedAt : " - -"}
                </p>
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="font-medium">Duration:</p>
              <p className="text-base font-medium">
                {kpiCount?.duration ? kpiCount?.duration : " - -"}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Pie and line chart area  */}
      {isLoading ? (
        <div className="w-full flex items-center justify-center h-[300px]">
          <CircularProgress />
        </div>
      ) : (
        <div className="gap-6 md:flex mt-9">
          {/* Pie Area */}
          <div className="w-full md:w-[450px] rounded-[10px] drop-shadow-lg p-6 overflow-hidden bg-iwhite mb-4 md:mb-0">
            <div className="relative">
              {!allTestCasesZero && selectedTestSuite && (
                <div className="text-xl font-medium leading-7">
                  {/* {selectedTestSuite?.suiteName} - Results */}
                  Test suite run - Results
                </div>
              )}

              {!allTestCasesZero && selectedTestSuite ? (
                <div className="relative w-full md:absolute grapgh-sec">
                  <div className="flex flex-col items-center justify-center -mt-10 ">
                    <ResponsiveContainer width={300} height={600}>
                      <PieChart>
                        <Pie
                          data={testCaseData}
                          cx={140}
                          cy={200}
                          innerRadius={100}
                          outerRadius={140}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {testCaseData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                          <Label
                            value={"Total Test Cases"}
                            position="center"
                            fontSize={18}
                            fontWeight={"500"}
                            fill={"#404040"}
                            dy={-20}
                          />
                          <Label
                            value={kpiCount?.total}
                            position="center"
                            fontSize={32}
                            dy={30}
                            fontWeight={600}
                            fill={"#000088"}
                          />
                        </Pie>
                        <Tooltip content={<PieCustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="-mt-[220px] flex gap-8 text-base">
                      {/* {kpiCount?.passed > 0 && ( */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-sm bg-[#089E61]" />
                        <div>Passed</div>
                      </div>
                      {/* )} */}
                      {/* {kpiCount?.failed > 0 && ( */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-sm bg-[#F45A5A]" />
                        <div>Failed</div>
                      </div>
                      {/* )} */}

                      {/* {kpiCount?.skipped > 0 && ( */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-sm bg-[#D1D1D1]" />
                        <div>Skipped</div>
                      </div>
                      {/* )} */}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center text-xs text-[#02152699] leading-5 h-[350px]">
                  No data found
                </div>
              )}
            </div>
          </div>
          {/* Line Chart Area  */}
          <div className="w-full md:w-[74%] max-w-[100vw]  rounded-[10px] drop-shadow-lg py-6 px-6 overflow-hidden bg-iwhite">
            <div className="mb-6 text-xl font-medium leading-7">
              {lastRunHistory?.length > 0 &&
                // <p>{selectedTestSuite?.suiteName} - Trends</p>
                "Test suite run - Trends"}
            </div>

            {lastRunHistory?.length > 0 ? (
              <ResponsiveContainer width="100%" height={360}>
                <LineChart
                  data={historyData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 15,
                    cursor: "pointer",
                  }}
                  onClick={handleChartClick}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    padding={{ left: 30 }}
                    label={{
                      value: "← Run Id →",
                      position: "insideBottom", // You can use "insideBottom", "insideTop", "bottom", "top", etc.
                      offset: -12, // Adjust the offset to move the label closer or further away from the axis
                      style: { textAnchor: "middle" },
                    }}
                    tick={{ fontSize: 14, fill: "#295D93" }}
                    axisLine={{ stroke: "#295D93", strokeWidth: 2 }}
                    tickLine={{ stroke: "#295D93", strokeWidth: 2 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={formatPercent}
                    tick={{ fontSize: 14, fill: "#295D93" }}
                    axisLine={{ stroke: "#295D93", strokeWidth: 2 }}
                    tickLine={{ stroke: "#295D93", strokeWidth: 2 }}
                  >
                    <Label
                      value="← Pass Percentage →"
                      angle={-90}
                      position="insideLeft"
                      style={{ textAnchor: "middle" }}
                    />
                  </YAxis>
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    connectNulls
                    type="monotone"
                    dataKey="uv"
                    stroke="#295D93"
                    fill="#295D93"
                    strokeWidth={2}
                    activeDot={{
                      r: 8, // Adjust the size of the active dot
                      cursor: "pointer",
                      fill: "#EA7525",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex -mt-6 items-center justify-center text-xs text-[#02152699] leading-5 h-full">
                No data found
              </div>
            )}
          </div>
        </div>
      )}

      {/* error section  */}
      {errorsData?.length > 0 && !isLoading && (
        <div className="w-full my-6 overflow-y-auto">
          <div className=" rounded-[10px] drop-shadow-lg p-6 overflow-hidden bg-iwhite min-w-1000 xlMax:min-w-[1200px]">
            <div className="text-xl font-medium leading-7">
              Test suite run - Errors
            </div>
            <div className="h-12 mt-5 bg-ibl7 rounded-t-[10px]">
              <div className="flex h-12">
                <div className="flex items-center justify-center text-base font-medium px-2 w-[20%]">
                  ID
                </div>
                <div className="flex items-center justify-start text-base font-medium px-2 w-[20%]">
                  Test Case Name
                </div>
                <div className="flex items-center justify-center text-base font-medium px-2 w-[10%]">
                  Step No.
                </div>
                <div className="flex items-center justify-start text-base font-medium px-2 w-[40%]">
                  Error Message
                </div>
                <div className="flex items-center justify-end text-base font-medium w-[10%]"></div>
              </div>
            </div>
            <div className={`max-h-[300px] ${styles.scroll}`}>
              {errorsData?.map((error, i) => (
                <div key={error.id}>
                  <div
                    className="flex py-4 hover:bg-ibl12 cursor-pointer hover:transition-all hover:ease-in hover:duration-300 "
                    onClick={() => handleNavigate(error)}
                  >
                    <div className="flex items-center justify-center text-sm px-2 w-[20%]">
                      {error.testCaseId}
                    </div>
                    <div className="flex items-center justify-start text-sm break-all px-2 w-[20%]">
                      {error.testCaseName}
                    </div>
                    <div className="flex items-center justify-center text-sm px-2 w-[10%]">
                      {error.stepNo}
                    </div>
                    <div className="flex items-center justify-start text-sm break-all text-ird1 px-2 w-[40%]">
                      {error.stepError
                        .replace("step failed with an error:", "")
                        .trim()}
                    </div>
                    <div className="flex items-center justify-end pr-6 text-sm break-all text-ird1 px-2 w-[10%]">
                      <TextLink
                        label="Screenshot"
                        onClick={(e) => handleImage(e, error)}
                      />
                    </div>
                  </div>
                  {i < errorsData.length - 1 && (
                    <hr className="rounded-full border-ibl17" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={onModalClose}
        className={`px-6 pb-6 pt-2 ${
          defaultApplication?.type === "ANDROID" ||
          defaultApplication?.type === "IOS"
            ? ""
            : "xl:max-w-5xl w-[50%]"
        }`}
      >
        <div
          className={`${
            (defaultApplication?.type === "ANDROID" ||
              defaultApplication?.type === "IOS") &&
            "w-[300px]"
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
          <img alt="" src={image} className="" />
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
