import { useState } from "react";
import PomScreen from "./PomScreen";
import LocatorRepo from "./LocatorRepo";

function PageObjectModel() {
  const [steps, setSteps] = useState(0);
  const [data, setData] = useState(null);
  return (
    <div>
      <div>
        {steps === 0 ? (
          <PomScreen
            navigateTo={(e) => {
              setSteps(1);
              setData(e);
            }}
          />
        ) : (
          <LocatorRepo
            navigateTo={() => {
              setSteps(0);
              setData(null);
            }}
            reqData={data}
          />
        )}
      </div>
    </div>
  );
}
export default PageObjectModel;
