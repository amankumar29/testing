import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ApplicationInformation from "./ApplicationInformation";
import ApplicationConfiguration from "./ApplicationConfiguration";
import HorizontalStepper from "../../../../Components/Atoms/HorizontalStepper/HorizontalStepper";
import PropTypes from "prop-types";

const ApplicationDetails = ({
  onBackArrowClick = () => {},
  handleAddApplication = () => {},
  currentApplication = {},
}) => {

  const [appInfo, setAppInfo] = useState(null);
  const [subStep, setSubStep] = useState(0);
  const[configData, setConfigData]=useState({})


  const [formValues, setFormValues] = useState({
    retryTestFail: 0,
    emailId: [],
    reportTelegram: false,
    telegramChatId: null,
    telegramToken: null,
    testSteps: "Failed Steps",
    videoRecord: false,
    reportSlack: false,
    slackChatId: null,
    slackToken: null,
  });

  useEffect(() => {
    if (appInfo) {
      const payload = {
        type: appInfo?.components[0]?.selectedOption?.type,
        name: appInfo?.components[0]?.name,
      };
      setFormValues((prevValues) => ({ ...prevValues, ...payload }));
    }
  }, [appInfo]);

  const handleInputChange = (field) => (e) => {
    let value = e.target.value;
    if(field === 'emailId' && typeof value === "string"){
      value = value.trim();
    }
    setFormValues({ ...formValues, [field]: value });
  };

  const handleToggleChange = (field) => (value) => {
    setFormValues({ ...formValues, [field]: value });
  };

  const handleAddClick = (values) => {
    handleAddApplication(values);
  };

  const handleBackClick = () => {
    if (subStep === 1) {
      setSubStep(0);
    } else {
      onBackArrowClick();
    }
  };

  const handleChildUnmount = (values) => {
     setConfigData(values)
  };

  return (
    <div className="mx-10">
      <h1 className="text-[20px] flex justify-center font-medium leading-[30px]">
        {subStep === 0
          ? "Application Information"
          : subStep === 1 && "Configuration"}
      </h1>
      <div
        onClick={() => handleBackClick(formValues)}
        className="cursor-pointer mt-3 mb-[9px]"
        data-testid="arrow_back_icon"
      >
        <ArrowBackIcon />
      </div>
      <div className="flex justify-center">
        <HorizontalStepper
          stepNumber="01"
          lineStep
          label="Type & Name"
          stepActive={subStep === 0}
          stepCheck={subStep > 0}
          onClick={() => {
            setSubStep(0);
          }}
          step={subStep}
        />
        <HorizontalStepper
          stepNumber="02"
          label="Configuration"
          stepActive={subStep === 1}
          stepCheck={subStep > 1}
          onClick={() => {
            setSubStep(1);
          }}
          step={subStep}
        />
      </div>
      <div>
        {subStep === 0 && (
          <ApplicationInformation
            onNextClick={(values) => {
              setSubStep(1);
              setAppInfo(values);
            }}
            currentApplication={currentApplication}
            formValues={formValues}
          />
        )}
        {subStep === 1 && (
          <ApplicationConfiguration
            formValues={formValues}
            setFormValues={setFormValues}
            onInputChange={handleInputChange}
            onToggleChange={handleToggleChange}
            onAddClick={handleAddClick}
            configData={configData}
            onUnmount={handleChildUnmount}
          />
        )}
      </div>
    </div>
  );
};

export default ApplicationDetails;

ApplicationDetails.propTypes={
  onBackArrowClick: PropTypes.func,
  handleAddApplication: PropTypes.func,
  currentApplication: PropTypes.object
}
