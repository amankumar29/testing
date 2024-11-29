const TestCaseManagement = () => {
  return (
    <div className="overflow-y-scroll">
      <div className="text-[35px] font-medium mt-2">Test Case Management</div>
      <div id="introduction">
        <div className="text-[25px] font-medium mt-8 mb-[16px]">
          Introduction
        </div>
        <p className="text-[16px] mb-4">
          You can associate your existing iLTAF Test Cases with the
          corresponding Test Cases in your Test Case Management (TCM) tool.
          iLTAF does not yet integrate directly with these tools, but there are
          multiple ways to fetch the results and update the entries in your TCM
          tool.
        </p>
        <p className="text-[16px] mb-4">
          This document will walk you through how to integrate with different
          TCM tools in iLTAF.
        </p>
      </div>
      <div className="w-full border-t text-[#D6E2FF] my-4"></div>
      <div id="add-external-ids">
        <div className="text-[20px] font-medium my-4">Add External IDs</div>
        <ol className="space-y-4">
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">1.</div>
            <div className="ml-4">
              Go to your TCM tool (TestRail, Zephyr, XRay, etc)
            </div>
          </li>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">2.</div>
            <div className="ml-4">
              Copy the ID of the Test Case from the TCM tool.
            </div>
          </li>

          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">3.</div>
            <div className="ml-4">Go to your Test Case in Endtest.</div>
          </li>

          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">4.</div>
            <div className="ml-4">
              Click on the Info button from that Test Case.
            </div>
          </li>

          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">5.</div>
            <div className="ml-4">
              Add the copied ID in the External IDs input.
            </div>
          </li>

          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right">6.</div>
            <div className="ml-4">Click on the Save button.</div>
          </li>
        </ol>
        <p className="text-[16px] my-4">
          The Test Case from iLTAF is now associated with the Test Case from
          your TCM tool and the test executions results will now include the
          External IDs.
        </p>
      </div>
      <div id="fetching-the-results">
        <div className="w-full border-t text-ibl7 my-6"></div>
        <div className="text-[20px] font-medium my-4">Fetching the results</div>
        <p className="text-[16px] mb-4">
          <p className="text-[16px] mb-4">
            The test execution results can be obtained through the iLTAF API.
            The response will contain information such as Test Case Name, Test
            Case ID, External ID, and Status.
          </p>
        </p>
      </div>
      <div id="updating-the-test-cases-in-your-tcm-tool">
        <div className="w-full border-t text-ibl7 my-6"></div>
        <div className="text-[20px] font-medium my-4">
          Updating the Test Cases in your TCM tool
        </div>
        <p className="text-[16px] mb-4">
          <p className="text-[16px] mb-4">
            Since iLTAF is not directly integrated with your TCM tool, it
            cannot automatically update the entries in your TCM tool.
          </p>
          <p className="text-[16px] mb-4">
            Those entries can be updated manually or programatically, by using
            the information from the Test Case Management component of the test
            execution results from Endtest.
          </p>
          <p className="text-[16px] mb-4">
            To update them programatically, you would need a use a script or
            orchestration tool that fetches the results from Endtest and
            connects to the API of your TCM tool.
          </p>
        </p>
      </div>
      <div className="mb-8"></div>  
    </div>
  );
};

export default TestCaseManagement;
