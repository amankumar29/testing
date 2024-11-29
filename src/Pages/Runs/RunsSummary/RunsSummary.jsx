import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import PendingIcon from "@mui/icons-material/Pending";
import PersonIcon from "@mui/icons-material/Person";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import { fetchRunSummary } from "Store/ducks/runsDetails";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { calculateDuration } from "../../../Helpers/CalculateDuration/CalculateDuration";
import ConvertToLocalTimeZone from "../../../Helpers/ConvertTolocalTimeZone/ConvertToLocalTimeZone";
import TestCaseTestHealth from "../TestCaseTestHealth/TestCaseTestHealth";
import { getRunSummary } from "Services/API/Run/Run";
import { toast } from "react-toastify";
import { WebsocketContext } from "Services/Socket/socketProvider";

const RunsSummary = () => {
  const [step, setStep] = useState(0);
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigateTo = useNavigate();
  // console.log(id);
  const [runSummary,setRunSummary] = useState()
  const {socket} =  useContext(WebsocketContext)
  const currentStore = useStore()

  const getTabClass = (path) =>
    step === path
      ? "font-semibold px-2 border-b-[3px] border-ibl1 text-ibl1"
      : "px-2 text-ibl2 cursor-pointer font-semibold hover:text-ibl1";

  const tabs = [
    {
      label: "Tests Health",
      step: 0,
      icon: <SpaceDashboardOutlinedIcon fontSize="medium" />,
    },
    // {
    //   label: "Video",
    //   step: 1,
    //   icon: <VideocamOutlinedIcon fontSize="medium" />,
    // },
  ];

  const handleChange = (step) => {
    setStep(step);
  };
  // const { runSummary } = useSelector((state) => state.runSummary);

  const fetchRunSummary = async()=>{
    try{
      const result = await getRunSummary(id,"TEST_CASE");
      setRunSummary(result?.data)

    }catch(error){
      toast.error(error?.message)
    }
  }

  const handleTestcaseSocket = async(response) =>{
    const {defaultApplication:currentProject} = currentStore?.getState()?.userDetails
    if(currentProject?.id === response?.applicationId && currentProject?.projectId === response?.projectId ){
      if(response?.command === 'testCaseRun'){
        const {testCaseId,status,startTime,endTime} = response?.data
        setRunSummary(prevState => {
          const updatedTestCases = prevState?.testCases?.map(item => {
            if (item?.testCaseId === testCaseId) {
              return {
                ...item,
                ...(status && { executionStatus: status }),
                ...(startTime && { executionStartTime: startTime }),
                ...(endTime && { executionEndTime: endTime })
              };
            }
            return item;
          }) || [];
      
          return {
            ...prevState,
            executionStatus: status,
            runEndTime: endTime,
            testCases: updatedTestCases
          };
        });
      }
    }
  }

  useEffect(() => {
    if (socket) {
      socket.on("onTestcasesResponse", handleTestcaseSocket);
      return () => {
        socket.off("onTestcasesResponse", handleTestcaseSocket);
      };
    }
  }, []);

  useEffect(()=>{
    if(id){
      fetchRunSummary()
    }
  },[id])

  // useEffect(() => {
  //   if (id) {
  //     dispatch(fetchRunSummary({ id, runType: "TEST_CASE" }));
  //   }
  // }, [id, dispatch]);

  return (
    <div data-testid="runs_Summary_Page" className="h-[calc(100vh-155px)] overflow-y-auto">
      <div className="mb-5 shadow-xl bg-iwhite rounded-[10px] px-3 md:px-6 pt-6">
        <div className="items-center justify-between md:flex">
          <p className="flex items-center gap-3">
            <button
              type="button"
              className=" text-[#767676] hover:text-[#404040] -mt-1"
              onClick={() => navigateTo("/runs/test-case")}
            >
              <ArrowBackIcon />
            </button>
            <span className="mdMax:text-lg mdMax:line-clamp-1 mdMax:mb-2 text-2xl font-bold leading-10 tracking-[0.90px]">
              {runSummary?.runName}{" "}
            </span>
            <span className="text-base text-[#6b7280] italic font-medium mdMax:max-w-28 truncate">
              #{runSummary?._id}
            </span>
          </p>
          <button
            type="button"
            className="p-2 font-semibold border-2 border-solid border-ibl1 rounded-xl text-ibl1 hover:text-ibl3 hover:border-ibl3 hover:bg-ibl3 hover:bg-opacity-10 hover:transition-all hover:duration-300 hover:ease-in"
          >
            Abort Execution
          </button>
        </div>
        <div className="grid grid-cols-2 md:flex gap-3 md:gap-8 text-sm font-medium text-[#6b7280] mt-2">
          <p
            className={`flex items-center md:justify-center gap-2 ${
              runSummary?.executionStatus === "QUEUED"
                ? "text-[#8A2BE2]"
                : runSummary?.executionStatus === "DONE"
                ? "text-ign1"
                : runSummary?.executionStatus === "IN_PROGRESS"
                ? "text-[#E86826]"
                : "text-ird1"
            }`}
          >
            {runSummary?.executionStatus === "QUEUED" ? (
              <PendingIcon fontSize="small" />
            ) : runSummary?.executionStatus === "DONE" ? (
              <CheckCircleIcon fontSize="small" />
            ) : runSummary?.executionStatus === "IN_PROGRESS" ? (
              <PendingIcon fontSize="small" />
            ) : runSummary?.executionStatus === "ABORTED" ? (
              <HighlightOffIcon fontSize="small" />
            ) : (
              <BlockIcon fontSize="small" />
            )}
            {runSummary?.executionStatus == "IN_PROGRESS"
              ? runSummary?.executionStatus?.replace(/_/g, ' ')
              : runSummary?.executionStatus}
          </p>
          <p className="flex items-center gap-2 md:justify-center">
            <PersonIcon fontSize="small" />
            {runSummary?.createdBy?.firstName} {runSummary?.createdBy?.lastName}
          </p>
          <p className="flex items-center gap-2 md:justify-center">
            <QueryBuilderIcon fontSize="small" />
            {runSummary?.runStartTime
              ? ConvertToLocalTimeZone(runSummary?.runStartTime)
              : "- -"}
          </p>
          <p className="flex items-center gap-2 md:justify-center ">
            <AccessAlarmIcon fontSize="small" />
            {/* 180 s */}
            {calculateDuration(
              runSummary?.runStartTime,
              runSummary?.runEndTime
            )}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-10">
            {tabs.map((tab) => (
              <div key={tab.path} className={getTabClass(tab.step)}>
                <span
                  data-testid={`tab_label_${tab.label}`}
                  className={`${
                    step === tab.step ? "pointer-events-none" : "cursor-pointer"
                  } flex gap-1`}
                  onClick={() => handleChange(tab.step)}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-base font-semibold">
            <CustomTooltip title="Passed" placement="top">
              <p className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center">
                {runSummary?.testStats?.passedTests}
              </p>
            </CustomTooltip>
            <CustomTooltip title="Failed" placement="top">
              <p className="w-6 h-6 rounded-full bg-[#FEE2E1] text-[#991b1b] flex items-center justify-center">
                {runSummary?.testStats?.failedTests}
              </p>
            </CustomTooltip>
            <CustomTooltip title="Skipped" placement="top">
              <p className="w-6 h-6 rounded-full bg-[#F3F4F6] text-[#1f2937] flex items-center justify-center">
                {runSummary?.testStats?.skippedTests}
              </p>
            </CustomTooltip>
            <CustomTooltip title="Unknown" placement="top">
              <p className="w-6 h-6 rounded-full bg-[#fef3c7] text-[#92400D] flex items-center justify-center">
                {runSummary?.testStats?.totalTests -
                  (runSummary?.testStats?.passedTests +
                    runSummary?.testStats?.failedTests +
                    runSummary?.testStats?.skippedTests)}
              </p>
            </CustomTooltip>
          </div>
        </div>
      </div>
      {step === 0 && (
        <TestCaseTestHealth
          data={runSummary?.testCases}
          platform={runSummary?.platform}
        />
      )}
      {/* {step == 1 && "Video"} */}
    </div>
  );
};

export default RunsSummary;
