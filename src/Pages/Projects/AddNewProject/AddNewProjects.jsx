import styles from "./AddNewProjects.module.scss";
import ProjectStepper from "../../../Components/Atoms/ProjectStepper/ProjectStepper";
import ProjectSummary from "../ProjectSummary/ProjectSummary";
import ProjectInformation from "../ProjectInformation/ProjectInformation";
import AddApplication from "../AddApplication/AddApplication";

import { useState } from "react";

function AddNewProjects() {
  const [step, setStep] = useState(0);
  const [projectInformation, setProjectInformation] = useState(null);

  const handleNext = (values) => {
    if (step < 2) {
      setStep((prevStep) => prevStep + 1);
    }
    setProjectInformation(values)
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prevStep) => prevStep - 1);
    }
  };

  const handleLabelClick = (stepNumber) => {
    setStep(stepNumber);
  };

  return (
    <div className={`flex flex-col ${styles.stepsContainer}`}>
      <div className="flex w-full">
        <div className="flex flex-col items-center pr-2">
          <div className="text-[20px] font-medium leading-7 mt-7 w-[220px] ml-[70px] mr-[59px]">
            Add New Project
          </div>
          <div className="relative mt-20 pr-[60px]">
            <ProjectStepper
              label="Project Information"
              isCompleted={step > 0}
              isActive={step === 0}
              stepNo={"01"}
              onLabelClick={() => {
                handleLabelClick(0);
              }}
            />
            <ProjectStepper
              label="Add New Application"
              isCompleted={step > 1}
              isActive={step === 1}
              stepNo={"02"}
              onLabelClick={() => {
                handleLabelClick(1);
              }}
            />
            <ProjectStepper
              label="Project Summary"
              isActive={step === 2}
              stepNo={"03"}
              onLabelClick={() => {
                handleLabelClick(2);
              }}
            />
          </div>
        </div>
        <div className="my-6 border  border-igy12 h-auto" />
        {step === 0 && (
          <ProjectInformation
            handleBack={handleBack}
            step={step}
            handleNext={handleNext}
            initialValues={projectInformation}
          />
        )}
        {step === 1 && (
          <AddApplication
            handleBack={handleBack}
            step={step}
            handleNext={handleNext}
            projectInformationValues = {projectInformation}
          />
        )}
        {step === 2 && (
          <ProjectSummary
            handleBack={handleBack}
            step={step}
            handleNext={handleNext}
          />
        )}
      </div>
    </div>
  );
}

export default AddNewProjects;
