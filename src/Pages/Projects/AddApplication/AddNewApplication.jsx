import React, { useState } from "react";
import { CustomButton } from "../../../Components/Atoms/CustomButton/CustomButton";

const AddNewApplication = ({
  onAddApplicationClick = () => {},
  handleNext = () => {},
  handleBack = () => {},
  addedApplications = [],
  configData,
  projectInfoData
}) => {
  console.log(configData);
  console.log(projectInfoData);

  return (
    <div>
      <h1 className="text-[20px] flex justify-center font-medium leading-7 mb-[42px]">
        Add New Application
      </h1>
      <div className="mx-10 h-[622px]">
        {addedApplications?.length === 0 ? (
          <p className="mb-6">
            Please click on the{" "}
            <span className="text-[#052C85] font-bold">
              'Add New Application'
            </span>{" "}
            button to initiate the process of adding a new application.
          </p>
        ) : (
          <p>application</p>
        )}
        <CustomButton
          className="font-medium leading-6 w-[233px]"
          label="Add New Application"
          isAddBtn={true}
          onClick={onAddApplicationClick}
        />
      </div>
      <div className="flex justify-between mx-10">
        <div
          className="text-ibl1 px-4 py-2 rounded cursor-pointer text-[16px] font-medium leading-5"
          onClick={handleBack}
        >
          Back
        </div>
        <CustomButton
          className="!w-[100px] !h-10"
          disable={addedApplications?.length === 0}
          onClick={handleNext}
          label="Next"
        ></CustomButton>
      </div>
    </div>
  );
};

export default AddNewApplication;
