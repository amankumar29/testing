import React from "react";
import PropTypes from "prop-types";
import { HBar } from "../Bars/Bars";
import CheckIcon from "@mui/icons-material/Check";

export default function HorizontalStepper({
  stepNumber = "",
  label = "",
  lineStep = false,
  stepCheck = false,
  stepActive = false,
  onClick = () => {},
  step,
}) {
  //OnClick condition
  const onStepClick = () => {
    if (stepCheck) {
      onClick();
    }
  };
  return (
    <div className="flex items-center">
      <div
        onClick={onStepClick}
        className={`flex flex-col items-center ${
          !(stepActive || !stepCheck) && "cursor-pointer"
        }`}
      >
        {stepCheck ? (
          <div className="flex justify-center items-center">
            <HBar
              className={`w-10 rounded-none h-[2px] bg-ibl1
               ${stepNumber == "01" && "opacity-0"}`}
            />
            <div className="bg-ibl1 border-2 border-solid border-ibl2 rounded-full text-iwhite">
              <CheckIcon />
            </div>
            <HBar
              className={`w-10 rounded-none h-[2px] bg-ibl1 ml-1.5
             ${stepNumber == "02" && "opacity-0"}`}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <HBar
              className={`w-10 rounded-none h-[2px] mr-1.5 ${
                step == 1 ? "bg-ibl1" : "bg-ibl2"
              } ${stepNumber == "01" && "opacity-0"}`}
            />

            <div
              className={`border-2 rounded-full font-semibold text-[12px]  w-[28px] h-[28px] ${
                !stepActive || stepCheck
                  ? `border-ibl2 text-igy1 bg-iwhite`
                  : `border-ibl2 text-iwhite bg-ibl3`
              } text-center flex items-center justify-center`}
            >
              {stepNumber}
            </div>

            <HBar
              className={`w-10 rounded-none h-[2px] ml-1.5 ${
                stepCheck ? "bg-ibl1" : "bg-ibl2"
              } ${stepNumber == "02" && "opacity-0"}`}
            />
          </div>
        )}
        <div
          className={`text-sm mt-2.5 font-semibold ${
            !stepActive || stepCheck ? `text-ibl1` : `border-cm3 text-ibl3`
          }`}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

HorizontalStepper.propTypes = {
  stepNumber: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
  lineStep: PropTypes.bool,
  stepCheck: PropTypes.bool,
  stepActive: PropTypes.bool,
};
