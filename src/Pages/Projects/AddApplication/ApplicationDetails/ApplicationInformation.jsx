import { CustomButton } from "../../../../Components/Atoms/CustomButton/CustomButton";
import SelectDropdown from "../../../../Components/Atoms/SelectDropdown/SelectDropdown";
import InputField from "../../../../Components/Atoms/InputField/InputField";
import rest from "../../../../Assets/Images/apiicon.svg";
import android from "../../../../Assets/Images/androidicon.svg";
import ios from "../../../../Assets/Images/iosicon.svg";
import webicon from "../../../../Assets/Images/webicon.svg";
import tvIcon from "../../../../Assets/Images/tv.svg";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";

const ApplicationInformation = ({
  onNextClick = () => {},
  currentApplication = {},
}) => {
  const [selectApplicationType, setSelectApplicationType] = useState();

  const handleOptionClick = (option, index, setFieldValue) => {
    setFieldValue(`components.${index}.selectedOption`, option);
    setSelectApplicationType(option);
  };

  const formik = useFormik({
    initialValues: {
      components: [{ name: "", selectedOption: "" }],
    },
    validationSchema: Yup.object().shape({
      components: Yup.array().of(
        Yup.object().shape({
          name: Yup.string()
            .required("Application Name is required.")
            .matches(
              /^(?!\s+$)/,
              "Spaces are not allowed."
            ),
          selectedOption: Yup.mixed().required("Application type is required."),
        })
      ),
    }),
    onSubmit: (values) => {
      onNextClick(values);
    },
  });

  return (
    <div>
      <div className="h-[558px]">
        <div className="flex justify-center items-center h-[401px]">
          <div className="flex flex-col gap-5">
            <div>
              <SelectDropdown
                iconForApplication={true}
                isRequired={true}
                label="Application Type"
                inputClassName="text-[18px]"
                id="applicationType"
                className={"h-[52px]"}
                options={options}
                value={selectApplicationType}
                placeHolder="Select Application"
                onBlur={() => {
                  formik.setFieldTouched(
                    `components.${[0]}.selectedOption`,
                    true
                  );
                }}
                onChange={(val) => {
                  handleOptionClick(val, 0, formik.setFieldValue);
                }}
                error={
                  formik.touched.components?.[0]?.selectedOption &&
                  formik.errors.components?.[0]?.selectedOption
                }
              />
            </div>
            <div>
              <InputField
                isRequired={true}
                label="Name"
                inputClassName={`!w-[352px] h-[52px]`}
                value={formik?.values?.components?.[0]?.name}
                placeHolder="Enter Application Name"
                {...formik.getFieldProps(`components.${[0]}.name`)}
                onBlur={() =>
                  formik.setFieldTouched(`components.${[0]}.name`, true)
                }
                error={
                  formik.touched.components?.[0]?.name &&
                  formik.errors.components?.[0]?.name
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <CustomButton
          className="!w-[100px] !h-10"
          onClick={formik.handleSubmit}
          label="Next"
          disable={!formik.isValid || !formik.dirty}
        ></CustomButton>
      </div>
    </div>
  );
};

export default ApplicationInformation;

const options = [
  { id: 1, name: "Web", type: "Web", img: webicon },
  { id: 2, name: "Android", type: "Android", img: android },
  { id: 3, name: "iOS", type: "iOS", img: ios },
  { id: 4, name: "REST API", type: "API", img: rest },
  { id: 5, name: "TV", type: "TV", img: tvIcon },
];
