import { useNavigate, useParams } from "react-router-dom";
import Tabs from "Components/Atoms/Tabs/Tabs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TestRunsTabs = () => {
  const navigateTo = useNavigate();
  const params = useParams();

  const handleClick = () => {
    navigateTo("/projects");
  };

  return (
    <div>
      <div className="flex items-start mt-4 gap-[15px]">
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
            { id: 3, tab: "Test Plans", type: "test-plans" },
          ]}
          className="flex"
          tabsClassName="text-sm"
          activeTab={params?.type}
        />
      </div>
    </div>
  );
};

export default TestRunsTabs;
