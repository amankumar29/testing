import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import { QueryParamComponent } from "Components/Atoms/QueryParamComponent/QueryParamComponent";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function Params({
  onUrlChange,
  paramsData,
  onParamsDataChange,
}) {
  const formik = useFormik({
    initialValues: {
      key: "",
      value: "",
    },
    validationSchema: Yup.object().shape({
      key: Yup.string(),
      value: Yup.string(),
    }),
  });

  return (
    <>
      <div>
        <QueryParamComponent
          onUrlChange={onUrlChange}
          paramsData={paramsData}
          onParamsDataChange={onParamsDataChange}
        />
        {/* <div className="flex gap-4 justify-center mt-7 absolute w-full">
          <CustomButton
            label="Cancel"
            className="w-[218px] h-[52px] !text-ibl3 bg-iwhite border border-ibl1  hover:bg-iwhite hover:text-ibl1 hover:border hover:border-ibl1"
          />
          <CustomButton
            onClick={formik.handleSubmit}
            className="w-[218px] h-[52px]"
            label="Add"
            isFocused
            disable={!formik.isValid || !formik.dirty}
          />
        </div> */}
      </div>
    </>
  );
}
