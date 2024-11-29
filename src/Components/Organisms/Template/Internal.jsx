import ToastProvider from "Helpers/ToastProvider/ToastProvider";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetProjectListQuery,
  useGetUserDataQuery,
} from "Services/API/apiHooks";
import {
  setGetAllProjects,
  setProjectList,
} from "Store/ducks/projectListSlice";
import {
  setDefaultApplication,
  setError,
  setLoading,
  setUserDetails,
} from "Store/ducks/userDetailsSlice";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import SideMenuBar from "../SideMenuBar/SideMenuBar";
import Cookies from "js-cookie";

const Internal = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const storedProjectId = Cookies.get("projectId");
  const storedApplicationId = Cookies.get("applicationId");
  const storedUser = localStorage.getItem("defaultApp");
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null)

  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
  } = useGetUserDataQuery({
    skip: !isAuthenticated,
  });

  //default API data flow
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(setLoading(isUserLoading));
      if (userError) {
        dispatch(setError(userError?.message));
        toast.error(userError?.message);
      }
      if (userData) {
        dispatch(setUserDetails(userData?.results));
        const defaultData = {
          id: userData?.results?.defaultApplicationId,
          projectId: userData?.results?.defaultProjectId,
          type: userData?.results?.defaultApplicationType,
          appData: userData?.results?.defaultAppData,
        };
        dispatch(setDefaultApplication(defaultData));
      }
    }
  }, [isAuthenticated, userData, userError, isUserLoading]);

  const {
    data: projectData,
    error: projectError,
    isLoading: isProjectLoading,
  } = useGetProjectListQuery(
    {},
    {
      skip: !isAuthenticated, // Prevent query from automatically running if not authenticated
    }
  );

  // Handle user data API response
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (isProjectLoading) {
      dispatch(setLoading(true));
    } else {
      dispatch(setLoading(false));
    }

    if (projectError) {
      dispatch(setError(projectError?.message));
      toast.error(projectError?.message);
    }

    if (projectData) {
      dispatch(setProjectList(projectData?.results));
      dispatch(setGetAllProjects(projectData?.results?.projects));
    }
  }, [isAuthenticated, projectData, projectError, isProjectLoading, dispatch]);

  // only if project and application ids are present dealing with cookies, localstorage, redux flow 
  useEffect(() => {
    if (isAuthenticated) {
      if (storedUser && storedUser !== "undefined") {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          if (storedProjectId && storedApplicationId) {
            const updatedUserDetails = {
              ...userData?.results,
              defaultApplicationId: parsedUser?.id,
              defaultProjectId: parsedUser?.projectId,
              defaultApplicationType: parsedUser?.type,
              defaultAppData: parsedUser?.appData,
            };

            dispatch(setUserDetails(updatedUserDetails));
            dispatch(setDefaultApplication(parsedUser));
          } else if (
            storedProjectId === 'undefined' &&
            storedApplicationId === 'undefined' &&
            userData
          ) {
            // handle it  when cookies are set to 'undefined'
            dispatch(setUserDetails(userData?.results));
            const defaultData = {
              id: userData.results?.defaultApplicationId,
              projectId: userData?.results?.defaultProjectId,
              type: userData?.results?.defaultApplicationType,
              appData: userData?.results?.defaultAppData,
            };
            dispatch(setDefaultApplication(defaultData));
          }
        } catch (error) {
          console.error("Error parsing localStorage data:", error);
          toast.error('Error parsing localStorage data:', error);
          localStorage.removeItem("defaultApp"); // Clear invalid data if needed
        }
      }
    }
  }, [isAuthenticated, userData, storedApplicationId, storedProjectId]);

  const handleMobileOpen = () => {
    setMobileOpen(!mobileOpen);
  }

  useEffect(() => {
    const handleClickOutSide = (event) =>{
      if(sidebarRef.current && !sidebarRef.current.contains(event.target)){
        setMobileOpen(false);
      }
    }
    if(mobileOpen){
      document.addEventListener('mousedown', handleClickOutSide);
    } else{
      document.removeEventListener('mousedown', handleClickOutSide);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutSide)
    }
  },[mobileOpen]);

  

  return (
    <div className="flex">
      <div className={`w-[65px] md:w-[88px] h-screen fixed z-[999] bg-ibl19 ${mobileOpen ? "mdMax:block" : "mdMax:hidden"}`} ref={sidebarRef}>
        <SideMenuBar />
      </div>
      <div className="mdMax:w-[calc(100%-0px)] md:w-[calc(100%-88px)] xl:w-full ml-0 md:ml-[88px] h-screen">
        <Header handleMobileOpen={handleMobileOpen} mobileOpen={mobileOpen}/>
        <div className="px-4 py-4 md:px-6 md:py-6 bg-ibl21 layout-height">
          <Outlet />
          <ToastProvider />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Internal;
