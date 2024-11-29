import React, { useEffect, useState } from "react";
import SelectDropdown from "Components/Atoms/SelectDropdown/SelectDropdown";
import InputField from "Components/Atoms/InputField/InputField";
import TextArea from "Components/Atoms/TextArea/TextArea";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";

export default function AuthorizationAPIModal({
  onChangeBearerToken,
  urlBearerToken,
  handleOptionClick = () => {},
  selectedAuth,
}) {
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  const formik = useFormik({
    initialValues: {
      username: urlBearerToken?.username,
      password: urlBearerToken?.password,
      token: urlBearerToken?.token || "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .test("no-emojis", "First name cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .matches(/^[A-Za-z]+$/, "First name can only contain alphabets.")
        .min(2, "First name must be at least 2 characters.")
        .max(50, "First name must be at most 50 characters."),
      password: Yup.string(),
      token: Yup.string().matches(/^(?!\s+$)/, "Spaces are not allowed."),
    }),
    onSubmit: (values) => {
      if (selectedAuth?.name === "No Auth") {
        console.log("This request does not use any authorization");
      } else if (selectedAuth?.name === "Basic Auth") {
        console.log({
          username: values.username,
          password: values.password,
        });
      } else if (selectedAuth?.name === "Bearer Token") {
        console.log({
          Authorization: `Bearer ${values.token}`,
        });
      }
    },
  });

  useEffect(() => {
    if (formik.values) {
      onChangeBearerToken(formik.values);
    }
  }, [formik.values, selectedAuth]);

  return (
    <>
      <div className="flex p-2 h-[500px]">
        <div className="m-2">
          <div className="flex flex-col">
            <SelectDropdown
              id="authSelect"
              isRequired={true}
              label="Select"
              className="w-[200px]"
              inputClassName="text-sm"
              placeHolder="Select a Auth"
              value={selectedAuth}
              options={ScheduleTypeList}
              onChange={handleOptionClick}
            />
            <div className="mt-4">
              {(selectedAuth?.name === "Basic Auth" ||
                selectedAuth?.name === "Bearer Token") && (
                <p className="w-[204px] h-[90px] text-xs text-igy16">
                  The authorization header will be automatically generated when
                  you send the request.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="border border-solid border-igy12 h-[460px] mt-[5px]"></div>

        <div className="flex justify-center items-center w-[760px]">
          {selectedAuth?.name === "No Auth" && (
            <div className="text-md text-igy16">
              This request does not use any authorization
            </div>
          )}

          {selectedAuth?.name === "Basic Auth" && (
            <div className="flex flex-col gap-6">
              <div>
                <InputField
                  id="username"
                  label="Username"
                  className="w-[286px] h-10"
                  placeHolder="Enter User Name"
                  {...formik.getFieldProps("username")}
                  error={formik.touched.username && formik.errors.username}
                />
              </div>
              <div>
                <InputField
                  id="password"
                  label="Password"
                  className="w-[286px] h-10"
                  placeHolder="Enter Password"
                  {...formik.getFieldProps("password")}
                  error={formik.touched.password && formik.errors.password}
                />
              </div>
            </div>
          )}
          {selectedAuth?.name === "Bearer Token" && (
            <div>
              <TextArea
                id="token"
                name="token"
                label="Token"
                className="w-[386px] h-[132px]"
                placeHolder="Enter Token"
                labelClassName="!text-sm"
                emailPadding={true}
                {...formik.getFieldProps("token")}
                onBlur={() => formik.setFieldTouched("token", true)}
                error={formik.touched.token && formik.errors.token}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const ScheduleTypeList = [
  { id: 1, name: "No Auth", type: "No Auth", value: "noAuth" },
  { id: 2, name: "Basic Auth", type: "Basic Auth", value: "basicAuth" },
  { id: 3, name: "Bearer Token", type: "Bearer Token", value: "bearerToken" },
];
