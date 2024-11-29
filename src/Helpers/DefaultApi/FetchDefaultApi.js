import { toast } from "react-toastify";

export const fetchDefaultData = async (
  setDefault,
  defaultApplication,
  getuserDetails
) => {
  const projectId = defaultApplication?.projectId;
  const applicationId = defaultApplication?.id;

  if (projectId && applicationId) {
    const payload = {
      applicationId,
      projectId,
    };
    try {
      const data = await setDefault(payload).unwrap();
      if (data?.message === "Application updated successfully") {
        try{
          getuserDetails();
        }catch(err){
          console.log(err,'Error In Userdetails API');
          toast.error("Error In Userdetails API");
        }
        // toast.success("Default project and application set successfully");
      }
    } catch (error) {
      toast.error("Failed to switch application");
    }
  } else {
    console.warn("Project ID or Application ID is missing.");
    toast.error('Project ID or Application ID is missing.')
  }
};
