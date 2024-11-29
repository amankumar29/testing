import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import InputField from "Components/Atoms/InputField/InputField";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  apiCreateTestcaseRun,
  apiCreateTestSuiteRun,
} from "Services/API/Run/Run";
import { toast } from "react-toastify";
import { useEmailNotificationMutation } from "Services/API/apiHooks"
import { useSelector } from "react-redux";

const CreateApiRunModal = ({
  onClick = () => {},
  runIds = [],
  type = "",
  onRunCreated = () => {},
  clearCheckBoxes = () => {},
}) => {
  const [emailNotification] = useEmailNotificationMutation();
  const  { userDetails, defaultApplication } = useSelector((state) => state?.userDetails)

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  const formik = useFormik({
    initialValues: {
      runName: "",
    },
    validationSchema: Yup.object().shape({
      runName: Yup.string()
        .test("no-emojis", "Run name cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Run name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .min(2, "Run name must be at least 2 characters.")
        .max(50, "Run name must be at most 50 characters.")
        .matches(
          /^[a-zA-Z0-9_.\- ]+$/,
          "Enter only letters, numbers, _, -, ., and spaces."
        ),
    }),
  });

  const handleRun = () => {
    const payload = {
      runName: formik.values.runName,
      ...(type == "test-cases" || type == "suite-test-cases"
        ? { testCases: runIds }
        : { testSuites: runIds }),
    };
    if (type == "test-cases" || type == "suite-test-cases") {
      apiCreateTestcaseRun(payload)
        .then((res) => {
          toast.success("Run has been successfully processed");
          onClick();
          onRunCreated();
          sendEmailNotification({
            userDetails,
            runId: res?.data?.results?._id,
            type: 'runDetails',
          })
        })
        .catch((err) => {
          toast.error("An error occurred while processing your request");
          onClick();
        });
    } else {
      apiCreateTestSuiteRun(payload)
        .then((res) => {
        sendEmailNotification({
          userDetails,
          runId: res?.data?.results?._id,
          type: 'runDetails',
        })
          toast.success("Run has been successfully processed");
          onClick();
          onRunCreated();
        })
        .catch((err) => {
          toast.error("An error occurred while processing your request");
          onClick();
        });
    }
    clearCheckBoxes();
  };

  const sendEmailNotification = async ({ userDetails, runId, type, toAll= true }) => {
    try{
      const response = await emailNotification({
        fromUser: {
          firstName: userDetails?.firstName,
          lastName: userDetails?.lastName,
          email: userDetails?.email,
        },
        runId,
        type,
        toAll,
        projectId: defaultApplication?.projectId,
        applicationId: defaultApplication?.id
      });
      toast.success(response?.data?.message);
    }catch(error){
      toast.error(error?.response?.data?.details);
    }
  }

  return (
    <div className="w-[460px] h-auto">
      <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[10px]">
        <div className="w-[300px] h-[80px] flex justify-between items-center">
          <div
            className="text-[18px] font-medium leading-7"
            data-testid="modal_heading"
          >
            Create Test Run
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
      <div className="flex flex-col gap-6 mt-[18px]">
        <div className="flex items-center justify-center gap-4">
          <div>
            <InputField
              id="runName"
              label="Run Name"
              placeHolder="Enter Run Name"
              className="w-[352px] h-[52px]"
              inputClassName="text-sm"
              placeHolderSize={true}
              isRequired={true}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              {...formik.getFieldProps("runName")}
              error={formik.touched.runName && formik.errors.runName}
            />
          </div>
        </div>
        <div className="flex justify-center items-center">
          <CustomButton
            label={"Execute"}
            className={`w-[352px] h-[52px] mb-6`}
            onClick={handleRun}
            disable={!(formik.isValid && formik.dirty)}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateApiRunModal;
