import React, { useState, useEffect, useCallback, useRef } from "react";
import { useFormik } from "formik";
// import { Checkbox } from "../Checkbox/Checkbox";
import deleteicon from "Assets/Images/delete.svg";
import styles from "../../../../../Components/Atoms/QueryParamComponent/QueryParamComponent.module.scss";
import InputField from "Components/Atoms/InputField/InputField";
import { Checkbox } from "Components/Atoms/Checkbox/Checkbox";

export const Extract = ({
  extractData = [],
  onExtractDataChange = () => {},
}) => {
  const [params, setParams] = useState(extractData);
  const idCounterRef = useRef(extractData?.length);

  const formik = useFormik({
    initialValues: {
      params: extractData,
    },
    onSubmit: (values) => console.log(values),
  });

  useEffect(() => {
    setParams(extractData);
    formik.setFieldValue("params", extractData);
    // debouncedUpdate(paramsData);
    idCounterRef.current = Math.max(idCounterRef.current, extractData.length);
  }, [extractData]);

  const getNextId = useCallback(() => {
    idCounterRef.current += 1;
    return String(idCounterRef.current);
  }, []);

  const handleCheckBox = (id) => {
    const updatedParams = formik.values.params.map((param) =>
      param.id === id ? { ...param, isChecked: !param.isChecked } : param
    );
    formik.setFieldValue("params", updatedParams);
    setParams(updatedParams);
    onExtractDataChange(updatedParams);
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
    onExtractDataChange(updatedParams);
  };

  const handleRemoveParam = (id) => {
    let updatedParams = formik.values.params.filter((param) => param.id !== id);
    for (let i = id; i <= updatedParams.length; i++) {
      updatedParams[i - 1].id--;
    }
    if (updatedParams.length === 0) {
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
    onExtractDataChange(updatedParams);
  };

  return (
    <div className={`p-4 pt-2`}>
      <h2 className="text-xl font-bold text-ibl1">Extract</h2>
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
