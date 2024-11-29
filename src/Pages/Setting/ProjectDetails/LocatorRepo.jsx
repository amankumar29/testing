import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import InputField from "Components/Atoms/InputField/InputField";
import { Modal } from "Components/Atoms/Modal/Modal";
import SearchDropdown from "Components/Atoms/SearchDropdown/SearchDropdown";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "react-toastify";
import {
  createElement,
  deleteElement,
  getAllElement,
  updateElement,
} from "Services/API/Setting/Pom";
import * as Yup from "yup";

const LocatorRepo = ({ navigateTo, reqData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [payload, setPayload] = useState(null);
  const [data, setData] = useState([]);
  const handleClick = () => {
    setIsModalOpen(!isModalOpen);
  };

  const fetchAllElement = () => {
    const locatorId = reqData?.repoId;
    const pageId = reqData?.pageId;
    getAllElement(locatorId, pageId)
      .then((res) => {
        const data = res?.data;
        setData(data);
      })
      .catch((err) => {
        toast.error("Unable to fetch element list");
      });
  };

  useEffect(() => {
    fetchAllElement();
  }, [reqData]);

  useEffect(() => {
    if (payload) {
      setData((prev) => [...prev, payload]);
      setPayload(null); // Clear payload after adding to data
    }
  }, [payload]);

  const handleEdit = (e, element) => {
    e.stopPropagation();
    setSelectedElement(element); // Set screen to be edited
    setIsModalOpen(true); // Open modal
  };

  // Function to handle deletion of an element
  const handleDelete = (e, element) => {
    e.stopPropagation();
    const locatorId = reqData?.repoId;
    const pageId = reqData?.pageId;
    const elementId = element?._id;
    deleteElement(locatorId, pageId, elementId)
      .then(() => {
        toast.success("Element deleted successfully");
        fetchAllElement();
      })
      .catch(() => {
        toast.error("Unable to delete element");
      });
    // setData((prevList) => prevList.filter((_, index) => index !== i));
  };

  const handleCreateElement = (obj) => {
    // If editing, update the existing screen
    if (selectedElement) {
      const locatorId = reqData?.repoId;
      const pageId = reqData?.pageId;
      const elementId = selectedElement?._id;
      updateElement(locatorId, pageId, elementId, obj)
        .then(() => {
          toast.success("Element updated successfully");
          fetchAllElement();
        })
        .catch(() => {
          toast.error("Unable to update element");
        });
    } else {
      const locatorId = reqData?.repoId;
      const pageId = reqData?.pageId;
      createElement(locatorId, pageId, obj)
        .then(() => {
          toast.success("Element created successfully");
          fetchAllElement();
        })
        .catch((err) => {
          toast.error("Unable to create element");
        });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedElement(null);
  };

  return (
    <div>
      <div className="flex justify-between my-6">
        <ArrowBackIcon className="cursor-pointer" onClick={navigateTo} />
        <CustomButton label="Create New Element" onClick={handleClick} />
      </div>
      <div className="flex items-center justify-between h-10 px-6 font-bold bg-ibl7">
        <div>Element Name</div>
        <div className="flex gap-10">
          <div>Edit</div>
          <div>Delete</div>
        </div>
      </div>
      <div className="overflow-y-scroll h-[450px] ">
        {data.length > 0 &&
          data.map((element, i) => (
            <div key={i}>
              <div
                className="flex items-center justify-between h-12 px-6 font-medium cursor-pointer hover:bg-ibl7"
                //   onClick={navigateTo}
              >
                <div className="flex items-center">{element?.elementName}</div>
                <div className="flex items-center gap-10">
                  <div
                    onClick={(e) => handleEdit(e, element)}
                    className="cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in-out hover:underline"
                  >
                    Edit
                  </div>
                  <div
                    className="cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in-out hover:underline"
                    onClick={(e) => handleDelete(e, element)}
                  >
                    Delete
                  </div>
                </div>
              </div>
              <hr className=" text-ibl7 rounded-[50%]" />
            </div>
          ))}
      </div>
      <CreateElementModal
        isOpen={isModalOpen}
        // onClose={() => setIsModalOpen(false)}
        onClose={handleCloseModal}
        onSave={(obj) => handleCreateElement(obj)}
        data={selectedElement}
      />
    </div>
  );
};

export default LocatorRepo;

const CreateElementModal = ({ isOpen, onClose, onSave, data }) => {
  const [disabledButton, setDisabledButton] = useState(true); // Initialize button as disabled
  const [identifier, setIdentifier] = useState([{ selector: null, value: "" }]);

  useEffect(() => {
    if (data?.attributes) {
      setIdentifier(data?.attributes);
    }
  }, [data]);

  const handleClose = () => {
    formik.resetForm();
    setIdentifier([{ selector: null, value: "" }]);
    onClose();
  };

  // Function to handle adding a new collection
  const addCollection = () => {
    const lastCollection = identifier[identifier.length - 1];
    if (lastCollection.selector && lastCollection) {
      setIdentifier([...identifier, { selector: null, value: "" }]);
      setDisabledButton(true); // Disable after adding
    }
  };

  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      elementName: data ? data?.elementName : "",
    },
    validationSchema: Yup.object({
      elementName: Yup.string()
        .test("no-emojis", "No emojis allowed.", (val) => !emojiRegex.test(val))
        .required("Element name is required.")
        .matches(/^(?!\s+$)/, "Spaces are not allowed."),
    }),

    onSubmit: (values) => {
      const payload = {
        // projectId: data?.projectId || projectId,
        // applicationId: data?.applicationId || applicationId,
        elementName: values.elementName,
        elements: identifier, // Include locators in the payload
      };
      onSave(payload);
      formik.resetForm();
      setIdentifier([{ selector: null, value: "" }]);
      onClose();
    },
  });

  const handleDisableButton = useMemo(() => {
    // Check if element name has changed
    const hasElementNameChanged =
      formik.values.elementName !== data?.elementName;

    // Check if identifiers have changed by comparing each field
    const hasIdentifiersChanged = identifier.some((item, index) => {
      const originalItem = data?.attributes?.[index] || {
        selector: null,
        value: "",
      };
      return (
        // Compare selector objects by their keyword_name
        item.selector?.keyword_name !== originalItem.selector?.keyword_name ||
        // Compare values
        item.value !== originalItem.value
      );
    });

    // Also check if number of identifiers has changed
    const identifierCountChanged =
      identifier.length !== (data?.attributes?.length || 1);

    // Button should be disabled if:
    // 1. Form is invalid OR
    // 2. No changes were made to element name, identifiers, or identifier count
    return (
      !formik.isValid ||
      (!hasElementNameChanged &&
        !hasIdentifiersChanged &&
        !identifierCountChanged)
    );
  }, [formik.isValid, formik.values.elementName, identifier, data]);

  // Function to handle locator type selection
  const handleLocatorSelect = (option, index) => {
    const updatedCollections = [...identifier];
    updatedCollections[index].selector = option;
    setIdentifier(updatedCollections);
  };

  // Function to handle locator value input
  const handleInputChange = (index, value) => {
    const updatedCollections = [...identifier];
    updatedCollections[index].value = value;
    setIdentifier(updatedCollections);
  };

  // Function to delete a locator collection
  const deleteCollection = (index) => {
    const updatedCollections = identifier.filter((_, i) => i !== index);
    setIdentifier(updatedCollections);
  };

  // Enable or disable the "Add" button based on the last identifier input
  useEffect(() => {
    const lastCollection = identifier[identifier.length - 1];
    if (lastCollection.selector && lastCollection.value) {
      setDisabledButton(false); // Enable button if selector and value are filled
    } else {
      setDisabledButton(true); // Disable if empty
    }
  }, [identifier]);

  const options = [
    { id: "66fce8824008100793ac3cf5", keyword_name: "Id" },
    { id: "66fce8824008100793ac3cf6", keyword_name: "Text Inside" },
    { id: "66fce8824008100793ac3cf7", keyword_name: "Name" },
    { id: "66fce8824008100793ac3cf8", keyword_name: "Class Name" },
    { id: "66fce8824008100793ac3cf9", keyword_name: "XPath" },
    { id: "66fce8824008100793ac3cfa", keyword_name: "CSS Selector" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-[650px]">
        <div className="flex items-center justify-center h-20 bg-ibl7 rounded-t-[10px] relative">
          <p className="text-lg font-medium leading-7">
            {data ? "Edit Element" : "Create New Element"}
          </p>
          <div className="absolute right-0 mr-[33px] cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
            <CloseIcon onClick={handleClose} />
          </div>
        </div>

        {/* Screen Name Input */}
        <div className="flex justify-center gap-6 text-base leading-5">
          <p className="flex items-center">Name of the Element:</p>
          <div className="flex items-center my-6">
            <InputField
              placeHolder="Enter Element Name"
              className="h-[52px] w-[200px] md:w-[350px] -mt-0"
              onChange={formik.handleChange}
              {...formik.getFieldProps("elementName")}
              error={formik.touched.elementName && formik.errors.elementName}
            />
          </div>
        </div>
        <div className="">
          {/* Identifier Input Fields */}
          {identifier.map((item, index) => (
            <div
              key={index}
              className="flex items-center pl-[18px] text-base leading-5"
            >
              <div className="flex items-center gap-6 ">
                <div>
                  <SearchDropdown
                    className="h-[50px]"
                    placeHolder="Choose Locator"
                    option={options}
                    isEditable={true}
                    selectedOption={options.find(
                      (opt) => opt.keyword_name === item.selector?.keyword_name
                    )}
                    onSelect={(option) => handleLocatorSelect(option, index)}
                  />
                </div>
                <div className="flex items-center">
                  <InputField
                    placeHolder="Enter Locator Value"
                    className="h-[52px] w-[200px] md:w-[350px] -mt-0"
                    value={item.value || ""}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                </div>
              </div>
              {identifier?.length > 1 && (
                <div onClick={() => deleteCollection(index)}>
                  <RiDeleteBin6Line
                    style={{
                      cursor: "pointer",
                      width: "!17px",
                      height: "!18px",
                      color: "#052C85",
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add New Locator */}
          <div className="mr-[55px] flex justify-end items-center">
            <button
              type="button"
              className="mt-2 text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in"
              onClick={addCollection}
              disabled={disabledButton} // Button disabled based on locator and value input
            >
              Add
            </button>
          </div>

          {/* Save/Submit Button */}
          <div className="flex items-center justify-center mb-6">
            <CustomButton
              type="submit"
              label={data ? "Update" : "Create"}
              className="w-[150px] h-[52px] mt-[7px]"
              onClick={formik.handleSubmit}
              disable={handleDisableButton || disabledButton}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
