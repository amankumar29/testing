import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import InputField from "Components/Atoms/InputField/InputField";
import TextLink from "Components/Atoms/TextLink/TextLink";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useCreateIntegrationMutation,
  useDeleteIntegrationMutation,
  useGetIntegrationQuery,
  useUpdateIntegrationMutation,
} from "Services/API/apiHooks";
import * as Yup from "yup";
import jiraLogo from "../../../Assets/Images/atlassianJira.webp";
import browserStackLogo from "../../../Assets/Images/browserstack.webp";
import gitLogo from "../../../Assets/Images/git-logo.png";
import sauceLabs from "../../../Assets/Images/sauceLabs.png";
import ChipTitle from "../../../Components/Atoms/ChipTitle/ChipTitle";
import { CustomButton } from "../../../Components/Atoms/CustomButton/CustomButton";
import { Modal } from "../../../Components/Atoms/Modal/Modal";

const Integrations = () => {
  const [openModal, setOpenModal] = useState(null);
  const [browserStackCredential, setBrowserStackCredential] = useState(null);
  const [saucelabsCredential, setSauceLabsCredential] = useState(null);
  const [jiraCredential, setJiraCredential] = useState(null);
  const [githubCredential, setGithubCredential] = useState(null);
  const [renderedIntegration, setRendeneredIntegration] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasIntegration = renderedIntegration?.length && !isLoading;

  const { userDetails } = useSelector((state) => state.userDetails);

  const [createIntegration, { isLoading: isCreating, error }] =
    useCreateIntegrationMutation();
  const [deleteIntegration, { isLoading: isDeleting }] =
    useDeleteIntegrationMutation();
  const [updateIntegration, { isLoading: isUpdating }] =
    useUpdateIntegrationMutation();
  const {
    data,
    isLoading: isFetching,
    error: errorWhileFetching,
    refetch,
  } = useGetIntegrationQuery();

  const handleOpenModal = (integration) => {
    setOpenModal(integration);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  useEffect(() => {
    if (isFetching) {
      setIsLoading(true);
    }
    if (data) {
      setIsLoading(false);
      const list = data?.results;
      const browserStackCredential = list
        ?.filter((item) => item?.integrationName === "browser-stack")
        .shift();
      setBrowserStackCredential(browserStackCredential);
      const sauceLabsCredential = list
        ?.filter((item) => item?.integrationName === "sauce-labs")
        .shift();
      setSauceLabsCredential(sauceLabsCredential);
      const jiraCredential = list
        ?.filter((item) => item?.integrationName === "atlassian-jira")
        .shift();
      setJiraCredential(jiraCredential);
      const githubCredential = list
        ?.filter((item) => item?.integrationName === "github")
        .shift();
      setGithubCredential(githubCredential);
    }
    if (errorWhileFetching) {
      toast.error("Error while fetching the data");
    }
    // eslint-disable-next-line
  }, [isFetching, data, errorWhileFetching]);

  const integrations = useMemo(
    () => [
      {
        id: browserStackCredential ? browserStackCredential?._id : null,
        logo: browserStackLogo,
        label: "BrowserStack",
        subLabel: "Credentials",
        navigateTo: "/documentation?topic=browser-stack",
        name: "browser-stack",
        username: browserStackCredential
          ? browserStackCredential?.userName
          : null,
        access_key: browserStackCredential
          ? browserStackCredential?.accessKey
          : null,
        domain: browserStackCredential ? browserStackCredential?.domain : null,
      },
      {
        id: saucelabsCredential ? saucelabsCredential?._id : null,
        logo: sauceLabs,
        label: "Sauce Labs",
        subLabel: "Credentials",
        navigateTo: "/documentation?topic=sauce-labs",
        name: "sauce-labs",
        username: saucelabsCredential ? saucelabsCredential?.userName : null,
        access_key: saucelabsCredential ? saucelabsCredential?.accessKey : null,
        domain: saucelabsCredential ? saucelabsCredential?.domain : null,
      },
      {
        id: jiraCredential ? jiraCredential?._id : null,
        logo: jiraLogo,
        label: "Atlassian Jira",
        subLabel: "Credentials",
        navigateTo: "/documentation?topic=test-case-management",
        name: "atlassian-jira",
        username: jiraCredential ? jiraCredential?.userName : null,
        access_key: jiraCredential ? jiraCredential?.accessKey : null,
        domain: jiraCredential ? jiraCredential?.domain : null,
      },
      {
        id: githubCredential ? githubCredential?._id : null,
        logo: gitLogo,
        label: "GitHub",
        subLabel: "GitHub Action",
        navigateTo: "/documentation?topic=git-hub",
        name: "github",
        username: githubCredential ? githubCredential?.userName : null,
        access_key: githubCredential ? githubCredential?.accessKey : null,
        domain: githubCredential ? githubCredential?.domain : null,
      },
    ],
    [
      browserStackCredential,
      saucelabsCredential,
      jiraCredential,
      githubCredential,
    ]
  );

  useEffect(() => {
    if (userDetails?.role !== "Admin") {
      const list = integrations?.filter((e) => e?.id !== null);
      setRendeneredIntegration(list);
    } else {
      // alert("integrations");
      setRendeneredIntegration(integrations);
    }
    // eslint-disable-next-line
  }, [integrations]);

  console.log(integrations);

  const handleCreate = async (payload) => {
    try {
      const res = await createIntegration(payload).unwrap();
      if (res) {
        handleCloseModal();
        refetch();
        toast.success(res.message);
      }
    } catch (error) {
      toast.error("Failed to add Integration. Please Try Again");
    }
  };

  const handleDeleteIntegration = async (id) => {
    try {
      const res = await deleteIntegration(id).unwrap();
      if (res) {
        handleCloseModal();
        refetch();
        toast.success(res.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = async (values) => {
    const integrationId = values?.id;
    console.log(integrationId);
    const payload = {
      userName: values?.userName,
      accessKey: values?.accessKey,
      domain: values?.domain,
    };
    try {
      const data = await updateIntegration({ payload, integrationId }).unwrap();
      if (data) {
        handleCloseModal();
        refetch();
        toast.success(data?.message);
      }
    } catch (error) {
      toast.error("Unable to update. Please try again");
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-iwhite lg:drop-shadow-lg max-h-[calc(100vh-220px)] mdMax:max-h-[100%]">
      <ChipTitle label={"Integrations"} />
      {isFetching ? (
        <div className="w-full h-[290px] flex items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="min-h-[90%]">
          {hasIntegration ? (
            <div className="grid-cols-2 gap-6 mt-6 mdMax:mt-3 lg:grid ">
              {renderedIntegration.map((integration, index) => (
                <IntegrationCard
                  key={index}
                  integration={integration}
                  onClick={() => handleOpenModal(integration)}
                  navigateTo={integration.navigateTo}
                  userRole={userDetails?.role}
                />
              ))}
            </div>
          ) : (
            <p className="flex items-center justify-center font-medium text-sm text-[#767676] italic h-[60vh]">
              No active integrations found. Please contact the administrator for
              assistance.
            </p>
          )}
        </div>
      )}
      <IntegrationModal
        isOpen={openModal !== null}
        onClose={handleCloseModal}
        integration={openModal}
        onCreate={(payload) => handleCreate(payload)}
        onUpdate={(values) => handleUpdate(values)}
        onDelete={(id) => handleDeleteIntegration(id)}
        organizationId={userDetails?.organizationId}
      />
    </div>
  );
};

const IntegrationCard = ({ onClick, navigateTo, integration, userRole }) => {
  const navigate = useNavigate();
  return (
    <div className="px-6 mdMax:px-3 pt-6 pb-3 border border-solid bg-opacity-10 rounded-2xl border-ibl7 bg-ibl7 lgMax:mb-2">
      <div className="flex items-center gap-4 font-medium text-lg tracking-[0.45px]">
        <img
          src={integration?.logo}
          className="h-7"
          alt={`${integration?.label} logo`}
        />
        <p>{integration?.label}</p>
      </div>
      {userRole === "Admin" && (
        <div className="flex items-center justify-between h-10 my-3">
          <p className="text-xs text-[#767676]">{integration?.subLabel}</p>
          <CustomButton
            label={integration?.id ? "View" : "Add"}
            className="!w-[100px]"
            onClick={onClick}
          />
        </div>
      )}

      <button
        onClick={() => {
          navigate(navigateTo);
        }}
        type="button"
        className="text-xs font-normal tracking-[0.19px] mt-4 text-ibl1 hover:underline hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in"
      >
        Read the instructions
      </button>
    </div>
  );
};

export default Integrations;

IntegrationCard.propTypes = {
  navigateTo: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  integration: PropTypes.object,
};

const IntegrationModal = ({
  isOpen,
  onClose,
  integration,
  onCreate,
  onDelete,
  onUpdate,
  organizationId,
}) => {
  const handleSave = (values) => {
    if (integration?.id) {
      const requiredData = {
        id: integration?.id,
        domain: values?.domain,
        userName: values?.username,
        accessKey: values?.accessKey,
      };
      onUpdate(requiredData);
    } else {
      const requestPayload = {
        integrationName: integration?.name,
        domain: values?.domain,
        userName: values?.username,
        accessKey: values?.accessKey,
        organizationId: organizationId,
      };
      onCreate(requestPayload);
    }
    formik.resetForm();
  };

  const handleClose = () => {
    onClose();
    formik.resetForm();
  };

  const Schema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    accessKey: Yup.string().required("Access key is required"),
    domain: Yup.string().required("Domain is required"),
  });

  useEffect(() => {
    if (integration?.id) {
      formik.setFieldValue("username", integration?.username);
      formik.setFieldValue("accessKey", integration?.access_key);
      formik.setFieldValue("domain", integration?.domain);
    }
    // eslint-disable-next-line
  }, [integration]);

  const handleDeleteIntegration = () => {
    const id = integration?.id;
    onDelete(id);
    formik.resetForm();
  };

  const initialValues = {
    username: "",
    accessKey: "",
    domain: "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Schema,
    onSubmit: handleSave,
  });

  const disableButton = useMemo(() => {
    return !(
      formik.dirty &&
      formik.isValid &&
      (formik.values.username !== integration?.username ||
        formik.values.accessKey !== integration?.access_key ||
        formik.values.domain !== integration?.domain)
    );
  }, [formik, integration]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className={"w-[526px] pb-8"}>
      <div className="flex items-center justify-center h-20 bg-ibl7 rounded-t-[10px] relative">
        <p className="flex items-center gap-3 text-lg font-medium leading-7">
          <img src={integration?.logo} alt="" className="h-7" />
          {integration?.label}
        </p>
        <div className="absolute right-0 mr-[33px] cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
          <CloseIcon onClick={handleClose} data-testid="close_Icon" />
        </div>
      </div>

      <div className="p-10">
        <div>
          <InputField
            id="domain"
            label="Domain"
            placeHolder="Enter Domain"
            className="w-full h-[40px]"
            isRequired={true}
            {...formik.getFieldProps("domain")}
            error={formik.touched.domain && formik.errors.domain}
          />
        </div>
        <div className="mt-6">
          <InputField
            id="username"
            label="Username"
            placeHolder="Enter Username"
            className="w-full h-[40px]"
            isRequired={true}
            {...formik.getFieldProps("username")}
            error={formik.touched.username && formik.errors.username}
          />
        </div>
        <div className="mt-6">
          <InputField
            id="accessKey"
            label="Access Key"
            placeHolder="Enter Access Key"
            className="w-full h-[40px]"
            isRequired={true}
            {...formik.getFieldProps("accessKey")}
            error={formik.touched.accessKey && formik.errors.accessKey}
          />
        </div>
      </div>
      <div className="flex items-center justify-center mt-2 mdMax:px-10">
        <CustomButton
          label={"Save"}
          onClick={formik.handleSubmit}
          disable={disableButton}
        />
      </div>
      {integration?.id && (
        <div className="flex items-center justify-center mt-2">
          <TextLink label="Delete" onClick={handleDeleteIntegration} />
        </div>
      )}
    </Modal>
  );
};

IntegrationModal.propTypes = {
  integration: PropTypes.object.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  navigateTo: PropTypes.string.isRequired,
};
