import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import android from "Assets/Images/androidicon.svg";
import rest from "Assets/Images/apiicon.svg";
import ios from "Assets/Images/iosicon.svg";
import webicon from "Assets/Images/webicon.svg";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import TextArea from "Components/Atoms/TextArea/TextArea";
import { useFormik } from "formik";
import { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import InputField from "../../Components/Atoms/InputField/InputField";
import SelectDropdown from "../../Components/Atoms/SelectDropdown/SelectDropdown";
import ToggleButton from "../../Components/Atoms/ToggleButton/ToggleButton";
import { createProject } from "../../Services/API/CreateProject/CreateProject";
import { createSpreadsheet } from "../../Services/API/Spreadsheet/Spreadsheet";

const AddNewProjects = () => {
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(false);
  const [selectedProj, setSelectedProj] = useState();
  const [saveCreate, setSaveCreate] = useState(false);
  const [singleProject, setSingleProject] = useState();

  const handleCreate = (values) => {
    const applicationName = values.components[0].name;
    const payload = {
      spreadsheetName: `${values?.projectName}_${applicationName}`,
    };
    createSpreadsheet(payload)
      .then((response) => {
        console.log("Response:", response?.data);
        const spreadShitId = response?.data?._id;
        setSaveCreate(true);
        const data = values.components;
        const transformedData = data?.map((item) => ({
          type: item?.selectedOption?.type,
          name: item?.name,
          retry_count: 0,
          send_emails: ["prarabdhab@gmail.com", "kiranr@yopmail.com"],
          screenshot_type: "All",
          video_record: false,
          is_telegram: true,
          telegram_chat_id: "123456789",
          telegram_token: "abcdefg123456",
          is_slack: false,
          is_teams: false,
          slack_chat_id: null,
          slack_token: null,
          file_url: spreadShitId,
        }));
        const requestBody = {
          name: values.projectName,
          description: values.reason,
          application: transformedData,
        };
        createProject(requestBody)
          .then((res) => {
            const data = res.data.data;
            const message = res?.data?.message;
            console.log(data);
            navigate("/projects");
            toast.success(message);
            setSaveCreate(false);
          })
          .catch((err) => {
            const message = err?.response?.data?.details;
            toast.error(message);
            setSaveCreate(false);
          });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const formik = useFormik({
    initialValues: {
      projectName: "",
      reason: "",
      components: [{ name: "", selectedOption: "" }],
    },
    validationSchema: Yup.object().shape({
      projectName: Yup.string()
        .required("Project Name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed."),
      reason: Yup.string().matches(
        /^(?!\s+$)/,
        "Spaces are not allowed."
      ),
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
    onSubmit: handleCreate,
  });

  const [rowCount, setRowCount] = useState(
    formik.initialValues.components.length
  );

  const handleOptionClick = (option, index, setFieldValue) => {
    setFieldValue(`components.${index}.selectedOption`, option);
    setSelectedProj(option);
    if (index === 0) setSingleProject(option);
  };

  const handleToggleChange = (values, setFieldValue) => {
    setIsChecked(!isChecked);

    if (!isChecked) {
      const components = values.components.map((comp, index) => {
        if (index === 0) {
          return comp;
        }
        return { name: "", selectedOption: "" };
      });
      setFieldValue("components", components);
    } else {
      const newComponents = [values.components[0]];
      setFieldValue("components", newComponents);
      setRowCount(newComponents.length);
    }
  };

  const handleAddNewApplication = (values, setFieldValue) => {
    const newComponents = [
      ...values.components,
      { name: "", selectedOption: "" },
    ];
    setFieldValue("components", newComponents);
    formik.setFieldTouched(
      `components.${newComponents.length - 1}.name`,
      false
    );
    formik.setFieldTouched(
      `components.${newComponents.length - 1}.selectedOption`,
      false
    );
    setRowCount(newComponents.length);
  };

  const handleDelete = (index, values, setFieldValue) => {
    const newComponents = [...values.components];
    newComponents.splice(index, 1);
    setFieldValue("components", newComponents);
    setRowCount(newComponents.length);
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          {/* Heading & Buttons */}
          <div className="flex justify-between mt-[5px]">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate("/projects", { replace: true })}
            >
              <div data-testid="arrow_back_icon">
                <ArrowBackIcon />
              </div>
              <div
                className="text-[20px] font-medium leading-7 text-igy1"
                data-testid="add_new_project"
              >
                Add New Project
              </div>
            </div>
            <div className="flex gap-2">
              <CustomButton
                onClick={() => navigate("/projects", { replace: true })}
                label="Cancel"
                className="w-[162px] h-10 !text-ibl3 bg-iwhite border border-ibl1 hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1"
              />
              <CustomButton
                label="Create"
                isFocused
                onClick={formik.handleSubmit}
                disable={
                  (!formik.isValid ||
                    !formik.dirty ||
                    !selectedProj ||
                    (isChecked && rowCount === 1) ||
                    formik.values.components.some(
                      (component) =>
                        !component.selectedOption ||
                        component.selectedOption.name === "Select type"
                    )) &&
                  !saveCreate
                }
              />
            </div>
          </div>

          {/* Project Name and Description */}
          <InputField
            label="Project Name"
            id="project"
            placeHolder="Enter your project name"
            className="w-[656px] h-[52px]"
            isRequired={true}
            {...formik.getFieldProps("projectName")}
            error={formik.touched.projectName && formik.errors.projectName}
          />
          <div className="mt-[2px]">
            <TextArea
              label="Description"
              placeHolder="Enter the description (Optional)"
              className="h-[144px] w-[656px] resize-none"
              {...formik.getFieldProps("reason")}
              charLimit={300}
              onBlur={() => formik.setFieldTouched("reason", true)}
              id="reason"
              name="reason"
              showCharCount={true}
              error={formik.touched.reason && formik.errors.reason}
            />
          </div>
          <div className="mt-[5px] flex gap-4">
            <div data-testid="multiple_applications">
              Are you planning to create multiple applications?
            </div>
            <div>
              <ToggleButton
                onToggleChange={() =>
                  handleToggleChange(
                    formik.values,
                    formik.setFieldValue,
                    formik.setFieldTouched
                  )
                }
                isChecked={isChecked}
                setIsChecked={setIsChecked}
              />
            </div>
          </div>
        </div>

        {isChecked ? (
          <>
            <div className="flex flex-col gap-4 mt-[37px]">
              {formik.values.components.map((comp, index) => (
                <div className="flex gap-4" key={index}>
                  <div>
                    <SelectDropdown
                      iconForApplication={true}
                      isRequired={true}
                      label="Application Type"
                      className="h-[52px]"
                      inputClassName="text-[18px]"
                      id="applicationType"
                      options={options}
                      placeHolder="Select Type"
                      value={comp?.selectedOption}
                      onBlur={() => {
                        formik.setFieldTouched(
                          `components.${[index]}.selectedOption`,
                          true
                        );
                      }}
                      onChange={(val) =>
                        handleOptionClick(val, index, formik.setFieldValue)
                      }
                      error={
                        formik.touched.components?.[index]?.selectedOption &&
                        formik.errors.components?.[index]?.selectedOption
                      }
                    />
                  </div>
                  <div>
                    <InputField
                      isRequired={true}
                      label="Name"
                      id={index}
                      name={index}
                      inputClassName={`!w-[436px] h-[52px]`}
                      value={formik?.values?.components?.[index]?.name}
                      placeHolder="Enter Name"
                      {...formik.getFieldProps(`components.${index}.name`)}
                      onBlur={() =>
                        formik.setFieldTouched(`components.${index}.name`, true)
                      }
                      error={
                        formik.touched.components?.[index]?.name &&
                        formik.errors.components?.[index]?.name
                      }
                    />
                  </div>
                  <div className="mt-[50px] ml-5">
                    {formik.values.components.length > 1 && (
                      <RiDeleteBin6Line
                        style={{
                          cursor: "pointer",
                          width: "!17px",
                          height: "!18px",
                          color: "#052C85",
                        }}
                        onClick={() =>
                          handleDelete(
                            index,
                            formik.values,
                            formik.setFieldValue
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-4 mt-[37px]">
              <div>
                <SelectDropdown
                  iconForApplication={true}
                  isRequired={true}
                  label="Application Type"
                  inputClassName="text-[18px]"
                  id="applicationType"
                  className={"h-[52px]"}
                  options={options}
                  placeHolder="Select Type"
                  value={singleProject}
                  onBlur={() => {
                    formik.setFieldTouched(
                      `components.${[0]}.selectedOption`,
                      true
                    );
                  }}
                  onChange={(val) =>
                    handleOptionClick(val, 0, formik.setFieldValue)
                  }
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
                  inputClassName={`!w-[436px] h-[52px]`}
                  value={formik?.values?.components?.[0]?.name}
                  placeHolder="Enter Name"
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
          </>
        )}

        <div className="mt-4 w-[212px]">
          <CustomButton
            label="Add New Application"
            className={`text-4 font-medium leading-6 w-[233px] mt-5 ${
              !isChecked && "bg-ibl2"
            } `}
            onClick={() =>
              handleAddNewApplication(
                formik.values,
                formik.setFieldValue,
                formik.setTouchedField
              )
            }
            disable={!isChecked}
            isAddBtn={true}
          />
        </div>
      </div>
    </>
  );
};

export default AddNewProjects;

const options = [
  { id: 1, name: "Web", type: "Web", img: webicon },
  { id: 2, name: "Android", type: "Android", img: android },
  { id: 3, name: "iOS", type: "iOS", img: ios },
  { id: 4, name: "REST API", type: "API", img: rest },
];
