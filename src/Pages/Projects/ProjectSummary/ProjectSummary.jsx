import { CustomButton } from "../../../Components/Atoms/CustomButton/CustomButton";
import PropTypes from "prop-types";

export default function ProjectSummary({ handleBack, step, handleNext }) {
  return (
    <div>
      <div className="flex flex-col mx-[70px] gap-6">
        {/* Project Information */}
        <div className="flex justify-center mt-7 text-[20px] font-medium leading-7">
          Application Summary
        </div>
        <div className="flex flex-col mt-[10px] w-full">
          <div className="bg-ibl12 h-[35px] px-4 flex items-center justify-between rounded-[2px]">
            <div className="text-sm text-ibl1 font-medium leading-7">
              Project Information
            </div>
            <div className="text-[16px] text-ibl1 font-medium leading-7 cursor-pointer">
              Edit
            </div>
          </div>
          {/* Project Name */}
          <div className="flex items-center px-[21px] mt-4">
            <div className="text-sm font-medium leading-7">
              Project Name <span className="text-ird3">*</span>
            </div>

            <div className="text-sm font-medium leading-7 text-ibl1 ml-[60px]">
              coyni
            </div>
          </div>
          {/* Description */}
          <div className="flex px-[21px] mt-4">
            <div className="text-sm font-medium leading-7">Description</div>
            <div className="text-sm font-medium leading-7 text-ibl1 ml-[84px]">
              Alpha project description typically refers to a document or
              outline that provides details about a project in its early stages
              of development, often referred to as the alpha phase.
            </div>
          </div>

          {/* Application Information */}
        </div>
        {/* Application Information */}
        <div className="flex flex-col w-full">
          <div className="bg-ibl12 h-[35px] px-4 flex items-center justify-between rounded-[2px]">
            <div className="text-sm text-ibl1 font-medium leading-7">
              Application Information
            </div>
            <div className="text-[16px] text-ibl1 font-medium leading-7 cursor-pointer">
              Edit
            </div>
          </div>

          <div className="flex flex-col h-[500px] overflow-y-auto">
            {/* 1st */}
            <div className="flex gap-[10px]">
              <div className="flex flex-col gap-[20px] ml-[21px] mt-4">
                <div className="text-sm font-medium leading-5">
                  Application <span className="text-ird3">*</span>
                </div>
                <div className="text-sm font-medium leading-5">
                  Configuration
                </div>
              </div>

              <div className="flex flex-col gap-[20px] ml-[57px] mt-4">
                <div className="text-sm font-medium text-ibl1 leading-5">
                  coyni-Merchant (Web)
                </div>
                <div className="text-sm font-medium leading-5">
                  Retry Test Fail
                </div>
                <div className="text-sm font-medium leading-5">
                  Screenshot for the test steps
                </div>{" "}
                <div className="text-sm font-medium leading-5">Email ID</div>
                <div className="text-sm font-medium leading-5">
                  Video Record
                </div>{" "}
                <div className="text-sm font-medium leading-5">
                  Report to Slack
                </div>{" "}
                <div className="text-sm font-medium leading-5">
                  Slack Chat ID
                </div>
                <div className="text-sm font-medium leading-5">Slack Token</div>
                <div className="text-sm font-medium leading-5">
                  Report to Telegram
                </div>
                <div className="text-sm font-medium leading-5">
                  Telegram Chat ID
                </div>
                <div className="text-sm font-medium leading-5">
                  Telegram Token
                </div>
              </div>

              <div className="flex flex-col gap-[20px] ml-[57px] mt-[55px]">
                <div className="text-sm font-medium leading-5 text-ibl1">
                  05
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  All Steps
                </div>{" "}
                <div className="text-sm font-medium leading-5 text-ibl1">
                  prarabdhab@ideyalabs.com
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  Yes
                </div>{" "}
                <div className="text-sm font-medium leading-5 text-ibl1">
                  Yes
                </div>{" "}
                <div className="text-sm font-medium leading-5 text-ibl1">
                  2345678
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  iuytr
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  123456789:ABCdefGhijkLMNoPQRStu
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  olkoiu765
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  89:ABCdefGhijkLMNoPQRStu
                </div>
              </div>
            </div>
            <div className="flex ml-[20px] gap-[105px] mt-[20px]">
              <div className="text-sm font-medium leading-5 text-ibl1">
                Data File
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-sm font-medium leading-5 text-ign7 underline cursor-pointer">
                  Data Excel Sheet
                </div>
                <div className="text-[10px] font-medium leading-5 text-ibl28 cursor-pointer">
                  Preview
                </div>
              </div>
            </div>
            <div className="mt-2 border  border-igy12 h-auto"></div>

            {/* 2nd */}
            <div className="flex gap-[10px]">
              <div className="flex flex-col gap-[20px] ml-[21px] mt-4">
                <div className="text-sm font-medium leading-5">
                  Application <span className="text-ird3">*</span>
                </div>
                <div className="text-sm font-medium leading-5">
                  Configuration
                </div>
              </div>

              <div className="flex flex-col gap-[20px] ml-[57px] mt-4">
                <div className="text-sm font-medium text-ibl1 leading-5">
                  coyni-Merchant (Web)
                </div>
                <div className="text-sm font-medium leading-5">
                  Retry Test Fail
                </div>
                <div className="text-sm font-medium leading-5">
                  Screenshot for the test steps
                </div>{" "}
                <div className="text-sm font-medium leading-5">Email ID</div>
                <div className="text-sm font-medium leading-5">
                  Video Record
                </div>{" "}
                <div className="text-sm font-medium leading-5">
                  Report to Slack
                </div>{" "}
                <div className="text-sm font-medium leading-5">
                  Slack Chat ID
                </div>
                <div className="text-sm font-medium leading-5">Slack Token</div>
                <div className="text-sm font-medium leading-5">
                  Report to Telegram
                </div>
                <div className="text-sm font-medium leading-5">
                  Telegram Chat ID
                </div>
                <div className="text-sm font-medium leading-5">
                  Telegram Token
                </div>
              </div>

              <div className="flex flex-col gap-[20px] ml-[57px] mt-[55px]">
                <div className="text-sm font-medium leading-5 text-ibl1">
                  05
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  All Steps
                </div>{" "}
                <div className="text-sm font-medium leading-5 text-ibl1">
                  prarabdhab@ideyalabs.com
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  Yes
                </div>{" "}
                <div className="text-sm font-medium leading-5 text-ibl1">
                  Yes
                </div>{" "}
                <div className="text-sm font-medium leading-5 text-ibl1">
                  2345678
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  iuytr
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  123456789:ABCdefGhijkLMNoPQRStu
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  olkoiu765
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  89:ABCdefGhijkLMNoPQRStu
                </div>
              </div>
            </div>
            <div className="flex ml-[20px] gap-[105px] mt-[20px]">
              <div className="text-sm font-medium leading-5 text-ibl1">
                Data File
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-sm font-medium leading-5 text-ign7 underline cursor-pointer">
                  Data Excel Sheet
                </div>
                <div className="text-[10px] font-medium leading-5 text-ibl28 cursor-pointer">
                  Preview
                </div>
              </div>
            </div>
            <div className="mt-2 border  border-igy12 h-auto"></div>

            {/* 3rd */}
            <div className="flex gap-[10px]">
              <div className="flex flex-col gap-[20px] ml-[21px] mt-4">
                <div className="text-sm font-medium leading-5">
                  Application <span className="text-ird3">*</span>
                </div>
                <div className="text-sm font-medium leading-5">
                  Configuration
                </div>
              </div>

              <div className="flex flex-col gap-[20px] ml-[57px] mt-4">
                <div className="text-sm font-medium text-ibl1 leading-5">
                  coyni-Merchant (Web)
                </div>
                <div className="text-sm font-medium leading-5">
                  Retry Test Fail
                </div>
                <div className="text-sm font-medium leading-5">
                  Screenshot for the test steps
                </div>{" "}
                <div className="text-sm font-medium leading-5">Email ID</div>
                <div className="text-sm font-medium leading-5">
                  Video Record
                </div>{" "}
                <div className="text-sm font-medium leading-5">
                  Report to Slack
                </div>{" "}
                <div className="text-sm font-medium leading-5">
                  Slack Chat ID
                </div>
                <div className="text-sm font-medium leading-5">Slack Token</div>
                <div className="text-sm font-medium leading-5">
                  Report to Telegram
                </div>
                <div className="text-sm font-medium leading-5">
                  Telegram Chat ID
                </div>
                <div className="text-sm font-medium leading-5">
                  Telegram Token
                </div>
              </div>

              <div className="flex flex-col gap-[20px] ml-[57px] mt-[55px]">
                <div className="text-sm font-medium leading-5 text-ibl1">
                  05
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  All Steps
                </div>{" "}
                <div className="text-sm font-medium leading-5 text-ibl1">
                  prarabdhab@ideyalabs.com
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  Yes
                </div>{" "}
                <div className="text-sm font-medium leading-5 text-ibl1">
                  Yes
                </div>{" "}
                <div className="text-sm font-medium leading-5 text-ibl1">
                  2345678
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  iuytr
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  123456789:ABCdefGhijkLMNoPQRStu
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  olkoiu765
                </div>
                <div className="text-sm font-medium leading-5 text-ibl1">
                  89:ABCdefGhijkLMNoPQRStu
                </div>
              </div>
            </div>
            <div className="flex ml-[20px] gap-[105px] mt-[20px]">
              <div className="text-sm font-medium leading-5 text-ibl1">
                Data File
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-sm font-medium leading-5 text-ign7 underline cursor-pointer">
                  Data Excel Sheet
                </div>
                <div className="text-[10px] font-medium leading-5 text-ibl28 cursor-pointer">
                  Preview
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between p-4">
            <div
              className="text-ibl1 px-4 py-2 rounded cursor-pointer text-[16px] font-medium leading-5"
              onClick={handleBack}
              disabled={step === 0}
            >
              Back
            </div>
            <CustomButton
              className="!w-[100px] !h-10"
              onClick={handleNext}
              disabled={step === 2}
              label={step === 2 ? "Save" : "Next"}
            ></CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}

ProjectSummary.propTypes = {
  handleBack: PropTypes.func,
  step: PropTypes.func,
  handleNext: PropTypes.func,
};
