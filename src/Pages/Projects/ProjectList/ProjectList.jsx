import { CustomButton } from "../../../Components/Atoms/CustomButton/CustomButton";
import Table from "Components/Atoms/Table/Table";
import AvatarStack from "Components/Molecules/AvatarStack/AvatarStack";
import AvatarName from "Components/Molecules/AvatarName/AvatarName";
import { useContext, useEffect, useRef, useState } from "react";
import { Modal } from "../../../Components/Atoms/Modal/Modal";
import ProjectDetails from "../../../Components/Molecules/ProjectDetailsModal/ProjectDetailsModal";
import { useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@emotion/react";
import SearchInput from "../../../Components/Atoms/SearchInput/SearchInput";
import { Tooltip } from "react-tooltip";
import textEllipsis from "../../../Helpers/TextEllipsis/TextEllipsis";
import { setDefaultProject } from "../../../Services/API/Projects/Projects";
import TextLink from "Components/Atoms/TextLink/TextLink";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
  useGetUserDataQuery,
  useLazyGetProjectListQuery,
  useSetDefaultMutation,
} from "Services/API/apiHooks";
import {
  setError,
  setLoading,
  setProjectList,
} from "Store/ducks/projectListSlice";
import { toast } from "react-toastify";
import {
  setError as setUserError,
  setLoading as setUserLoading,
  setUserDetails,
} from "Store/ducks/userDetailsSlice";
import { WebsocketContext } from "Services/Socket/socketProvider";
import Cookies from "js-cookie";

const ProjectList = () => {
  const dispatch = useDispatch();

  const navigateTo = useNavigate();
  const type = "test-cases";
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25); // Number of rows per page
  const [totalPages, setTotalPages] = useState(0);
  const [searchValue, setSearchValue] = useState({
    value: "",
    error: null,
  });
  const [setDefault] = useSetDefaultMutation();
  const [payload, setPayload] = useState({});
  const [showInfo, setShowInfo] = useState(null);
  const [show, setShow] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [countData, setCountData] = useState(0);

  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
    refetch: refetchUserDetails,
  } = useGetUserDataQuery();

  const offset = (page - 1) * rowsPerPage; // Calculate the offset based on current page and rows per page

  const [getProjectDetails, { data, error: apiError, isLoading }] =
    useLazyGetProjectListQuery();

  useEffect(() => {
    getProjectDetails({
      sortDirection: "desc",
      sortColumn: "_id",
      search: searchValue?.value,
      limit: rowsPerPage,
      offset: offset,
    }).then((res) => {
      const projectNewData = res?.data?.results?.projects;
      setProjectData(projectNewData);
      setCountData(res?.data?.results?.count);
    });
  }, [rowsPerPage, offset, searchValue]);

  const countProjects = data?.results?.total;
  const [list, setList] = useState([]);


  const {socket} = useContext(WebsocketContext);
  const { defaultApplication , userDetails} = useSelector((state) => state?.userDetails);
  const currentStore = useRef()
  useEffect(() => {
    if (countData) {
      setTotalPages(Math.ceil(countData / rowsPerPage)); // Use rowsPerPage to calculate total pages dynamically
    }
  }, [countData, rowsPerPage]); // Dependency array includes count and rowsPerPage

  useEffect(() => {
    if (isLoading) {
      dispatch(setLoading(true));
    }
    // Handle API response

    if (data) {
      setList(data?.results?.projects);
      dispatch(setLoading(false)); // Set loading to false
    }
    // Handle errors
    if (apiError) {
      dispatch(setError(apiError.message)); // Dispatch error to Redux
    }
  }, [isLoading, data, apiError, dispatch]);

  const handleOpen = () => {
    setShow(true);
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    setShow(false);
  };

  const handleSearch = (value) => {
    const searchValueString = value?.trim();

    setPayload((prevPayload) => ({
      ...prevPayload,
      search: searchValueString,
    }));
    setPage(1);
  };

  const handleCLick = async (row) => {
    const projectId = row?._id;
    const applicationId = row?.applicationIds[0]?._id;

    const payload = {
      projectId,
      applicationId,
    };
 
    Cookies.set("projectId", projectId);
    Cookies.set("applicationId", applicationId);
 
    try {
      if (Object.keys(payload)?.length>0) {
        refetchUserDetails().then(() => {
          navigateTo("/projects/test-cases");
        });
      }
    } catch (error) {
      toast.error("failed to switch project");
    }
  };

  useEffect(() => {
    dispatch(setUserLoading(isUserLoading));
    if (userError) {
      dispatch(setUserError(userError.message));
    }
    if (userData) {
      dispatch(setUserDetails(userData.results));
    }
  }, [refetchUserDetails]);

  // useEffect(() => {
  //   // console.log("payload", payload);
  //   dispatch(setProjectList(payload));
  // }, [payload]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const noEmojiValidation = (value) => {
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    return emojiRegex.test(value);
  };

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    if (value === " " && value?.length === 1) {
      setSearchValue({ value: "", error: null });
    } else if (noEmojiValidation(value)) {
      setSearchValue({ value, error: "Emojis are not allowed." });
    } else {
      setSearchValue({ value, error: null });
      handleSearch(value); // Trigger search immediately without delay
    }
  };

  useEffect(() => {
    const handleProjectResponse = async (response) => {
      const sendUser = response?.user;
        const {userList} = response?.data
      if (currentStore?.current?.organizationId === response?.organizationId) {
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
        if (response.command === "appDelete") {
          const { projectId, appId } = response?.data;
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
          setList((prev) => {
            const newData = [...prev, project];
              const uniqueData = newData.filter((item, index, self) =>
                index === self.findIndex((t) => t._id === item._id)
            );
            return uniqueData;
          });
            toast.dismiss()
            toast.success(`Hello Team! ${sendUser?.userName} has created New Project ${project?.name}`)
        }
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
        // if(response?.command === "appCreate"){
        //   const { projectId , newAppData } = response?.data;
        //   setList((prevList) => {
        //     if (prevList && prevList.length > 0) {
        //       const selectProject = prevList.find(
        //         (project) => project?._id === projectId
        //       );

        //       if (selectProject) {
        //         const updatedList = prevList.map((project) => {
        //           if (project._id === projectId) {
        //             const newApplicationsList = new Set([...project?.applicationIds,newAppData])
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
      }
    };
    socket.on("onProjectResponse", handleProjectResponse);
    return () => {
      socket.off("onProjectResponse", handleProjectResponse);
    };
  }, []);

  useEffect(() => {
    currentStore.current = userDetails;
  }, [userDetails]);


  //this useffect sets when new account and new project is created 
  // & length is one then automatically calls API 
  useEffect(() => {
    if ( countProjects === 1 ) {
        const firstProject = projectData[0];
        const projectId = firstProject?._id;
        const applicationId = firstProject?.applicationIds[0]?._id;

        if (projectId && applicationId && defaultApplication?.projectId !== projectId) {
            const fetchData = async () => {
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
            };

            fetchData();
        }
    }
}, [projectData, countProjects]);

  return (
    <>
      <div className="items-center justify-between md:flex">
        <div
          className="mb-4 text-xl font-medium md:mb-0"
          data-testid="project_heading"
        >
          Projects
        </div>
        <div className="items-center gap-4 md:flex">
          <div className="w-full md:w-[296px] mb-4 md:mb-0">
            <SearchInput
              placeHolder="Search"
              maxLength={255}
              onChange={handleInputChange}
              value={searchValue.value}
              error={searchValue.error}
            />
          </div>

          <CustomButton
            className="font-medium leading-6"
            label="Add New Project"
            isAddBtn={true}
            onClick={() =>
              navigateTo("add-new-project", {
                state: {
                  projectScreen: true,
                },
              })
            }
          />
        </div>

        {/*  */}
      </div>
      <div className="mt-4 bg-iwhite p-5 rounded-[8px] table-div">
        <div className="tableScroll">
          <Table
            isLoading={isLoading}
            data={list}
            onRowClick={(row) => {
              handleCLick(row);
            }}
            onRowClickPointer={true}
            columns={[
              {
                tHeadClass: "w-[18%]",
                tbodyClass: "text-igy1 text-sm font-normal pl-[20px]",
                label: "ID",
                column: "id",
                cell: (row) => (
                  <div className="flex items-center justify-center row-id">
                    {row?._id}
                  </div>
                ),
              },
              {
                tHeadClass: "mdMax:pl-[20px] pl-[130px] text-left w-[28%]",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "Name",
                column: "name",
                cell: (row) => (
                  <>
                    <div className="text-left">
                      <div
                        data-tooltip-id="goToProfile"
                        data-tooltip-content={
                          row?.name?.length > 30 ? row?.name : ""
                        }
                        className="w-fit"
                      >
                        {textEllipsis(row?.name, 30)}
                      </div>
                    </div>
                    {row?.name?.length > 30 && (
                      <Tooltip
                        id="goToProfile"
                        place="bottom"
                        className="!text-[11px] max-w-[300px] break-all !text-left"
                      />
                    )}
                  </>
                ),
              },
              {
                label: "Applications",
                column: "applicationIds",
                tHeadClass: "w-[25%]",
                cell: (row) => (
                  <div>
                    <AvatarStack avatarData={row?.applicationIds} />
                  </div>
                ),
              },
              {
                label: "Users",
                column: "users",
                tHeadClass: "w-[20%]",
                cell: (row) => (
                  <div className="flex items-center justify-center">
                    <AvatarName
                      // rowData={row}                             // this state is useful for feature reference regarding for displaying avatar names
                      profileData={row?.userIds}
                      userCount={row?.userIds}
                      // projectListData={projectNewData}
                      // showCard={row?.id === selectedId}          // this state is useful for feature reference regarding for displaying avatar names
                      // storeRowId={(id)=>{setSelectedID(id)}}    // this state is useful for feature reference regarding for displaying avatar names
                    />
                  </div>
                ),
              },
              {
                label: "",
                column: "actions",
                tHeadClass: "w-[12%]",
                cell: (row) => (
                  <div className="flex items-center justify-center text-center">
                    <TextLink
                      label="Info"
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleOpen(row);
                        setShowInfo(row);
                      }}
                      className="!text-base"
                    />
                  </div>
                ),
              },
            ]}
          />
          <div className="flex items-center justify-between mt-8 mb-[10px] pagination-row">
            {!isLoading && countData > 0 && (
              <div className="text-sm text-ibl1">{`Showing ${projectData?.length} out of ${countData}`}</div>
            )}
            {!isLoading && countData > 25 && (
              <div className="flex items-center">
                <div className="flex text-[15px] text-ibl1 font-medium">
                  <div className="flex items-center gap-2">
                    <div>Page Limit:</div>
                    <div>
                      <select
                        name="pageValue"
                        id="pageValue"
                        onChange={handleChangeRowsPerPage}
                        value={rowsPerPage}
                      >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={75}>75</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <ThemeProvider theme={theme}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handleChangePage}
                        showFirstButton
                        showLastButton
                        color="primary"
                      />
                    </ThemeProvider>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal isOpen={show} onClose={handleClose}>
        <ProjectDetails
          showInfo={showInfo}
          onClick={handleClose}
          isModalLoading={isLoading}
        />
      </Modal>
    </>
  );
};

export default ProjectList;

const theme = createTheme({
  palette: {
    primary: {
      main: "#052C85",
      contrastText: "#ffffff", // or any contrasting color
    },
  },
});
