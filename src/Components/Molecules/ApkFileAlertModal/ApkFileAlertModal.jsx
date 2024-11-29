import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import alertApkModal from "../../../Assets/Images/AlertCard.svg";
import alertImage from "../../../Assets/Images/AlertImage.svg";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

export function ApkFileAlertModal({
  onClick,
  projectId,
  applicationId,
  applicationName,
  projectName,
  applicationType
}) {
  const navigateTo = useNavigate();

  const handleGoToConfig = () => {
    navigateTo(
      `/setting/project-list/${projectId}/application-details/${applicationId}`,
      { state: { projectId, applicationId, applicationName, projectName } }
    );
  };

  return (
    <>
      <div className="w-[500px] h-[350px] rounded-[10px] flex justify-center items-center">
        <div className="relative w-full h-full">
          <img
            src={alertApkModal}
            alt="alertApkModal"
            className="w-full h-full"
          />
          <div className="absolute top-9 left-1/2 transform -translate-x-1/2">
            <img src={alertImage} alt="alertImage" />
          </div>
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-full px-10">
            <div className="flex flex-col justify-center items-center gap-5">
              <div className="text-3xl text-ibl1 font-bold text-center">
                {`${applicationType ==='iOS' ? 'IPA' : 'APK'} file is missing...`}
              </div>
              <div className="text-igy1 font-medium text-center">
                {`Please upload the ${applicationType ==='iOS' ? 'IPA' : 'APK'} file in the Settings.`}
              </div>
            </div>

            <div className="flex flex-col justify-center items-center gap-5 mt-5">
              <div
                className="text-ibl1 underline hover:font-semibold cursor-pointer"
                onClick={handleGoToConfig}
              >
                Click here to upload
              </div>
              <CustomButton label="Close" onClick={onClick} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
