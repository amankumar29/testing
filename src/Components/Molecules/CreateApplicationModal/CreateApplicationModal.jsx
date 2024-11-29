import { Modal } from "../../Atoms/Modal/Modal";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import InputField from "../../Atoms/InputField/InputField";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import SelectDropdown from "../../Atoms/SelectDropdown/SelectDropdown";

const CreateApplicationModal = ({ isOpen, onClose, data, onCreate }) => {
  const optionList = [
    { id: 1, name: "Web", type: "Web" },
    { id: 2, name: "Android", type: "Android" },
    { id: 3, name: "iOS", type: "iOS" },
    { id: 4, name: "REST API", type: "API" },
  ];

  const handleSubmit = (values) => {
    const payload = {
      project_id: data?.id,
      applicationName: values?.applicationName,
      applicationType: values?.applicationType?.type,
    };
    onCreate(payload);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      applicationType: null,
      applicationName: "",
    },
    validationSchema: Yup.object({
      applicationType: Yup.object().nullable().required("Type is required."),
      applicationName: Yup.string()
        .required("Application name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed."),
    }),
    onSubmit: handleSubmit,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[626px] h-[424px]">
        <div className="flex items-center justify-center h-20 bg-ibl7 rounded-t-[10px] relative">
          <p
            className="text-lg font-medium leading-7"
            data-testid="add_new_application"
          >
            Add New Application
          </p>
          <div className="absolute right-0 mr-[33px] cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
            <CloseIcon onClick={onClose} data-testid="close_Icon" />
          </div>
        </div>
        <div className="flex justify-center mt-8 text-sm leading-5 ">
          <p
            className="max-w-[350px] text-center"
            data-testid={"details_message"}
          >
            Please fill in the details for the new application under the project{" "}
            <span
              className="font-medium"
              data-testid={`keyword_Name_${data?.keyword_name}`}
            >
              {data?.keyword_name}
            </span>
            .
          </p>
        </div>
        <div className="px-[33px] mt-12 flex gap-4 ">
          <div>
            <SelectDropdown
              id={"applicationType"}
              isRequired={true}
              options={optionList}
              label={"Application Type"}
              placeHolder={"Select Type"}
              iconForApplication={true}
              value={formik.values.applicationType}
              onBlur={() => {
                formik.setFieldTouched("applicationType", true);
              }}
              onChange={(option) =>
                formik.setFieldValue("applicationType", option)
              }
              error={
                formik.touched.applicationType && formik.errors.applicationType
              }
            />
          </div>
          <div className="w-full">
            <InputField
              isRequired={true}
              label={"Application Name"}
              placeHolder={"Enter Application Name"}
              onChange={formik.handleChange}
              {...formik.getFieldProps("applicationName")}
              error={
                formik.touched.applicationName && formik.errors.applicationName
              }
            />
          </div>
        </div>
        <div className="flex justify-center mt-12">
          <CustomButton
            data-testid="submit_button"
            type="submit"
            label={"Create"}
            className={`w-[246px]`}
            onClick={formik.handleSubmit}
            disable={!(formik.dirty && formik.isValid)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateApplicationModal;

CreateApplicationModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
};
