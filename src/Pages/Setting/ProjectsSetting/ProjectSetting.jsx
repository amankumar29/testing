import { useState, useEffect, useMemo, useContext, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ChipTitle from "../../../Components/Atoms/ChipTitle/ChipTitle";
import { CustomTooltip } from "../../../Components/Atoms/Tooltip/CustomTooltip";
import { Modal } from "../../../Components/Atoms/Modal/Modal";
import ConfirmDeleteModal from "../../../Components/Molecules/ConfirmDeleteModal/ConfirmDeleteModal";
import InputField from "../../../Components/Atoms/InputField/InputField";
import TextArea from "../../../Components/Atoms/TextArea/TextArea";
import { CustomButton } from "../../../Components/Atoms/CustomButton/CustomButton";
import { CircularProgress } from "@mui/material";
import textEllipsis from "Helpers/TextEllipsis/TextEllipsis";
import { Tooltip } from "react-tooltip";
import {
  useGetApplicationCountInfoMutation,
  useGetProjectListQuery,
  useGetUserDataQuery,
  useSetDefaultMutation,
} from "Services/API/apiHooks";
import { useUpdateProjectDetailsByIdMutation, useEmailNotificationMutation } from "Services/API/apiHooks";
import { useDispatch, useSelector } from "react-redux";
import {
  setError,
  setLoading,
  setProjectList,
} from "Store/ducks/projectListSlice";
import { useDeleteProjectByIdMutation } from "Services/API/apiHooks";
import { useDeleteApplicationByIdMutation } from "Services/API/apiHooks";
import { WebsocketContext } from "Services/Socket/socketProvider";

const MAX_SHORT_DESCRIPTION_LENGTH = 70;

const ProjectAccordion = ({ setIsDataPresence }) => {
  const dispatch = useDispatch();
  const [openAccordionIndex, setOpenAccordionIndex] = useState(null);
  const [editModalProject, setEditModalProject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isApplicationDeleteModalOpen, setIsApplicationDeleteModalOpen] =
    useState(null);
  const [projectToDeleteId, setProjectToDeleteId] = useState(null);
  const [plansCount, setPlansCount] = useState([]);
  const [suitesCount, setSuitesCount] = useState([]);
  const [caseCount, setCaseCount] = useState([]);

  const [deleteProjectById, { error: deleteError }] =
    useDeleteProjectByIdMutation();
  const [deleteApplicationById, { error: appDeleteError }] =
    useDeleteApplicationByIdMutation();
  const [applicationToDeleteId, setApplicationToDeleteId] = useState(null);
  const [updateProjectDetails, {isUpdateLoading}] = useUpdateProjectDetailsByIdMutation();
  const {socket} =  useContext(WebsocketContext)
  const {userDetails} =  useSelector((state)=>state?.userDetails)
  const currentStore = useRef()
  const [getUserCount] = useGetApplicationCountInfoMutation();
  const [setDefault] = useSetDefaultMutation();
  const [emailNotification] = useEmailNotificationMutation();

  const {
    data,
    error: apiError,
    isLoading,
    refetch,
  } = useGetProjectListQuery({
    sortDirection: "desc",
    sortColumn: "_id",
    limit: 100,
    offset: 0,
  });

  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
    refetch: refetchUserDetails,
  } = useGetUserDataQuery();
  const {defaultApplication} = useSelector((state)=>state?.userDetails);
  

  const fetchApplicationCount = async (appIds) => {
    const payload = {
      applicationIds: appIds,
    };
    try {
      const data = await getUserCount(payload).unwrap();
      const countData = data?.results;
      setPlansCount(countData?.plansCount);
      setSuitesCount(countData?.suitesCount)
      setCaseCount(countData?.testCasesCount)
    } catch (error) {
      const errMsg = error?.data?.details;
      if (errMsg) {
        toast.error(errMsg);
      }
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  const navigate = useNavigate();

  const projectData = data?.results?.projects;
  const [list,setList] = useState()

  //this useeffect handles when default project is deleted
  // then automatically sets 0th index of project and hit default API
  useEffect(() => {
    const defaultProjectId = defaultApplication?.projectId;
    const projectExists = projectData?.find(project => project._id === defaultProjectId);

    const fetchData = async () => {
      const firstProject = projectData?.[0];
      const projectId = firstProject?._id;
      const applicationId = firstProject?.applicationIds[0]?._id;

      if (projectId && applicationId) {
        const payload = {
          applicationId: applicationId,
          projectId: projectId,
        };
        try {
          const data = await setDefault(payload).unwrap();
          if (data) {
            refetchUserDetails();
            toast.success("Default project and application set successfully");
          }
        } catch (error) {
          toast.error("Failed to switch application");
        }
      }
    };
    if (projectExists?._id !== defaultProjectId ) {
      fetchData();
    }
  }, [projectData, defaultApplication]);


useEffect(()=>{
    // Dispatch loading state
    if (isLoading) {
      dispatch(setLoading(true));
    }

    // Handle API response
    if (data) {
      setList(data?.results?.projects)
      dispatch(setProjectList(data.projects));
      dispatch(setLoading(false));
    }

    // Handle errors
    if (apiError) {
      dispatch(setError(apiError.message));
    }
},[data,apiError,isLoading,dispatch])

  const handleUpdateProject = async (values) => {
    const { id: projectId, name, description } = values;
    const payload = { name, description };

    try {
      await updateProjectDetails({ projectId, payload }).unwrap();
      socket.emit('onProjects',{
        command:"projectUpdate",
        organizationId:userDetails?.organizationId,
        user:{
          userName:userDetails?.userName,
          userId:userDetails?.userId
        },
        data:{name,description,projectId}
      })
      refetch();
      toast.success("Project updated successfully");
      await sendEmailNotification('projectModification');
    } catch (error) {
      toast.error(error.message || "Failed to update project");
    }
  };

  const handleOpenEditModal = (project) => {
    setEditModalProject(project);
  };

  const handleCloseEditModal = () => {
    setEditModalProject(null);
  };

  const handleAccordionToggle = (index, project) => {
    setOpenAccordionIndex(openAccordionIndex === index ? null : index);
    const data = project?.applicationIds?.map((item) => {
      return item._id;
    });

    if (openAccordionIndex === index ? 0 : 180) {
      fetchApplicationCount(data);
    }
  };

  const handleDeleteApplication = async () => {
    const payload = { projectId: projectToDeleteId };
    try {
      await deleteApplicationById({applicationToDeleteId, payload}).unwrap()
      socket.emit('onProjects',{
        command:"appDelete",
        organizationId:userDetails?.organizationId,
        user:{
          userName:userDetails?.userName,
          userId:userDetails?.userId
        },
        data:{
          projectId:projectToDeleteId,
          appId:applicationToDeleteId
        }
      })
      handleCloseEditModal()
      refetch()
      toast.success("Application deleted successfully")
    } catch (error){
      toast.error(appDeleteError || "Deleting application data is not allowed.")
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDeleteId) return;

    try {
      await deleteProjectById(projectToDeleteId).unwrap();
      socket.emit('onProjects',{
        command:"projectDelete",
        organizationId:userDetails?.organizationId,
        user:{
          userName:userDetails?.userName,
          userId:userDetails?.userId
        },
        data:{
          projectId:projectToDeleteId,
        }
      })
      setOpenAccordionIndex(null); 
      refetch(); 
      navigate(`/setting/project-list`);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      toast.success("Project deleted successfully");
      await sendEmailNotification('projectDeletion');
    } catch (error) {
      toast.error(
        deleteError?.data?.message || "Deleting project data is not allowed."
      );
    }
  };

  const handleViewDetails = (
    projectId,
    applicationId,
    name,
    applicationName
  ) => {

     localStorage.setItem('name',name)
     localStorage.setItem('applicationName',applicationName)
     localStorage.setItem("currentStep", 0); // Save step when it changes
    navigate(
      `/setting/project-list/${projectId}/application-details/${applicationId}`,
    );
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleOpenConfirmDelete = (id) => {
    setProjectToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleApplicationDelete = (id, projectId) => {
    setProjectToDeleteId(projectId);
    setApplicationToDeleteId(id);
    setIsApplicationDeleteModalOpen(true);
  };

  const handleCloseApplicationModal = () => {
    setIsApplicationDeleteModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return null;
    return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
  };

  const accordionVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" },
  };

  useEffect(() => {
    if (socket) {
      const handleProjectResponse = async (response) => {
        const sendUser= response?.user
        const {userList} = response?.data

        if(currentStore?.current?.organizationId === response?.organizationId){
          if (response?.command === "projectCreate") {
            setList((prev) => {
              const newItem = response?.data;
              const newData = [...prev, newItem];
              const uniqueData = newData.filter((item, index, self) =>
                  index === self.findIndex((t) => t._id === item._id)
              );
              return uniqueData;
            });
            toast.dismiss()
            toast.success(`Hello Team! ${sendUser?.userName} has created New Project ${response?.data?.name}`)
          }
          if(response?.command === "projectUpdate"){
            const {name,description,projectId} = response?.data
            const olddetails = list?.find((project)=> project?._id == projectId)
            setList((prevItems) =>
              prevItems.map((item) =>
                item._id == projectId ? { ...item, name:name,description:description} : item
              )
            )
            toast.dismiss()
            toast.success(`Hello Team! ${sendUser?.userName} has updated the project name from ${olddetails?.name} to ${name}`)
          }
          if(response?.command === "appDelete"){
            const {projectId,appId} = response?.data
            setList((prevList) => {
              if (prevList && prevList.length > 0) {
                const selectProject = prevList.find(
                  (project) => project?._id === projectId
                );
                if (selectProject) {
                  const updatedList = prevList.map((project) => {
                    if (project._id === projectId) {
                      const updatedApplications = project.applicationIds.filter(
                        (app) => app._id !== appId
                      );
                      return {
                        ...project,
                        applicationIds: updatedApplications,
                      };
                    }
                    return project;
                  });
                  dispatch(setProjectList(updatedList));
                  return updatedList;
                }
              }
              return prevList;
            });
            toast.dismiss();
            toast.success(`Hello Team! ${sendUser?.userName} has deleted an Application in ${projectId} project`)
          }
          if(response?.command === "projectDelete"){
            const {projectId} = response?.data
            const selectProject = list?.find((project)=>project?._id == projectId )
            setList((prevItems) =>
              prevItems.filter((item) => item._id !== projectId)
            )
            toast.dismiss()
            toast.success(`Hello Team! ${sendUser?.userName} has deleted ${selectProject?.name} project`)
          }
          if(response?.command === "inviteUser" && userList?.includes(currentStore?.current?._id)){
            const {project} = response?.data
            const updateProject = {
              ...project,
              userIds:[...project?.userIds,{
                  _id: currentStore?.current?._id,
                  email: currentStore?.current?.email,
                  roleId: currentStore?.current?.roleId,
                  userName: currentStore?.current?.userName,
                  userId: currentStore?.current?.userId
              }]
            }
            setList((prev) => {
              const newData = [...prev, updateProject];
              const uniqueData = newData.filter((item, index, self) =>
                  index === self.findIndex((t) => t._id === item._id)
              );
              return uniqueData;
            });
            toast.dismiss()
            toast.success(`Hello Team! ${sendUser?.userName} has created New Project ${project?.name}`)
          }
          // if(response?.command === "appCreate"){
          //   const { projectId , newAppData } = response?.data;
          //   setList((prevList) => {
          //     if (prevList && prevList.length > 0) {
          //       const selectProject = prevList.find(
          //         (project) => project?._id === projectId
          //       );

          //       if (selectProject) {
          //         const updatedList = prevList.map((project) => {
          //           if (project?._id === projectId) {
          //             const newApplicationsList = [
          //               ...project.applicationIds.filter(app => app?._id !== newAppData?._id),
          //               newAppData
          //             ];
          //             return {
          //               ...project,
          //               applicationIds: newApplicationsList
          //             };
          //           }
          //           return project;
          //         });
          //         dispatch(setProjectList(updatedList));
          //         return updatedList;
          //       }
          //     }
          //     return prevList;
          //   });
          //   toast.dismiss();
          //   toast.success(`Hello Team! ${sendUser?.userName} has Created New Application in ${projectId} project`)
          // }
          if(response?.command === "removeUser"){
            const {applicationId,projectId,deleteUserId} = response?.data
            setList((pre) => {
              return pre.map((item) => {
                  if (item._id === projectId) {
                  const filteredUserIds = item.userIds.filter((user) => user._id !== deleteUserId);
                    if (filteredUserIds.length === 0) {
                      return null;
                    }
                  const filteredApplications = item.applicationIds.filter((app) => app._id !== applicationId);
                    if (filteredApplications.length === 0) {
                      return null;
                    }
                    return {
                      ...item,
                      userIds: filteredUserIds,
                    applicationIds: filteredApplications
                    };
                  }
                  return item;
              }).filter(item => item !== null);
            });
            toast.dismiss()
            toast.success(`Hi ${sendUser?.userName} removed you from ${projectId} project`)
          }
        }
      };
      socket.on("onProjectResponse", handleProjectResponse);
      return () => {
        socket.off("onProjectResponse", handleProjectResponse);
      };
    }
  }, []);

  useEffect(() => {
    currentStore.current = userDetails;
  }, [userDetails]);

  const capitalizeFirstLetter = (string) => {
    if(string === 'IOS'){
      return string?.charAt(0)?.toLowerCase() + string?.slice(1)?.toUpperCase();
    }else{
      return string?.charAt(0)?.toUpperCase() + string?.slice(1)?.toLowerCase();
    }
  }

  const sendEmailNotification = async (type) => {
    try{
      const response = await emailNotification({
        fromUser: {
          firstName: userDetails?.firstName,
          lastName: userDetails?.lastName,
          email: userDetails?.email,
        },
        type,
        projectId: defaultApplication?.projectId,
        applicationId: defaultApplication?.id,
        toAll: true,
      });
      toast.success(response?.data?.message);
    }catch(error){
      toast.error(error?.response?.data?.details);
    }
  }

  return (
    <>
      {isLoading ? (
        <div className="w-full h-[747px] flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="space-y-3 mt-6 mdMax:mt-3">
          {list?.map((project, index) => (
            <div
              key={project?._id}
              className="overflow-hidden bg-white border rounded-xl shadow-iwhite border-ibl29"
            >
              <div
                className={`hover:bg-ibl30 ${
                  openAccordionIndex === index ? "bg-ibl30" : ""
                }`}
              >
                <motion.div
                  className="flex items-center justify-between px-4 py-6 mdMax:px-2 mdMax:py-3 cursor-pointer sm:px-6 md:px-8"
                  onClick={() => handleAccordionToggle(index, project)}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center w-1/4 space-x-4">
                    <motion.div
                      animate={{
                        rotate: openAccordionIndex === index ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiChevronDown className="text-2xl text-[#4A5568]" />
                    </motion.div>
                    <div className="flex items-center">
                      <div className="truncate">
                        <h3 className="text-xl mdMax:text-base font-semibold text-[#2D3748]">
                          <>
                            <div
                              className={` ${
                                project?.name?.length > 21 && "cursor-pointer"
                              }`}
                            >
                              <div
                                data-tooltip-id="test_plan_name"
                                data-tooltip-content={
                                  project?.name?.length > 21
                                    ? project?.name
                                    : ""
                                }
                                className="pl-2"
                              >
                                {textEllipsis(project?.name, 21)}
                              </div>
                            </div>
                            {project?.name?.length > 21 && (
                              <Tooltip
                                id="test_plan_name"
                                place="top"
                                className="!text-[11px] max-w-[300px] break-all !text-left"
                              />
                            )}
                          </>
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/2 truncate">
                    <p className="overflow-hidden text-sm text-center text-igy4 whitespace-nowrap text-overflow-ellipsis pl-9">
                      {openAccordionIndex !== index &&
                        truncateText(
                          project?.description,
                          MAX_SHORT_DESCRIPTION_LENGTH
                        )}
                    </p>
                  </div>
                  <div className="flex items-center justify-end w-1/6 space-x-6">
                    <CustomTooltip
                      title="Edit"
                      placement="bottom"
                      height={"28px"}
                      fontSize="11px"
                      offset={[0, -3]}
                    >
                      <ModeOutlinedIcon
                        className="w-5 h-5 cursor-pointer text-ibl1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(project);
                        }}
                      />
                    </CustomTooltip>
                    <CustomTooltip
                      title="Delete"
                      placement="bottom"
                      height={"28px"}
                      fontSize="11px"
                      offset={[0, -3]}
                    >
                      <span>
                        <RiDeleteBin6Line
                          style={{
                            cursor: "pointer",
                            fontSize: "20px",
                            color: "#F64242",
                          }}
                          className="w-[20px] h-[20px] text-igy6 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenConfirmDelete(project?._id);
                          }}
                        />
                      </span>
                    </CustomTooltip>
                  </div>
                </motion.div>
              </div>

              <AnimatePresence>
                {openAccordionIndex === index && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={accordionVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-full border-t text-ibl7"></div>
                    <div className="flex items-start px-4 py-2 space-x-4 shadow-sm rounded-xl rounded-t-md">
                      <div className="flex w-full">
                        <div className="border-l-4 border-[#121F57] h-auto"></div>
                        <div className="w-full ml-4">
                          <p className="text-[15px] text-[#4A5568] mb-2 leading-6 p-4 break-words">
                            <span className="font-semibold">Description: </span>
                            {project?.description ||
                              "No description available."}
                          </p>

                          <div className="w-full overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E2E8F0]">
                              <thead className="bg-[#385DB0] rounded-full rounded-t-md">
                                <tr>
                                  {[
                                    "ID",
                                    "Application Name",
                                    "Type",
                                    "Test Plan",
                                    "Test Suites",
                                    "Test Cases",
                                    "",
                                  ].map((header, index) => (
                                    <th
                                      key={header}
                                      className={`px-6 py-4 text-left text-sm text-ibl31 uppercase tracking-wider font-semibold
                                    ${index === 1 ? "text-left" : "text-center"}
                                    ${
                                      index === 0
                                        ? "rounded-tl-xl rounded-bl-xl"
                                        : ""
                                    }
                                    ${
                                      index === 6
                                        ? "rounded-tr-xl rounded-br-xl"
                                        : ""
                                    }`}
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody className="bg-white divide-y divide-ibl29">
                                {project?.applicationIds?.map(
                                  (app, appIndex) => {
                                    const plansCountNum = plansCount?.find((item)=>item?._id === app?._id)?.count || 0
                                    const suitesCountNum = suitesCount?.find((item)=>item?._id === app._id)?.count || 0
                                    const testCasesCountNum = caseCount?.find((item)=>item?._id === app?._id)?.count || 0
                                    return (
                                      <>
                                        <motion.tr
                                          key={app?.id}
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: appIndex * 0.1 }}
                                          className={`hover:bg-ibl30 cursor-pointer transition-colors duration-200
                                    ${
                                      appIndex === 0
                                        ? "rounded-tl-xl rounded-bl-xl"
                                        : ""
                                    }
                                    ${
                                      appIndex ===
                                      project?.application?.length - 1
                                        ? "rounded-tr-xl rounded-br-xl"
                                        : ""
                                    }`}
                                          onClick={() =>
                                            handleViewDetails(
                                              project?._id,
                                              app?._id,
                                              project?.name,
                                              app?.name
                                            )
                                          }
                                        >
                                          <td className="px-8 py-6 text-sm text-center whitespace-nowrap">
                                            {app?._id || "N/A"}
                                          </td>
                                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-igy15">
                                            {app?.name || "N/A"}
                                          </td>
                                          <td className="px-8 py-6 text-sm text-center whitespace-nowrap text-igy15">
                                            {capitalizeFirstLetter(app?.type)}
                                          </td>
                                          <td className="px-6 py-4 text-sm text-center whitespace-nowrap text-igy15">
                                            {plansCountNum}
                                          </td>
                                          <td className="px-6 py-4 text-sm text-center whitespace-nowrap text-igy15">
                                            {suitesCountNum}
                                          </td>
                                          <td className="px-6 py-4 text-sm text-center whitespace-nowrap text-igy15">
                                            {testCasesCountNum}
                                          </td>
                                          <td>
                                            {project?.applicationIds?.length >
                                              1 && (
                                              <CustomTooltip
                                                title="Delete"
                                                placement="bottom"
                                                height="28px"
                                                fontSize="11px"
                                                offset={[0, -3]}
                                                className="pr-12"
                                              >
                                                <span>
                                                  <RiDeleteBin6Line
                                                    style={{
                                                      cursor: "pointer",
                                                      fontSize: "20px",
                                                      color: "#F64242",
                                                    }}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleApplicationDelete(
                                                        app?._id,
                                                        project._id
                                                      );
                                                    }}
                                                  />
                                                </span>
                                              </CustomTooltip>
                                            )}
                                          </td>
                                        </motion.tr>
                                      </>
                                    );
                                  }
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <Modal
            isOpen={isApplicationDeleteModalOpen}
            onClose={handleCloseApplicationModal}
          >
            <ConfirmDeleteModal
              isHeight={true}
              onClick={handleCloseApplicationModal}
              fetchUserList={handleDeleteApplication}
              modalMessage={
                "Deleting this application will permanently remove all associated test cases, test suites, and test plans. Do you want to Continue?"
              }
            />
          </Modal>
          <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
            <ConfirmDeleteModal
              isHeight={true}
              onClick={handleCloseDeleteModal}
              fetchUserList={handleDeleteProject}
              modalMessage={
                "Deleting this project will permanently remove all associated applications, test cases, test suites, and test plans. Do you want to Continue?"
              }
            />
          </Modal>
          <UpdateProjectModal
            isOpen={editModalProject !== null}
            onClose={handleCloseEditModal}
            projectData={editModalProject}
            onUpdate={handleUpdateProject}
          />
        </div>
      )}
    </>
  );
};

const ProjectSetting = () => {
  const [isDataPresence, setIsDataPresence] = useState(false);
  return (
    <div className="p-6 rounded-2xl bg-iwhite  mb-4 min-w-1000 tableScroll h-[calc(100vh-220px)] mdMax:h-auto">
      <ChipTitle label="Projects" />
      {!isDataPresence ? (
        <div className="mt-6 mdMax:mt-3">
          <ProjectAccordion setIsDataPresence={setIsDataPresence} />
        </div>
      ) : (
        <p className="flex items-center justify-center h-[290px] font-medium text-sm text-[#767676] italic">
          No active Projects found. Please contact the administrator for
          assistance.
        </p>
      )}
    </div>
  );
};

const UpdateProjectModal = ({ isOpen, onClose, projectData, onUpdate }) => {
  const initialValues = {
    id: projectData?._id || "",
    name: projectData?.name || "",
    description: projectData?.description || "",
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Project Name is required.")
      .min(2, "Project name must be at least 2 characters.")
      .max(50, "Project name must be at most 50 characters.")
      .test("no-emojis", "Invalid project name.", (val) => {
        return !emojiRegex.test(val);
      })
      .matches(/^(?!\s+$)/, "Spaces are not allowed.")
      .matches(
        /^[a-zA-Z0-9_.\- ]+$/,
        "Enter only letters, numbers, _, -, ., and spaces."
      ),
    description: Yup.string().matches(/^(?!\s+$)/, "Spaces are not allowed."),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onUpdate(values);
      handleClose();
    },
    enableReinitialize: true,
  });

  const handleClose = () => {
    onClose();
    formik.resetForm();
  };

  useEffect(() => {
    if (projectData) {
      formik.setValues({
        id: projectData?._id || "",
        name: projectData?.name || "",
        description: projectData?.description || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectData]);

  const isUpdateButtonDisabled = useMemo(() => {
    return !(
      formik.dirty &&
      formik.isValid &&
      (formik.values.name !== projectData?.name ||
        formik.values.description !== projectData?.description)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.isValid, formik.values, projectData]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="w-[526px] pb-8">
      <div className="flex items-center justify-center h-20 bg-ibl7 rounded-t-[10px] relative">
        <p className="text-lg font-medium leading-7">Update Project Details</p>
        <div className="absolute right-0 mr-[33px] cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
          <CloseIcon onClick={handleClose} data-testid="close_Icon" />
        </div>
      </div>
      <div className="p-5 md:p-10">
        <InputField
          id="name"
          name="name"
          label="Project Name"
          placeholder="Enter Project Name"
          className="w-full h-[42px]"
          isRequired={true}
          onBlur={() => formik.setFieldTouched("name", true)}
          placeHolderSize={true}
          {...formik.getFieldProps("name")}
          error={formik.touched.name && formik.errors.name}
        />
        <div className="mt-6">
          <TextArea
            id="description"
            label="Description"
            name="description"
            placeholder="Enter Description"
            className="w-full md:w-[446px] h-[142px] resize-none"
            {...formik.getFieldProps("description")}
            charLimit={300}
            onBlur={() => formik.setFieldTouched("description", true)}
            showCharCount={true}
            isMult="align-top"
            placeHolderSize={true}
            error={formik.touched.description && formik.errors.description}
          />
        </div>
      </div>
      <div className="flex items-center justify-center mt-3 mdMax:px-5">
        <CustomButton
          label="Save"
          onClick={formik.handleSubmit}
          disable={isUpdateButtonDisabled}
        />
      </div>
    </Modal>
  );
};

export default ProjectSetting;
