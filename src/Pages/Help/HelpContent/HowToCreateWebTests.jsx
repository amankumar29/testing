import projectNameDescription from "Assets/Images/anp_project_name_description.png"
import addNewButton from "Assets/Images/anp_button.png"
import applicationType from "Assets/Images/anp_application_type.png"
import createButton from "Assets/Images/anp_create_button.png"
const HowToCreateWebTests = () => {
  return (
    <div className="overflow-y-scroll">
      <div className="text-[25px] md:text-[35px] font-medium mt-2">
        How to create Web Tests
      </div>
      <div id="introduction">
        <div className="text-[25px] font-medium mt-4 md:mt-8  mb-[16px]">
          Introduction
        </div>
        <p className="text-[16px]">
        iLTAF is the fastest way to resilient end-to-end tests, your way—in
          code, codeless, or both. It also offers enhanced security, extensive
          test lab, project and review management, powerful reporting
          capabilities, and much more.
        </p>
      </div>
      <div className="w-full border-t text-[#D6E2FF] my-4"></div>
      <div id="manage-projects">
        <div className="text-[25px] font-medium text-[#183247] mb-4">
          Manage Projects
        </div>
        <p className="text-[16px] mb-4">
        iLTAF offers the ability to create multiple projects and
          applications, allowing for logical separation between them. Each
          Project comprises different types of applications, similar to a
          real-life Project.
        </p>
        <p className="text-[16px] mb-4">
          This document will walk you through creating, editing, switching, and
          deleting projects in iLTAF.
        </p>
      </div>
      <div id="create-project">
        <div className="text-[20px] font-medium my-4">Create a Project</div>
        <ol className="space-y-4">
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">1.</div>
            <div className="ml-4">
              Navigate to <strong>Projects</strong> Section and click on{" "}
              <strong>Add New Project</strong> button.
            </div>
          </li>
          <img className="rounded-xl" src={addNewButton} />
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">2.</div>
            <div className="ml-4">
              Enter <strong>Project Name</strong> and{" "}
              <strong>Description</strong> (Optional).
            </div>
          </li>
          <img
            className="rounded-xl"
            src={projectNameDescription}
          />
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">3.</div>
            <div className="ml-4">
              If your project involves multiple applications, set the{" "}
              <strong>Are you planning to create multiple applications?</strong>{" "}
              toggle to <strong>Yes</strong>. To add an application, click{" "}
              <strong>Add New Application</strong>, select the{" "}
              <strong>Application Type</strong> from the drop-down menu, and
              give it a <strong>Name</strong>. By default, the project is set up
              for a single application.
            </div>
          </li>
          <img className="rounded-xl" src={applicationType} />
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">4.</div>
            <div className="ml-4">
              Click on the <strong>Create</strong> button.
            </div>
          </li>
          <img className="rounded-xl" src={createButton} />
        </ol>
      </div>
      <div id="edit-project">
        <div className="w-full border-t text-ibl7 my-6"></div>
        <div className="text-[20px] font-medium my-4">Edit a Project</div>
        <ol className="space-y-4">
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">1.</div>
            <div className="ml-4">
              Navigate to <strong>Projects</strong> Section and click on{" "}
              <strong>Add New Project</strong> button.
            </div>
          </li>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">2.</div>
            <div className="ml-4">
              Enter <strong>Project Name</strong> and{" "}
              <strong>Description</strong> (Optional).
            </div>
          </li>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">3.</div>
            <div className="ml-4">
              If your project involves multiple applications, set the{" "}
              <strong>Are you planning to create multiple applications?</strong>{" "}
              toggle to <strong>Yes</strong>. To add an application, click{" "}
              <strong>Add New Application</strong>, select the{" "}
              <strong>Application Type</strong> from the drop-down menu, and
              give it a <strong>Name</strong>. By default, the project is set up
              for a single application.
            </div>
          </li>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">4.</div>
            <div className="ml-4">
              Click on the <strong>Create</strong> button.
            </div>
          </li>
        </ol>
      </div>
      <div id="delete-project">
        <div className="w-full border-t text-ibl7 my-6"></div>
        <div className="text-[20px] font-medium my-4">Delete a Project</div>
        <ol className="space-y-4">
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">1.</div>
            <div className="ml-4">
              Navigate to <strong>Projects</strong> Section and click on{" "}
              <strong>Add New Project</strong> button.
            </div>
          </li>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">2.</div>
            <div className="ml-4">
              Enter <strong>Project Name</strong> and{" "}
              <strong>Description</strong> (Optional).
            </div>
          </li>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">3.</div>
            <div className="ml-4">
              If your project involves multiple applications, set the{" "}
              <strong>Are you planning to create multiple applications?</strong>{" "}
              toggle to <strong>Yes</strong>. To add an application, click{" "}
              <strong>Add New Application</strong>, select the{" "}
              <strong>Application Type</strong> from the drop-down menu, and
              give it a <strong>Name</strong>. By default, the project is set up
              for a single application.
            </div>
          </li>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">4.</div>
            <div className="ml-4">
              Click on the <strong>Create</strong> button.
            </div>
          </li>
        </ol>   
        <div className="mb-8"></div>  
      </div>
    </div>
  );
};

export default HowToCreateWebTests;
