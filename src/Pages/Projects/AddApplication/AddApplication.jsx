import { useState } from "react";
import { CustomButton } from "../../../Components/Atoms/CustomButton/CustomButton";
import PropTypes from "prop-types";
import AddNewApplication from "./AddNewApplication";
import ApplicationDetails from "./ApplicationDetails/ApplicationDetails";

export default function AddApplication({ handleBack, handleNext, projectInformationValues }) {
  
  const [step, setStep] = useState(0);
  const [addedApplications, setAddedApplications] = useState([]);
  const [currentApplication, setCurrentApplication] = useState({});
  const [configurationData, setConfigurationData] = useState(null);
  return (
    <>
      <div className=" w-full h-[760px] mt-7">
        {/* this should contain entire applications list */}
        {step === 0 && (
          <AddNewApplication
            onAddApplicationClick={() => setStep(1)}
            handleNext={handleNext}
            addedApplications={addedApplications}
            handleBack={handleBack}
            configData={configurationData}
            projectInfoData={projectInformationValues}
          />
        )}
        {/* this should only contain the application which we are editing or creating */}
        {step === 1 && (
          <ApplicationDetails
            onBackArrowClick={() => setStep(0)}
            currentApplication={currentApplication}
            handleAddApplication={(values) => {
              setStep(0);
              setConfigurationData(values);
            }}
          />
        )}
        {/* extracting applicationDetails from this and pushing it to the addedApplications */}
      </div>
    </>
  );
}

AddApplication.propTypes = {
  handleBack: PropTypes.func,
  step: PropTypes.func,
  handleNext: PropTypes.func,
  projectInformationValues: PropTypes.object
};
