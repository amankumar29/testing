import CloseIcon from "@mui/icons-material/Close";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import InputField from "Components/Atoms/InputField/InputField";
import { Modal } from "Components/Atoms/Modal/Modal";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createPage,
  deletePage,
  getAllPage,
  getRepo,
  updatePage,
  createRepo,
} from "Services/API/Setting/Pom";
import * as Yup from "yup";

const PomScreen = ({ navigateTo = () => {} }) => {
  const [isCreateScreenModalOpen, setIsCreateModalOpen] = useState(false);
  const [screenList, setScreenList] = useState([]);
  const [isRepo, setIsRepo] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null); // For tracking edit
  const { applicationId, projectId } = useParams();

  const handleClick = () => {
    setIsCreateModalOpen(true);
    setSelectedScreen(null); // Reset selectedScreen when creating a new screen
  };

  useEffect(() => {
    getRepo(projectId, applicationId)
      .then((res) => {
        const data = res?.data?._id;
        setIsRepo(data ? data : null);
      })
      .catch(() => {
        toast.error("Unable to fetch locator Repository");
      });
  }, []);

  useEffect(() => {
    if (isRepo) {
      getAllScreen();
    }
  }, [isRepo]);

  const getAllScreen = () => {
    getAllPage(isRepo)
      .then((res) => {
        const data = res?.data.pages;
        setScreenList(data);
      })
      .catch((error) => {
        toast.error("Unable to fetch Screen List");
      });
  };

  const handleCreateOrEditScreen = (screenData) => {
    if (selectedScreen) {
      // If editing, update the existing screen
      const locatorId = isRepo;
      const id = screenData?.id;
      const payload = {
        pageName: screenData?.pageName,
      };
      updatePage(locatorId, id, payload)
        .then(() => {
          toast.success("Screen update successfully");
          getAllScreen();
        })
        .catch(() => {
          toast.error("Screen failed to update. Please try again");
        });
    } else {
      // Creating new screen
      const createScreenWithRepo = (locatorId) => {
        const payload = {
          pageName: screenData?.pageName,
        };
        createPage(locatorId, payload)
          .then(() => {
            toast.success("Screen created successfully");
            getAllScreen();
          })
          .catch(() => {
            toast.error("Unable to create. Please try again");
          });
      };

      if (!isRepo) {
        // Create repo first if it doesn't exist

        createRepo(projectId, applicationId)
          .then((res) => {
            const newRepoId = res?.data?._id;
            setIsRepo(newRepoId);
            createScreenWithRepo(newRepoId);
          })
          .catch(() => {
            toast.error("Unable to create repository. Please try again");
          });
      } else {
        // Repo exists, create screen directly
        createScreenWithRepo(isRepo);
      }
    }
    setIsCreateModalOpen(false);
  };

  const handleEditScreen = (e, screen) => {
    e.stopPropagation();
    setSelectedScreen(screen); // Set screen to be edited
    setIsCreateModalOpen(true); // Open modal
  };

  const handleDeleteScreen = (e, screen) => {
    e.stopPropagation();
    const locatorId = isRepo;
    deletePage(locatorId, screen?._id)
      .then(() => {
        toast.success("Screen deleted successfully");
        getAllScreen();
      })
      .catch(() => {
        toast.error("Unable to delete. Please try again");
      });
  };

  const handleNavigate = (screen) => {
    const requiredData = {
      repoId: isRepo,
      pageId: screen?._id,
    };
    navigateTo(requiredData);
  };

  return (
    <div>
      <div className="flex justify-end my-6">
        <CustomButton label="Create New Screen" onClick={handleClick} />
      </div>
      <div className="flex items-center justify-between h-10 px-6 font-bold bg-ibl7">
        <div>Screen Name</div>
        <div className="flex gap-10">
          <div>Edit</div>
          <div>Delete</div>
        </div>
      </div>
      <div className="overflow-y-scroll h-[450px] ">
        {screenList.map((screen, i) => (
          <div key={i}>
            <div
              className="flex items-center justify-between h-12 px-6 font-medium cursor-pointer hover:bg-ibl7"
              onClick={() => handleNavigate(screen)}
            >
              <div className="flex items-center">{screen?.pageName}</div>
              <div className="flex items-center gap-10">
                <div
                  onClick={(e) => handleEditScreen(e, screen)}
                  className="cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in-out hover:underline"
                >
                  Edit
                </div>
                <div
                  className="cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in-out hover:underline"
                  onClick={(e) => handleDeleteScreen(e, screen)}
                >
                  Delete
                </div>
              </div>
            </div>
            <hr className=" text-ibl7 rounded-[50%]" />
          </div>
        ))}
      </div>

      {isCreateScreenModalOpen && (
        <CreateScreenModal
          isOpen={isCreateScreenModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateOrEditScreen}
          data={selectedScreen} // Pass selected screen for editing
        />
      )}
    </div>
  );
};

export default PomScreen;

const CreateScreenModal = ({ isOpen, onClose, onSave, data }) => {
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  const { applicationId, projectId } = useParams();

  const formik = useFormik({
    initialValues: {
      pageName: data?.pageName || "", // Populate with selected screen data for editing
    },
    validationSchema: Yup.object({
      pageName: Yup.string()
        .test("no-emojis", "Value cannot contain emojis.", (val) => {
          return !emojiRegex.test(val);
        })
        .required("Screen name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed."),
    }),
    onSubmit: (values) => {
      const payload = {
        projectId: data?.projectId || projectId, // Retain projectId and applicationId
        applicationId: data?.applicationId || applicationId,
        id: data?._id || null,
        pageName: values.pageName,
      };
      onSave(payload); // Send payload back to parent
      formik.resetForm();
      onClose(); // Close modal after saving
    },
  });

  const handleDisableButton = useMemo(() => {
    return !(
      formik.dirty &&
      formik.isValid &&
      formik.values.pageName !== data?.pageName
    );
  }, [formik, data]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="md:w-[400px] h-[325px]">
        <div className="flex items-center justify-center h-20 bg-ibl7 rounded-t-[10px] relative">
          <p className="text-lg font-medium leading-7">
            {data ? "Edit Screen" : "Create New Screen"}{" "}
            {/* Update modal title */}
          </p>
          <div className="absolute right-0 mr-[33px] cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
            <CloseIcon onClick={onClose} />
          </div>
        </div>
        <div className="mdMax:px-6">
          <div className="flex justify-center mt-8 text-base leading-5 ">
            <p className="max-w-[350px] text-center">
              {data ? "Edit the screen name:" : "Enter the name of the screen:"}
            </p>
          </div>
          <div className="flex items-center justify-center w-full my-6">
            <InputField
              placeHolder={"Enter Screen Name"}
              className={`h-[52px] w-[200px] md:w-[350px] -mt-0 mdMax:mr-2`}
              onChange={formik.handleChange}
              {...formik.getFieldProps("pageName")}
              error={formik.touched.pageName && formik.errors.pageName}
            />
          </div>
          <div className="flex items-center justify-center">
            <CustomButton
              type="submit"
              label={data ? "Update" : "Create"} // Dynamic button label
              className={`w-[150px] h-[52px] mt-[7px] mdMax:max-w-40`}
              onClick={formik.handleSubmit}
              disable={handleDisableButton}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
