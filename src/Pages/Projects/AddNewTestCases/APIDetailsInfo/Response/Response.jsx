import React, { useState } from "react";
import { motion } from "framer-motion";
import ResponseBody from "../ResponseBody/ResponseBody";
import ResponseHeader from "../ResponseHeader/ResponseHeader";

const Response = ({ response }) => {
  const [step, setStep] = useState(0);
  const timeInMs = 875;
  const tabs = [
    {
      label: "Response Body",
      step: 0,
    },
  ];

  const getTabClass = (path) =>
    step === path
      ? "font-semibold border-b-[3px] border-ibl1 text-ibl1"
      : "text-ibl2 cursor-pointer font-semibold hover:text-ibl1";

  const handleChange = (step) => {
    setStep(step);
  };

  const formatTime = (time) => {
    if (time < 1000) {
      return `${time} ms`;
    }
    return `${(time / 1000).toFixed(2)} s`;
  };

  return (
    <div className="px-4 pt-2 pb-3">
      <div className="flex gap-4 text-igy1 text-sm leading-[22px] font-normal">
        <div>
          <span>Status: </span> {response?.status}
        </div>
        <div>
          <span>Time: </span> {formatTime(timeInMs)}
        </div>
        <div>
          <span>Size: </span> {"183 B"}
        </div>
      </div>
      <div className="pt-3 flex gap-4">
        {tabs.map((tab) => (
          <motion.div
            key={tab.path}
            className={getTabClass(tab.step)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleChange(tab.step)}
          >
            <span
              data-testid={`tab_label_${tab.label}`}
              className={`${
                step === tab.step ? "pointer-events-none" : "cursor-pointer"
              } flex gap-1 items-center mb-2`}
            >
              <span>{tab.label}</span>
            </span>
          </motion.div>
        ))}
      </div>
      <div className="">
        {step === 0 && <ResponseBody response={response?.actualResult || {}} />}
      </div>
      {/* <div className="">
        {step === 1 && <ResponseHeader response={response} />}
      </div> */}
    </div>
  );
};

export default Response;
