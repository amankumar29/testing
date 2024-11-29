import InputField from "../../Atoms/InputField/InputField";
import CloseIcon from "@mui/icons-material/Close";
import RadioButtons from "../../Atoms/RadioButtons/RadioButtons";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import PasswordInputField from "Components/Atoms/PasswordInputField/PasswordInputField";

import PropTypes from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { createUser } from "../../../Services/API/Users/Users";
import { toast } from "react-toastify";

export default function CreateUserModal({
  onClick,
  selectedApplication,
  selectedProject,
  getList = () => {},
}) {
  const [newRole, setNewRole] = useState("User");
  const [passwordError, setPasswordError] = useState(null);
  const [createUserDisable, setcreateUserDisable] = useState(false);

  const fetchCreateUser = (values) => {
    setcreateUserDisable(true);
    const payload = {
      first_name: values?.firstName?.trim(),
      last_name: values?.lastName?.trim(),
      username: "Test_name",
      email: values?.email,
      password: values?.password,
      role_id: newRole === "User" ? 2 : 1,
      project_id: selectedProject?.id,
      application_type_id: selectedApplication?.id,
    };
    createUser(payload)
      .then((res) => {
        const message = res?.data;
        toast.success(message);
        onClick();
        getList();
        setcreateUserDisable(false);
      })
      .catch((err) => {
        const message = err?.response?.data?.details;
        toast.error(message);
        setcreateUserDisable(false);
      });
  };

  const handlePasswordFocus = () => {
    setPasswordError("");
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },

    validationSchema: Yup.object({
      firstName: Yup.string()
        .test("no-emojis", "First name cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("First name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .matches(/^[A-Za-z]+$/, "First name can only contain alphabets.")
        .min(2, "First name must be at least 2 characters.")
        .max(50, "First name must be at most 50 characters."),
      lastName: Yup.string()
        .test("no-emojis", "Last name cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Last name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .matches(/^[A-Za-z]+$/, "Last name can only contain alphabets.")
        .min(1, "Last name must be at least 1 character.")
        .max(50, "Last name must be at most 50 characters."),
      email: Yup.string()
        .required("Please enter your work email.")
        .matches(
          /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/,
          "Invalid Email"
        ),
      password: Yup.string().required("Please enter your password."),
    }),
    onSubmit: fetchCreateUser,
  });

  return (
    <div className="w-full md:w-[520px] md:h-[553px]">
      <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[10px]">
        <div className="w-full md:w-[310px] h-[80px]  flex justify-center md:justify-between items-center mdMax:relative">
          <div
            className="text-[18px] font-medium leading-7"
            data-testid="modal_heading"
          >
            Create User
          </div>

          <div className="flex justify-end !pr-6 mdMax:absolute mdMax:right-0">
            <CloseIcon
              onClick={onClick}
              className="cursor-pointer"
              data-testid="close_Icon"
            />
          </div>
        </div>
      </div>

      {/* Form */}

      <div className="flex flex-col mx-auto w-full md:w-[456px] gap-6 my-[18px] mdMax:px-5">
        <div className="md:flex items-center justify-center gap-4">
          <div>
            <InputField
              id="firstName"
              label="First Name"
              placeHolder="Enter First Name"
              className="w-full md:w-[220px] h-[52px]"
              isRequired={true}
              {...formik.getFieldProps("firstName")}
              error={formik.touched.firstName && formik.errors.firstName}
            />
          </div>
          <div>
            <InputField
              id="lastName"
              label="Last Name"
              placeHolder="Enter Last Name"
              className="w-full md:w-[220px] h-[52px]"
              isRequired={true}
              {...formik.getFieldProps("lastName")}
              error={formik.touched.lastName && formik.errors.lastName}
            />
          </div>
        </div>
        <div className="md:flex items-center justify-center">
          <InputField
            autocomplete="one-time-code"
            id="email"
            label="Email"
            placeHolder="Enter your work email"
            className="w-full md:w-[456px] h-[52px]"
            max_Length={257}
            isRequired={true}
            {...formik.getFieldProps("email")}
            error={
              (formik.touched.email && formik.errors.email) || passwordError
            }
          />
        </div>
        <div>
          <PasswordInputField
            autocomplete="one-time-code"
            label="Password"
            placeHolder="Enter your password"
            className="h-[52px]"
            onFocus={handlePasswordFocus}
            isRequired={true}
            {...formik.getFieldProps("password")}
            error={formik.touched.password && formik.errors.password}
          />
        </div>
        <div className="flex items-center justify-start gap-4">
          <div className="flex">
            <div className="text-sm font-medium leading-7">Role</div>&nbsp;
            <span className="text-ird3 mt-[2px]">*</span>
          </div>
          <div>
            <RadioButtons
              value={"User"}
              onClick={(item) => {
                setNewRole(item);
              }}
              checked={newRole === "User"}
            />
          </div>
          <div>
            <RadioButtons
              value={"Owner"}
              onClick={(item) => {
                setNewRole(item);
              }}
              checked={newRole === "Owner"}
            />
          </div>
        </div>
        <div>
          <CustomButton
            label={"Create"}
            className="w-[456px] h-[52px] mt-2"
            onClick={formik.handleSubmit}
            disable={!formik.isValid || !formik.dirty || !newRole || createUserDisable}
          />
        </div>
      </div>
    </div>
  );
}

CreateUserModal.propTypes = {
  onClick: PropTypes.func,
  selectedApplication: PropTypes.object,
  selectedProject: PropTypes.object,
  getList: PropTypes.func,
};
