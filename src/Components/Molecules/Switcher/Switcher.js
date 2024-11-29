import SearchDropdown from "Components/Atoms/SearchDropdown/SearchDropdown";
import { fetchDefaultData } from "Helpers/DefaultApi/FetchDefaultApi";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProjectListQuery,
  useGetUserDataQuery,
  useLazyGetUserDataQuery,
  useSetDefaultMutation,
} from "Services/API/apiHooks";
import {
  setCookieDefaultApplication,
  setDefaultApplication,
  setError,
  setLoading,
  setUserDetails,
} from "Store/ducks/userDetailsSlice";
 
const Switcher = ({
  isPlusRequired,
  addProject = () => {},
  addApplication = () => {},
  shouldSetCookies= false,
  setSearchValue,
  setPayload
}) => {
  const dispatch = useDispatch();
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState({});
  const [applicationList, setApplicationList] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [getuserDetails] = useLazyGetUserDataQuery();
  const [setDefault] = useSetDefaultMutation();
 
  const { userDetails, defaultApplication } = useSelector(
    (state) => state?.userDetails
  );
 
  const { data: projectData, refetch } = useGetProjectListQuery({});
 
  useEffect(() => {
    refetch();
  }, []);
 
  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
    refetch: refetchUserDetails,
  } = useGetUserDataQuery();

  const apiDefaultProjectId = userData?.results?.defaultProjectId === selectedProject?.id ;
  const apiDefaultApplicationId = userData?.results?.defaultApplicationId === selectedApplication?.id;

  //this useeffect keeps track of enable of set as default button for newly selected project,
  //  aplication && api values of projectid, applicationid
  useEffect(() => {
    setIsModified(!(apiDefaultProjectId && apiDefaultApplicationId) );
  }, [apiDefaultProjectId, apiDefaultApplicationId, selectedProject, selectedApplication]);

 
  useEffect(() => {
    const reqData = projectData?.results?.projects?.map((e) => {
      return {
        id: e?._id,
        keyword_name: e?.name,
        isDefault: e?.isDefault,
        application: e?.applicationIds,
      };
    });
 
    setProjectList(reqData);
   
    if (shouldSetCookies && Cookies.get("projectId") && Cookies.get("applicationId")) {
      setIsModified(true)
      const storedProjectId = Cookies.get("projectId");
      const storedApplicationId = Cookies.get("applicationId");
 
      const selectedProj = reqData?.find((e) => e?.id === storedProjectId);
      setSelectedProject(selectedProj);
 
      const modifiedApplication = selectedProj?.application?.map(({ _id, name, ...rest }) => ({
        ...rest,
        id: _id,
        keyword_name: name,
        projectId: selectedProj?.id,
      }));
 
      setApplicationList(modifiedApplication);

      if(storedApplicationId){
        const selectedApp = modifiedApplication?.find((e) => e?.id === storedApplicationId);
      setSelectedApplication(selectedApp);
      localStorage.setItem('defaultApp',JSON.stringify(selectedApp));
      dispatch(setDefaultApplication(selectedApp));
      dispatch(setCookieDefaultApplication(selectedApp));
      }
    } else {
      refetchUserDetails();
 
      const defaultProject = reqData?.find((e) => e?.id === userDetails?.defaultProjectId);
      setSelectedProject(defaultProject);
 
      const modifiedApplication = defaultProject?.application?.map(({ _id, name, ...rest }) => ({
        ...rest,
        id: _id,
        keyword_name: name,
        projectId: defaultProject?.id,
      }));
 
      setApplicationList(modifiedApplication);
 
      const defaultApplications = modifiedApplication?.find(
        (e) => e?.id === userDetails?.defaultApplicationId
      );
     
        setSelectedApplication(defaultApplications);
        dispatch(setDefaultApplication(defaultApplications));
        localStorage.setItem('defaultApp',JSON.stringify(defaultApplications));
        dispatch(setCookieDefaultApplication(defaultApplications));
    }
  }, [projectData, shouldSetCookies,userDetails]);
 
  const updateUserDetails = useCallback(() => {
    const defaultApp = localStorage.getItem('defaultApp');
    const parsedUser = defaultApp ? JSON.parse(defaultApp) : null;
    if (parsedUser) {
      const updatedUserDetails = {
        ...userData?.results,
        defaultApplicationId: parsedUser.id,
        defaultProjectId: parsedUser.projectId,
        defaultApplicationType: parsedUser.type,
        defaultAppData: parsedUser.appData,
      };
     
      dispatch(setUserDetails(updatedUserDetails));
    }
  }, [userData, selectedProject, selectedApplication]);
 
  useEffect(() => {
    dispatch(setLoading(isUserLoading));
    if (userError) {
      dispatch(setError(userError.message));
    }
    if (userData) {
      dispatch(setUserDetails(userData?.results));
    }
  }, [refetchUserDetails]);
 
  const handleProjectSelect = (option) => {
    if(setSearchValue){
      setSearchValue({ value: "", error: null });
    }
    if(setPayload){
      setPayload("");
    }
    if (shouldSetCookies) {
      Cookies.set("projectId", option?.id);
    }
    setSelectedProject(option);
 
    const modifiedApplication = option?.application?.map(({ _id, name, ...rest }) => ({
      ...rest,
      id: _id,
      keyword_name: name,
      projectId: option?.id,
    }));
 
    setApplicationList(modifiedApplication);
    if (modifiedApplication.length > 0) {
      const firstApplication = modifiedApplication[0];
      setSelectedApplication(firstApplication);
      localStorage.setItem('defaultApp',JSON.stringify(firstApplication));
      dispatch(setDefaultApplication(firstApplication));
      dispatch(setCookieDefaultApplication(firstApplication));
      if (shouldSetCookies) {
        Cookies.set("applicationId", firstApplication?.id);
        updateUserDetails();
      }
      setIsModified(true);
    } else {
      setSelectedApplication({});
    }
  };
 
  const handleApplicationSelect = (option) => {
    if(setSearchValue){
      setSearchValue({ value: "", error: null });
    }
    if(setPayload){
      setPayload("");
    }
    if (selectedProject?.id) {
      setSelectedApplication(option);
      localStorage.setItem('defaultApp',JSON.stringify(option));
      dispatch(setDefaultApplication(option));
      dispatch(setCookieDefaultApplication(option));
      if (shouldSetCookies) {
        Cookies.set("applicationId", option?.id);
        updateUserDetails();
      }
      setIsModified(true);
    }
  };
 
  const handleDefaultSelect = async () => {
    const payload = {
      applicationId: selectedApplication?.id,
      projectId: selectedProject?.id,
    };
    try {
      const data = await setDefault(payload).unwrap();
      if (data) {
        localStorage.setItem('defaultApp',JSON.stringify(selectedApplication));
        dispatch(setDefaultApplication(selectedApplication));
        dispatch(setCookieDefaultApplication(selectedApplication));
        refetchUserDetails();
        toast.success("Default project and application set successfully");
        setIsModified(false);
      }
    } catch (error) {
      toast.error("Failed to switch application");
    }
  }
  
 
  return (
    <div className="items-center gap-4 md:flex left">
      {selectedProject && (<>
      <SearchDropdown
        option={projectList}
        placeHolder="Choose Project"
        label={"Project"}
        className={`h-10 w-[276px] bg-iwhite select-full`}
        isPlusRequired={isPlusRequired}
        onPlusClick={addProject}
        hideCross={true}
        isEditable={true}
        selectedOption={selectedProject}
        onSelect={handleProjectSelect}
        type='project'
      />
      <SearchDropdown
        option={applicationList}
        placeHolder="Choose Application"
        label={"Application"}
        className={`h-10 w-[276px] bg-iwhite select-full`}
        onPlusClick={addApplication}
        isPlusRequired={isPlusRequired}
        hideCross={true}
        iconForApplication={true}
        isEditable={true}
        selectedOption={selectedApplication||defaultApplication}
        onSelect={handleApplicationSelect}
        type='app'
      />
      <button
        onClick={handleDefaultSelect}
        className={`h-[40px] px-4 rounded-[8px] font-medium mt-8 
          ${
              isModified
                ? "font-medium mt-8 bg-ibl1 hover:bg-ibl3 text-iwhite" 
                : "bg-ibl2 text-iwhite cursor-not-allowed" 
          }`}            
            disabled={!isModified} 
      >
        Set As Default
      </button>
      </>)}
    </div>
  );
};
 
export default Switcher;