import { CustomButton } from "../../../../Components/Atoms/CustomButton/CustomButton";
import InputField from "../../../../Components/Atoms/InputField/InputField";
import ToggleButton from "../../../../Components/Atoms/ToggleButton/ToggleButton";
import RadioButtons from "../../../../Components/Atoms/RadioButtons/RadioButtons";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useMemo, useRef, useState } from "react";

const ApplicationConfiguration = ({
  onAddClick = () => {},
  formValues,
  onInputChange,
  onToggleChange,
  setFormValues,
  onUnmount,
  configData,
}) => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
const [isCheck,setIsCheck]=useState(false)
  const formikRef = useRef(null);
  const baseSchema = {
    telegramChatId: Yup.string().matches(
      /^(?!\s+$)/,
      "Spaces are not allowed."
    ),
    telegramToken: Yup.string().matches(
      /^(?!\s+$)/,
      "Spaces are not allowed."
    ),
    slackChatId: Yup.string().matches(
      /^(?!\s+$)/,
      "Spaces are not allowed."
    ),
    slackToken: Yup.string().matches(
      /^(?!\s+$)/,
      "Spaces are not allowed."
    ),
  };

  const formik = useFormik({
    initialValues: {
      telegramChatId: configData?.telegramChatId || null,
      telegramToken: configData?.telegramToken || null,
      slackChatId: configData?.slackChatId || null,
      slackToken: configData?.slackToken || null,
    },
    validationSchema: Yup.object({
      telegramChatId:
        formValues.reportTelegram &&
        baseSchema.telegramChatId.required("Chat ID is required."),
      telegramToken:
        formValues.reportTelegram &&
        baseSchema.telegramToken.required("Token is required."),
      slackChatId:
        formValues.reportSlack &&
        baseSchema.slackChatId.required("Chat ID is required."),
      slackToken:
        formValues.reportSlack &&
        baseSchema.slackToken.required("Token is required."),
    }),
    onSubmit: (values) => {
      const trimmedValues = {};
      Object.keys(values).forEach((key) => {
        if(typeof values[key] === "string"){
          trimmedValues[key] = values[key].trim();
        }else{
          trimmedValues[key] = values[key];
        }
      })
      const mergedValues = { ...formValues, ...trimmedValues };
      onAddClick(mergedValues);
    },
  });

  useEffect(() => {
    if (
      (formValues.reportTelegram &&
        (!formik.values.telegramChatId || !formik.values.telegramToken)) ||
      (formValues.reportSlack &&
        (!formik.values.slackChatId || !formik.values.slackToken))
    ) {
      setIsButtonDisabled(true);
    } else {
      setIsButtonDisabled(false);
    }
  }, [formik.values, formValues]);

  const handleAddClick = () => {
    formik.handleSubmit();
  };

  const handleClick = () => {
    onAddClick(formValues);
  };

  useEffect(() => {
    return () => {
      onUnmount(formik.values);
    };
  }, [formValues, onUnmount]);

  useEffect(() => {
    formikRef.current = formik;
  }, [formik]);

  useEffect(() => {
    formik.validateForm();
    if (Object.keys(formik.errors)?.length == 0) {
      formik.setErrors("");
    }
  }, [formik.values]);

  // Call the onUnmount callback with the latest Formik values when the component unmounts
  useEffect(() => {
    return () => {
      if (formikRef.current) {
        onUnmount(formikRef.current.values);
      }
    };
  }, [onUnmount]);

const isDisable = useMemo(() => {
  if (formValues.reportTelegram || formValues.reportSlack) {
    return !(formik.dirty && formik.isValid);
  }
  return isButtonDisabled;
}, [formValues.reportTelegram, formValues.reportSlack, formik.dirty, formik.isValid, isButtonDisabled]);

  return (
    <>
      <div className="h-[558px] pt-[29px]">
        <div className="flex justify-center items-center">
          <div className="flex flex-row items-center gap-[72px] relative">
            <div className="flex flex-col gap-4">
              <InputField
                label="Retry Test Fail"
                id="retryTestFail"
                placeHolder="Enter Retry Test Fail Count"
                className="w-[304px] h-[52px]"
                value={formValues.retryTestFail}
                onChange={onInputChange("retryTestFail")}
              />
              <InputField
                label="Email ID"
                id="emailId"
                placeHolder="Enter Email ID"
                className="w-[304px] h-[52px]"
                value={formValues.emailId}
                onChange={onInputChange("emailId")}
              />

              <div className="flex flex-row gap-4">
                <span className="text-sm font-medium leading-5 text-igy1">
                  Send Report to Telegram? <span className="pl-2">:</span>
                </span>
                <div>
                  <ToggleButton
                    onToggleChange={onToggleChange("reportTelegram")}
                    isChecked={formValues.reportTelegram}
                    setIsChecked={(value) => {
                      onToggleChange("reportTelegram")(value);
                      if (!value) {
                        formik.setFieldValue("telegramChatId", "");
                        formik.setFieldValue("telegramToken", "");
                      }
                      setIsCheck(!isCheck)
                    }}
                    addNewConfig={true}
                  />
                </div>
              </div>
              {formValues.reportTelegram && (
                <div className="absolute top-[241px] flex gap-4">
                  <InputField
                    label="Chat ID"
                    id="telegramChatId"
                    name="telegramChatId"
                    placeHolder="Enter Chat ID"
                    className="w-[144px] h-[52px]"
                    value={formValues.telegramChatId}
                    isRequired={true}
                    {...formik.getFieldProps("telegramChatId")}
                    error={
                      formik.touched.telegramChatId &&
                      formik.errors.telegramChatId
                    }
                    placeHolderSize={true}
                  />

                  <InputField
                    label="Token"
                    id="telegramToken"
                    name="telegramToken"
                    placeHolder="Enter Token"
                    className="w-[144px] h-[52px]"
                    value={formValues.telegramToken}
                    isRequired={true}
                    {...formik.getFieldProps("telegramToken")}
                    error={
                      formik.touched.telegramToken &&
                      formik.errors.telegramToken
                    }
                    placeHolderSize={true}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-[9px] mb-[30px]">
              <div className="text-sm font-medium leading-5 text-igy1">
                Screenshot for the test steps?
              </div>
              <div className="flex flex-col gap-1 items-start">
                <RadioButtons
                  value="Passed Steps"
                  onClick={() =>
                    setFormValues({ ...formValues, testSteps: "Passed Steps" })
                  }
                  checked={formValues.testSteps === "Passed Steps"}
                  className="text-sm font-normal leading-[22px] text-iblack"
                />
                <RadioButtons
                  value="Failed Steps"
                  onClick={() =>
                    setFormValues({ ...formValues, testSteps: "Failed Steps" })
                  }
                  checked={formValues.testSteps === "Failed Steps"}
                  className="text-sm font-normal leading-[22px] text-iblack"
                />
              </div>
              <div className="pt-6 flex flex-col gap-4">
                <div className="flex flex-row gap-4">
                  <div className="text-sm font-medium leading-5 text-igy1">
                    Want to Video Record? <span className="pl-2">:</span>
                  </div>
                  <div>
                    <ToggleButton
                      onToggleChange={onToggleChange("videoRecord")}
                      isChecked={formValues.videoRecord}
                      setIsChecked={(value) =>
                        onToggleChange("videoRecord")(value)
                      }
                      addNewConfig={true}
                    />
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="text-sm font-medium leading-5 text-igy1">
                    Send Report to Slack? <span className="pl-4">:</span>
                  </div>
                  <div>
                    <ToggleButton
                      onToggleChange={onToggleChange("reportSlack")}
                      isChecked={formValues.reportSlack}
                      setIsChecked={(value) => {
                        onToggleChange("reportSlack")(value);
                        if (!value) {
                          formik.setFieldValue("slackChatId", "");
                          formik.setFieldValue("slackToken", "");
                        }
                      }}
                      addNewConfig={true}
                    />
                  </div>
                </div>
                {formValues.reportSlack && (
                  <div className="absolute top-[204px] -right-[64px] flex gap-4">
                    <InputField
                      label="Chat ID"
                      id="slackChatId"
                      placeHolder="Enter Chat ID"
                      className="w-[144px] h-[52px]"
                      value={formValues.slackChatId}
                      isRequired={true}
                      {...formik.getFieldProps("slackChatId")}
                      error={
                        formik.touched.slackChatId && formik.errors.slackChatId
                      }
                      placeHolderSize={true}
                    />

                    <InputField
                      label="Token"
                      id="slackToken"
                      placeHolder="Enter Token"
                      className="w-[144px] h-[52px]"
                      value={formValues.slackToken}
                      isRequired={true}
                      {...formik.getFieldProps("slackToken")}
                      error={
                        formik.touched.slackToken && formik.errors.slackToken
                      }
                      placeHolderSize={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <CustomButton
          className="!w-[100px] !h-10"
          onClick={() => {
            formValues.reportTelegram || formValues.reportSlack
              ? handleAddClick()
              : handleClick();
          }}
          label="Add"
          disable={isDisable}
        />
      </div>
    </>
  );
};

export default ApplicationConfiguration;

ApplicationConfiguration.propTypes = {
  formValues: PropTypes.shape({
    retryTestFail: PropTypes.number,
    emailId: PropTypes.string,
    reportTelegram: PropTypes.bool,
    reportSlack: PropTypes.bool,
    telegramChatId: PropTypes.string,
    telegramToken: PropTypes.string,
    slackChatId: PropTypes.string,
    slackToken: PropTypes.string,
    testSteps: PropTypes.string,
    videoRecord: PropTypes.bool,
  }),
  onInputChange: PropTypes.func,
  onToggleChange: PropTypes.func,
  onAddClick: PropTypes.func,
  setFormValues: PropTypes.func,
  onUnmount: PropTypes.func,
  configData: PropTypes.shape({
    telegramChatId: PropTypes.string,
    telegramToken: PropTypes.string,
    slackChatId: PropTypes.string,
    slackToken: PropTypes.string,
  }),
};
