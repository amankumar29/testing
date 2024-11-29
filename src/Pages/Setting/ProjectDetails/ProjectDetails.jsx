import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChipTitle from "../../../Components/Atoms/ChipTitle/ChipTitle";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import Configuration from "./Configuration";
import PageObjectModel from "./PageObjectModel";
import { motion } from "framer-motion";
import GlobalVariable from "./GlobalVariable";

export default function ProjectDetails() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [appName, setAppName] = useState("");

  const tabs = [
    {
      label: "Configurations",
      step: 0,
      icon: <SpaceDashboardOutlinedIcon fontSize="medium" />,
      path: "config",
    },
    {
      label: "POM",
      step: 1,
      icon: <SpaceDashboardOutlinedIcon fontSize="medium" />,
      path: "pom",
    },
    {
      label: "Global Variable",
      step: 2,
      icon: <SpaceDashboardOutlinedIcon fontSize="medium" />,
      path: "globalvariable",
    },
  ];
  const getTabClass = (path) =>
    step === path
      ? "font-semibold px-2 border-b-[3px] border-ibl1 text-ibl1"
      : "px-2 text-ibl2 cursor-pointer font-semibold hover:text-ibl1";

  const handleNaviagteProjectList = () => {
    navigate(`/setting/project-list`);
  };

  const handleChange = (step, path) => {
    setStep(step);
    navigate(path);
    localStorage.setItem("currentStep", step);
  };

  useEffect(() => {
    const savedStep = localStorage.getItem("currentStep");
    if (savedStep !== null) {
      const parsedStep = Number(savedStep);
      setStep(parsedStep);
      const tab = tabs.find((t) => t?.step === parsedStep);
      if (tab) {
        navigate(tab.path);
      }
    }
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem("name");
    const savedApplicationName = localStorage.getItem("applicationName");

    if (savedName && savedApplicationName) {
      setProjectName(savedName);
      setAppName(savedApplicationName);
    }
  }, []);

  return (
    <div className="p-6 rounded-2xl bg-iwhite shadow-[0_0px_4px_0_rgba(12,86,255,0.72)] w-full mb-4 mdMax:h-auto h-[calc(100vh-210px)]">
      <div className="flex flex-row items-center mb-[30px] flex-shrink-0">
        <div className="cursor-pointer">
          <ChipTitle
            label={"Projects"}
            className="cursor-pointer"
            onClick={handleNaviagteProjectList}
          />
        </div>
        <ArrowForwardIosIcon className="mx-4 text-ibl1" fontSize="small" />
        <p className="line-clamp-2">{projectName}</p>
        <ArrowForwardIosIcon className="mx-4 text-ibl1" fontSize="small" />
        <p className="line-clamp-2">{appName}</p>
      </div>
      <div className="flex gap-6 mb-3">
        {tabs.map((tab) => (
          <motion.div
            key={tab.path}
            className={getTabClass(tab.step)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleChange(tab.step, tab.path)}
          >
            <span
              data-testid={`tab_label_${tab.label}`}
              className={`${
                step === tab.step ? "pointer-events-none" : "cursor-pointer"
              } flex gap-1 items-center mb-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </span>
          </motion.div>
        ))}
      </div>
      <div className="w-full -mt-3 border-t text-ibl7"></div>
      {step === 0 && <Configuration />}
      {step === 1 && <PageObjectModel />}
      {step === 2 && <GlobalVariable />}
    </div>
  );
}
