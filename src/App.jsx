import PrivateRoute from "Components/Atoms/PrivateRoute/PrivateRoute";
import Internal from "Components/Organisms/Template/Internal";
import ToastProvider from "Helpers/ToastProvider/ToastProvider";
import Authentication from "Pages/Authentication/Authentication";
import Login from "Pages/Authentication/Login/Login";
import Dashboard from "Pages/Dashboard/Dashboard";
import Help from "Pages/Help/Help";
import BrowserStack from "Pages/Help/HelpContent/BrowserStack";
import HowToCreateWebTests from "Pages/Help/HelpContent/HowToCreateWebTests";
import NewProject from "Pages/NewProject/NewProject";
import AddNewTestCases from "Pages/Projects/AddNewTestCases/AddNewTestCases";
import AddNewTestPlans from "Pages/Projects/AddNewTestPlans/AddNewTestPlans";
import ProjectList from "Pages/Projects/ProjectList/ProjectList";
import Projects from "Pages/Projects/Projects";
import Testcases from "Pages/Projects/Testcases/Testcases";
import TestSuiteDetails from "Pages/Projects/TestSuites/TestSuiteDetails/TestSuiteDetails";
import Runs from "Pages/Runs/Runs";
import RunsSummary from "Pages/Runs/RunsSummary/RunsSummary";
import RunsTestCase from "Pages/Runs/RunsTestCase/RunsTestCase";
import RunsTestPlans from "Pages/Runs/RunsTestPlans/RunsTestPlans";
import RunsTestSuites from "Pages/Runs/RunsTestSuites/RunsTestSuites";
import TestPlanSummary from "Pages/Runs/TestPlanSummary/TestPlanSummary";
import TestSuiteSummary from "Pages/Runs/TestSuiteSummary/TestSuiteSummary";
import ChangePassword from "Pages/Setting/ChangePassword/ChangePassword";
import Integrations from "Pages/Setting/Integrations/Integrations";
import ProjectDetails from "Pages/Setting/ProjectDetails/ProjectDetails";
import ProjectSetting from "Pages/Setting/ProjectsSetting/ProjectSetting";
import Setting from "Pages/Setting/Setting";
import Spreadsheet from "Pages/Spreadsheet/Spreadsheet";
import UserProfile from "Pages/UserProfile/UserProfile";
import Users from "Pages/Users/Users";
import { useEffect, useState } from "react";
import WifiOffOutlinedIcon from "@mui/icons-material/WifiOffOutlined";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { WebsocketProvider } from "Services/Socket/socketProvider";

// import Internal from "Components/Organisms/Template/Internal";
// import Authentication from "Pages/Authentication/Authentication";
// import Login from "Pages/Authentication/Login/Login";
// import Dashboard from "Pages/Dashboard/Dashboard";
// import Help from "Pages/Help/Help";
// import ProjectList from "Pages/Projects/ProjectList/ProjectList";
// import Projects from "Pages/Projects/Projects";
// import Runs from "Pages/Runs/Runs";
// import Setting from "Pages/Setting/Setting";
// import Users from "Pages/Users/Users";
// import {
//   Navigate,
//   Route,
//   BrowserRouter as Router,
//   Routes,
// } from "react-router-dom";
// // import AddNewProjects from "./Pages/Projects/AddNewProject/AddNewProjects";
// import ToastProvider from "Helpers/ToastProvider/ToastProvider";
// import Capital from "./Capital";
// import Testcases from "./Pages/Projects/Testcases/Testcases";
// import AddNewTestCases from "./Pages/Projects/AddNewTestCases/AddNewTestCases";
// import RunsTestCase from "./Pages/Runs/RunsTestCase/RunsTestCase";
// import RunsTestPlans from "./Pages/Runs/RunsTestPlans/RunsTestPlans";
// import RunsTestSuites from "./Pages/Runs/RunsTestSuites/RunsTestSuites";
// import AddNewTestPlans from "./Pages/Projects/AddNewTestPlans/AddNewTestPlans";
// import UserProfile from "./Pages/UserProfile/UserProfile";
// import RunsSummary from "./Pages/Runs/RunsSummary/RunsSummary";
// import TestSuiteDetails from "./Pages/Projects/TestSuites/TestSuiteDetails/TestSuiteDetails";
// import TestSuiteSummary from "./Pages/Runs/TestSuiteSummary/TestSuiteSummary";
// import Spreadsheet from "./Pages/Spreadsheet/Spreadsheet";
// import TestPlanSummary from "./Pages/Runs/TestPlanSummary/TestPlanSummary";
// import ProjectSetting from "./Pages/Setting/ProjectsSetting/ProjectSetting";
// import Integrations from "./Pages/Setting/Integrations/Integrations";
// import NewProject from "./Pages/NewProject/NewProject";
// import BrowserStack from "./Pages/Help/HelpContent/BrowserStack";
// import HowToCreateWebTests from "./Pages/Help/HelpContent/HowToCreateWebTests";
// import ProjectDetails from "./Pages/Setting/ProjectDetails/ProjectDetails";
// import ChangePassword from "./Pages/Setting/ChangePassword/ChangePassword";
// import PrivateRoute from "Components/Atoms/PrivateRoute/PrivateRoute";
import AddUsers from "Pages/Setting/AddUsers/AddUsers";
import Configuration from "Pages/Setting/ProjectDetails/Configuration";
import PageObjectModel from "Pages/Setting/ProjectDetails/PageObjectModel";
import GlobalVariable from "Pages/Setting/ProjectDetails/GlobalVariable";

const TemplatePage = () => {
  return (
    <Router>
      <Routes>
        <Route
          element={
            <WebsocketProvider>
              <PrivateRoute />
            </WebsocketProvider>
          }
        >
          <Route path="/" element={<Internal />}>
            {/* Dashboard Route */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Projects Route */}
            <Route path="projects" element={<Projects />}>
              {/* Nested Route for ProjectList */}

              <Route index element={<ProjectList />} />
              {/* <Route path="add-new-project" element={<AddNewProjects />} /> */}
              <Route path="add-new-project" element={<NewProject />} />

              <Route path="/projects/:type" element={<Testcases />} />
              <Route
                path="/projects/:type/workbook/:project/:id/:application"
                element={<Spreadsheet />}
              />

              <Route
                path="/projects/:type/add-test-steps"
                element={<AddNewTestCases />}
              />
              <Route
                path="/projects/:type/add-test-scheduler"
                element={<AddNewTestPlans />}
              />
              <Route
                path="/projects/test-suites/test-cases"
                element={<TestSuiteDetails />}
              />
              <Route
                path="/projects/test-suites/test-cases/add-test-steps"
                element={<AddNewTestCases />}
              />
              {/* Redirect to ProjectList if no subpath is specified */}
              <Route index element={<Navigate to="projects" replace />} />
            </Route>

            {/* Runs Route */}

            <Route
              path="/runs"
              element={<Navigate to="/runs/test-case" replace />}
            />
            <Route path="/runs/*" element={<Runs />}>
              <Route path="test-case" element={<RunsTestCase />} />
              <Route path="test-suite" element={<RunsTestSuites />} />
              <Route path="test-scheduler" element={<RunsTestPlans />} />
            </Route>

            <Route
              path="/runs/test-cases/:id/summary"
              element={<RunsSummary />}
            />
            <Route
              path="/runs/test-suite/:id/summary"
              element={<TestSuiteSummary />}
            />
            <Route
              path="/runs/test-scheduler/:id/summary"
              element={<TestPlanSummary />}
            />

            {/* Setting Route */}
            <Route path="/setting/*" element={<Setting />}>
              <Route path="project-list" element={<ProjectSetting />} />
              <Route
                path="project-list/:projectId/application-details/:applicationId"
                element={<ProjectDetails />}
              >
                <Route path="config" element={<Configuration />} />
                <Route path="pom" element={<PageObjectModel />} />
                <Route path="globalvariable" element={<GlobalVariable />} />
              </Route>
              <Route path="integration" element={<Integrations />} />
              <Route path="add-user" element={<AddUsers />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>

            <Route
              path="/setting"
              element={<Navigate to="/setting/project-list" replace />}
            />

            {/* Users Route */}
            <Route path="users" element={<Users />} />

            {/* Help Route */}
            <Route path="/documentation/*" element={<Help />}>
              <Route
                path="documentation?topic=browser-stack"
                element={<BrowserStack />}
              />
              <Route path="create-web-test" element={<HowToCreateWebTests />} />
            </Route>

            {/* User Profile */}
            <Route path="user-profile" element={<UserProfile />} />

            {/* Redirection Routes */}
            <Route path="/" element={<Navigate to="dashboard" />} />
          </Route>
        </Route>

        {/* Authentication Route */}
        <Route path="/login" element={<Authentication />}>
          {/* Nested Route for Login */}
          <Route index element={<Login />} />

          {/* Redirect to Login if no subpath is specified */}
          <Route path="*" element={<Navigate to="login" />} />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  const [isOnline, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
  }, []);
  window.addEventListener("online", () => {
    setOnline(true);
  });
  window.addEventListener("offline", () => {
    setOnline(false);
  });
  return (
    <>
      {!isOnline && (
        <div className="flex justify-center items-center fixed left-0 top-0 bg-iwhite/90 w-full h-full z-[9999]">
          <div className="text-center">
            <WifiOffOutlinedIcon className="!text-[100px]" />
            <p className="mt-4 text-xl font-semibold">No Internet Connection</p>
          </div>
        </div>
      )}
      <TemplatePage />
      <ToastProvider />
    </>
  );
}

export default App;
