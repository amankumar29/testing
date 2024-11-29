import automateButton from "Assets/Images/browser_stack_automate_button.png"
import accessKey from "Assets/Images/browser_stack_access_key.png"

const BrowserStack = () => {
  return (
    <div className="overflow-y-auto">
      <div className="text-[35px] font-medium mt-2">Browser Stack</div>
      <div id="steps">
        <div className="text-[25px] font-medium mt-8 mb-4">
          Steps to Execute Mobile Tests on Real Devices from BrowserStack
        </div>
        <ol className="space-y-4">
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right flex items-center">
              1.
            </div>
            <div className="text-[20px] font-medium">
              Access Your BrowserStack Account
            </div>
          </li>
          <ul className="list-disc list inside ml-12 space-y-2">
            <li>
              If you don’t have an account,{" "}
              <a
              target="blank"
                href="https://www.browserstack.com/"
                className="text-ibl3 hover:underline"
              >
                Sign Up for a Free Trial
              </a>
              .
            </li>
          </ul>
          <div className="w-full border-t text-[#D6E2FF] my-4"></div>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right flex items-center">
              2.
            </div>
            <div className="text-[20px] font-medium">
              Navigate to App Automate
            </div>
          </li>
          <ul className="list-disc list inside ml-12 space-y-2">
            <li>
              Go to the <strong>Products</strong> section on BrowserStack.
            </li>
            <li>
              Click on <strong>App Automate.</strong>
            </li>
          </ul>
          <img
            className="rounded-xl"
            src={automateButton}
          />
          <div className="w-full border-t text-[#D6E2FF] my-4"></div>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right flex items-center">
              3.
            </div>
            <div className="text-[20px] font-medium">
              Retrieve Your Access Credentials
            </div>
          </li>
          <ul className="list-disc list inside ml-12 space-y-2">
            <li>Hover over the user profile icon and click on Settings.</li>
            <li>
              Locate the <strong>Local Testing</strong> section to find your{" "}
              <strong>Username</strong> and <strong>Access Key</strong>.
            </li>
          </ul>
          <img
            className="rounded-xl"
            src={accessKey}
          />
          <div className="w-full border-t text-[#D6E2FF] my-4"></div>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right flex items-center">
              4.
            </div>
            <div className="text-[20px] font-medium">Configure iLTAF</div>
          </li>
          <ul className="list-disc list inside ml-12 space-y-2">
            <li>Log in to your iLTAF account.</li>
            <li>
              Go to the <strong>Settings</strong> page.
            </li>
            <li>
              Click on the <strong>Integrations</strong> tab.
            </li>
          </ul>
          <div className="w-full border-t text-[#D6E2FF] my-4"></div>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right flex items-center">
              5.
            </div>
            <div className="text-[20px] font-medium">
              Add BrowserStack Credentials
            </div>
          </li>
          <ul className="list-disc list inside ml-12 space-y-2">
            <li>
              Enter the <strong>Username and Access Key</strong> from
              BrowserStack App Automate.
            </li>
          </ul>
          <div className="w-full border-t text-[#D6E2FF] my-4"></div>
          <li className="flex">
            <div className="w-[25px] flex-shrink-0 text-right flex items-center">
              6.
            </div>
            <div className="text-[20px] font-medium">
              Save the Configuration
            </div>
          </li>
          <ul className="list-disc list inside ml-12 space-y-2">
            <li>
              Click on the <strong>Save</strong> button to apply the changes.
            </li>
          </ul>
        </ol>
        <div className="mb-8"></div>
      </div>
    </div>
  );
};

export default BrowserStack;
