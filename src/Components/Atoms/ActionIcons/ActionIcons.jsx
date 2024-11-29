import dots from "Assets/Images/dots.svg";
import run from "Assets/Images/run.svg";
import disableRun from "Assets/Images/disableRun.svg";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import { useOutsideClick } from "Hooks/useOutSideClick";
import { useEffect, useRef, useState } from "react";
import ActionsOverlayIcons from "../ActionsOverlayIcons/ActionsOverlayIcons";
import RunPopUp from "../RunPopUp/RunPopUp";
import styles from "./ActionIcons.module.scss";
import PropTypes from "prop-types";
import TestCaseInfoModal from "../../../Components/Molecules/TestCaseInfoModal/TestCaseInfoModal";
import TransferCaseModal from "../../../Components/Molecules/TransferCaseModal/TransferCaseModal";
import { Modal } from "../Modal/Modal";
import TestPlanInfoModal from "../../Molecules/TestPlanInfoModal/TestPlanInfoModal";
import TransferTestPlanModal from "../../Molecules/TransferTestPlanModal/TransferTestPlanModal";
import ConfirmDeleteProjectModal from "../../Molecules/ConfirmDeleteProjectModal/ConfirmDeleteProjectModal";
import CreateRunModal from "../../Molecules/CreateRunModal/CreateRunModal";
import { ApkFileAlertModal } from "Components/Molecules/ApkFileAlertModal/ApkFileAlertModal";
import { useDispatch, useSelector } from "react-redux";
import { setIsrunned } from "Store/ducks/testCases";
import { ApplicationTypeEnum } from "Enums/ApplicationTypeEnum";
import CreateApiRunModal from "Components/Molecules/CreateApiRunModal/CreateApiRunModal";
import { useLazyGetUserDataQuery, useSetDefaultMutation } from "Services/API/apiHooks";

const ActionIcons = ({
  clearRunPopUp,
  suiteDetailsRunPopUp,
  testSuiteRowId,
  data,
  id,
  selectedApplication,
  transferData,
  paramType,
  fetchDuplicateRow = () => {},
  fetchDeleteTestCase = () => {},
  fetchTestPlanInfo = () => {},
  testCaseInfo,
  fetchDeleteTestPlans = () => {},
  isRemove = false,
  onRowCheckBoxClear = () => {},
  testPlanLoading = false,
  testPlanInfo,
  fetchTestSuiteInfo = () => {},
  testSuitInfo,
  fetchTestCasesData = () => {},
  removeCheckBoxValues = () => {},
  checkApk,
  selectedProject,
  projectName,
  applicationName,
  setActiveRowMorePopup,
  activeRowMorePopup,
  setActiveRowRunPopup,
  activeRowRunPopup,
  closeStatusDropdown = () => {},
  closeRunPopup = () => {},
  setRunPopUpClear = () => {},
  setMorePopUpClear = () => {},
  disableRunImage = false,
  setRowRunImage = () => {},
  fetchTestCaseAPI = () => {},
  closeExportPopup = () => {},
  closeActionPopup = false,
  checkBoxUnCheckInTestCase = () => {},
}) => {
  const statusList = data?.testCases?.map((item) => item.status);
  const uniqueId = data?._id;
  const [showBackGround, setShowBackGround] = useState(false);
  const [showRunPopup, setShowRunPopUp] = useState(false);
  const [show, setShow] = useState(false);
  const [showTestPlanInfo, setShowTestPlanInfo] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPlanTransferModal, setShowPlanTransferModal] = useState(false);
  const [showTestSuiteInfo, setShowTestSuiteInfo] = useState(false);
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);
  const [openCreateRunModal, setOpenCreateRunModal] = useState(false);
  const [openApkModal, setOpenApkModal] = useState(false);
  const [apiRunModal, setApiRunModal] = useState(false);
  const [setDefault] = useSetDefaultMutation();
  const [getuserDetails] = useLazyGetUserDataQuery();
  const {defaultApplication} = useSelector((state)=>state?.userDetails)

  const showSuites = data?.total_suites;

  const runDropDown = useRef(null);
  const morePopup = useRef(null);
  const dispatch = useDispatch();

  useOutsideClick(morePopup, () => {
    if (showBackGround) {
      setShowBackGround(false);
    }
    setMorePopUpClear(null);
  });

  useOutsideClick(runDropDown, () => {
    if (showRunPopup) {
      setShowRunPopUp(!showRunPopup);
    }
    setRunPopUpClear(null);
  });

  const runHandleClick = () => {
    if (id === activeRowRunPopup) {
      // If the same row is clicked, close the popup
      setActiveRowRunPopup(null);
      setShowRunPopUp(false);
    } else {
      // Open the popup for the clicked row and close others
      setActiveRowRunPopup(id);
      setActiveRowMorePopup(null);
      setShowRunPopUp(true);
      closeRunPopup();
      setRowRunImage();
    }

    if (showSuites === 0) {
      setShowRunPopUp(false);
    }
  };

  const dotsHandleClick = () => {
    if (id === activeRowMorePopup) {
      // If the same row is clicked, close the popup
      checkBoxUnCheckInTestCase();
      setShowBackGround(true);
    } else {
      // Open the popup for the clicked row and close others
      setActiveRowRunPopup(null);
      setActiveRowMorePopup(id);
      setShowBackGround(true);
      setShowRunPopUp(false);
      closeExportPopup();
    }
  };

  const handleShowMoreInfo = () => {
    setShowBackGround((pre) => !pre);
    setShow(true);
  };

  const handleShowTestPlanInfo = (uniqueId) => {
    setShowBackGround((pre) => !pre);
    setShowTestPlanInfo(true);
    fetchTestPlanInfo(uniqueId);
  };

  const handleShowTestSuiteInfo = (uniqueId) => {
    setShowBackGround((pre) => !pre);
    setShowTestSuiteInfo(true);
    fetchTestSuiteInfo(uniqueId);
  };

  const handleCloseMoreInfo = () => {
    setShow(false);
    fetchTestCaseAPI();
  };

  const handleCloseTestPlanInfo = () => {
    setShowTestPlanInfo(false);
  };

  const handleCloseTestSuiteInfo = () => {
    setShowTestSuiteInfo(false);
  };

  const handleShowTransferTest = () => {
    setShowBackGround((pre) => !pre);
    setShowTransferModal(true);
  };

  const handleShowPlanTransferTest = () => {
    setShowBackGround((pre) => !pre);
    setShowPlanTransferModal(true);
  };

  const handleCloseTransferTest = () => {
    setShowTransferModal(false);
    fetchTestCaseAPI();
  };

  const handleCloseTestPlanTransferTest = (value) => {
    if (value === "api") {
      onRowCheckBoxClear();
    }
    setShowPlanTransferModal(false);
  };

  const handleShowDeleteModal = () => {
    setOpenConfirmDeleteModal(true);
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDeleteModal(false);
    setShowBackGround(false);
  };

  const actionRowHide = () => {
    setShowBackGround(false);
  };

  const checkBoxClear = () => {
    onRowCheckBoxClear();
  };

  // Handle for create run test commenting for future Ref
  const handleShowCreateRunModal = () => {
    setOpenCreateRunModal(true);
  };

  const handleCloseCreateRunModal = () => {
    setOpenCreateRunModal(false);
  };

  const clearCheckBoxesValues = () => {
    removeCheckBoxValues();
  };

  const handleCloseApkModal = () => {
    setOpenApkModal(false);
  };

  const handleOpenApkModal = () => {
    setOpenApkModal(true);
  };

  const handleRunModalLogic = () => {
    closeStatusDropdown();
    const isMobileApp =
      selectedApplication?.type === ApplicationTypeEnum?.TV ||
      selectedApplication?.type === ApplicationTypeEnum?.IOS ||
      selectedApplication?.type === ApplicationTypeEnum?.ANDROID;

    const isWebApp = selectedApplication?.type === ApplicationTypeEnum?.WEB;

    const isTestSuiteOrCase =
      paramType === "test-suites" ||
      paramType === "test-cases" ||
      paramType === "suite-test-cases";

    if (isTestSuiteOrCase && isMobileApp) {
      if (
        checkApk === false &&
        (selectedApplication?.type === ApplicationTypeEnum?.IOS ||
          selectedApplication?.type === ApplicationTypeEnum?.TV ||
          selectedApplication?.type === ApplicationTypeEnum?.ANDROID)
      ) {
        handleOpenApkModal();
      } else {
        handleShowCreateRunModal();
      }
      return;
    }

    if (paramType === "test-suites" && isWebApp) {
      handleShowCreateRunModal();
      return;
    }

    if (
      (paramType === "suite-test-cases" && isWebApp) ||
      (paramType === "test-cases" && isWebApp)
    ) {
      runHandleClick();
    }
  };

  useEffect(() => {
    if (activeRowRunPopup && activeRowMorePopup) {
      // Close the other popup if one is already open
      if (activeRowRunPopup === id && activeRowMorePopup !== id) {
        setActiveRowMorePopup(null);
      } else if (activeRowMorePopup === id && activeRowRunPopup !== id) {
        setActiveRowRunPopup(null);
      }
    }
  }, [activeRowRunPopup, activeRowMorePopup, id]);

  useEffect(() => {
    setActiveRowRunPopup(null);
  }, [clearRunPopUp, suiteDetailsRunPopUp]);

  const closeSingleRunPopup = () => {
    setShowRunPopUp(false);
  };


  const handelfetchTestCasesData = () => {
    dispatch(setIsrunned({ type: paramType, value: true }));
    fetchTestCasesData();
  };

  useEffect(() => {
    setShowBackGround(false);
  }, [closeActionPopup]);

  // Helper function to determine if the action should be disabled
  const isRunDisabled = () => {
    let disable;
    if (paramType === "test-cases") {
      disable =
        data?.testSteps?.length === 0 ||
        (data?.status !== "ACTIVE" && data?.status !== "DRAFT");
    } else if (paramType === "test-suites") {
      disable =
        data?.testCases?.length === 0 ||
        (!statusList.includes("ACTIVE") && !statusList.includes("DRAFT"));
    } else if (paramType === "suite-test-cases") {
      disable =
        data?.noOfSteps === 0 ||
        (data?.status !== "ACTIVE" && data?.status !== "DRAFT");
    }
    return disableRunImage || disable;
  };

  // Handle image source based on disable state
  const handelRunwithStatus = () => {
    return isRunDisabled() ? disableRun : run;
  };

  // Handle click event for running modal logic
  const handleRunwithClick = () => {
    if (!isRunDisabled()) {
      if (selectedApplication?.type !== ApplicationTypeEnum?.API) {
        handleRunModalLogic(); // Call the modal logic only if not disabled
      } else {
        setApiRunModal(true);
      }
    }
  };

  return (
    <>
      <div
        onClick={(e) => {
          e?.stopPropagation();
        }}
      >
        <div className="flex gap-[33px]">
          {(paramType === "test-cases" ||
            paramType === "test-suites" ||
            paramType === "suite-test-cases") && (
            <CustomTooltip
              title="Run"
              placement="bottom"
              offset={[0, -5]}
              height={"28px"}
              fontSize="11px"
            >
              <img
                data-testid={`${id}_run_image`}
                ref={runDropDown}
                src={handelRunwithStatus()} // Use the optimized function to get src
                alt="run"
                onClick={handleRunwithClick} // Pass the function reference directly
                className={`${
                  isRunDisabled() ? "cursor-default" : styles.iconsHover
                }`}
              />
            </CustomTooltip>
          )}

          <CustomTooltip
            title="More"
            placement="bottom"
            offset={[0, -5]}
            height={"28px"}
            fontSize="11px"
          >
            <img
              data-testid={`${id}_dots_image`}
              src={dots}
              alt="dots"
              onClick={dotsHandleClick}
              className={`${styles.iconsHover}`}
            />
          </CustomTooltip>
        </div>

        <div className={`${styles.card_container}`} ref={morePopup}>
          <div>
            {showBackGround && activeRowMorePopup === id && (
              <div className={`${styles.card}`}>
                <ActionsOverlayIcons
                  handleClick={() => {
                    if (
                      paramType === "test-cases" ||
                      paramType === "suite-test-cases"
                    ) {
                      handleShowMoreInfo();
                    } else if (paramType === "test-scheduler") {
                      handleShowTestPlanInfo(uniqueId);
                    } else {
                      handleShowTestSuiteInfo(uniqueId);
                    }
                  }}
                  handleTransferClik={() => {
                    handleShowTransferTest();
                  }}
                  handleDeleteTestCase={() => {
                    handleShowDeleteModal();
                  }}
                  handleDuplicateRow={(testCaseName) => {
                    fetchDuplicateRow(uniqueId, testCaseName);
                  }}
                  id={uniqueId}
                  isRemove={isRemove}
                  type={paramType}
                  PlanTransferHandleClick={() => {
                    handleShowPlanTransferTest();
                  }}
                />
              </div>
            )}
            <Modal
              isOpen={show}
              onClose={handleCloseMoreInfo}
              modalClassName="!cursor-default"
            >
              <TestCaseInfoModal
                onClick={handleCloseMoreInfo}
                testCaseInfo={data}
              />
            </Modal>
            <Modal
              isOpen={showTransferModal}
              onClose={handleCloseTransferTest}
              modalClassName="!cursor-default"
            >
              <TransferCaseModal
                onClick={handleCloseTransferTest}
                transferData={transferData}
                testRowId={id}
                selectedAppn={selectedApplication}
                clearValues={clearCheckBoxesValues}
                testSuiteId={testSuiteRowId}
                paramType={paramType}
              />
            </Modal>
            <Modal
              isOpen={
                paramType === "test-suites"
                  ? showTestSuiteInfo
                  : showTestPlanInfo
              }
              onClose={
                paramType === "test-suites"
                  ? handleCloseTestSuiteInfo
                  : handleCloseTestPlanInfo
              }
            >
              <TestPlanInfoModal
                onClick={
                  paramType === "test-suites"
                    ? handleCloseTestSuiteInfo
                    : handleCloseTestPlanInfo
                }
                testPlanInfo={testPlanInfo}
                testPlanLoading={testPlanLoading}
                testSuitInfo={testSuitInfo}
                paramType={paramType}
              />
            </Modal>
            <Modal
              isOpen={showPlanTransferModal}
              onClose={handleCloseTestPlanTransferTest}
              modalClassName="!cursor-default"
            >
              <TransferTestPlanModal
                onClick={handleCloseTestPlanTransferTest}
                type={paramType}
                testPlanRowId={id}
                selectedAppn={selectedApplication}
              />
            </Modal>

            <Modal
              isOpen={openConfirmDeleteModal}
              onClose={handleCloseConfirmDelete}
              className="rounded-[16px]"
            >
              <ConfirmDeleteProjectModal
                onClick={handleCloseConfirmDelete}
                fetchDeleteTestCase={() => {
                  fetchDeleteTestCase(uniqueId);
                }}
                fetchDeleteTestPlans={() => {
                  fetchDeleteTestPlans(uniqueId);
                }}
                type={paramType}
              />
            </Modal>
          </div>
        </div>

        <div className={`${styles.card_container}`}>
          {showRunPopup && activeRowRunPopup === id && (
            <div className={`${styles.runpopup}`}>
              <RunPopUp
                id={[id]}
                type={paramType}
                clearCheckBoxes={checkBoxClear}
                selectedApplication={selectedApplication}
                onRunCreated={handelfetchTestCasesData}
                nameData={data}
                closeRunPopup={closeSingleRunPopup}
              />
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={openCreateRunModal}
        onClose={handleCloseCreateRunModal}
        modalClassName="!cursor-default"
      >
        <CreateRunModal
          onClick={handleCloseCreateRunModal}
          id={[id]}
          type={paramType}
          onCloseRunPopup={handleCloseCreateRunModal}
          clearCheckBoxes={checkBoxClear}
          selectedApplication={selectedApplication}
          onRunCreated={handelfetchTestCasesData}
        />
      </Modal>
      <Modal
        isOpen={openApkModal}
        onClose={handleCloseApkModal}
        className="rounded-[16px]"
      >
        <ApkFileAlertModal
          onClick={handleCloseApkModal}
          projectId={selectedProject?.projectId}
          applicationId={selectedApplication?.id}
          projectName={projectName}
          applicationName={applicationName}
          applicationType={selectedApplication?.type}
        />
      </Modal>
      <Modal isOpen={apiRunModal} onClose={() => setApiRunModal(false)}>
        <CreateApiRunModal
          onClick={() => setApiRunModal(false)}
          runIds={[id]}
          type={paramType}
          onRunCreated={handelfetchTestCasesData}
        />
      </Modal>
    </>
  );
};

export default ActionIcons;

ActionIcons.propTypes = {
  data: PropTypes.any,
  handleDuplicate: PropTypes.func,
  handleDelete: PropTypes.func,
  id: PropTypes.array,
  selectedApplication: PropTypes.any,
  selectedProject: PropTypes.any,
  transferData: PropTypes.any,
  paramType: PropTypes.string,
  fetchDuplicateRow: PropTypes.func,
  fetchDeleteTestCase: PropTypes.func,
  fetchTestCaseInfo: PropTypes.func,
  testCaseLoading: PropTypes.bool,
  testCaseInfo: PropTypes.any,
  fetchDeleteTestPlans: PropTypes.func,
  isRemove: PropTypes.bool,
  onRowCheckBoxClear: PropTypes.func,
  testSuiteData: PropTypes.object,
  fetchTestPlanInfo: PropTypes.object,
  testPlanLoading: PropTypes.bool,
  testPlanInfo: PropTypes.any,
  fetchTestSuiteInfo: PropTypes.object,
  testSuitInfo: PropTypes.any,
  fetchTestCasesData: PropTypes.func,
  removeCheckBoxValues: PropTypes.func,
  testSuiteRowId: PropTypes.number,
};
