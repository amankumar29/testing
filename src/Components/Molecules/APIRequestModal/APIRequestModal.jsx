import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import SelectDropdown from "Components/Atoms/SelectDropdown/SelectDropdown";
import InputField from "Components/Atoms/InputField/InputField";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import Params from "Pages/Projects/AddNewTestCases/APIDetailsInfo/Params";
import Response from "Pages/Projects/AddNewTestCases/APIDetailsInfo/Response/Response";
import AuthorizationAPIModal from "Pages/Projects/AddNewTestCases/APIDetailsInfo/AuthorizationAPIModal/AuthorizationAPIModal";
import Body from "Pages/Projects/AddNewTestCases/APIDetailsInfo/Body/Body";
import { Headers } from "Pages/Projects/AddNewTestCases/APIDetailsInfo/Headers/Headers";
import axios from "axios";
import { AssertionManager } from "Pages/Projects/AddNewTestCases/APIDetailsInfo/AssertionManager/AssertionManager";
import { Extract } from "Pages/Projects/AddNewTestCases/APIDetailsInfo/Extract/Extract";
import { apiRunResponse } from "Services/API/TestCase/TestCase";

const APIRequestModal = ({
  onClick = () => {},
  apiModalData = {},
  fetchAPIModalData = () => {},
}) => {
  //bodysection
  const [json, setJson] = useState(
    apiModalData?.body && apiModalData?.bodyType == "raw"
      ? JSON.stringify(apiModalData?.body)
      : "{}"
  );
  const [selectedOption, setSelectedOption] = useState("none");
  const [params, setParams] = useState([
    { id: 1, key: "", value: "", description: "", isChecked: false },
  ]);
  const [formJSONData, setFormJSONData] = useState(
    apiModalData?.bodyType == "form-data" && apiModalData?.formData?.length
      ? apiModalData?.formData
      : [
          {
            id: 1,
            key: "",
            value: "",
            description: "",
            isChecked: false,
            filePath: null,
            fileName: null,
            type: { id: 1, name: "Text", value: "TEXT" },
          },
        ]
  );
  const [formDataOption, setFormDataOption] = useState(null);

  //Response section
  const [response, setResponse] = useState({});
  const [paramCount, setParamCount] = useState(3);

  const options = [
    { id: 1, name: "GET" },
    { id: 2, name: "POST" },
    { id: 3, name: "PUT" },
    { id: 4, name: "DELETE" },
    { id: 5, name: "HEAD" },
    { id: 6, name: "PATCH" },
  ];

  const [selectApiMethod, setSelectApiMethod] = useState(options[0]);

  const [paramHeader, setParamHeader] = useState([
    {
      id: 1,
      key: "",
      value: "",
      description: "",
      isChecked: true,
    },
  ]);
  const [headerStep, setHeaderStep] = useState(false);

  //Params states
  const [paramData, setParamData] = useState(
    apiModalData?.params?.length
      ? apiModalData?.params
      : [{ id: "1", key: "", value: "", description: "", isChecked: false }]
  );

  //Authorization states
  const ScheduleTypeList = [
    { id: 1, name: "No Auth", type: "No Auth" },
    { id: 2, name: "Basic Auth", type: "Basic Auth" },
    { id: 3, name: "Bearer Token", type: "Bearer Token" },
  ];
  const [selectedAuth, setSelectedAuth] = useState(
    apiModalData?.authType ? apiModalData?.authType : ScheduleTypeList[0]
  );
  const [urlCodedData, setUrlCodedData] = useState(
    apiModalData?.headers?.authorization
      ? apiModalData?.headers?.authorization
      : {
          username: "",
          password: "",
          token: "",
        }
  );
  const [extractData, setExtractData] = useState(
    apiModalData?.extract?.length
      ? apiModalData?.extract
      : [{ id: 1, key: "", value: "", description: "", isChecked: false }]
  );

  const [step, setStep] = useState(0);
  const [requestSchema, setRequestSchema] = useState({});
  const [assertions, setAssertions] = useState(
    apiModalData?.assertions ? apiModalData?.assertions : []
  );

  const handleOptionAuthClick = (option) => {
    setSelectedAuth(option);
  };

  const textFormData = formJSONData.filter(
    (item) => item?.key && item?.value && item?.description
  );
  const fileFormData = formJSONData.filter(
    (item) => item?.key && item?.fileName && item?.description
  );

  const formik = useFormik({
    initialValues: {
      url: apiModalData?.url || "",
    },
    validationSchema: Yup.object().shape({
      url: Yup.string()
        .required("URL is required.")
        .max(2048, "URL is too long.")
        .matches(
          /^(https?:\/\/)?/,
          "URL should start with http:// or https://"
        ),
    }),
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const handleOptionClick = (option) => {
    setSelectApiMethod(option);
  };

  const tabs = [
    { label: "Params", step: 0 },
    { label: "Authorization", step: 1 },
    { label: "Headers", step: 2 },
    { label: "Body", step: 3 },
    { label: "Response", step: 4 },
    { label: "Assertion", step: 5 },
    { label: "Extract", step: 6 },
  ];

  const getTabClass = (path) =>
    step === path
      ? "font-semibold border-b-[3px] border-ibl1 text-ibl1"
      : "text-ibl2 cursor-pointer font-semibold hover:text-ibl1";

  const handleChange = (step) => {
    setStep(step);
    if (step === 2) {
      setHeaderStep(true);
    } else {
      setHeaderStep(false);
    }
  };

  // Handles the URL field change and updates query params
  const handleUrlChange = (newUrl) => {
    formik.setFieldValue("url", newUrl);
    const [baseUrl, queryString] = newUrl.split("?");

    if (queryString) {
      const params = queryString.split("&");
      const newParamsData = params?.map((param, index) => {
        const [key, value] = param?.split("=");
        return {
          id: String(index + 1),
          key: key || "",
          value: value || "",
          description: "",
          isChecked: true,
        };
      });

      // Add an empty row for new key-value pairs if the last param is not empty
      if (
        newParamsData[newParamsData?.length - 1].key !== "" ||
        newParamsData[newParamsData?.length - 1].value !== ""
      ) {
        newParamsData.push({
          id: String(newParamsData.length + 1),
          key: "",
          value: "",
          description: "",
          isChecked: false,
        });
      }

      setParams(newParamsData);
    } else {
      setParams([
        { id: "1", key: "", value: "", description: "", isChecked: false },
      ]);
    }
  };

  // Updates the URL when query params change
  const handleParamsDataChange = (newParamsData) => {
    setParamData(newParamsData);
    updateUrlFromParams(newParamsData);
  };

  const updateUrlFromParams = (params) => {
    const queryString = params
      .filter((param) => param.isChecked && (param.key || param.value))
      .map(
        (param) =>
          `${encodeURIComponent(param.key)}${
            param.value ? `=${encodeURIComponent(param.value)}` : ""
          }`
      )
      .join("&");

    const baseUrl = formik.values?.url?.split("?")[0];
    const newUrl = `${baseUrl}${queryString ? `?${queryString}` : ""}`;
    formik.setFieldValue("url", newUrl);
  };

  const cleanAndParseJson = (jsonString) => {
    try {
      const cleanedString = jsonString
        .replace(/\\n/g, "")
        .replace(/\\"/g, '"')
        .trim();
      return JSON.parse(cleanedString);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  };

  const convertKeyValueToObject = (keyPairs) => {
    return [...keyPairs].reduce((data, pair) => {
      const key = pair.key;
      const value = pair.value;

      if (key === "") return data;
      return {
        ...data,
        [key]: value,
      };
    }, {});
  };

  // const handleRequestSend = async () => {
  //   const formData = new FormData();
  //   formJSONData?.forEach((item) => {
  //     formData.append(
  //       item?.key,
  //       item?.selectedOption?.name === "File" ? item?.file : item?.value
  //     );
  //   });

  //   const dummyRequestBody = {
  //     method: selectApiMethod?.name,
  //     url: formik.values.url,
  //     header: paramHeader,
  //     authorization: {
  //       Authorization: `Bearer ${urlCodedData}`,
  //     },
  //     body: selectedOption == "form-data" ? formData : cleanAndParseJson(json),

  //     params: params,
  //   };

  //   try {
  //     const response = await axios({
  //       url: dummyRequestBody?.url,
  //       method: dummyRequestBody?.method,
  //       // params: convertKeyValueToObject(dummyRequestBody?.params),
  //       headers: {
  //         ...convertKeyValueToObject(dummyRequestBody?.header),
  //         ...dummyRequestBody?.authorization,
  //       },
  //       data: dummyRequestBody?.body,
  //     });
  //     console.log(response);
  //     setResponse(response);
  //   } catch (e) {
  //     console.log(e);
  //     setResponse({});
  //   }
  //   setStep(4);
  // };

  const urlSeperater = (url) => {
    const [baseUrl, queryString] =
      url && url.includes("?") ? url.split("?") : [url, ""];
    return baseUrl;
  };

  const handleRequestSend = () => {
    const getAuthorizationHeader = (auth) => {
      if (auth?.username && auth?.password) {
        const credentials = `${auth?.username}:${auth?.password}`;
        const encodedCredentials = btoa(credentials); // Base64 encode
        return `Basic ${encodedCredentials}`;
      } else if (auth?.token) {
        return `Bearer ${auth?.token}`;
      }
      return "";
    };
    const headers = [
      {
        id: "1", // Start with id "1" for Authorization
        key: "Authorization",
        value: getAuthorizationHeader(urlCodedData),
        description: "",
        isChecked: true,
      },
      ...paramHeader
        .filter((header) => header?.key && header?.value) // Filter out items with empty key or value
        .map((header, index) => ({
          id: (index + 2).toString(), // Start from id "2" and increment
          key: header?.key,
          value: header?.value,
          description: header?.description,
          isChecked: header?.isChecked,
        })),
    ];
    const modifiedAssertions = assertions.map((item) => {
      let parsedValue = item?.expectedValue;

      if (typeof parsedValue === "string" && parsedValue !== "") {
        try {
          parsedValue = JSON.parse(parsedValue);
        } catch {
          // Keep parsedValue as a string if JSON parsing fails
        }
      }

      return {
        ...item,
        expectedValue: parsedValue,
      };
    });
    const payload = {
      apiRequest: {
        method: selectApiMethod?.name,
        url: urlSeperater(formik.values.url),
        params: paramData,
        headers: headers,
        bodyType: selectedOption,
        body: selectedOption == "raw" ? cleanAndParseJson(json) : {},
        formData: selectedOption == "form-data" ? formJSONData : [],
        assertions: modifiedAssertions,
        extract: extractData
      },
    };
    apiRunResponse(payload)
      .then((res) => {
        const data = res?.data?.results;
        setResponse(data);
        const requiredAssertions = data?.payload?.assertions;
        if (requiredAssertions?.length > 0) {
          requiredAssertions.forEach((payloadAssertion, index) => {
            if (data.assertions[index]) {
              payloadAssertion.actualValue = data.assertions[index].actualValue;
              payloadAssertion.expectedValue = payloadAssertion?.expectedValue
                ? JSON.stringify(payloadAssertion.expectedValue, null, 2)
                : "";
              payloadAssertion.error = data.assertions[index].reason || "";
              payloadAssertion.status = data.assertions[index].pass
                ? "Passed"
                : "Failed";
            }
          });
          setAssertions(requiredAssertions);
        }
      })
      .catch((res) => {
        setResponse({});
      });
    setStep(4);
  };

  const selectedOptionValue = (val) => {
    setFormDataOption(val);
  };

  const handleBearerToken = (tokenDetails) => {
    selectedAuth?.name == "Bearer Token"
      ? setUrlCodedData({ token: tokenDetails?.token })
      : selectedAuth?.name == "Basic Auth"
      ? setUrlCodedData({
          username: tokenDetails?.username,
          password: tokenDetails?.password,
        })
      : setUrlCodedData("");
  };

  const handleAPIData = () => {
    const requiredArray = {
      params: paramData,
      url: urlSeperater(formik.values.url),
      method: selectApiMethod,
      authType: selectedAuth,
      bodyType: selectedOption,
      headers: {
        authorization: urlCodedData,
        paramHeader: paramHeader,
      },
      body: selectedOption == "raw" ? cleanAndParseJson(json) : {},
      formData: selectedOption == "form-data" ? formJSONData : [],
      assertions: assertions,
      extract: extractData,
    };

    fetchAPIModalData(requiredArray);
  };

  useEffect(() => {
    if (apiModalData) {
      // Avoid multiple re-renders by batching state updates where possible
      const { params, url, authType, method, bodyType, headers, body } =
        apiModalData;

      authType &&
        setSelectedAuth((prevAuth) =>
          prevAuth !== authType ? authType : prevAuth
        );

      setSelectApiMethod((prevMethod) =>
        method && prevMethod !== method ? method : options[0]
      );

      bodyType &&
        setSelectedOption((prevBodyType) =>
          prevBodyType !== bodyType ? bodyType : prevBodyType
        );

      // Handle headers
      if (headers) {
        headers.paramHeader &&
          setParamHeader((prevHeader) =>
            prevHeader !== headers.paramHeader
              ? headers.paramHeader
              : prevHeader
          );
      }
    }
  }, []);

  return (
    <div className="w-full lg:w-[1080px] min-h-[720px] bg-iwhite rounded-2xl api-request-model">
      <div
        className="flex justify-end !pr-6 pl-[14px]"
        data-testid="close_icon"
      >
        <CloseIcon onClick={onClick} className="cursor-pointer mt-4" />
      </div>
      <div className="md:flex justify-center items-center gap-3 pt-[17px] px-5">
        <SelectDropdown
          inputClassName="text-sm"
          className={"h-[40px] !w-full md:!w-[128px] hover: cursor-pointer"}
          options={options}
          onChange={handleOptionClick}
          value={selectApiMethod}
          apiMethodsDropdown={true}
          removeContainer={true}
        />
        <InputField
          placeHolder={"Enter Request URL"}
          className={"w-full md:w-[686px] h-[40px] input-full"}
          placeHolderSize={true}
          {...formik.getFieldProps(`url`)}
          value={formik?.values?.url}
          onChange={(e) => handleUrlChange(e?.target?.value)}
          onBlur={() => formik.setFieldTouched(`url`, true)}
          error={formik?.touched?.url && formik?.errors?.url}
        />
        <CustomButton
          label="Send"
          className="w-[128px] h-[40px] mt-[6px]"
          onClick={() => handleRequestSend()}
        />
      </div>
      <div className="flex px-6 pt-6 lgMax:overflow-y-auto">
        <div className="rounded-[6px] bg-iwhite shadow-[0_0px_4px_0_rgba(12,86,255,0.72)] w-full pb-2 lgMax:min-w-[1000px]">
          <div className="flex gap-20 mb-3  mt-3.5 px-[16px] border-igy6 border-solid border-b-2 justify-between">
            {tabs?.map((tab) => (
              <motion.div
                key={tab?.step}
                className={getTabClass(tab?.step)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleChange(tab?.step)}
              >
                <span
                  data-testid={`tab_label_${tab?.label}`}
                  className={`${
                    step === tab?.step
                      ? "pointer-events-none"
                      : "cursor-pointer"
                  } flex gap-1 items-center mb-2`}
                >
                  <span>
                    {tab?.label}
                    {tab.step === 2 ? `(${paramCount})` : ""}
                  </span>
                </span>
              </motion.div>
            ))}
          </div>
          {/* <div className="w-full border-t text-igy12 -my-3"></div> */}
          <div className="relative">
            {step === 0 && (
              <Params
                onUrlChange={handleUrlChange}
                paramsData={paramData}
                onParamsDataChange={handleParamsDataChange}
              />
            )}
          </div>
          <div>
            {step === 1 && (
              <AuthorizationAPIModal
                onChangeBearerToken={handleBearerToken}
                urlBearerToken={urlCodedData}
                handleOptionClick={handleOptionAuthClick}
                selectedAuth={selectedAuth}
              />
            )}
          </div>
          <div>
            {step === 2 && (
              <Headers
                params={paramHeader}
                setParams={setParamHeader}
                paramCount={paramCount}
                setParamCount={setParamCount}
                headerStep={headerStep}
                setHeaderStep={setHeaderStep}
              />
            )}
          </div>
          <div>
            {step === 3 && (
              <Body
                formParam={formJSONData}
                setFormParam={setFormJSONData}
                params={params}
                setParams={setParams}
                selectedOptionValue={selectedOptionValue}
                json={json}
                setJson={setJson}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
              />
            )}
          </div>
          <div className="">
            {step === 4 && <Response response={response} />}
          </div>
          <div>
            {step === 5 && (
              <AssertionManager
                handleAssertions={(data) => {
                  setAssertions(data);
                }}
                assertionsData={assertions}
              />
            )}
          </div>
          <div>
            {step === 6 && (
              <Extract
                extractData={extractData}
                onExtractDataChange={(values) => setExtractData(values)}
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-4 justify-center my-7 w-full">
        <CustomButton
          label="Cancel"
          className="w-[218px] h-[52px] !text-ibl3 bg-iwhite border border-ibl1  hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1"
          onClick={onClick}
        />
        <CustomButton
          // onClick={formik.handleSubmit}
          className="w-[218px] h-[52px]"
          label="Add"
          isFocused
          onClick={() => {
            handleAPIData();
            onClick();
          }}
          // disable={!formik.isValid || !formik.dirty}
        />
      </div>
    </div>
  );
};

export default APIRequestModal;
