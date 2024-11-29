import PropTypes from "prop-types";
import chrome from "Assets/Images/google.svg";
import safari from "Assets/Images/safari.svg";
import firefox from "Assets/Images/firefox.svg";
import edge from "Assets/Images/edge.svg";
import { toast } from "react-toastify";
import { createRunTestPlan } from "../../../Services/API/TestPlans/TestPlans";
import { useEffect, useState ,useContext} from "react";
import { useCreateTestCaseRunMutation, useCreateTestSuiteRunMutation, useEmailNotificationMutation } from "Services/API/apiHooks";
import { ApplicationTypeEnum } from "Enums/ApplicationTypeEnum";
import { WebsocketContext } from "Services/Socket/socketProvider";
import { useSelector } from "react-redux";

const RunPopUp = ({
  id,
  onCloseRunPopup = () => {},
  type,
  clearCheckBoxes = () => {},
  selectedApplication,
  onRunCreated = () => {}, // Added callback prop
  nameData,
  closeRunPopup = () => {}
}) => {
  const [createTestCaseRun] = useCreateTestCaseRunMutation()
  const [createTestSuiteRun] = useCreateTestSuiteRunMutation()
  const [selectedApplicationType, setSelectedApplicationType] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false); // State to prevent multiple clicks
  const {socket,engineSocket} = useContext(WebsocketContext)
  const { defaultApplication,userDetails } = useSelector((state) => state?.userDetails);
  const [emailNotification] = useEmailNotificationMutation();

  const data = [
    { id: 1, name: "Chrome", src: chrome },
    // { id: 2, name: "Safari", src: safari },
    { id: 2, name: "Firefox", src: firefox },
    { id: 3, name: "Edge", src: edge },
  ];

  const iosData = [
    { id: 1, name: "iPhone 15", src: null },
    { id: 2, name: "iPhone 14", src: null },
    { id: 3, name: "iPhone 13", src: null },
    { id: 4, name: "iPhone 12", src: null },
    { id: 5, name: "iPhone SE", src: null },
  ];

  const androidData = [
    { id: 1, name: "Samsung", src: null },
    { id: 2, name: "Google Pixel", src: null },
    // { id: 3, name: "One plus", src: null },
    { id: 4, name: "Vivo", src: null },
    { id: 5, name: "Oppo", src: null },
  ];

  useEffect(() => {
    if (!selectedApplication?.type) return;

    switch (selectedApplication?.type) {
      case "WEB":
      case "API":
        setSelectedApplicationType(data);
        break;
      case "IOS":
        setSelectedApplicationType(iosData);
        break;
      case "ANDRIOD":
        setSelectedApplicationType(androidData);
        break;
      default:
        // Handle other cases if necessary
        break;
    }
  }, [selectedApplication]);

  const optionsClick = async (item) => {
    closeRunPopup();
    if (isProcessing) return; // Prevent further clicks

    setIsProcessing(true); // Set processing to true to disable further clicks

    // Construct the idKey based on type
    let idKey;
    switch (type) {
      case "test-cases":
      case "suite-test-cases":
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
        ? { browser: item?.name.toUpperCase() }
        : { device: item?.name.toUpperCase() };

    // Construct the platform based on selectedApplication type
    let platform;
    switch (selectedApplication?.type) {
      case "ANDROID":
        platform = "ANDROID";
        break;
      case "IOS":
        platform = "IOS";
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
      runName:
        type === "test-cases" || type === "suite-test-cases"
          ? nameData?.testCaseName
          : type === "test-suites"
          ? nameData?.name
          : nameData?.test_plan_name,
      target: "REMOTE",                // we have to pass static this one for single run
      executionType: "SEQUENTIAL"      // we have to pass static this one for single run
    };

    // Define the run creation function based on type
    const runCreationPromise = (() => {
      switch (type) {
        case "test-cases":
        case "suite-test-cases":
          return createTestCaseRun(payload);
        case "test-suites":
          return createTestSuiteRun(payload);
        default:
          return createRunTestPlan(payload);
      }
    })();

    // Execute the run creation function and handle success/error
    runCreationPromise
      .then((res) => {
        if(res?.data?.results){
          socket.emit("onTestcases", {
            command: "createRun-testCase",
            organizationId: userDetails?.organizationId,
            applicationId: defaultApplication?.id,
            projectId: defaultApplication?.projectId,
            user: {
              userName: userDetails?.userName,
              userId: userDetails?.userId,
            },
            data:{
              ...res?.data?.results,
              createdBy:{
                _id:userDetails?._id,
                firstName:userDetails?.firstName,
                lastName:userDetails?.lastName
              }
            },
          });
          // enginSocket.emit('run-test',JSON.stringify(res?.data?.results))
          try{
            emailNotification({
              fromUser: {
                firstName: userDetails?.firstName,
                lastName: userDetails?.lastName,
                email: userDetails?.email
              },
              runId: res?.data?.results?._id,
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
        }
        if(res?.error){
          const msg = res?.error?.data?.details
          toast.error(msg);
          return;
        }
        toast.success("Run has been successfully processed.");
        onRunCreated();
      })
      .catch(() => {
        toast.error("An error occurred while processing your request.");
      });

    onCloseRunPopup();
    clearCheckBoxes();
  };

  return (
    <div className="flex flex-col">
      {selectedApplicationType?.map((item, index) => (
        <div
          data-testid={`option_div_${item}`}
          key={index}
          className={`flex flex-row justify-between items-center px-4 py-2 hover:bg-ibl12  cursor-pointer ${
            index === 0
              ? "hover:rounded-t-[8px]"
              : index === data?.length - 1
              ? "hover:rounded-b-[8px]"
              : ""
          }`}
          onClick={() => optionsClick(item)}
        >
          <span
            className="text-sm font-normal text-igy1"
            data-testid={`option_name_${item.name}`}
          >
            {item?.name}
          </span>
          {item?.src && (
            <span data-testid={`option_image_${item.name}`}>
              <img src={item?.src} alt={item?.name} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default RunPopUp;

RunPopUp.propTypes = {
  id: PropTypes.array,
  onCloseRunPopup: PropTypes.func,
  clearCheckBoxes: PropTypes.func,
  type: PropTypes.string,
  selectedApplication: PropTypes.any,
  onRunCreated: PropTypes.func,
  nameData: PropTypes.array,
};
