import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import InputField from "../../Atoms/InputField/InputField";
import userDateTime from "../../../Helpers/userDateTime/userDateTime";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import { updateTestCase } from "../../../Services/API/TestCase/TestCase";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

const TransferCaseInfoModal = ({ onClick = () => {}, testCaseInfo }) => {
  const [externalIds, setExternalIds] = useState(""); // State for the input field

  const testCaseId = testCaseInfo?._id;

  const fetchTestCaseInfoUpdate = () => {
    const payload = {
      externalId: formik?.values?.testCaseExternalId,
    };
    updateTestCase(payload, testCaseId)
      .then((res) => {
        const data = res?.data?.results;
        setExternalIds(data?.externalIds);
        const message = res?.data?.message || "Updated Successfully";
        toast.success(message);
        onClick();
      })
      .catch((err) => {
        const errMsg = err?.response?.data?.details;
        toast.error(errMsg);
      });
  };

  const formik = useFormik({
    initialValues: {
      testCaseExternalId: "",
    },
    validationSchema: Yup.object().shape({
      testCaseExternalId: Yup.string()
        .required("External ID is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .min(2, "External ID must be at least 2 characters.")
        .max(50, "External ID must be at most 50 characters.")
        .matches(
          /^[a-zA-Z0-9_.\- ]+$/,
          "Enter only letters, numbers, _, -, ., and spaces."
        ),
    }),
    onSubmit: (values) => {
      fetchTestCaseInfoUpdate(values);
    },
  });

  return (
    <div className="flex items-center justify-center w-auto h-full">
      <div className="w-full md:w-[660px] h-[536px] rounded-2xl shadow-2xl">
        <div className="flex flex-row  bg-ibl7 w-full rounded-t-[10px]">
          <div className="h-[80px] flex justify-center items-center">
            <div className="flex justify-start pl-6"></div>
            <div
              className="text-[18px] font-medium leading-7 justify-center items-center w-[570px] break-all line-clamp-2"
              data-testid={`${testCaseInfo?.testCaseName}_details`}
            >
              {testCaseInfo?.testCaseName} Details
            </div>
            <div
              className="flex justify-end !pr-6 pl-[14px]"
              data-testid="close_icon"
            >
              <CloseIcon onClick={onClick} className="cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="flex flex-col h-[320px] overflow-y-auto gap-4 mt-6 mx-8">
          <div className="flex flex-col gap-[17px]">
            <div className="flex justify-between">
              <div
                className="text-sm font-medium leading-5 text-igy2 w-[50%]"
                data-testid="test_case_name"
              >
                Test Case Name
              </div>
              <div
                className="text-igy2 text-[16px] font-normal break-all"
                data-testid={`${testCaseInfo?.testCaseName}_name`}
              >
                {testCaseInfo?.testCaseName}
              </div>
            </div>
            <div className="flex justify-between">
              <div
                className="text-sm font-medium leading-5 text-igy2"
                data-testid="owner"
              >
                Owner
              </div>
              <div
                className="text-igy2 text-[16px] font-normal"
                data-testid={`${testCaseInfo?.createdBy?.firstName}_date`}
              >
                {testCaseInfo?.createdBy?.firstName}{" "}
                {testCaseInfo?.createdBy?.lastName}
              </div>
            </div>
            <div className="flex justify-between">
              <div
                className="text-sm font-medium leading-5 text-igy2"
                data-testid="created_on"
              >
                Created On
              </div>
              <div
                className="text-igy2 text-[16px] font-normal"
                data-testid={`${testCaseInfo?.createdAt}_date`}
              >
                {userDateTime(testCaseInfo?.createdAt)}
              </div>
            </div>
            <div className="flex justify-between">
              <div
                className="text-sm font-medium leading-5 text-igy2"
                data-testid="updated_on"
              >
                Updated On
              </div>
              <div
                className="text-igy2 text-[16px] font-normal"
                data-testid={`${testCaseInfo?.updatedAt}_update`}
              >
                {userDateTime(testCaseInfo?.updatedAt)}
              </div>
            </div>
            <div className="flex justify-between">
              <div
                className="text-sm font-medium text-igy2"
                data-testid="status"
              >
                Status
              </div>
              <div
                className="text-sm font-medium text-igy2"
                data-testid={`${testCaseInfo?.status}_status`}
              >
                {testCaseInfo?.status}
              </div>
            </div>
            <div className="flex justify-between">
              <div
                className="text-sm font-medium text-igy2"
                data-testid="number_of_steps"
              >
                Number Of Steps
              </div>
              <div
                className="text-sm font-medium text-igy2"
                data-testid={`${testCaseInfo?.noOfSteps}_steps`}
              >
                {testCaseInfo?.testSteps?.length || testCaseInfo?.noOfSteps || 0}
              </div>
            </div>

            <div className="flex justify-between">
              <div
                className="text-sm font-medium text-igy2 mt-[10px]"
                data-testid="external_ids"
              >
                External ID
              </div>
              {testCaseInfo.externalId ? (
                <div className="text-sm font-medium text-igy2">
                  {testCaseInfo?.externalId}
                </div>
              ) : (
                <InputField
                  id="testCaseExternalId"
                  name="testCaseExternalId"
                  className="w-[228px] h-[40px]"
                  inputClassName="text-sm"
                  placeHolder="Enter an External ID"
                  {...formik.getFieldProps("testCaseExternalId")}
                  error={
                    formik.touched.testCaseExternalId &&
                    formik.errors.testCaseExternalId
                  }
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mt-8 gap-7 mdMax:px-5">
          <CustomButton
            className="w-[218px] h-[52px]"
            label="Save"
            isFocused
            onClick={formik.handleSubmit}
            disable={!(formik.isValid && formik.dirty)}
          />
        </div>
      </div>
    </div>
  );
};

TransferCaseInfoModal.propTypes = {
  onClick: PropTypes.func,
  testCaseInfo: PropTypes.object, // Ensure testCaseInfo is an object
  testCaseLoading: PropTypes.bool,
};

export default TransferCaseInfoModal;
