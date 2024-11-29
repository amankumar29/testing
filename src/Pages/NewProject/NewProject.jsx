import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import InputField from "../../Components/Atoms/InputField/InputField";
import NewProjectApplicationModal from "../../Components/Molecules/NewProjectApplicationModal/NewProjectApplicationModal";
import styles from "./NewProject.module.scss";
// import { createSpreadsheet } from "../../Services/API/Spreadsheet/Spreadsheet";
// import {
//   createProject,                       // fo feature reference we need this
//   deleteWorkbook,
// } from "../../Services/API/CreateProject/CreateProject";
import TextLink from "Components/Atoms/TextLink/TextLink";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import {
  useCreateApplicationMutation,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectListQuery,
  useLazyGetProjectListQuery,
  useEmailNotificationMutation
} from "Services/API/apiHooks";
import { useContext } from "react";
import { WebsocketContext } from "Services/Socket/socketProvider";
import { useDispatch, useSelector } from "react-redux";
import {
  setGetAllProjects,
  setProjectList,
} from "Store/ducks/projectListSlice";
import textEllipsis from "../../Helpers/TextEllipsis/TextEllipsis";

export default function NewProject() {
  const location = useLocation();
  const projectNavigation = location?.state?.projectScreen;
  const navigate = useNavigate();
  const [openAddApplicationModal, setOpenAddApplicationModal] = useState(false);
  const [displayModalName, setDisplayModalName] = useState(false);
  const [applicationData, setApplicationData] = useState([]);
  const [initialValues, setInitialValues] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [projectCreateDisable, setProjectCreateDisable] = useState(false);
  const [createProject] = useCreateProjectMutation();
  const [createApplication] = useCreateApplicationMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [projectApplicationModalOpen, setProjectApplicationModalOpen] =
    useState(false);
  const dispatch = useDispatch();
  const paramValue = location?.state?.paramType;
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const {socket} =  useContext(WebsocketContext)

  const { data: projectData, refetch } = useGetProjectListQuery({});
  const { defaultApplication ,userDetails} = useSelector((state) => state?.userDetails);
  const [emailNotification] = useEmailNotificationMutation();

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     // Manually trigger the query
  //     refetch();
  //   }
  // }, [isAuthenticated, refetch]);
  const [getProjectDetails] = useLazyGetProjectListQuery();

  const handleOpenModal = () => {
    setIsEdit(false); // Reset isEdit to false when adding new application
    setOpenAddApplicationModal(true);
    setInitialValues([]);
    setProjectApplicationModalOpen(true);
    setDisplayModalName(false);
  };

  const handleCloseModal = () => {
    setOpenAddApplicationModal(false);
  };

  const handleCreate = async (values) => {
    setProjectCreateDisable(true);
    const payload = {
      name: values?.projectName,
      description: values?.reason,
    };
    try {
      const data = await createProject(payload).unwrap();

      if (data) {
        const payload = applicationData?.map(({ selectedOption, selectedVideoRecording, selectedScreenshot, emailId, components, retryTestFail, ...rest }) => ({
            ...rest,
            projectId: data?.results?._id, // for each object we have to pass this id
            type: selectedOption?.type, // type we have to pass in the payload instead of selectedoption
            isActive: true,
            appSettings: {
              videoRecord: selectedVideoRecording,
              screenShotType: selectedScreenshot,
            },
            retryCount: retryTestFail,
            channels: {
              email: emailId,
              reportDelivery: components?.map((item) => ({
                type: item?.reportDelivery?.type ?? "",
                spec: {
                  tokenId: item?.reportToken,
                  chatId: item?.reportChatID,
                },
              })),
            },
          })
        );
        await createApplication(payload)
          .unwrap()
          .then(async (res) => {
            if (res) {
              const applicationIds = res?.results?.map((app) => {
                return(
                  {
                    _id:app?._id,
                    name : app?.name,
                    isActive:app?.isActive,
                    isDefault:app?.isDefault || false,
                    type:app?.type,
                    appData:{
                      dataproviderId:app?.appData?.dataproviderId
                    }
                  }
                )
              })
              const userIds = res?.results?.flatMap(appuser => {
                return appuser.userIds
                    .filter(user => user.name)
                    .map(userId => ({
                        userName: userId?.name,
                        email: userId?.email,
                        roleId: userId?.userRole,
                        isActive:userId?.isActive,
                        _id:userId?._id
                    }));
              })
              const socketPayload = {
                _id: data?.results?._id,
                name: data?.results?.name,
                organizationId: data?.results?.organizationId,
                description: data?.results?.description,
                isActive:  data?.results?.isActive,
                owner: data?.results?.owner,
                userIds:userIds,
                applicationIds: applicationIds,
                createdBy: data?.results?.createdBy,
                updatedBy: data?.results?.createdBy,
                isDefault: data?.results?.isDefault,
                createdAt: data?.results?.createdAt,
                updatedAt: data?.results?.updatedAt
              }
            socket.emit('onProjects',{
              command:"projectCreate",
              organizationId:data?.results?.organizationId,
              data:socketPayload
            })

            try{
              emailNotification(
                {
                  fromUser: {
                    firstName: userDetails?.firstName,
                    lastName: userDetails?.lastName,
                    email: userDetails?.email
                  },
                  type: 'projectCreation',
                  projectId: defaultApplication?.projectId,
                  applicationId: defaultApplication?.id,
                }
              ).then((res) => {
                toast.success(res?.data?.message);
              })
            }catch(error){
              toast.error(error?.response?.data?.details);
            }

              const list = await getProjectDetails().unwrap();
              if (list) {
                dispatch(setProjectList(list?.results));
                dispatch(setGetAllProjects(list?.results?.projects));
                if (projectNavigation) {
                  navigate("/projects", { replace: true });
                } else {
                  navigate(`/projects/${paramValue}`, { replace: true });
                }
              }
              toast.success(data?.message);
              setProjectCreateDisable(false);
            }
          })
          .catch(async (err) => {
            toast.error(err?.data?.details);
            const delData = await deleteProject(data?.results?._id).unwrap();
            if (delData) {
              toast.success(data?.message);
            }
          });
      }
    } catch (err) {
      const message =
        err?.data?.details === "Project is already with given name"
          ? "Project already exists !"
          : err?.data?.details;
      toast.error(message);
      setProjectCreateDisable(false);
    }
  };

  useEffect(() => {
    if (projectData) {
      dispatch(setProjectList(projectData.results));
      dispatch(setGetAllProjects(projectData.results.projects));
    }
  }, [refetch]);

  const handleAddApplicationData = (newValue) => {
    if (isEdit) {
      setApplicationData((prevData) =>
        prevData?.map((item, index) => (index === editIndex ? newValue : item))
      );
    } else {
      setApplicationData((prevData) => [...prevData, newValue]);
    }
    handleCloseModal();
  };

  const handleDelete = (index) => {
    setApplicationData((prevData) => prevData?.filter((_, i) => i !== index));
  };

  const handleEditApplication = (item, index) => {
    setOpenAddApplicationModal(true);
    setDisplayModalName(true);
    setInitialValues(item);
    setEditIndex(index);
    setIsEdit(true);
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  const formik = useFormik({
    initialValues: {
      projectName: "",
      reason: "",
    },
    validationSchema: Yup.object().shape({
      projectName: Yup.string()
        .test("no-emojis", "Project name cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Project name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .min(2, "Project name must be at least 2 characters.")
        .max(50, "Project name must be at most 50 characters.")
        .matches(
          /^[a-zA-Z0-9_.\- ]+$/,
          "Enter only letters, numbers, _, -, ., and spaces."
        ),
      reason: Yup.string().matches(/^(?!\s+$)/, "Spaces are not allowed."),
    }),
    onSubmit: handleCreate,
  });

  const handleNavigation = () => {
    if (projectNavigation) {
      navigate("/projects", { replace: true });
    } else {
      navigate(`/projects/${paramValue}`, { replace: true });
    }
  };

  return (
    <>
      <div
        className={`flex flex-col ${styles.scroll} px-1 mdMax:h-[calc(100vh-155px)] md:h-[calc(100vh-165px)]`}
      >
        <div className="flex flex-col gap-4">
          <div className="md:flex justify-between mt-[5px]">
            <div
              className="flex items-center gap-4 cursor-pointer mdMax:mb-4"
              onClick={() => {
                handleNavigation();
              }}
            >
              <div data-testid="arrow_back_icon">
                <ArrowBackIcon />
              </div>
              <div
                className="text-[20px] font-medium leading-7 text-igy1"
                data-testid="add_new_project"
              >
                Add New Project
              </div>
            </div>
            <div className="flex gap-2">
              <CustomButton
                onClick={() => {
                  formik.resetForm();
                  if (projectNavigation) {
                    navigate("/projects", { replace: true });
                  } else {
                    navigate(`/projects/${paramValue}`, { replace: true });
                  }
                }}
                label="Cancel"
                className="w-[162px] h-10 !text-ibl3 bg-iwhite border border-ibl1 hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1"
              />
              <CustomButton
                label="Create"
                isFocused
                onClick={() => {
                  formik.handleSubmit();
                }}
                disable={
                  !formik.isValid ||
                  !formik.dirty ||
                  applicationData?.length === 0 ||
                  projectCreateDisable
                }
              />
            </div>
          </div>
          <div>
            <div className="flex flex-col">
              {/* Project Information */}
              <div
                className={`bg-iwhite w-full h-auto p-5 md:p-10 ${styles.stepsContainer}`}
              >
                <div className="text-[20px] font-medium leading-7">
                  Project Information
                </div>
                <div className="mt-5 md:mt-10">
                  <div className="gap-8 lg:flex">
                    <InputField
                      label="Project Name"
                      id="project"
                      name="project"
                      placeHolder="Enter your project name"
                      className="lg:w-[352px] h-[52px]"
                      isRequired={true}
                      {...formik.getFieldProps("projectName")}
                      error={
                        formik.touched.projectName && formik.errors.projectName
                      }
                    />
                    <div className="lgMax:mt-[15px]">
                      <InputField
                        label="Description"
                        placeHolder="Enter the description (Optional)"
                        className="h-[52px] md:min-w-[400px] xl:w-[680px] resize-none"
                        charLimit={300}
                        id="reason"
                        name="reason"
                        showCharCount={true}
                        {...formik.getFieldProps("reason")}
                        onBlur={() => formik.setFieldTouched("reason", true)}
                        error={formik.touched.reason && formik.errors.reason}
                        max_Length={300}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Application Information */}
              <div
                className={`application-info w-full h-auto flex flex-col mt-8 bg-iwhite p-5 md:p-10 ${styles.stepsContainer}`}
              >
                <div className="text-[20px] font-medium leading-7">
                  Application Information
                </div>
                <div className="h-[44px] rounded-[8px] bg-ibl12 mt-[18px]">
                  <div className="flex items-center px-5 gap-[10px] md:gap-[166px] mt-[11px]">
                    <div className="text-sm font-medium leading-5 text-ibl1">
                      Type
                    </div>
                    <div className="text-sm font-medium leading-5 text-ibl1">
                      Application Name
                    </div>
                  </div>
                </div>

                {/* Add Application */}
                {applicationData?.length === 0 ? (
                  <div className={`mt-[24px]`}>
                    <p className="mb-6">
                      Please click on the{" "}
                      <span className="text-[#052C85] font-bold">
                        'Add New Application'
                      </span>{" "}
                      button to initiate the process of adding a new
                      application.
                    </p>
                  </div>
                ) : (
                  applicationData?.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className={`w-[1144px] h-[56px] mt-4 rounded-lg ${styles.stepsContainer}`}
                      >
                        <div className="flex justify-between items-center mt-[17.5px]">
                          <div className="ml-[20px] flex items-center justify-center gap-[130px]">
                            <div className="min-w-[70px]">
                              {item?.selectedOption?.name}
                            </div>
                            <>
                              <div className="cursor-pointer">
                                <div
                                  data-tooltip-id="aplicationName"
                                  data-tooltip-content={
                                    item?.name?.length > 30 ? item?.name : ""
                                  }
                                >
                                  {textEllipsis(item?.name, 30)}
                                </div>
                              </div>
                              <Tooltip
                                id="aplicationName"
                                place="top"
                                className="!text-[11px] max-w-[300px] break-all !text-left"
                              />
                            </>
                          </div>
                          <div className="flex justify-center items-center gap-[47px] mr-[33px]">
                            <div
                              onClick={() => {
                                handleEditApplication(item, index);
                              }}
                              className="cursor-pointer"
                            >
                              <TextLink label="Edit" className="!text-sm" />
                            </div>
                            <div
                              onClick={() => handleDelete(index)}
                              className="cursor-pointer"
                            >
                              <TextLink label="Delete" className="!text-sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <CustomButton
                  className={`font-medium leading-6 w-[233px] ${
                    applicationData?.length > 0 && "mt-8"
                  }`}
                  label="Add New Application"
                  isAddBtn={true}
                  onClick={() => {
                    handleOpenModal();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <NewProjectApplicationModal
        onClick={handleCloseModal}
        isOpen={openAddApplicationModal}
        onClose={handleCloseModal}
        addedValues={handleAddApplicationData}
        initialValues={initialValues}
        isEdit={isEdit}
        projectApplicationModalOpen={projectApplicationModalOpen}
        displayModalName={displayModalName}
      />
    </>
  );
}

NewProject.propTypes = {
  addedApplications: PropTypes.array,
};
