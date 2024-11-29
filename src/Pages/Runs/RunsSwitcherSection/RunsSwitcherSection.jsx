import { useEffect } from "react";
import SearchDropdown from "../../../Components/Atoms/SearchDropdown/SearchDropdown";
import { getProjectInfo } from "../../../Services/API/ProjectInfo/ProjectInfo";
import {
  getDefaultProjectList,
  getProjectsList,
  setDefaultProject,
} from "../../../Services/API/Projects/Projects";
import useRunsSwitcherStore from "../../../Store/useRunsSwitcherStore";
import { toast } from "react-toastify";

const RunsSwitcherSection = ({ onProjectSelect, onApplicationSelect, clearSearchField = () => {} }) => {
  const {
    projectList,
    applicationList,
    selectedProject,
    selectedApplication,
    setProjectList,
    setApplicationList,
    setSelectedProject,
    setSelectedApplication,
  } = useRunsSwitcherStore();

  // ... other functions and effects
  const getAllprojectList = () => {
    getDefaultProjectList()
      .then((res) => {
        const projectList = res?.data?.results;
        const updatedProjectList = projectList.map((item) => {
          return {
            id: item?.project_id,
            keyword_name: item?.project_name,
            is_default: item?.is_default,
          };
        });
        setProjectList(updatedProjectList);
        const areAllDefaultsFalse = updatedProjectList.every(
          (item) => !item.is_default
        );
        const filteredProjects = updatedProjectList.filter(
          (project) => project.is_default
        );
        if (areAllDefaultsFalse) {
          setSelectedProject(updatedProjectList[0]);
        } else {
          setSelectedProject(filteredProjects[0]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getAllApplicationList = () => {
    const payload = {
      id: selectedProject?.id,
    };
    getProjectInfo(payload).then((res) => {
      const applicationList = res?.data?.results?.applicationTypes;

      const updatedApplicationList = applicationList.map((item) => {
        return {
          id: item?.id,
          keyword_name: item?.name,
          type: item?.type,
          is_default: item?.is_default,
        };
      });
      setApplicationList(updatedApplicationList);
      const areAllDefaultsFalse = updatedApplicationList.every(
        (item) => !item.is_default
      );
      const filteredProjects = updatedApplicationList.filter(
        (application) => application.is_default
      );

      if (areAllDefaultsFalse) {
        setSelectedApplication(updatedApplicationList[0]);
      } else {
        setSelectedApplication(filteredProjects[0]);
      }
    });
  };

  useEffect(() => {
    if (selectedProject?.id) {
      getAllApplicationList();
    }
  }, [selectedProject]); // This effect runs when selectedProject changes

  useEffect(() => {
    if (projectList.length > 0 && !selectedProject.id) {
      setSelectedProject(projectList[0]);
    }
  }, [projectList]);

  useEffect(() => {
    getAllprojectList();
  }, []);

  const handleProjectSelect = (option) => {
    const payload = { withoutPagination: true };
    getProjectsList(payload)
      .then((res) => {
        const projectList = res?.data?.results;
        // Find the project in the projectList that matches the id in option
        const selectedProject = projectList.find(
          (project) => project?.id === option?.id
        );
        if (selectedProject) {
          // Create the payload object
          const payload = {
            project_id: option.id,
            application_type_id: selectedProject.applications[0]?.id, // Assuming you want the first application's id
          };
          setDefaultProject(payload)
            .then(() => {
              setSelectedProject(option);
            })
            .catch(() => {
              toast.error("Unable to fetch the data");
            });
        }
      })
      .catch(() => {
        toast.error("Unable to fetch the data");
      });
      clearSearchField()
  };

  const handleApplicationSelect = (option) => {
    if (selectedProject?.id) {
      // Create the payload object
      const payload = {
        project_id: selectedProject?.id,
        application_type_id: option?.id, // Assuming you want the first application's id
      };
      setDefaultProject(payload)
        .then(() => {
          setSelectedApplication(option);
        })
        .catch(() => {
          toast.error("Unable to fetch the data");
        });
    }
  };

  return (
    <div>
      <div className="md:flex items-center gap-4">
        <SearchDropdown
          option={projectList}
          placeHolder="Choose Project"
          label={"Project"}
          className={`h-10 w-[276px] bg-iwhite`}
          hideCross={true}
          isEditable={true}
          selectedOption={selectedProject}
          onSelect={handleProjectSelect}
        />

        <SearchDropdown
          option={applicationList}
          placeHolder="Choose Application"
          label={"Application"}
          className={`h-10 w-[276px] bg-iwhite`}
          hideCross={true}
          iconForApplication={true}
          isEditable={true}
          selectedOption={selectedApplication}
          onSelect={handleApplicationSelect}
        />
      </div>
    </div>
  );
};

export default RunsSwitcherSection;
