import InputField from "Components/Atoms/InputField/InputField";
import PrimaryButton from "Components/Atoms/PrimaryButton/PrimaryButton";
import { useFormik } from "formik";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetUserDataQuery,
  useUpdateUserMutation,
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation
} from "Services/API/apiHooks";
import * as Yup from "yup";
import TextLink from "../../Components/Atoms/TextLink/TextLink";
import ChangePasswordModal from "../../Components/Molecules/ChangePasswordModal/ChangePasswordModal";
import useChangePasswordModal from "../../Store/useChangePasswordModal";
import {
  setError,
  setLoading,
  setUserDetails,
} from "Store/ducks/userDetailsSlice";
import deleteicon from "Assets/Images/delete.svg";
import { Modal } from "Components/Atoms/Modal/Modal";
import CloseIcon from "@mui/icons-material/Close";


const UserProfile = () => {
  const dispatch = useDispatch();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const { isOpen, setShow, setHide } = useChangePasswordModal();
  const { userDetails } = useSelector((state) => state?.userDetails);
  const fileInputRef = useRef(null);
  const [uploadProfileImage] = useUploadProfileImageMutation();
  const [deleteProfileImage] = useDeleteProfileImageMutation();
  const assetsURL = process.env.REACT_APP_ASSETS_URL;
  const [profileView, setProfileView] = useState(false);
  // const {data:userData, refetch } = useGetUserDataQuery();
  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
    refetch,
  } = useGetUserDataQuery();

  const handleSave = async (values) => {
    const payload = {
      firstName: values?.firstName?.trim(),
      lastName: values?.lastName?.trim(),
    };

    try {
      const res = await updateUser(payload).unwrap();
      if (res) {
        refetch();
        toast.success(res.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // useEffect(() => {

  //     dispatch(setLoading(isUserLoading));
  //     if (userError) {
  //       dispatch(setError(userError.message));
  //       toast.error(userError.message);
  //     }
  //     if (userData) {
  //       dispatch(setUserDetails(userData.results));
  //     }

  // }, [ userData, userError, isUserLoading, dispatch]);

  useEffect(() => {
    if (userDetails) {
      formik.setFieldValue("firstName", userDetails?.firstName);
      formik.setFieldValue("lastName", userDetails?.lastName);
      formik.setFieldValue("email", userDetails?.email);
    }
  }, [userDetails]);

  useEffect(() => {
    dispatch(setLoading(isUserLoading));
    if (userError) {
      dispatch(setError(userError.message));
      toast.error(userError.message);
    }
    if (userData) {
      dispatch(setUserDetails(userData.results));
    }
  }, [userData, userError, isUserLoading, dispatch]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    validationSchema: UpdateProfileSchema,
    onSubmit: handleSave,
  });

  const hiddenButton = useMemo(() => {
    return !(
      formik.dirty &&
      formik.isValid &&
      (formik.values.firstName !== userDetails?.firstName ||
        formik.values.lastName !== userDetails?.lastName)
    );
  }, [formik, userDetails]);

  const handleChangePassword = () => {
    setShow();
  };

  const uploadImage = () => {
    fileInputRef?.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e?.target?.files[0]
    const formData = new FormData()
    formData.append("profile", file)
      try{
        const res = await uploadProfileImage({id:userDetails?._id, formData}).unwrap();
        if(res){
          toast.success('Profile photo uploaded successfully');
          refetch();
        }
      }catch(error){
        console.log(error)
      }
  };

  const deleteUserProfileImage = async(id) => {
    try{
      const res = await deleteProfileImage(id).unwrap(); 
      if(res){
        fileInputRef.current.value = null;
        toast.success('Profile photo deleted successfully');
        refetch();
      }
    }catch(error){
      console.log(error)
    } 
  }

  const showProfileView = () => {
    setProfileView(true);
  }

  const closeProfileView = () => {
    setProfileView(false);
  }


  return (
    <>
      <div className="w-full">
        <div
          className="flex items-center justify-center text-[20px] font-medium text-igy1 leading-7 w-full"
          data-testid="profile_Information"
        >
          Profile Information
        </div>
        <div className="mt-6 border border-solid border-ibl7" />
        <div className="md:flex w-full">
          <div>
            <div className="w-32 h-32 mx-16 mdMax:mx-auto mt-16 mdMax:mt-5 rounded-full bg-ibl1 text-iwhite text-[46px] flex justify-center items-center font-semibold uppercase profile-zoom">
              {userDetails?.profilePicUrl ? (
                <img src={userDetails?.profilePicUrl && `${assetsURL}${userDetails?.profilePicUrl}`} className="w-full h-full object-cover rounded-full hover:cursor-pointer object-top" onClick={showProfileView}/>
              ) : (
                <>
                  {userDetails?.firstName && userDetails?.firstName[0]}
                  {userDetails?.lastName && userDetails?.lastName[0]}
                </>
              )}
              <Modal isOpen={profileView} onClose={closeProfileView}>
                <div className="flex flex-col relative">
                <div className="cursor-pointer absolute right-2 top-2 w-[35px] h-[35px] flex justify-center items-center bg-[rgba(0,0,0,0.5)] hover:bg-[rgba(0,0,0,0.7)] hover:transition-all hover:duration-300 hover:ease-in text-iwhite rounded-full">
                    <CloseIcon onClick={closeProfileView} data-testid="close_Icon" />
                  </div>
                  {
                    userDetails?.profilePicUrl && (
                      <img src={userDetails?.profilePicUrl && `${assetsURL}${userDetails?.profilePicUrl}`} className="w-[400px] h-[400px] object-cover rounded-full hover:cursor-pointer mx-16 my-5 object-top" />
                    )
                  }
                </div>
            </Modal>
            </div>
            <div className="flex gap-3 mdMax:justify-center">
            <button
                className="bg-ibl1 w-[165px] h-[45px] mt-4 text-iwhite flex justify-center items-center rounded-lg text-sm ml-12 mdMax:ml-0"
                onClick={uploadImage}
              >
                Upload Image
              </button>
              {
                userDetails?.profilePicUrl && (
                  <>
                  <img src={deleteicon} alt="Delete Icon" className="cursor-pointer pt-4" onClick={() => {
                    deleteUserProfileImage(userDetails?._id);
                }}/>
                  </>
                )
              }
            </div>
            <input
                  type="file"
                  accept=".jpg,.png,.svg"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange(e)}
                />
            <div className="mt-4 text-sm text-center text-igy7">
              Account Id - {userDetails?.userId}
            </div>
          </div>
          <div className="h-[80vh] mdMax:h-[auto] border border-solid border-ibl7" />
          <div className="flex flex-col items-center flex-grow md:pl-4 pl-0">
            <div className="md:flex gap-[18px] mt-8 lgMax:w-full">
              <div className="mdMax:mb-2">
                <InputField
                  id="firstName"
                  label="First Name"
                  placeHolder="Enter your first name"
                  className="w-[230px] lgMax:w-full h-[52px]"
                  isRequired={true}
                  {...formik.getFieldProps("firstName")}
                  error={formik.touched.firstName && formik.errors.firstName}
                />
              </div>
              <div>
                <InputField
                  id="lastName"
                  label="Last Name"
                  placeHolder="Enter your last name"
                  className="w-[230px] lgMax:w-full h-[52px]"
                  isRequired={true}
                  {...formik.getFieldProps("lastName")}
                  error={formik.touched.lastName && formik.errors.lastName}
                />
              </div>
            </div>
            <div className="mt-4 lgMax:w-full">
              <InputField
                disabled={true}
                id="email"
                label="Email"
                className="w-[478px] lgMax:w-full h-[52px]"
                {...formik.getFieldProps("email")}
              />
            </div>
            <div className="flex justify-end w-[478px] lgMax:w-full mt-4">
              <TextLink
                label={"Change Password ?"}
                onClick={handleChangePassword}
                className={`!text-sm`}
              />
              <ChangePasswordModal isOpen={isOpen} onClose={setHide} />
            </div>
            <div className="w-[478px] lgMax:w-full mt-4">
              <PrimaryButton
                data-testid="update_Button"
                disabled={hiddenButton || isLoading}
                label={"Update"}
                onClick={formik.handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default UserProfile;

const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

const UpdateProfileSchema = Yup.object().shape({
  firstName: Yup.string()
    .test("no-emojis", "First name cannot contain emojis.", (val) => {
      return !emojiRegex.test(val);
    })
    .required("First name is required.")
    .matches(/^(?!\s+$)/, "Spaces are not allowed.")
    .matches(/^[A-Za-z]+$/, "First Name can only contain alphabets.")
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
});
