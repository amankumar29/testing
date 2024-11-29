import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import InputField from "Components/Atoms/InputField/InputField";
import { Modal } from "Components/Atoms/Modal/Modal";
import CloseIcon from "@mui/icons-material/Close";
import * as Yup from "yup";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import React, { useState } from "react";
import { useFormik } from "formik";
import { EncryptionHelper } from "Helpers/EncryptionHelper/EncryptionHelper";
import { Tooltip } from "react-tooltip";

const GenerateEncryptedDataModal = ({ isOpen, onClose }) => {
  const [encryptedValue, setEncryptedValue] = useState(null);
  const [copySuccess, setCopySuccess] = useState("Copy");

  const handleSubmit = async (values) => {
    const inputValue = formik.values.value;

    const encryptedValue = await EncryptionHelper(inputValue);

    const finalValue = "ENC_" + encryptedValue;
    setEncryptedValue(finalValue);
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  const formik = useFormik({
    initialValues: {
      value: null,
    },
    validationSchema: Yup.object({
      value: Yup.string()
        // Check if the value starts with 'ENC_'
        // .test("no-enc", "Value should not start with 'ENC_'", (val) => {
        //   // Only run the test if the value is defined
        //   return val ? !val.startsWith("ENC_") : true;
        // })
        // Check if the value matches the predefined encrypted value
        .test(
          "no-encrypted-match",
          "Value should not be the same as the encrypted value.",
          (val) => {
            // Return false if the value matches the encrypted value, true otherwise
            return val !== encryptedValue;
          }
        )
        .test("no-emojis", "Value cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Value is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed."),
    }),
    onSubmit: handleSubmit,
  });

  const handleClose = () => {
    onClose();
    formik.resetForm();
    setEncryptedValue(null);
  };

  const copyToClipboard = (data) => {
    navigator.clipboard.writeText(data).then(
      () => {
        setCopySuccess("Copied!");
        setTimeout(() => {
          setCopySuccess("Copy");
        }, 500);
      },
      (err) => {
        setCopySuccess("Failed to copy!");
        console.error("Failed to copy text: ", err);
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} modalClassName="z-[300]">
      <div className="md:w-[626px] h-[424px]">
        <div className="flex items-center justify-center h-20 bg-ibl7 rounded-t-[10px] relative">
          <p
            className="text-lg font-medium leading-7"
            data-testid="add_new_application"
          >
            Generate Encrypted Data
          </p>
          <div className="absolute right-0 mr-[33px] cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
            <CloseIcon onClick={handleClose} data-testid="close_Icon" />
          </div>
        </div>
        <div className="flex justify-center mt-8 text-base leading-5 ">
          <p className="max-w-[350px] text-center">
            Enter the value to encrypt:
          </p>
        </div>
        <div className="px-[33px] mt-6 flex gap-4 ">
          <div className="flex items-center justify-between w-full">
            <InputField
              placeHolder={"Enter Value"}
              className={`h-[52px] w-[200px] md:w-[350px] -mt-0 mdMax:mr-2`}
              onChange={formik.handleChange}
              {...formik.getFieldProps("value")}
              error={formik.touched.value && formik.errors.value}
            />
            <CustomButton
              data-testid="submit_button"
              type="submit"
              label={"Generate"}
              className={`w-[150px] h-[52px] mt-[7px]`}
              onClick={formik.handleSubmit}
              disable={!(formik.dirty && formik.isValid)}
            />
          </div>
        </div>
        <div className="mx-[33px] mt-6 border border-solid border-ibl17 rounded-lg  h-[150px]">
          <div className="flex items-center justify-between h-10 px-4 py-1 rounded-t-lg bg-ibl21">
            <p className="text-sm text-[#404040]">Encrypted Value :</p>
            {encryptedValue && (
              <>
                <p
                  className="text-sm cursor-pointer text-ibl1 hover:text-ibl3 hover:duration-300 hover:transition-all hover:ease-in-out"
                  data-tooltip-id="copy"
                  data-tooltip-content={copySuccess ? copySuccess : "Copy"}
                >
                  <ContentCopyIcon
                    fontSize="small"
                    onClick={() => copyToClipboard(encryptedValue)}
                  />
                </p>
                <Tooltip id="copy" noArrow className="!text-[11px]" />
              </>
            )}
          </div>
          <hr className="text-ibl17 rounded-[50%] mb-4" />
          <div className="flex items-center break-all overflow-y-auto text-center justify-center h-20 px-6 text-lg font-semibold tracking-[0.45px]">
            {encryptedValue}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GenerateEncryptedDataModal;
