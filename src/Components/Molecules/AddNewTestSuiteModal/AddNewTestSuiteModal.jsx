import CloseIcon from "@mui/icons-material/Close";
import InputField from "../../Atoms/InputField/InputField";
import { CustomButton } from "../../Atoms/CustomButton/CustomButton";
import PropTypes from "prop-types";
import SearchInput from "../../../Components/Atoms/SearchInput/SearchInput";
import { Checkbox } from "../../Atoms/Checkbox/Checkbox.jsx";

import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  addNewTestSuite,
  getTestCasesList,
  updateTestSuite,
} from "../../../Services/API/Projects/Projects.js";
import { useContext, useEffect, useMemo, useState } from "react";
import { setsuiteIsCreated } from "Store/ducks/testCases";
import { useDispatch, useSelector, useStore } from "react-redux";
import { WebsocketContext } from "Services/Socket/socketProvider";

const AddNewTestSuiteModal = ({
  onClick,
  selectedProject,
  selectedApplication,
  getTestSuiteAPI = () => {},
  backArrow = false,
  onBackNavigation = () => {},
  testSuiteName = "",
  testSuiteId,
  existingTestCases,
}) => {
  const [checkedItems, setCheckedItems] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newTestcasesdata, setNewTestCasesData] = useState([]);
  const [filteredTestCasesData, setFilteredTestCasesData] = useState([]);
  const [noRecordFound, setNoRecordFound] = useState(false);
  const [emojiError, setEmojiError] = useState("");
  const [addNewTestSuiteDisable, setAddNewTestSuiteDisable] = useState(false);
  const dispatch = useDispatch()
  const { defaultApplication ,userDetails} = useSelector((state) => state?.userDetails);
  const {socket} =  useContext(WebsocketContext)
  const [allTestCases,setAllTestCases] = useState([])


  const noEmojiValidation = (value) => {
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    return emojiRegex.test(value);
  };

  const handleSearch = (e) => {
    const value = e?.target?.value;
    setSearchValue(value);
    if(noEmojiValidation(value)){
      setEmojiError("Emojis are not allowed.");
    }else{
      setEmojiError("");
    } 

    const searchValueString = value?.trim();
    const newSearchValue = /^\d+$/.test(searchValueString)
      ? Number(searchValueString)
      : searchValueString;

    if (newSearchValue) {
      const filteredData = newTestcasesdata?.filter((testcase) =>
        testcase.testCaseName
          .toLowerCase()
          .includes(newSearchValue.toLowerCase())
      );
      setFilteredTestCasesData(filteredData);
      setNoRecordFound(filteredData?.length === 0);
    } else {
      setFilteredTestCasesData(newTestcasesdata);
      setNoRecordFound(false);
    }
  };
  const handleSearchEnter = (e) => {
    if (e?.key === "Enter") {
      handleSearch(e);
    }
  };

  const getTestCasesData = () => {
    const requestBody = {
      projectId: defaultApplication?.projectId,
      applicationId: defaultApplication?.id,
    };

    setIsLoading(true);
    getTestCasesList(requestBody)
      .then((res) => {
        const data = res?.data?.results;

        if (testSuiteName?.length) {
          const existingIds = existingTestCases?.map((item) => item?._id)
          const filteredTestCases = data?.filter(
            (item) => !existingIds?.includes(item?._id)
          );
          setNewTestCasesData(filteredTestCases);
          setFilteredTestCasesData(filteredTestCases);
          setAllTestCases(data)
        } else {
          setNewTestCasesData(data);
          setFilteredTestCasesData(data);
        }

        setIsLoading(false);
      })
      .catch((error) => {
        const message = error?.response?.data?.details;
        if(message !== "No test cases found"){
          toast.dismiss()
          toast.error(message || "Error retrieving testcases list data");
          }
        setIsLoading(false);
      });
  };

  useEffect(() => {
      getTestCasesData();
  }, [defaultApplication]);

  const handleCheckBox = (itemId) => {
    setCheckedItems((prevCheckedItems) => {
      if (prevCheckedItems?.includes(itemId)) {
        // Remove index if already checked
        return prevCheckedItems?.filter((id) => id !== itemId);
      } else {
        // Add index if not checked
        return [...prevCheckedItems, itemId];
      }
    });
  };

  const handleCreate = () => {
    setAddNewTestSuiteDisable(true);
    const reqBody = {
      name: formik?.values?.testSuiteName?.trim(),
      projectId: defaultApplication?.projectId,
      applicationId: defaultApplication?.id,
      testCases: checkedItems,
    };
    setIsLoading(true);
    addNewTestSuite(reqBody)
      .then((res) => {
        const message = res?.data?.message;
        const data = res?.data?.results
        socket.emit('onTestsuites',{
          command:"testSuiteCreate",
          organizationId:userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user:{
            userName:userDetails?.userName,
            userId:userDetails?.userId
          },
          data: data
        })
        toast.success(message);
        setIsLoading(false);
        dispatch(setsuiteIsCreated(true))
        onClick();
        getTestSuiteAPI();
        setAddNewTestSuiteDisable(false);
      })
      .catch((error) => {
        onClick();
        const message = error?.response?.data?.details;
        toast.error(message || "Error Creating the Add new Testsuite.");
        setIsLoading(false);
        setAddNewTestSuiteDisable(false);
      });
  };

  const handleUpdate = () => {
    const payload = {
      name: formik?.values?.testSuiteName?.trim(),
      ...(checkedItems?.length !== 0 && { addedTestCases: checkedItems }),
    };
    setIsLoading(true);
    updateTestSuite(testSuiteId, payload)
      .then((res) => {
        const message = res?.data?.message;
        const data = res?.data?.results
        socket.emit('onTestsuites',{
          command:"testSuiteUpdate",
          organizationId:userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user:{
            userName:userDetails?.userName,
            userId:userDetails?.userId
          },
          data: {
            testsuiteId:testSuiteId,
            name:formik?.values?.testSuiteName?.trim(),
            ...(checkedItems?.length !== 0 && { caseList: checkedItems }),
            TestCaseData:allTestCases
            .filter(testCase => checkedItems.includes(testCase._id))
            .map(testCase => ({
              ...testCase,
              noOfSteps:testCase?.testSteps?.length || 0
            }))
          }
        })
        toast.success(message);
        setIsLoading(false);
        onClick();
        getTestSuiteAPI();
        dispatch(setsuiteIsCreated(true))

      })
      .catch((error) => {
        onClick();
        const message = error?.response?.data?.details;
        toast.error(message || "Error Updating the Testsuite.");
        setIsLoading(false);
      });
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  const formik = useFormik({
    initialValues: {
      testSuiteName: testSuiteName ? testSuiteName : "",
    },
    validationSchema: Yup.object().shape({
      testSuiteName: Yup.string()
      .test("no-emojis", "Test suite name cannot contain emojis.", (val) => {
        return !emojiRegex.test(val);
      })
        .required("Test suite name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed.")
        .min(2, "Test suite name must be at least 2 characters.")
        .max(50, "Test suite name must be at most 50 characters.")
        .matches(
          /^[a-zA-Z0-9_.\- ]+$/,
          "Enter only letters, numbers, _, -, ., and spaces."
        ),
    }),
    onSubmit: handleCreate,
  });

  const isUpdateDisabled = useMemo(() => {
    return (
      testSuiteName === formik.values.testSuiteName &&
      checkedItems?.length === 0
    );
  }, [formik]);

  // Check if the form is valid and at least one checkbox is checked
  const isFormValid = formik.isValid && formik.dirty;
  const isCheckboxChecked = checkedItems?.length > 0;
  const isButtonEnabled = isFormValid && isCheckboxChecked;

  return (
    <div className="flex items-center justify-center w-auto h-full md:w-[416px]">
      <div className="rounded-2xl shadow-2xl">
        <div className="flex flex-row justify-end bg-ibl7 w-full rounded-t-[10px]">
          <div
            className={`${
              backArrow ? "w-full" : "w-[310px]"
            } h-[80px]  flex justify-between items-center`}
          >
            {backArrow && (
              <div className="ml-[19px] cursor-pointer">
                <ArrowBackIcon onClick={onBackNavigation} />
              </div>
            )}
            <div
              className="text-[18px] font-medium leading-7"
              data-testid="modal_heading"
            >
              {testSuiteName ? "Update Test Suite" : "Add New Test Suite"}
            </div>

            <div className="flex justify-end !pr-6">
              <CloseIcon
                onClick={onClick}
                className="cursor-pointer"
                data-testid="closeIcon"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col pt-[28px] px-[32px]">
          <div className="flex items-center cursor-pointer">
            <InputField
              data-testid={`testCaseName_inputfield`}
              id="testSuiteName"
              label="Test Suite Name"
              className="w-[352px] h-[52px]"
              placeHolder="Enter Test Suite Name"
              isRequired={true}
              {...formik.getFieldProps("testSuiteName")}
              error={
                formik.touched.testSuiteName && formik.errors.testSuiteName
              }
            />
          </div>
          <div className="flex gap-[41px] pt-7">
            <div
              className="text-sm font-medium leading-[21px] flex items-center"
              data-testid="test_cases_label"
            >
              <div className="flex gap-1">
                <div className="text-sm">Test Cases</div>
                <div className="text-ird3">*</div>
              </div>
            </div>
            <div className="w-[218px]">
              <SearchInput
                data-testid={`searchValue_${searchValue}`}
                placeHolder="Search"
                maxLength={255}
                className="!border !border-solid !border-ibl1 h-8"
                onChange={handleSearch}
                value={searchValue}
                error={null}
                onKeyDown={handleSearchEnter}
              />
            </div>
          </div>
          {emojiError && (
                  <p className="text-ird3 text-[10px] font-medium mt-1 pl-[128px]" data-testid="emoji_error">
                    {emojiError}
                  </p>
                )}
          <hr className="text-ibl17 rounded-[50%] mt-2" />
          {isLoading ? (
            <div className="flex justify-center items-center h-[142px]">
              <CircularProgress />
            </div>
          ) : (
            <>
              {filteredTestCasesData?.length === 0 ? (
                <div className="flex items-center justify-center h-[142px]">
                  <p>No Records Found</p>
                </div>
              ) : (
                <div className="flex flex-col overflow-y-scroll h-[142px]">
                  {filteredTestCasesData?.map((item, index) => (
                    <div key={index} className="flex  gap-5 mt-4 hover:bg-ibl12" onClick={() => handleCheckBox(item?._id)}>
                      <div className="relative ml-5 mt-3">
                        <Checkbox
                          data-testid={`checkbox_value_${item}`}
                          id={"checkbox"}
                          isHeaderCheck={true}
                          checked={checkedItems?.includes(item?._id)}
                          className="cursor-pointer"
                        />
                      </div>
                      <p
                        className="text-igy2 text-base font-normal w-full break-all "
                        data-testid={item?.testCaseName}
                      >
                        {item?.testCaseName}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          <div className="pt-[14px] pb-5 flex justify-center">
            <CustomButton
              data-testid="create_Button"
              label={testSuiteName ? "Update" : "Create"}
              className="w-[352px] !h-[52px]"
              onClick={() =>
                testSuiteName ? handleUpdate() : formik.handleSubmit()
              }
              disable={
                (testSuiteName
                  ? isUpdateDisabled || !formik.isValid
                  : !isButtonEnabled) || addNewTestSuiteDisable
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewTestSuiteModal;

AddNewTestSuiteModal.propTypes = {
  onClick: PropTypes.func,
  selectedProject: PropTypes.object,
  selectedApplication: PropTypes.object,
};
