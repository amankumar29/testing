import ChipTitle from "Components/Atoms/ChipTitle/ChipTitle";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import InputField from "Components/Atoms/InputField/InputField";
import RadioButtons from "Components/Atoms/RadioButtons/RadioButtons";
import { UserRoleEnum } from "Enums/UsersRoleEnum";
import { useFormik } from "formik";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useCreateUserMutation, useEmailNotificationMutation } from "Services/API/apiHooks";
import * as Yup from "yup";

const AddUsers = () => {
  const [assignedRole, setAssignedRole] = useState(UserRoleEnum.Developer);
  const { userDetails } = useSelector((state) => state?.userDetails);
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [emailNotification] = useEmailNotificationMutation();

  const handleCreate = async (values) => {
    const payload = {
      firstName: values?.firstName,
      lastName: values?.lastName,
      email: values?.email,
      password: "Admin@123",
      roleValue: assignedRole,
      userName: values?.userName,
      isActive: true,
      organizationId: userDetails?.organizationId,
      phoneNumber: values?.phoneNumber,
      gender: "MALE",
    };

    try {
      const data = await createUser(payload).unwrap();
      if (data) {
        formik.resetForm();
        setAssignedRole(UserRoleEnum.Developer);
        toast.success("User created successfully");
      }
      try{
        emailNotification({
          fromUser: {
            firstName: userDetails?.firstName,
            lastName: userDetails?.lastName,
            email: userDetails?.email
          },
          toUsers: [values?.email],
          type: 'addUser'
        }).then((res) => {
          toast.success(res?.data?.message);
        })
      }catch(error){
        toast.error(error?.response?.data?.details);
      }
    } catch (error) {
      toast.error(
        error?.data?.details || "Failed to create user. Please try again"
      );
    }
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      userName: "",
      phoneNumber: "",
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
      userName: Yup.string()
        .test("no-emojis", "Username cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Username is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .matches(/^[A-Za-z]+$/, "Username can only contain alphabets.")
        .min(1, "Username must be at least 1 character.")
        .max(50, "Username must be at most 50 characters."),
      phoneNumber: Yup.string()
        .required("Phone number is required")
        .matches(/^[0-9]*$/, "Phone number must contain only digits") // Only digits allowed
        .max(10, "Phone number cannot exceed 10 digits") // Maximum 10 digits
        .min(10, "Phone number must be exactly 10 digits") // Ensures it is exactly 10 digits
        .test(
          "no-all-spaces",
          "Phone number cannot be only spaces",
          (val) => val && val.trim().length > 0
        )
        .test(
          "no-all-zeros",
          "Phone number cannot be all zeros",
          (val) => val !== "0000000000" // Check for all zeros
        ),
    }),
    onSubmit: handleCreate,
  });
  return (
    <div className="p-6 rounded-2xl bg-iwhite lg:drop-shadow-lg max-h-[calc(100vh-220px)] mdMax:max-h-[100%]">
      <ChipTitle label={"Add User"} />
      <div className="gap-4 mt-6 mdMax:mt-3 lg:flex">
        <div className="w-full lg:w-[50%] mb-6 mdMax:mb-3">
          <InputField
            id="firstName"
            label="First Name"
            placeHolder="Enter Firstname"
            className="w-full h-[48px]"
            isRequired={true}
            {...formik.getFieldProps("firstName")}
            error={formik.touched.firstName && formik.errors.firstName}
          />
        </div>
        <div className="w-full lg:w-[50%] mb-6 mdMax:mb-3">
          <InputField
            id="lastName"
            label="Last Name"
            placeHolder="Enter Lastname"
            className="w-full h-[48px]"
            isRequired={true}
            {...formik.getFieldProps("lastName")}
            error={formik.touched.lastName && formik.errors.lastName}
          />
        </div>
      </div>
      <div className="gap-4 lg:flex">
        <div className="w-full lg:w-[50%] mb-6 mdMax:mb-3">
          <InputField
            id="email"
            label="Email Id"
            placeHolder="Enter Work Email"
            className="w-full h-[48px]"
            isRequired={true}
            {...formik.getFieldProps("email")}
            error={formik.touched.email && formik.errors.email}
          />
        </div>
        <div className="w-full lg:w-[50%] mb-6 mdMax:mb-3">
          <InputField
            id="userName"
            label="Username"
            placeHolder="Enter Username"
            className="w-full h-[48px]"
            isRequired={true}
            {...formik.getFieldProps("userName")}
            error={formik.touched.userName && formik.errors.userName}
          />
        </div>
        <div className="w-full mb-6">
          <InputField
            id="phoneNumber"
            type="tel"
            label="Phone Number"
            placeHolder="Enter Phone Number"
            className="w-full h-[48px]"
            max_Length={10}
            isRequired={true}
            {...formik.getFieldProps("phoneNumber")}
            error={formik.touched.phoneNumber && formik.errors.phoneNumber}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/\D/g, ""); 
            }}
          />
        </div>
      </div>
      <div className="mb-6">
        <div className="flex">
          <div className="text-sm font-medium leading-7">Role</div>&nbsp;
          <span className="text-ird3 mt-[2px]">*</span>
        </div>
        <div className="flex mdMax:flex-col gap-8 lgMax:gap-2 adduser-radio-btn">
          <div>
            <RadioButtons
              value={"Developer"}
              onClick={() => {
                setAssignedRole(UserRoleEnum.Developer);
              }}
              checked={assignedRole === UserRoleEnum.Developer}
            />
          </div>
          <div>
            <RadioButtons
              value={"Maintainer"}
              onClick={() => {
                setAssignedRole(UserRoleEnum.Maintainer);
              }}
              checked={assignedRole === UserRoleEnum.Maintainer}
            />
          </div>

          <div>
            <RadioButtons
              value={"Guest"}
              onClick={() => {
                setAssignedRole(UserRoleEnum.Guest);
              }}
              checked={assignedRole === UserRoleEnum.Guest}
            />
          </div>
        </div>
      </div>
      <CustomButton
        label={"Create"}
        className="w-[456px] h-[52px] mt-2"
        onClick={formik.handleSubmit}
        disable={!(formik.dirty && formik.isValid) || isLoading}
      />
    </div>
  );
};

export default AddUsers;
