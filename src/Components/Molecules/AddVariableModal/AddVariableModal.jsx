import { Modal } from "Components/Atoms/Modal/Modal";
import CloseIcon from "@mui/icons-material/Close";
import InputField from "Components/Atoms/InputField/InputField";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useEffect, useMemo } from "react";
import {
  useCreateGlobalVariableMutation,
  useUpdateGlobalVariableMutation,
} from "Services/API/apiHooks";
import { toast } from "react-toastify";
const AddVariableModal = ({
  isOpen,
  onClose,
  onGetVariable = () => {},
  isEditVariable,
  initialValues,
  projectId,
  applicationId,
  fetchGlobalVariableList = () => {},
  getGlobalId,
}) => {
  const [createVariable] = useCreateGlobalVariableMutation();
  const [updateVariable] = useUpdateGlobalVariableMutation();

  const handleClose = () => {
    onClose();
    if (!isEditVariable) {
      formik.resetForm();
    }
    onClose();
  };

  const fetchCreateGlobalVariable = async (value) => {
    const payload = {
      projectId: projectId,
      applicationId: applicationId,
      variableName: value?.variableName?.trim(),
      variableValue: value?.variableValue,
    };
    try {
      const result = await createVariable(payload).unwrap();
      const msg = result?.message;
      fetchGlobalVariableList();
      onClose();
      toast.success(msg);
    } catch (error) {
      toast.error(error?.data?.details);
    }
  };

  const fetchUpdateGlobalVariable = async (value) => {
    const updatePayload = {
      _id: initialValues?._id,
      projectId: projectId,
      applicationId: applicationId,
      ...(value?.variableName !== initialValues?.variableName && {
        variableName: value?.variableName,
      }),
      ...(value?.variableValue !== initialValues?.variableValue && {
        variableValue: value?.variableValue,
      }),
    };

    try {
      const result = await updateVariable(updatePayload).unwrap();
      fetchGlobalVariableList();
      const msg = result?.message
      toast.success(msg)
      onClose();
    } catch (error) {
      const errMsg = error?.data?.details;
      toast.error(errMsg);
    }
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  const formik = useFormik({
    initialValues: {
      variableName: initialValues?.variableName || "",
      variableValue: initialValues?.variableValue || "",
    },
    validationSchema: Yup.object({
      variableName: Yup.string()
        .test("no-emojis", "Variable Name cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Variable Name is required."),
      variableValue: Yup.string()
        .test("no-emojis", "Variable Value cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Variable Value is required."),
    }),
    onSubmit: (value) => {
      onGetVariable(value);
      if (isEditVariable !== false) {
        fetchUpdateGlobalVariable(value);
      } else {
        fetchCreateGlobalVariable(value);
      }
      formik.resetForm();
    },
  });

  useEffect(() => {
    if (!isEditVariable) {
      formik.resetForm();
    } else if (initialValues && isEditVariable) {
      formik.setFieldValue("variableName", initialValues?.variableName);
      formik.setFieldValue("variableValue", initialValues?.variableValue);
    }
  }, [initialValues, isEditVariable]);

  const isButtonEnabled = useMemo(() => {
    return (
      formik.values.variableName !== initialValues?.variableName ||
      formik.values.variableValue !== initialValues.variableValue
    );
  }, [
    formik.values.variableName,
    formik.values.variableValue,
    initialValues?.variableName,
    initialValues?.variableValue,
  ]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="w-[520px] h-[400px] flex flex-col gap-3">
          <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[10px]">
            <div className="w-full md:w-[320px] h-[80px]  flex justify-center md:justify-between items-center mdMax:relative">
              <div
                className="text-[18px] font-medium leading-7"
                data-testid="modal_heading"
              >
                {`${isEditVariable ? "Edit" : "Add"} Variable`}
              </div>

              <div className="flex justify-end !pr-6 mdMax:absolute mdMax:right-0">
                <CloseIcon
                  onClick={onClose}
                  className="cursor-pointer"
                  data-testid="close_Icon"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 items-center justify-center">
            <div>
              <InputField
                id="variableName"
                label="Variable Name"
                className={"w-[400px] h-[52px]"}
                placeHolder="Enter Variable Name"
                isRequired={true}
                {...formik.getFieldProps("variableName")}
                error={
                  formik.touched.variableName && formik.errors.variableName
                }
              />
            </div>
            <div>
              <InputField
                id="variableValue"
                label="Variable Value"
                className={"w-[400px] h-[52px]"}
                placeHolder="Enter Variable Name"
                isRequired={true}
                {...formik.getFieldProps("variableValue")}
                error={
                  formik.touched.variableValue && formik.errors.variableValue
                }
              />
            </div>
          </div>
          <div className="flex justify-center items-center mt-8">
            <CustomButton
              label={`${isEditVariable ? "Edit" : "Add"}`}
              className="!w-[400px]  h-[52px]"
              onClick={formik.handleSubmit}
              disable={!isButtonEnabled || !(formik.isValid && formik.dirty)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddVariableModal;
