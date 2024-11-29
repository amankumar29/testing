import CloseIcon from "@mui/icons-material/Close";
import RadioButtons from "../../Atoms/RadioButtons/RadioButtons";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import { useEffect, useState } from "react";
import ConfirmEditRoleModal from "../ConfirmEditRoleModal/ConfirmEditRoleModal";

export default function EditRole({
  onClick = () => {},
  openConfirmEdit,
  selectedApplication,
  selectedProject,
  getList = () => {},
}) {
  const checkRole = openConfirmEdit?.userRole;
  const initialRole = checkRole === 'USER' ? "User" : "Owner";

  const [updatedRole, setUpdatedRole] = useState(initialRole);
  const [isButtonUpdatedDisabled, setIsButtonUpdatedDisabled] = useState(true);
  const [step, setStep] = useState(0);

  const handleOpenConfirmMessage = () => {
    setStep(1);
  };

  const handleCloseConfirmMessage = () => {
    setStep(0);
  };

  useEffect(() => {
    setIsButtonUpdatedDisabled(initialRole === updatedRole);
  }, [initialRole, updatedRole]);

  return (
    <>
      {step == 0 ? (
        <div className="w-[304px] h-[284px]">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[10px]">
              <div className="w-[214px] h-[80px] flex justify-between items-center">
                <div
                  className="text-[18px] font-medium leading-7"
                  data-testid="modal_heading"
                >
                  Edit User Role
                </div>

                <div className="flex justify-end !pr-6">
                  <CloseIcon
                    onClick={onClick}
                    className="cursor-pointer"
                    data-testid="close_Icon"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-6 mt-[47px]">
              <div>
                <RadioButtons
                  value={"User"}
                  onClick={(item) => {
                    setUpdatedRole(item);
                  }}
                  checked={updatedRole === "User"}
                />
              </div>
              <div>
                <RadioButtons
                  value={"Owner"}
                  onClick={(item) => {
                    setUpdatedRole(item);
                  }}
                  checked={updatedRole === "Owner"}
                />
              </div>
            </div>

            <div>
              <CustomButton
                label="Update"
                className="w-[236px] h-[52px] mt-[55px]"
                onClick={handleOpenConfirmMessage}
                disable={isButtonUpdatedDisabled}
              />
            </div>
          </div>
        </div>
      ) : (
        <ConfirmEditRoleModal
          onClick={handleCloseConfirmMessage}
          updatedRole={updatedRole}
          openConfirmEdit={openConfirmEdit}
          selectedApplication={selectedApplication}
          selectedProject={selectedProject}
          getList={getList}
          onCloseEditRole={onClick}
        />
      )}
    </>
  );
}
