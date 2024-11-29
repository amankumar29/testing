import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { CircularProgress } from "@mui/material";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { useSelector, useStore } from "react-redux";
import { toast } from "react-toastify";
import { useGetApplicationDetailsByIdQuery, useEmailNotificationMutation } from "Services/API/apiHooks";
import textEllipsis from "../../../Helpers/TextEllipsis/TextEllipsis";
import {
  createAssignUser,
  getAllUser,
} from "../../../Services/API/Users/Users";
import { Checkbox } from "../../Atoms/Checkbox/Checkbox";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import { WebsocketContext } from "Services/Socket/socketProvider";


export default function AssignUserModal({
  onClick,
  selectedApplication,
  selectedProject,
  getList = () => {},
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUsersData, setFilterUsersData] = useState([]);
  const [noRecordFound, setNoRecordFound] = useState(false);
  const [assignedUsers, setAssignedUser] = useState([]);
  const [allUserData, setAllUserData] = useState([]);
  const { defaultApplication ,userDetails} = useSelector((state) => state?.userDetails);
  const [emojiError, setEmojiError] = useState("");
  const [allUsers,setAllUsers] = useState([])
  const [assignUserEmails, setAssignUserEmails] = useState([]);
  const [emailNotification] = useEmailNotificationMutation();
  const {
    data: userAllData,
    error: isUserError,
    refetch,
  } = useGetApplicationDetailsByIdQuery({
    id: defaultApplication?.id,
  });
  const currentStore = useStore()
  const {socket} = useContext(WebsocketContext)

  useEffect(() => {
    if (userAllData) {
      setAssignedUser(userAllData?.results?.userIds);
    }
    if (isUserError) {
      toast.error("Failed to retrieve user data");
    }
  }, [userAllData, isUserError]);

  useEffect(() => {
    setIsLoading(true);
    getAllUser()
      .then((res) => {
        const data = res?.data?.results?.users;
        const requiredData = data?.map((e) => {
          return {
            id: e?._id,
            name: e?.firstName + " " + e?.lastName,
            isActive: e?.isActive,
          };
        });
        const allList = res?.data?.results?.users?.map((e)=>{
          return {
            _id: e?._id,
            isActive: e?.isActive,
            userRole: e?.userRole,
            roleValue: e?.roleValue,
            userName: e?.userName,
            email: e?.email,
            firstName:e?.firstName,
            lastName:e?.lastName,
            roleId:e?.roleId,
            userId:e?.userId,
            name:`${e?.firstName} ${e?.lastName}`
          }
        })
        setAllUserData(requiredData);
        setAllUsers(allList)
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (assignedUsers && allUserData) {
      const filteredArray = allUserData?.filter(
        (e) => !assignedUsers?.some((obj) => obj?._id === e?.id)
      );
      setFilterUsersData(filteredArray);
      if (searchQuery) {
        const filteredOptions = filteredArray?.filter((list) =>
          list?.name?.toLowerCase()?.includes(searchQuery.toLowerCase())
        );
        setFilterUsersData(filteredOptions);
      }
    }
  }, [assignedUsers, allUserData, searchQuery]);

  const fetchcreateAssignUser = () => {
    const payload = {
      projectId: defaultApplication?.projectId,
      applicationId: defaultApplication?.id,
      userIds: checkedItems,
    };
    createAssignUser(payload)
      .then((res) => {
        refetch();
        const message = res?.data?.message;
        const projectList = currentStore?.getState()?.projectList?.getAllProjects
        const project = projectList?.filter((item) => item?._id === payload?.projectId)
        .map((item) => {
            return {
                ...item,
                applicationIds: item?.applicationIds?.filter((app) => app?._id === payload?.applicationId) 
            };
        })
        const userIds = allUsers?.filter(item => checkedItems?.includes(item?._id.toString()))
        socket.emit('onProjects',{
          command:"inviteUser",
          organizationId:userDetails?.organizationId,
          user:{
            userName:userDetails?.userName,
            userId:userDetails?.userId
          },
          data:{
            project:{...project[0],userIds:userIds},
            userList:checkedItems,
            userIds:userIds,
          }
        })
        try{
          emailNotification({
            fromUser: {
              firstName: userDetails?.firstName,
              lastName: userDetails?.lastName,
              email: userDetails?.email
            },
            type:'assignUser',
            projectId: defaultApplication?.projectId,
            applicationId: defaultApplication?.id,
            toUsers: assignUserEmails,
          }).then((res) => {
            toast.success(res?.data?.message);
          })
        }catch(error){
          toast.error(error?.response?.data?.details)
        }
        toast.success(message);
        onClick();
        getList();
      })
      .catch((err) => {
        const message = err?.response?.data?.details;
        toast.error(message);
      });
  };

  const handleCheckBox = (itemId) => {
    setCheckedItems((prevCheckedItems) => {
      if (prevCheckedItems?.includes(itemId)) {
        setAssignUserEmails((prevEmails) => {
          // Remove the email of the deselected item
          return prevEmails?.filter(
            (email) => email !== allUsers?.find((user) => user?._id === itemId)?.email
          );
        });
        return prevCheckedItems?.filter((id) => id !== itemId);
      } else {
        setAssignUserEmails((prevEmails) => {
          // Add the email of the newly selected item
          const newEmail = allUsers?.find((user) => user?._id === itemId)?.email;
          return newEmail ? [...prevEmails, newEmail] : prevEmails;
        });
        return [...prevCheckedItems, itemId];
      }
    });
  };

  const noEmojiValidation = (value) => {
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    return emojiRegex.test(value);
  };

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    setSearchQuery(value);
    if (noEmojiValidation(value)) {
      setEmojiError("Emojis are not allowed.");
    } else {
      setEmojiError("");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center w-auto h-full">
        <div className="w-full md:w-[416px] rounded-2xl shadow-2xl relative">
          <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[10px]">
            <div className="w-full md:w-[266px] h-[80px]  flex justify-center md:justify-between items-center">
              <div
                className="text-[18px] font-medium leading-7"
                data-testid="modal_heading"
              >
                Assign User
              </div>

              <div className="flex justify-end !pr-6 mdMax:absolute mdMax:right-0">
                <CloseIcon
                  onClick={onClick}
                  className="cursor-pointer"
                  data-testid="closeIcon"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col pt-[24px] px-[32px]">
            <div className="flex flex-col">
              <div
                className={`flex items-center justify-between border border-solid border-ibl1 rounded-xl h-10 text-ibl1 w-full`}
              >
                <input
                  type="text"
                  placeholder="Search"
                  className={`focus:outline-none mx-2 w-full text-sm placeholder:text-igy5`}
                  autoFocus
                  value={searchQuery}
                  onChange={handleInputChange}
                />
                <SearchIcon fontSize="small" data-testid="search_Icon" />
              </div>
              <div className="mt-4 text-sm font-medium leading-7">
                Users <span className="text-ird3">*</span>
              </div>
            </div>
            <hr className="text-ibl17 rounded-[50%] mt-2" />
            {isLoading ? (
              <div className="flex justify-center items-center h-[142px]">
                <CircularProgress />
              </div>
            ) : (
              <>
                {filterUsersData?.length === 0 ? (
                  <div className="flex items-center justify-center h-[142px]">
                    <p>No Records Found</p>
                  </div>
                ) : (
                  <div className="flex flex-col overflow-y-scroll h-[142px]">
                    {filterUsersData?.map((item, index) => (
                      <div key={index} className="flex items-center gap-5 mt-4">
                        <div className="relative ml-5">
                          <Checkbox
                            data-testid={`checkbox_value_${item}`}
                            id={"checkbox"}
                            isHeaderCheck={true}
                            checked={checkedItems?.includes(item?.id)}
                            onChange={() => handleCheckBox(item?.id)}
                            className="cursor-pointer"
                          />
                        </div>
                        <p
                          className="text-base font-normal capitalize text-igy2"
                          data-testid={item?.name}
                        >
                          {textEllipsis(`${item?.name}`, 23)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="pt-[14px] pb-5">
              <CustomButton
                data-testid="create_Button"
                label="Assign User"
                className="w-[352px] !h-[52px]"
                onClick={fetchcreateAssignUser}
                disable={checkedItems?.length === 0}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

AssignUserModal.propTypes = {
  onClick: PropTypes.func,
};
