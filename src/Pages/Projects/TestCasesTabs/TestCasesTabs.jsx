import { useNavigate, useParams } from "react-router-dom";
import Tabs from "Components/Atoms/Tabs/Tabs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { removeCookies } from "Helpers/RemoveCookies/RemoveCookies";

const TestCasesTabs = () => {
  const navigateTo = useNavigate();
  const params = useParams();

  const handleClick = () => {
    navigateTo("/projects");
    removeCookies();
  };

  return (
    <div className="mb-3 xl:mb-0">
      <div className="flex items-start mt-4 gap-[15px] min-w-500">
        <div
          onClick={handleClick}
          className="cursor-pointer"
          data-testid="arrow_back_icon"
        >
          <ArrowBackIcon />
        </div>
        <Tabs
          data={[
            { id: 1, tab: "Test Cases", type: "test-cases" },
            { id: 2, tab: "Test Suites", type: "test-suites" },
            { id: 3, tab: "Test Scheduler", type: "test-scheduler" },
          ]}
          className="flex"
          tabsClassName="text-sm"
          activeTab={params?.type}
        />
      </div>
    </div>
  );
};

export default TestCasesTabs;
