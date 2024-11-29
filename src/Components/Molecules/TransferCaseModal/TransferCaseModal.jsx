import CloseIcon from "@mui/icons-material/Close";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import SearchDropdown from "../../Atoms/SearchDropdown/SearchDropdown";
import { getProjectInfo } from "../../../Services/API/ProjectInfo/ProjectInfo";
import {
  getProjectsList,
  getTestSuiteDetailsTransfer,
} from "../../../Services/API/Projects/Projects";
import { transferTestCase } from "../../../Services/API/TestCase/TestCase";
import { toast } from "react-toastify";
import SelectDropdown from "../../Atoms/SelectDropdown/SelectDropdown";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useStore } from "react-redux";
import { WebsocketContext } from "Services/Socket/socketProvider";

export default function TransferCaseModal({
  onClick,
  testRowId,
  selectedAppn,
  clearValues = () => {},
  testSuiteId,
  paramType,
  transferData
}) {
  const [projectList, setProjectList] = useState([]);
  const [applicationList, setApplicationList] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [valueDropdownType, setValueDropdownType] = useState(null);
  const {socket} =  useContext(WebsocketContext)
  const currentStore = useStore()
  const {userDetails,defaultApplication} = currentStore?.getState()?.userDetails

  const handleTransfer = (values) => {
    const payload = {
      testCaseId: testRowId,
      projectId: values?.projectName?.id,
      applicationId: values?.applicationType?.id,
      transferType: values?.transferType?.value,
    };

    const testSuiteTransferPayload = {
      testCaseId: testRowId,
      projectId: values?.projectName?.id,
      applicationId: values?.applicationType?.id,
      transferType: values?.transferType?.value,
      // ...(paramType === "suite-test-cases" && { test_suite_id: testSuiteId }),
    };

    if (paramType === "suite-test-cases") {
      getTestSuiteDetailsTransfer(testSuiteTransferPayload)
        .then((res) => {
          const data = res?.data?.message;
          socket.emit('onTestcases',{
            command:"testCaseTransfer",
            organizationId:userDetails?.organizationId,
            user:{
              userName:userDetails?.userName,
              userId:userDetails?.userId
            },
            data:{
              targetProjectId: values?.projectName?.id,
              targetApplicationId: values?.applicationType?.id,
              data:res?.data?.results
            }
          })
          toast.success(data);
          onClick();
          transferData()
        })
        .catch((err) => {
          console.log(err);
          const errMsg = err?.response?.data?.details;
          toast.error(errMsg);
        });
    } else {
      transferTestCase(payload)
        .then((res) => {
          const data = res?.data?.message;
          socket.emit('onTestcases',{
            command:"testCaseTransfer",
            organizationId:userDetails?.organizationId,
            user:{
              userName:userDetails?.userName,
              userId:userDetails?.userId
            },
            data:{
              targetProjectId: values?.projectName?.id,
              targetApplicationId: values?.applicationType?.id,
              data:res?.data?.results
            }
          })
          toast.success(data);
          onClick();
        })
        .catch((err) => {
          console.log(err);
          const errMsg = err?.response?.data?.details;
          toast.error(errMsg);
        });
    }
  };

  const formik = useFormik({
    initialValues: {
      projectName: null,
      applicationType: null,
      transferType: null,
    },
    validationSchema: Yup.object().shape({
      projectName: Yup.object().required("Project Name is Required"),
      applicationType: Yup.object().required("Application Type is Required"),
      transferType: Yup.object().required("Transfer Type is Required"),
    }),
    onSubmit: (values) => {
      handleTransfer(values);
    },
  });

  const handleOptionClick = (option) => {
    setValueDropdownType(option);
    formik.setFieldValue("transferType", option);
  };

  const getAllprojectList = () => {
    getProjectsList().then((res) => {
      const projectList = res?.data?.results;
      const updatedProjectList = projectList?.projects?.map((item) => {
        return {
          id: item?._id,
          keyword_name: item?.name,
          defaultApplication: item?.applicationIds,
        };
      });
      setProjectList(updatedProjectList);
      if (selectedProject?.id) {
        getAllApplicationList();
      }
    });
  };

  const getAllApplicationList = () => {
    const payload = {
      id: selectedProject?.id,
    };
    getProjectInfo(payload).then((res) => {
      const applicationList = res?.data?.results;

      const updatedApplicationList = applicationList?.map((item) => {
        return {
          id: item?._id,
          keyword_name: item?.name,
          type: item?.type,
        };
      });
      const withOutCurrentApplication = updatedApplicationList?.filter(
        (each) => each?.id !== selectedAppn?.id
      );

      setApplicationList(withOutCurrentApplication);
    });
  };

  const handleProjectSelect = (option) => {
    formik.setFieldValue("projectName", option);
    setSelectedProject(option);
    setApplicationList([]); // Clear the application list when a new project is selected
    setSelectedApplication(null) // Reset the selected application
  };

  const handleApplicationSelect = (option) => {
    formik.setFieldValue("applicationType", option);
    setSelectedApplication(option);
  };

  useEffect(() => {
    getAllprojectList();
  }, [selectedProject]);

  return (
    <div className="flex justify-center items-center w-auto h-full">
      <div className="w-full md:w-[626px] h-[534px] rounded-2xl shadow-2xl">
        <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[10px]">
          <div className="w-[420px] h-[80px]  flex justify-between items-center">
            <div
              className="text-[18px] font-medium leading-7 mdMax:w-[calc(100%-55px)] mdMax:ml-6"
              data-testid="transfer_test_case"
            >
              Transfer Test Case
            </div>

            <div className="flex justify-end !pr-6" data-testid="close_icon">
              <CloseIcon onClick={onClick} className="cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="relative !pt-[28px] !px-[20px] md:!px-[48px]">
          <div className="relative z-40">
            <div className="absolute top-0 left-0 w-full">
              <div className="md:flex justify-between items-start shedular-min">
                <div className="flex items-center md:h-[52px]">
                  <span
                    className="text-sm font-medium leading-5"
                    data-testid="select_project_name"
                  >
                    Project Name <span className="text-ird3">*</span>
                  </span>
                </div>

                <SearchDropdown
                  option={projectList}
                  placeHolder="Select Project"
                  className="h-[52px] w-[320px]"
                  selectedOption={selectedProject}
                  onSelect={handleProjectSelect}
                  isEditable={true}
                  hideCross={true}
                  onBlur={() => {
                    formik.setFieldTouched("projectName", true);
                  }}
                  error={
                    formik.touched.projectName && formik.errors.projectName
                  }
                />
              </div>
            </div>
          </div>
          <div className="relative z-30">
            <div className="absolute top-[100px] left-0 w-full">
              <div className="md:flex justify-between items-start shedular-min">
                <div className="flex items-center md:h-[52px]">
                  <span
                    className="text-sm font-medium leading-5"
                    data-testid="select_application_type"
                  >
                    Application Type <span className="text-ird3">*</span>
                  </span>
                </div>
                <SearchDropdown
                  option={applicationList}
                  placeHolder="Select Application"
                  className="h-[52px] w-[320px]"
                  selectedOption={selectedApplication}
                  onSelect={handleApplicationSelect}
                  isEditable={true}
                  hideCross={true}
                  onBlur={() => {
                    formik.setFieldTouched("applicationType", true);
                  }}
                  error={
                    formik.touched.applicationType &&
                    formik.errors.applicationType
                  }
                />
              </div>
            </div>
          </div>
          <div className="relative z-20">
            <div className="absolute top-[200px] left-0 w-full">
              <div className="md:flex justify-between items-start">
                <div className="flex items-center md:h-[52px]">
                  <span
                    className="text-sm font-medium leading-5"
                    data-testid="transfer_type"
                  >
                    Transfer Type <span className="text-ird3">*</span>
                  </span>
                </div>
                <SelectDropdown
                  inputClassName="text-[14px]"
                  id="transferType"
                  className="h-[52px] md:w-[320px]"
                  options={typeOptions}
                  placeHolder="Select Transfer Type"
                  value={valueDropdownType}
                  onChange={handleOptionClick}
                  onBlur={() => {
                    formik.setFieldTouched("transferType", true);
                  }}
                  error={
                    formik.touched.transferType && formik.errors.transferType
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center gap-7 mt-[340px] mb-[48px]">
            <div className="flex gap-2">
              <CustomButton
                label="Cancel"
                className="w-[218px] h-[52px] !text-ibl3 bg-iwhite border border-ibl1  hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1"
                onClick={onClick}
              />
              <CustomButton
                onClick={formik.handleSubmit}
                className="w-[218px] h-[52px]"
                label="Transfer"
                isFocused
                disable={!formik.isValid || !formik.dirty}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

TransferCaseModal.propTypes = {
  onClick: PropTypes.func.isRequired,
  testRowId: PropTypes.string.isRequired,
  clearValues: PropTypes.func,
  selectedAppn: PropTypes.array,
};

const typeOptions = [
  { id: 1, name: "Copy", value: "COPY"},
  { id: 2, name: "Move", value: "MOVE" },
];
