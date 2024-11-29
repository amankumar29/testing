import React, { useState } from "react";
import RadioButtons from "Components/Atoms/RadioButtons/RadioButtons";
import { MultiStepperRows } from "Components/Atoms/MultiStepperRows/MultiStepperRows";
import JsonEditorPane from "Components/Atoms/JsonEditorPane/JsonEditorPane";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";

const Body = ({
  params,
  setParams = () => {},
  selectedOptionValue,
  setFormParam = () => {},
  formParam,
  json,
  setJson = () => {},
  selectedOption,
  setSelectedOption = () => {},
}) => {
  const [error, setError] = useState(null);

  const handleNone = (val) => {
    setSelectedOption(val);
  };

  // Callback to handle params changes
  const handleParamsChange = (updatedParams) => {
    setParams(updatedParams);
  };

  const handleFormParamChange = (newParamsData) => {
    setFormParam(newParamsData);
  };

  const beautifyJson = () => {
    try {
      const parsedJson = JSON.parse(json);
      const beautifiedJson = JSON.stringify(parsedJson, null, 2);
      setJson(beautifiedJson);
      setError(null); // Clear any errors
    } catch (e) {
      setError("Invalid JSON format. Please fix errors before beautifying.");
    }
  };

  return (
    <div className="p-4 pt-0">
      <div className="flex justify-between items-center mb-3 min-h-[40px]">
        <div className="flex gap-4">
          <RadioButtons
            id="none"
            value="none"
            className="text-sm font-normal leading-[22px] text-iblack"
            onClick={() => handleNone("none")}
            checked={selectedOption === "none"}
          />
          <RadioButtons
            id="form-data"
            value="form-data"
            className="text-sm font-normal leading-[22px] text-iblack"
            onClick={() => handleNone("form-data")}
            checked={selectedOption === "form-data"}
          />
          <RadioButtons
            id="url-encoded"
            value="x-www-form-urlencoded"
            className="text-sm font-normal leading-[22px] text-iblack"
            onClick={() => handleNone("url-encoded")}
            checked={selectedOption === "url-encoded"}
          />
          <RadioButtons
            id="raw"
            value="raw"
            className="text-sm font-normal leading-[22px] text-iblack"
            onClick={() => handleNone("raw")}
            checked={selectedOption === "raw"}
          />
        </div>
        {selectedOption === "raw" && (
          <div>
            <CustomButton
              label="Beautify"
              onClick={beautifyJson}
              className="bg-ign6 hover:!bg-ign7 w-[99px]  text-[14px]"
            ></CustomButton>
          </div>
        )}
      </div>
      <div>
        {selectedOption === "none" && (
          <>
            <div className="h-[432px] flex justify-center items-center text-md font-normal leading-[18px] text-igy16">
              This request does not have a body
            </div>
          </>
        )}
        {selectedOption === "form-data" && (
          <div className="h-[432px]">
            <MultiStepperRows
              label={selectedOption}
              params={formParam}
              setParams={setFormParam}
              onParamsChange={handleFormParamChange}
              selectedOptionValue={selectedOptionValue}
            />
          </div>
        )}
        {selectedOption === "url-encoded" && (
          <div className="h-[432px]">
            <MultiStepperRows
              params={params}
              setParams={setParams}
              onParamsChange={handleParamsChange}
            />
          </div>
        )}
      </div>
      <div className="flex justify-center items-center">
        {selectedOption === "raw" && (
          <>
            <JsonEditorPane
              json={json}
              setJson={setJson}
              error={error}
              setError={setError}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Body;
