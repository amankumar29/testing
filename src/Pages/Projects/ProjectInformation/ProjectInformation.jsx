import { CustomButton } from "../../../Components/Atoms/CustomButton/CustomButton";
import PropTypes from "prop-types";
import InputField from "../../../Components/Atoms/InputField/InputField";
import TextArea from "../../../Components/Atoms/TextArea/TextArea";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

export default function ProjectInformation({ step, handleNext, initialValues }) {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      projectName: initialValues?.projectName ||'',
      projectDescription: initialValues?.projectDescription || '',
    },
    validationSchema: Yup.object().shape({
      projectName: Yup.string()
      .required('Project Name is required.')
      .matches(/^(?!\s+$)/, 'Spaces are not allowed.'),
      projectDescription: Yup.string().matches(/^(?!\s+$)/, 'Spaces are not allowed.')
    }),
    onSubmit: (values) => {
      handleNext(values);
    }
  })

  const handleClick = () => {
    formik.resetForm();
    navigate('/projects');
  }

  const isFormValidAndFilled = () => {
    const { projectName, projectDescription } = formik.values;
    return formik.isValid && (projectName.trim() !== '' || projectDescription.trim() !== '');
  };

  return (
    <>
      <div className=" w-full h-[760px] mx-[70px] mt-7">
        <div className="flex justify-center font-medium leading-7 text-igy1 text-xl">
          Project Information
        </div>

        <div className="flex flex-col items-center">
        <div className="h-[660px] pt-[77px]">
          <InputField
            label="Project Name"
            id="project"
            placeHolder="Enter Project Name"
            className="w-[456px] h-[52px]"
            isRequired={true}
            {...formik.getFieldProps('projectName')}
            error={formik.touched.projectName && formik.errors.projectName}
          />
          <div className="pt-4">
            <TextArea
              label="Description"
              placeHolder="Enter Description"
              className="h-[124px] w-[456px] resize-none"
              {...formik.getFieldProps('projectDescription')}
              charLimit={300}
              onBlur={() => formik.setFieldTouched("projectDescription", true)}
              id="projectDescription"
              name="projectDescription"
              showCharCount={true}
              error={formik.touched.projectDescription && formik.errors.projectDescription}
              isFilledValue={!!formik.values.projectDescription}
              />
          </div>
        </div>
        </div>
        
        <div className="flex justify-between p-4">
          <div className="text-ibl1 px-4 py-2 rounded cursor-pointer text-[16px] font-medium leading-5 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in-out hover:underline" onClick={handleClick}>
            Cancel
          </div>
          <CustomButton
            className="!w-[100px] !h-10"
            onClick={formik.handleSubmit}
            disable={!isFormValidAndFilled()}
            label={step === 2 ? "Save" : "Next"}
          ></CustomButton>
        </div>
      </div>
    </>
  );
}

ProjectInformation.propTypes = {
  step: PropTypes.func,
  handleNext: PropTypes.func,
  initialValues: PropTypes.object
};
