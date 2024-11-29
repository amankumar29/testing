import logo from "Assets/Images/logo.svg";
import InputField from "Components/Atoms/InputField/InputField";
import PasswordInputField from "Components/Atoms/PasswordInputField/PasswordInputField";
import PrimaryButton from "Components/Atoms/PrimaryButton/PrimaryButton";
import TextLink from "Components/Atoms/TextLink/TextLink";
import { useLoginMutation } from "Services/API/apiHooks";
import { setCredentials } from "Store/ducks/authSlice";
import { useFormik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Cookies from "js-cookie";

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize dispatch
  const [login, { isLoading }] = useLoginMutation();
  const [passwordError, setPasswordError] = useState(null);

  const handleSubmit = async (values) => {
    try {
      const data = await login(values).unwrap();
      if (data) {
        // Dispatch setCredentials with the received access token and refreshToken
        dispatch(
          setCredentials({
            token: data.results.accessToken,
            refreshToken: data.results.refreshToken,
          })
        );
        Cookies.set("ilAuth", data.results.accessToken);

        navigate("/dashboard");
        // toast.success("Logged in Successfully")
      }
    } catch (error) {
      if (error.data.details === "Invalid login credentials") {
        setPasswordError("Invalid password");
      } else {
        toast.error(error.data.details);
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: handleSubmit,
  });

  const handlePasswordFocus = () => {
    setPasswordError("");
  };

  return (
    <div className="px-[25px] lg:px-[48px] p-6 lg:p-10 overflow-y-auto bg-iwhite rounded-[16px] h-full 2xl:h-fit">
      <div className="flex items-center justify-center font-bold text-ibl1">
        <img
          src={logo}
          alt="logo"
          className="xl:h-[100px] 2xl:h-auto w-full max-w-40 mdMax:max-w-36 md:max-w-60"
          data-testid={`logo_Image`}
        />
      </div>
      <div
        className="flex justify-center items-center text-igy2 text-[28px] mdMax:text-[20px] 2xl:text-[32px] font-semibold mt-4 2xl:mt-8"
        data-testid={`sign_In`}
      >
        Sign In
      </div>
      <div className="mt-4 2xl:mt-6">
        <InputField
          id="email"
          label="Email"
          placeHolder="Enter your work email"
          className="w-full h-[52px]"
          isRequired={true}
          {...formik.getFieldProps("email")}
          error={formik.touched.email && formik.errors.email}
        />
      </div>
      <div className="mt-4 2xl:mt-6">
        <PasswordInputField
          label="Password"
          placeHolder="Enter your password"
          className="h-[52px]"
          onFocus={handlePasswordFocus}
          handleKeyEnter={formik.handleSubmit}
          isRequired={true}
          {...formik.getFieldProps("password")}
          error={
            (formik.touched.password && formik.errors.password) || passwordError
          }
        />
      </div>
      <div className="mt-2 text-end mdMax:mt-4">
        <TextLink label="Forgot Password?" />
      </div>
      <div className="mt-5 2xl:mt-9 mdMax:mt-2">
        <PrimaryButton
          data-testid={"sign_In_Button"}
          label={"Sign In"}
          disabled={formik.values.length < 1 || !(formik.isValid) || isLoading}
          onClick={formik.handleSubmit}
        />
      </div>
      <div className="my-5 text-center">
        <p
          className="text-xs font-medium text-igy5"
          data-testid={"sign_In_Message"}
        >
          By Clicking “Sign In” you agree to our
          <TextLink label="Terms of Service" className="mx-1 underline" />
          and
          <TextLink label="Privacy Policy." className="mx-1 underline" />
        </p>
      </div>
      <hr className="text-ibl17 rounded-[50%] my-6 mdMax:my-2" />
      <div
        className="font-medium text-center text-igy5"
        data-testid={`confirm_Message`}
      >
        Don’t have an account?
        <TextLink label="Sign Up" className="pl-2" />
      </div>
    </div>
  );
};

export default LoginForm;

const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .required("Please enter your work email")
    .matches(
      /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/,
      "Invalid Email"
    )
    .test("no-emojis", "Invalid Email", (val) => {
      return !emojiRegex?.test(val);
    }),
  password: Yup.string()
    .required("Please enter your password")
    .test("no-emojis", "Invalid Password", (val) => {
      return !emojiRegex?.test(val);
    }),
});
