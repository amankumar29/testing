import create from "zustand";

const useRunsSwitcherStore = create((set) => ({
  projectList: [],
  applicationList: [],
  selectedProject: {},
  selectedApplication: {},
  setProjectList: (projectList) => set({ projectList }),
  setApplicationList: (applicationList) => set({ applicationList }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setSelectedApplication: (selectedApplication) => set({ selectedApplication }),
}));

export default useRunsSwitcherStore;
