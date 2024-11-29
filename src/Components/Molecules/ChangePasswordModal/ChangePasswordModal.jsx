import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useChangePasswordMutation } from "Services/API/apiHooks";
import { logout } from "Store/ducks/authSlice";
import { setUserDetails } from "Store/ducks/userDetailsSlice";
import * as Yup from "yup";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import { Modal } from "../../Atoms/Modal/Modal";
import PasswordInputField from "../../Atoms/PasswordInputField/PasswordInputField";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [passwordMatched, setPasswordMatched] = useState(false);
  const [changePassword] = useChangePasswordMutation();
  const navigateTo = useNavigate();
  const dispatch = useDispatch();

  const modalClose = () => {
    formik.resetForm();
    onClose();
  };

  const handleSave = async (values) => {
    const payload = {
      oldPassword: values?.currentPassword,
      newPassword: values?.newPassword,
    };
    try {
      const res = await changePassword(payload).unwrap();
      if (res) {
        toast.success(res.message);
        dispatch(logout()); // Dispatch the logout action
        dispatch(setUserDetails(null));
        navigateTo("/login");
      }
    } catch (error) {
      toast.error(error?.data?.details);
    }
  };

  const machtingValidation = Yup.object().shape({
    currentPassword: Yup.string()
      .matches(/^(?!\s+$)/, "Spaces are not allowed.")
      .required("Please enter current password."),

    newPassword: Yup.string()
      .required("Password is required.")
      .notOneOf(
        [Yup.ref("currentPassword"), null],
        "New password should not match with current password."
      ),
    confirmPassword: Yup.string()
      .required("Confirm password is required.")
      .oneOf([Yup.ref("newPassword"), null], "Password does not match."),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: machtingValidation,
    onSubmit: handleSave,
  });

  //Matching Validation for routing fields
  useEffect(() => {
    if (
      formik.values.newPassword === formik.values.confirmPassword &&
      (formik.touched.confirmPassword || formik.touched.newPassword) &&
      !formik.errors.confirmPassword &&
      !formik.errors.newPassword
    ) {
      setPasswordMatched(true);
    } else {
      setPasswordMatched(false);
    }
  }, [
    formik.values.newPassword,
    formik.values.confirmPassword,
    formik.errors.confirmPassword,
    formik.touched.confirmPassword,
  ]);

  const disableNextButton = useMemo(() => {
    return !(formik.dirty && formik.isValid);
  }, [formik.dirty, formik.isValid]);

  return (
    <Modal isOpen={isOpen} onClose={modalClose}>
      <div className="w-[500px] pb-6">
        <div className="flex items-center justify-center h-20 bg-ibl7 rounded-t-[10px] relative">
          <p
            className="text-lg font-medium leading-7"
            data-testid="add_new_application"
          >
            Change Password
          </p>
          <div className="absolute right-0 mr-[33px] cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
            <CloseIcon onClick={modalClose} data-testid="close_Icon" />
          </div>
        </div>
        <div className="flex justify-center mt-8 text-sm leading-5 ">
          <p className="px-6 text-center " data-testid={"change_password"}>
            As a security measure, you will be logged out of your account once
            you successfully change your password.
          </p>
        </div>
        <div className="px-6">
          <div className="pl-8 mt-4">
            <PasswordInputField
              label={"Current Password"}
              id="change_password"
              className={`w-[388px]`}
              placeHolder="Enter Current Password"
              handleKeyEnter={() => {}}
              isRequired={true}
              {...formik.getFieldProps("currentPassword")}
              error={
                formik.touched.currentPassword && formik.errors.currentPassword
              }
            />
          </div>
          <div className="my-8 border border-solid border-ibl7 rounded-[25%]" />
          <div className="pl-8">
            <PasswordInputField
              label={"New Password"}
              id="new_password"
              className={`w-[388px]`}
              placeHolder="Enter New Password"
              handleKeyEnter={() => {}}
              {...formik.getFieldProps("newPassword")}
              isRequired={true}
              error={formik.touched.newPassword && formik.errors.newPassword}
            />
          </div>
          <div className="flex items-center gap-2 pl-8 mt-4">
            <PasswordInputField
              label={"Confirm Password"}
              id="confirm_password"
              className={`w-[388px]`}
              placeHolder="Confirm New Password"
              isRequired={true}
              {...formik.getFieldProps("confirmPassword")}
              error={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
            />
            {(passwordMatched || !disableNextButton) && (
              <div className="mt-8 text-ign1">
                <CheckCircleIcon />
              </div>
            )}
          </div>
          <div className="flex justify-center mt-12">
            <CustomButton
              data-testid="submit_button"
              type="submit"
              disable={disableNextButton}
              label={"Update Password"}
              className={`w-[246px]`}
              onClick={formik.handleSubmit}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;

ChangePasswordModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
