import React, { useState, useEffect, useCallback, useRef } from "react";
import { useFormik } from "formik";
import InputField from "../InputField/InputField";
import { Checkbox } from "../Checkbox/Checkbox";
import deleteicon from "Assets/Images/delete.svg";
import styles from "./QueryParamComponent.module.scss";

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Custom encoding function to handle commas
const customEncode = (str) => {
  return encodeURIComponent(str).replace(/%2C/g, ",");
};

export const QueryParamComponent = ({
  onUrlChange,
  paramsData,
  onParamsDataChange,
}) => {
  const [params, setParams] = useState(paramsData);
  const idCounterRef = useRef(paramsData.length);

  const formik = useFormik({
    initialValues: { params: paramsData },
    onSubmit: (values) => console.log(values),
  });

  // Function to create URL-friendly query string
  const createQueryString = (params) => {
    return params
      .filter((param) => param.isChecked && param.key)
      .map((param) => `${customEncode(param.key)}=${customEncode(param.value)}`)
      .join("&");
  };

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((updatedParams) => {
      const queryString = createQueryString(updatedParams);
      onParamsDataChange(updatedParams, queryString);
    }, 100),
    [onParamsDataChange]
  );

  useEffect(() => {
    setParams(paramsData);
    formik.setFieldValue("params", paramsData);
    // debouncedUpdate(paramsData);
    idCounterRef.current = Math.max(idCounterRef.current, paramsData.length);
  }, [paramsData]);

  const getNextId = useCallback(() => {
    idCounterRef.current += 1;
    return String(idCounterRef.current);
  }, []);

  // Immediate update function
  const immediateUpdate = useCallback(
    (updatedParams) => {
      const queryString = createQueryString(updatedParams);
      onParamsDataChange(updatedParams, queryString);
    },
    [onParamsDataChange]
  );

  const handleCheckBox = (id) => {
    const updatedParams = formik.values.params.map((param) =>
      param.id === id ? { ...param, isChecked: !param.isChecked } : param
    );
    formik.setFieldValue("params", updatedParams);
    setParams(updatedParams);
    debouncedUpdate(updatedParams, "updated");
  };

  const handleInputChange = (id, field, value) => {
    let updatedParams = formik.values.params.map((param) =>
      param.id === id ? { ...param, [field]: value, isChecked: true } : param
    );

    const lastParam = updatedParams[updatedParams.length - 1];
    if (
      lastParam.id === id &&
      (lastParam.key !== "" ||
        lastParam.value !== "" ||
        lastParam.description !== "")
    ) {
      updatedParams.push({
        id: updatedParams?.length + 1,
        key: "",
        value: "",
        description: "",
        isChecked: false,
      });
    }

    formik.setFieldValue("params", updatedParams);
    setParams(updatedParams);
    debouncedUpdate(updatedParams);
  };

  const handleRemoveParam = (id) => {
    let updatedParams = formik.values.params.filter((param) => param.id !== id);
    for (let i = id; i <= updatedParams.length; i++) {
      updatedParams[i - 1].id--;
    }
    if (updatedParams?.length === 0) {
      updatedParams = [
        {
          id: 1,
          key: "",
          value: "",
          description: "",
          isChecked: false,
        },
      ];
    } else {
      const lastParam = updatedParams[updatedParams.length - 1];
      if (
        lastParam.key !== "" ||
        lastParam.value !== "" ||
        lastParam.description !== ""
      ) {
        updatedParams.push({
          id: updatedParams?.length,
          key: "",
          value: "",
          description: "",
          isChecked: false,
        });
      }
    }

    formik.setFieldValue("params", updatedParams);
    setParams(updatedParams);
    immediateUpdate(updatedParams);
  };

  useEffect(() => {
    debouncedUpdate(paramsData);
  }, []);

  return (
    <div className={`p-4 pt-2`}>
      <h2 className="text-xl font-bold text-ibl1">Query Params</h2>
      <div className={`overflow-y-auto ${styles.scroll} `}>
        <div className="px-1 space-y-3 py-[10px]">
          {formik.values.params.map((param, index) => (
            <div
              key={param.id}
              className="flex justify-center items-center bg-white p-2 rounded-lg shadow"
            >
              <div className="">
                <Checkbox
                  data-testid={`checkbox_value_${param.id}`}
                  id={`checkbox_${param.id}`}
                  isHeaderCheck={true}
                  checked={param.isChecked}
                  onChange={() => handleCheckBox(param.id)}
                  className="cursor-pointer relative ml-6 "
                />
              </div>
              <div className="flex justify-center items-center gap-5 ml-4 mr-2 mb-[7px]">
                <InputField
                  placeHolder="Enter Key"
                  max_Length={60}
                  placeHolderSize={true}
                  inputClassName="w-[280px] h-[40px]"
                  value={param.key}
                  onChange={(e) =>
                    handleInputChange(param.id, "key", e.target.value)
                  }
                />
                <InputField
                  placeHolder="Value"
                  max_Length={60}
                  placeHolderSize={true}
                  inputClassName="w-[280px] h-[40px]"
                  value={param.value}
                  onChange={(e) =>
                    handleInputChange(param.id, "value", e.target.value)
                  }
                />
                <InputField
                  placeHolder="Description"
                  max_Length={60}
                  placeHolderSize={true}
                  inputClassName="w-[280px] h-[40px]"
                  value={param.description}
                  onChange={(e) =>
                    handleInputChange(param.id, "description", e.target.value)
                  }
                />
              </div>
              <button
                onClick={() => handleRemoveParam(param.id)}
                className={`w-6 h-6 flex items-center justify-center ${
                  index === formik.values.params.length - 1
                    ? "cursor-not-allowed opacity-50"
                    : "hover:cursor-pointer"
                }`}
              >
                <img
                  src={deleteicon}
                  alt="delete icon"
                  className={`${
                    index === formik.values.params.length - 1
                      ? "opacity-50"
                      : ""
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
