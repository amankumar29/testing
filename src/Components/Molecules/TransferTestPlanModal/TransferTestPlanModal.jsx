import CloseIcon from "@mui/icons-material/Close";
import SearchDropdown from "../../Atoms/SearchDropdown/SearchDropdown";
import { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import PropTypes from "prop-types";
import {
  getProjectsList,
  transferTestSuite,
} from "../../../Services/API/Projects/Projects";
import { getProjectInfo } from "../../../Services/API/ProjectInfo/ProjectInfo";
import { transferTestPlan } from "../../../Services/API/TestPlans/TestPlans";
import { toast } from "react-toastify";
import { WebsocketContext } from "Services/Socket/socketProvider";
import { useStore } from "react-redux";

const TransferTestPlanModal = ({
  onClick,
  testPlanRowId,
  selectedAppn,
  type,
}) => {
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [applicationList, setApplicationList] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const {socket} =  useContext(WebsocketContext)
  const currentStore = useStore()
  const {userDetails,defaultApplication} = currentStore?.getState()?.userDetails

  const handleProjectSelect = (option) => {
    formik.setFieldValue("projectName", option);
    setSelectedProject(option);
  };

  const formik = useFormik({
    initialValues: {
      projectName: null,
      applicationType: null,
    },
    validationSchema: Yup.object().shape({
      projectName: Yup.object().required("Project Name is Required"),
      applicationType: Yup.object().required("Application Type Required"),
    }),
    onSubmit: (values) => {
      handleTransfer(values);
    },
  });

  const handleTransfer = (values) => {
    const payload = {
      originalTestSuiteId: testPlanRowId,
      targetProjectId: values?.projectName?.id,
      targetApplicationId: values?.applicationType?.id,
    };
    if (type === "test-scheduler") {
      transferTestPlan(payload)
        .then((res) => {
          const message = res?.data?.message;
          toast.success(message);
          onClick("api");
        })
        .catch((error) => {
          const errmsg = error?.response?.data?.details;
          toast.error(errmsg || "Not Allowed For Transfer");
          onClick("api");
        });
    } else if (type === "test-suites") {
      transferTestSuite(payload)
        .then((res) => {
          const message = res?.data?.message;
          socket.emit('onTestsuites',{
            command:"testSuiteTransfer",
            organizationId:userDetails?.organizationId,
            user:{
              userName:userDetails?.userName,
              userId:userDetails?.userId
            },
            data:{
              targetProjectId: values?.projectName?.id,
              targetApplicationId: values?.applicationType?.id,
              data:res?.data?.results[0]
            }
          })
          toast.success(message);
          onClick("api");
        })
        .catch((error) => {
          const errmsg = error?.response?.data?.details;
          toast.error(errmsg || "Not Allowed For Transfer");
          onClick("api");
        });
    }
  };

  const getAllprojectList = () => {
    const payload = { withoutPagination: true };
    getProjectsList(payload).then((res) => {
      const projectList = res?.data?.results?.projects;
      const updatedProjectList = projectList?.map((item) => {
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

  const handleApplicationSelect = (option) => {
    formik.setFieldValue("applicationType", option);
    setSelectedApplication(option);
  };

  useEffect(() => {
    getAllprojectList();
  }, [selectedProject]);

  return (
    <div className="flex justify-center items-center w-auto h-full">
      <div className="w-[626px] h-[424px] rounded-2xl shadow-2xl">
        <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[16px]">
          <div className="w-[393px] h-[80px]  flex justify-between items-center">
            <div
              className="text-[18px] font-medium leading-7"
              data-testid="transfer_test_case"
            >
              {type === "test-suites"
                ? "Transfer Test Suite"
                : "Transfer Test Plan"}
            </div>

            <div className="flex justify-end !pr-7" data-testid="close_icon">
              <CloseIcon
                onClick={() => onClick("modal")}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div className="relative !pt-[28px] !px-[48px]">
          <div className="relative z-40">
            <div className="absolute top-0 left-0 w-full">
              <div className="flex justify-between items-start">
                <div className="flex items-center h-[52px]">
                  <span
                    className="text-sm font-medium leading-5 text-iblack"
                    data-testid="select_project_name"
                  >
                    Select Project Name <span className="text-ird3">*</span>
                  </span>
                </div>

                <SearchDropdown
                  option={projectList}
                  placeHolder="Select Project"
                  className="h-[52px] w-[320px] mt-0"
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
              <div className="flex justify-between items-start">
                <div className="flex items-center h-[52px]">
                  <span
                    className="text-sm font-medium leading-5"
                    data-testid="select_application_type"
                  >
                    Select Application Type <span className="text-ird3">*</span>
                  </span>
                </div>
                <SearchDropdown
                  option={applicationList}
                  placeHolder="Select Application"
                  className="h-[52px] w-[320px] mt-0"
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
          <div className="flex justify-center items-center mt-[220px] mb-[48px] pr-[18px]">
            <div className="flex gap-5">
              <CustomButton
                label="Cancel"
                className="w-[218px] h-[52px] !text-ibl1 !text-base !font-medium !leading-5 bg-iwhite border border-ibl1  hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1 rounded-xl"
                onClick={() => onClick("modal")}
              />
              <CustomButton
                onClick={formik.handleSubmit}
                className="w-[218px] h-[52px] !text-base !font-medium !leading-5 rounded-xl"
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
};

export default TransferTestPlanModal;

TransferTestPlanModal.propTypes = {
  onClick: PropTypes.func.isRequired,
  testPlanRowId: PropTypes.number,
  selectedAppn: PropTypes.number,
  type: PropTypes.string,
};
