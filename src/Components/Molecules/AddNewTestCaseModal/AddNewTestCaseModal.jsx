import CloseIcon from "@mui/icons-material/Close";
import InputField from "../../Atoms/InputField/InputField";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function AddNewTestCaseModal({
  onClick,
  type,
  selectedProject,
  selectedApplication,
  testSuiteData,
  backArrow = false,
  onBackNavigation = () => {},
}) {
  const navigate = useNavigate();

  const handleGoToTestCase = () => {
    let data = {
      item: formik?.values?.testCaseName,
      project: selectedProject,
      application: selectedApplication,
      isEditable: true,
      isEditRequired: false,
      isRunRequired: false,
    };
    if (type === "test-cases") {
      navigate(`/projects/${type}/add-test-steps`, {
        state: { ...data },
      });
    } else if (type === "suite-test-cases") {
      navigate(`/projects/test-suites/test-cases/add-test-steps`, {
        state: {
          ...data,
          testSuiteData: testSuiteData,
        },
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      testCaseName: "",
    },
    validationSchema: Yup.object({
      testCaseName: Yup.string()
        .required("Test Case Name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed."),
    }),
    onSubmit: handleGoToTestCase,
  });

  return (
    <div className="flex items-center justify-center w-auto h-full">
      <div className="w-[416px] h-[329px] rounded-2xl shadow-2xl">
        <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[10px]">
          <div
            className={`${
              backArrow ? "w-full" : "w-[310px]"
            } h-[80px]  flex justify-between items-center`}
          >
            {backArrow && (
              <div className="ml-[19px] cursor-pointer">
                <ArrowBackIcon onClick={onBackNavigation} />
              </div>
            )}
            <div
              className="text-[18px] font-medium leading-7"
              data-testid="modal_heading"
            >
              Add New Test Case
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
        <div className="flex flex-col h-[249px] overflow-y-auto py-8 px-[32px]">
          <div className="flex items-center cursor-pointer">
            <InputField
              data-testid="testCaseName_Value"
              id="testCaseName"
              label="Test Case Name"
              className="w-[352px]"
              placeHolder="Enter Test Case Name"
              isRequired={true}
              {...formik.getFieldProps("testCaseName")}
              error={formik.touched.testCaseName && formik.errors.testCaseName}
            />
          </div>
          <CustomButton
            data-testid="add_button"
            label="Add"
            className="w-[352px] !h-[52px] mt-[52px]"
            disable={!(formik.isValid && formik.dirty)}
            onClick={handleGoToTestCase}
          />
        </div>
      </div>
    </div>
  );
}

AddNewTestCaseModal.propTypes = {
  onClick: PropTypes.func,
};
