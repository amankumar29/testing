import confirmDeleteModalTop from "../../../Assets/Images/Intersect.svg";
import confirmDeleteIcon from "../../../Assets/Images/error.svg";
import CloseIcon from "@mui/icons-material/Close";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import PropTypes from "prop-types";

export default function ConfirmDeleteProjectModal({
  onClick,
  fetchDeleteTestCase,
  fetchDeleteTestPlans,
  type,
}) {
  // Delete
  const fetchDeleteUser = () => {
    if (
      type === "test-cases" ||
      type === "test-suites" ||
      type === "suite-test-cases"
    ) {
      fetchDeleteTestCase();
      onClick();
    } else {
      fetchDeleteTestPlans();
      onClick();
    }
  };

  return (
    <>
      <div className={`w-full md:w-[460px] ${type === "suite-test-cases" ? 'h-[330px]' : 'h-[309px]'}`}>
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
            {`${type === "suite-test-cases" ? "Remove" : "Delete"}`}
          </div>
          <div className="text-sm font-normal leading-6 mt-8 w-[420px] text-center">
            {`${
              type === "suite-test-cases"
                ? "Removing this test case from the suite won't delete it from the project. Are you sure you want to proceed?"
                : "Are you sure you want to Delete?"
            }`}
          </div>
          <div className="flex gap-2 mt-10">
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

ConfirmDeleteProjectModal.propTypes = {
  onClick: PropTypes.func,
  fetchUserList: PropTypes.func,
  fetchDeleteTestCase: PropTypes.func,
  fetchDeleteTestPlans: PropTypes.func,
  type: PropTypes.any,
};
