import info from "Assets/Images/info.svg";
import transfer from "Assets/Images/transfer.svg";
import duplicate from "Assets/Images/duplicate.svg";
import deleteicon from "Assets/Images/delete.svg";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import styles from "./ActionsOverlayIcons.module.scss";
import PropTypes from "prop-types";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ActionInput from "../ActionInput/ActionInput";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import { useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useOutsideClick } from "Hooks/useOutSideClick";

const ActionsOverlayIcons = ({
  handleClick,
  handleTransferClik,
  handleDuplicateRow,
  handleDeleteTestCase,
  id,
  isRemove = false,
  type,
  PlanTransferHandleClick,
}) => {
  const duplicatePopup = useRef(null);

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  const formik = useFormik({
    initialValues: {
      testCaseName: "",
    },
    validationSchema: Yup.object({
      testCaseName: Yup.string()
      .test("no-emojis", "Name cannot contain emojis.", (val) => {
        return !emojiRegex.test(val);
      })
        .required("Name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .min(2, "Name must be at least 2 characters.")
        .max(50, "Name must be at most 50 characters.")
        .matches(
          /^[a-zA-Z0-9_.\- ]+$/,
          "Enter only letters, numbers, _, -, ., and spaces."
        ),
    }),
  });

  const [duplicateModal, setDuplicateModal] = useState(false);

  const testPlanTransferHandleClick = () => {
    PlanTransferHandleClick();
  };
  const transferHandleClick = () => {
    handleTransferClik();
  };

  const duplicateHandleClick = () => {
    handleDuplicateRow(formik?.values?.testCaseName?.trim());
  };

  const deleteHandleClick = () => {
    handleDeleteTestCase();
  };

  const handleOpen = () => {
    handleClick();
  };

  useOutsideClick(duplicatePopup, () => {
    if (duplicateModal) {
      setDuplicateModal(false);
      formik.resetForm();
    }
  });

  return (
    <div className="flex justify-center items-center gap-8 mt-[14px]">
      <CustomTooltip
        title="Info"
        placement="bottom"
        offset={[0, -3]}
        height={"28px"}
        fontSize="11px"
      >
        <img
          data-testid={`${id}_info_image`}
          src={info}
          alt="info image"
          className={`${styles.overlayIcons}`}
          onClick={handleOpen}
        />
      </CustomTooltip>
      <CustomTooltip
        title="Transfer"
        placement="bottom"
        offset={[0, -3]}
        height={"28px"}
        fontSize="11px"
      >
        <img
          data-testid={`${id}_transfer_image`}
          src={transfer}
          alt="transfer image"
          className={`${styles.overlayIcons}`}
          onClick={
            type === "test-cases" || type === "suite-test-cases"
              ? transferHandleClick
              : type === "test-scheduler" || type === "test-suites"
              ? testPlanTransferHandleClick
              : null
          }
        />
      </CustomTooltip>
      <div ref={duplicatePopup}>
        <CustomTooltip
          title="Duplicate"
          placement="bottom"
          offset={[0, -3]}
          height={"28px"}
          fontSize="11px"
        >
          <img
            data-testid={`${id}_duplicate_image`}
            src={duplicate}
            alt="duplicate image"
            className={`${styles.overlayIcons}`}
            onClick={() => setDuplicateModal(true)}
          />
        </CustomTooltip>
        {duplicateModal && (
          <div
            className={`absolute top-[45px] right-[-15px] w-[250px] h-[80px] bg-ibl7 rounded-lg p-4 z-[111] ${styles.moveToContainer}`}
          >
            <div className="flex items-center gap-[7px]">
              <div className="w-[200px]">
                <ActionInput
                  id="testCaseName"
                  placeHolder={
                    type === "test-cases" || type === "suite-test-cases"
                      ? "Enter Test Case Name"
                      : type === "test-suites"
                      ? "Enter Test Suite Name"
                      : "Enter Test Plan Name"
                  }
                  type={"text"}
                  className="!h-10 !text-[12px] !mt-0 !px-[7px] bg-iwhite"
                  {...formik.getFieldProps("testCaseName")}
                  error={
                    formik.touched.testCaseName && formik.errors.testCaseName
                  }
                  isEditable={true}
                  autoFocus={true}
                  errorClassName="w-[233px]"
                />
              </div>
              <div
                className={`w-10 h-10 ${
                  formik.isValid && formik.dirty
                    ? styles.moveToIcon
                    : styles.disableIcon
                } flex items-center justify-center`}
                onClick={() => {
                  formik.isValid &&
                    formik.dirty &&
                    duplicateHandleClick(formik.values.testCaseName);
                }}
                data-testid="forward_outlined_icon"
              >
                <ArrowForwardIosOutlinedIcon className="text-iwhite" />
              </div>
            </div>
          </div>
        )}
      </div>
      {isRemove ? (
        <CustomTooltip
          title="Remove"
          placement="bottom"
          offset={[0, -3]}
          height={"28px"}
          // fontSize="11px"
        >
          <RemoveCircleOutlineIcon
            style={{ color: "#FF0000" }}
            onClick={deleteHandleClick}
            className="cursor-pointer"
          />
        </CustomTooltip>
      ) : (
        <CustomTooltip
          title="Delete"
          placement="bottom"
          offset={[0, -3]}
          height={"28px"}
          fontSize="11px"
        >
          <img
            data-testid={`${id}_delete_image`}
            src={deleteicon}
            alt="delete icon"
            className={`${styles.overlayIcons}`}
            onClick={deleteHandleClick}
          />
        </CustomTooltip>
      )}
    </div>
  );
};

export default ActionsOverlayIcons;

ActionsOverlayIcons.propTypes = {
  handleClick: PropTypes.func,
  handleTransferClik: PropTypes.func,
  handleDuplicateRow: PropTypes.func,
  handleDeleteTestCase: PropTypes.func,
  id: PropTypes.number,
  isRemove: PropTypes.bool,
  PlanTransferHandleClick: PropTypes.func,
  type: PropTypes.string,
};
