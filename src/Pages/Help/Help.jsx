import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HelpSideBar from "../../Components/Atoms/HelpSideBar/HelpSideBar";
import HelpTableContent from "../../Components/Atoms/HelpTableContent/HelpTableContent";
import HowToCreateWebTests from "./HelpContent/HowToCreateWebTests";
import TestCaseManagement from "./HelpContent/TestCaseManagement";
import BrowserStack from "./HelpContent/BrowserStack";
import styles from "./Help.module.scss";
import SauceLabs from "./HelpContent/SauceLabs";
import GitHubInstructions from "./HelpContent/GitHubInstructions";

const Help = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialTopic = queryParams.get("topic") || "how-to-create-web-tests";
  const initialOpenSection = queryParams.get("section") || "web-tests";
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [openSection, setOpenSection] = useState(initialOpenSection);

  useEffect(() => {
    const topicFromURL = queryParams.get("topic");
    const sectionFromURL = queryParams.get("section");
    if (topicFromURL) {
      setSelectedTopic(topicFromURL);
    }
    if (sectionFromURL) {
      setOpenSection(sectionFromURL);
    }
  }, [location.search]);

  useEffect(() => {
    navigate(`?topic=${selectedTopic}&section=${openSection}`);
  }, [selectedTopic, openSection, navigate]);

  const webTestTopics = [
    { id: "how-to-create-web-tests", label: "How to create Web Tests" },
    { id: "finding-elements", label: "Finding elements in Web Applications" },
    { id: "how-to-execute-web-tests", label: "How to execute Web Tests" },
    { id: "assertions-for-web-tests", label: "Assertions for Web Tests" },
    { id: "how-to-test-in-iframes", label: "How to test in iframes" },
    { id: "how-to-test-file-uploads", label: "How to test File Uploads" },
    { id: "how-to-test-file-downloads", label: "How to test File Downloads" },
    { id: "how-to-test-in-emails", label: "How to test Emails" },
    { id: "how-to-test-pdf-files", label: "How to test PDF files" },
  ];

  const integrationTopics = [
    { id: "browser-stack", label: "BrowserStack" },
    { id: "sauce-labs", label: "Sauce Labs" },
    { id: "test-case-management", label: "Test Case Management" },
    {id: "git-hub", label: "Git Hub"}
  ];

  const getWebTableOfContents = (selectedTopic) => {
    switch (selectedTopic) {
      case "how-to-create-web-tests":
        return [
          { id: "introduction", title: "Introduction" },
          { id: "manage-projects", title: "Manage Projects" },
          { id: "create-project", title: "Create a Project" },
          { id: "edit-project", title: "Edit a Project" },
          { id: "delete-project", title: "Delete a Project" },
        ];
      case "finding-elements":
        return [
          { id: "hi", title: "hi" },
          { id: "hlo", title: "hlo" },
          { id: "create-project", title: "Create a Project" },
          { id: "edit-project", title: "Edit a Project" },
          { id: "delete-project", title: "Delete a Project" },
        ];
      case "how-to-execute-web-tests":
        return null;
      case "assertions-for-web-tests":
        return null;
      case "how-to-test-in-iframes":
        return null;
      case "how-to-test-file-uploads":
        return null;
      case "how-to-test-file-downloads":
        return null;
      case "how-to-test-in-emails":
        return null;
      case "how-to-test-pdf-files":
        return null;
      case "browser-stack":
        return [
          {
            id: "steps",
            title: "Steps",
          },
        ];
      case "test-case-management":
        return [
          { id: "introduction", title: "Introduction" },
          { id: "add-external-ids", title: "Add External IDs" },
          { id: "fetching-the-reults", title: "Fetching the results" },
          {
            id: "updating-the-test-cases-in-your-tcm-tool",
            title: "Updating the Test Cases in your TCM tool",
          },
        ];
      case "sauce-labs":
        return [{ id: "steps", title: "Steps" }, {}];
      case "git-hub":
        return [{
          id: "introduction", title: "Instructions"
        },{
          id:"example-workflow", title: "Example workflow"
        },{
          id: "environment-variables", title: "Environment Variables"
        },{
          id: "inputs", title:"Inputs"
        },{
          id: "outputs", title:"Outputs"
        }]
      default:
        return [];
    }
  };

  const HelpContentSection = ({ selectedTopic }) => {
    const renderContent = () => {
      switch (selectedTopic) {
        case "how-to-create-web-tests":
          return <HowToCreateWebTests />;
        case "browser-stack":
          return <BrowserStack />;
        case "test-case-management":
          return <TestCaseManagement />;
        case "sauce-labs":
          return <SauceLabs />;
        case "git-hub":
          return <GitHubInstructions/>
        default:
          return <p className="text-center">Select a topic to view</p>;
      }
    };

    return (
      <div className="flex flex-grow relative bg-iwhite lgMax:mb-5">
        <div
          className={`w-full flex flex-col rounded-lg ${styles.stepsContainer} ${styles.drawerScroll}`}
        >
          <div className="flex-grow px-8 w-full pb-6 mt-4 flex-shrink-0">
            <div className={`h-[90vh] pb-12`}>{renderContent()}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="text-2xl font-medium mb-4" data-testid="project_heading">
        Documentation
      </div>
      <div className="lg:flex gap-6 text-[#021526] pb-2 h-[calc(100vh-215px)] lgMax:overflow-y-auto">
        <HelpSideBar
          webTestTopics={webTestTopics}
          integrationTopics={integrationTopics}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          openSection={openSection}
          setOpenSection={setOpenSection}
        />
        <HelpContentSection selectedTopic={selectedTopic} />
        <HelpTableContent
          selectedTopic={selectedTopic}
          getWebTableOfContents={getWebTableOfContents}
        />
      </div>
    </>
  );
};

export default Help;
