import confirmDeleteModalTop from "../../../Assets/Images/Intersect.svg";
import confirmDeleteIcon from "../../../Assets/Images/error.svg";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import PropTypes from "prop-types";

export default function ConfirmDeleteModal({ onClick, fetchUserList, modalMessage="Are you sure you want to Delete?" , isHeight=false }) {
  // Delete
  const fetchDeleteUser = () => {
    fetchUserList();
    onClick();
  };

  return (
    <>
      <div className={`w-full md:w-[460px] h-[309px] ${isHeight && 'h-[358px]'}`}>
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-[460px] h-[107px]">
            <img src={confirmDeleteModalTop} alt="ConfirmdeleteIcon" />
            <div className="absolute top-9 left-[205px]">
              <img
                src={confirmDeleteIcon}
                alt="errorMessage"
                className="w-[54px] h-[54px]"
              />
            </div>
          </div>
          <div className="text-[20px] text-iro5 font-semibold leading-6 mt-4 ml-1">
            Delete
          </div>
          <div className="text-sm text-center font-normal leading-6 mt-8 w-[420px] mdMax:w-[90%] mdMax:max-w-[420px]">
            {modalMessage}
          </div>
          <div className="flex gap-2 mt-[40px]">
            <CustomButton
              onClick={onClick}
              label="No"
              className="!w-[120px] h-10 !text-ibl3 bg-iwhite border border-ibl1 hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1"
            />
            <CustomButton
              label="Yes"
              isFocused
              className="!w-[120px] h-10"
              onClick={fetchDeleteUser}
            />
          </div>
        </div>
      </div>
    </>
  );
}

ConfirmDeleteModal.propTypes = {
  onClick: PropTypes.func,
  fetchUserList: PropTypes.func,
  modalMessage: PropTypes.string,
  isHeight: PropTypes.bool
};
