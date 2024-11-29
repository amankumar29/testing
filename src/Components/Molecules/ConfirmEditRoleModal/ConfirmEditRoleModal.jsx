import CloseIcon from "@mui/icons-material/Close";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import errorMsg from "../../../Assets/Images/error.svg";
import { useUpdateUserRoleApplicationMutation } from "Services/API/apiHooks";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { WebsocketContext } from "Services/Socket/socketProvider";

export default function ConfirmEditRoleModal({
  onClick = () => {},
  updatedRole,
  openConfirmEdit,
  selectedApplication,
  selectedProject,
  getList = () => {},
  onCloseEditRole = () => {},
}) {
  const [updatedUserRole, { isSuccess, isError }] =
    useUpdateUserRoleApplicationMutation();
  const {userDetails} = useSelector((state)=>state?.userDetails)
  const {socket} = useContext(WebsocketContext)


  const fetchEditRole = async () => {
    const payload = {
      applicationId: selectedApplication?.id,
      projectId: selectedProject?.projectId,
      userId: openConfirmEdit?._id,
      userRole: updatedRole === "Owner" ? "OWNER" : "USER",
    };

    try {
      const result = await updatedUserRole(payload).unwrap();
      const msg = result.message;
      if (msg || isSuccess) {
        socket.emit('onProjects',{
          command:"updateUserRole",
          organizationId:userDetails?.organizationId,
          user:{
            userName:userDetails?.userName,
            userId:userDetails?.userId
          },
          data:{
            applicationId: selectedApplication?.id,
            projectId: selectedProject?.projectId,
            userId: openConfirmEdit?._id,
            userRole: updatedRole === "Owner" ? "OWNER" : "USER",
          }
        })
        toast.success(msg);
      }
      getList();
      onCloseEditRole();
      onClick();
    } catch (error) {
      console.error("Error deleting scheduler:", error);
      const errMsg = error?.data?.details;
      if (isError || errMsg) {
        toast.error(errMsg);
      }
    }
  };

  const fetchCancelConfirmMessage = () => {
    onClick();
    onCloseEditRole();
  };

  return (
    <div className="w-[374px] h-[284px]">
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[10px]">
          <div className="w-[204px] h-[80px]  flex justify-between items-center">
            <div
              className="text-[18px] font-medium leading-7"
              data-testid="modal_heading"
            >
              <img src={errorMsg} alt="errorImage" />
            </div>

            <div className="flex justify-end !pr-6">
              <CloseIcon
                onClick={fetchCancelConfirmMessage}
                className="cursor-pointer"
                data-testid="close_Icon"
              />
            </div>
          </div>
        </div>
        <div className=" mt-[45px] px-[33px] flex justify-center items-center">
          <p className="text-[16px] text-center font-medium leading-7">
            {" "}
            Are you sure you want to Update the Role ?
          </p>
        </div>
        <div className="flex gap-2 mt-[35px]">
          <CustomButton
            label="Yes"
            isFocused
            className="!w-[154px] h-[52px]"
            onClick={fetchEditRole}
          />
          <CustomButton
            label="No"
            className="!w-[154px] h-[52px] !text-ibl3 bg-iwhite border border-ibl1 hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1"
            onClick={fetchCancelConfirmMessage}
          />
        </div>
      </div>
    </div>
  );
}
