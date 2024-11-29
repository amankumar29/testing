import CloseIcon from "@mui/icons-material/Close";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import SelectDropdown from "Components/Atoms/SelectDropdown/SelectDropdown";
import InputField from "Components/Atoms/InputField/InputField";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
export default function ConnectDataBaseModal({ onClick , setDBData=()=>{} , dbData }) {
  console.log(dbData)
  const dbConnection = dbData?.dbConnection;
  const [selectDbType, setSelectDbType] = useState(null);
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  const formik = useFormik({
    initialValues: {
      dataBaseType: dbConnection?.dataBaseType ||  null,
      userName: dbConnection?.userName || "",
      password: dbConnection?.password || "",
      host: dbConnection?.host || "",
      dataBaseName: dbConnection?.dataBaseName || "",
    },
    validationSchema: Yup.object({
      dataBaseType: Yup.mixed().required("Database Type is required."),
      userName: Yup.string()
      .test("no-emojis", "UserName cannot contain emojis.", (val) => {
        return !emojiRegex.test(val);
      })
      .required("Please enter your userName.")
      .matches(/^(?!\s+$)/, "Spaces are not allowed.")
      .min(2, "UserName must be at least 2 characters.")
      .max(50, "UserName must be at most 50 characters.")
      .matches(
        /^[a-zA-Z0-9_.\- ]+$/,
        "Enter only letters, numbers, _, -, ., and spaces."
      ),

      password: Yup.string()
        .required("Please enter your password")
        .test("no-emojis", "Invalid Password", (val) => {
          return !emojiRegex?.test(val);
        }),
      host: Yup.string()
        .required("Please enter your host name")
        .test("no-emojis", "Invalid host", (val) => {
          return !emojiRegex?.test(val);
        }),
      dataBaseName: Yup.string()
        .required("Please enter your dataBaseName")
        .test("no-emojis", "Invalid dataBaseName", (val) => {
          return !emojiRegex?.test(val);
        }),
    }),
    onSubmit: (values) => {
      console.log(values);
      setDBData(values)
    },
  });

  const handleOptionDataBaseType = (value) => {
    setSelectDbType(value);
    formik.setFieldValue("dataBaseType", value);
  };

  const handleAdd=()=>{
    formik.handleSubmit()
    onClick()
  }

    // Effect to synchronize local state with formik initial value
    useEffect(() => {
      setSelectDbType(formik.values.dataBaseType);
    }, [formik.values.dataBaseType]);
  
  return (
    <div className="w-[774px] h-[480px]">
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[10px]">
          <div className="w-[495px] h-[80px]  flex justify-between items-center">
            <div
              className="text-[18px] font-medium leading-7"
              data-testid="modal_heading"
            >
              Connect to Database
            </div>

            <div className="flex justify-end !pr-6">
              <CloseIcon
                className="cursor-pointer"
                data-testid="close_Icon"
                onClick={onClick}
              />
            </div>
          </div>
        </div>
        <div className="mt-3 px-[33px] flex justify-center items-center">
          <div className="flex flex-col gap-4">
            <div className="w-[352px]">
              <SelectDropdown
                id="dataBaseType"
                placeHolder="Enter the Database Type"
                inputClassName="!text-sm"
                label="Database Type"
                options={dataBaseType}
                value={selectDbType}
                onBlur={() => formik.setFieldTouched(`dataBaseType`, true)}
                onChange={handleOptionDataBaseType}
                error={
                  formik.touched.dataBaseType && formik.errors.dataBaseType
                }
              />
            </div>
            <div className="flex justify-center items-center gap-3">
              <div>
                <InputField
                  id="userName"
                  name="userName"
                  isRequired={true}
                  label="UserName"
                  placeHolder="Enter UserName"
                  className="w-[352px] h-[52px]"
                  placeHolderSize={true}
                  {...formik.getFieldProps("userName")}
                  error={formik.touched.userName && formik.errors.userName}
                />
              </div>
              <div>
                <InputField
                  id="password"
                  name="password"
                  isRequired={true}
                  label="Password"
                  placeHolder="Enter Password"
                  className="w-[352px] h-[52px]"
                  placeHolderSize={true}
                  {...formik.getFieldProps("password")}
                  error={formik.touched.password && formik.errors.password}
                />
              </div>
            </div>
            <div className="flex justify-center items-center gap-3">
              <div>
                <InputField
                  id="host"
                  name="host"
                  isRequired={true}
                  label="Host"
                  placeHolder="Enter Host"
                  className="w-[352px] h-[52px]"
                  placeHolderSize={true}
                  {...formik.getFieldProps("host")}
                  error={formik.touched.host && formik.errors.host}
                />
              </div>
              <div>
                <InputField
                  id="dataBaseName"
                  name="dataBaseName"
                  isRequired={true}
                  label="Database Name"
                  placeHolder="Enter Database Name"
                  className="w-[352px] h-[52px]"
                  placeHolderSize={true}
                  {...formik.getFieldProps("dataBaseName")}
                  error={
                    formik.touched.dataBaseName && formik.errors.dataBaseName
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-[35px]">
          <CustomButton
            label={`Add`}
            className="!w-[154px] h-[52px]"
            onClick={()=>{
              handleAdd()
            }}
            disable={!(formik.isValid && formik.dirty)}
          />
          <CustomButton
            label="Cancel"
            className="!w-[154px] h-[52px] !text-ibl3 bg-iwhite border border-ibl1 hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1"
            onClick={onClick}
          />
        </div>
      </div>
    </div>
  );
}

const dataBaseType = [
  { id: 1, name: "PostgreSQL", type: "postgreSql" },
  { id: 2, name: "MySQL", type: "mySql" },
  { id: 3, name: "MicrosoftSQL", type: "microsoftSql" },
  { id: 4, name: "OracleSQL", type: "oracleSql" },
];
