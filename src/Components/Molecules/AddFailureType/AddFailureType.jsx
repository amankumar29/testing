import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import SelectDropdown from "../../Atoms/SelectDropdown/SelectDropdown";
import { useState } from "react";
import InputField from "../../Atoms/InputField/InputField";
import { CustomButton } from "../../../Components/Atoms/CustomButton/CustomButton";

const AddFailureType = ({ isModalLoading, onClick = () => {} }) => {
  const [value, setValue] = useState(null);
  const [isClicked, setIsClicked] = useState(false);

  const handleOption = (option) => {
    setValue(option);
  };

  const handleButtonClick = () => {
    setIsClicked(true);

    setTimeout(() => {
      setIsClicked(false);
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center w-auto h-full">
      <div className="w-[340px] h-auto rounded-2xl shadow-2xl">
        <div className="flex flex-row bg-ibl7 w-full rounded-t-[10px]">
          <div className="h-[54px] flex justify-center items-center w-full">
            <div className="flex justify-start !pl-6"></div>
            <div
              className="text-[18px] font-medium leading-7 flex justify-center items-center w-[500px]"
              data-testid="modal_heading"
            >
              Add Failure Type
            </div>
            <div className="flex justify-end !pr-6 pl-[14px]">
              <CloseIcon
                onClick={onClick}
                className="cursor-pointer"
                data-testid="close_Icon"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col h-[244px] gap-[6px] mt-4 mx-[32px] cursor-pointer">
          <div>
            <SelectDropdown
              data-testid={`selectDropdown_${value}`}
              id={"failureType"}
              options={projectList}
              label={"FAILURE TYPE"}
              placeHolder={"Select Failure Type"}
              iconForApplication={true}
              value={value}
              onChange={(option) => handleOption(option)}
              className={"w-[276px] h-[40px]"}
            />
          </div>
          <div className="w-full mt-[10px]">
            <InputField
              data-testid={"link_to_issue_value"}
              label={"LINK TO ISSUE"}
              placeHolder={"Enter URL"}
              className={"w-[276px] h-[40px]"}
            />
          </div>
          <div className="flex gap-2 mt-[18px]">
            <CustomButton
              data-testid="add_to_jira_button"
              className={`!w-[134px] h-10 bg-iwhite !text-igy1 border border-ibl1 text-base font-normal ${
                isClicked
                  ? "!bg-ibl1 !text-iwhite"
                  : "bg-iwhite hover:!bg-ibl25 font-normal"
              }`}
              label="Add to Jira"
              addToJira={true}
              onClick={handleButtonClick}
            />
            <CustomButton
              data-testid="add_button"
              className="!w-[134px] h-10 hover:bg-ibl3 text-base"
              label="Add"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFailureType;

AddFailureType.propTypes = {
  isModalLoading: PropTypes.bool,
  onClick: PropTypes.func,
  projectList: PropTypes.array,
};

const projectList = [
  { id: 1, name: "Bug In App" },
  { id: 2, name: "Environment Issue" },
  { id: 3, name: "Invalid Test Data" },
  { id: 4, name: "Test Design" },
  { id: 5, name: "New UI Changes" },
  { id: 6, name: "Test Design" },
  { id: 7, name: "New UI Changes" },
];
