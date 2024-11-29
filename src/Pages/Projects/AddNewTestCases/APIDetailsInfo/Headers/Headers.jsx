import { MultiStepperRows } from "Components/Atoms/MultiStepperRows/MultiStepperRows";

export const Headers =({params,setParams,paramCount,setParamCount, headerStep, setHeaderStep})=>{
    return (<div className="p-4 pt-2 h-[500px]">
        <MultiStepperRows params={params} setParams={setParams} paramCount={paramCount} setParamCount={setParamCount} headerStep={headerStep} setHeaderStep={setHeaderStep}/>
    </div>)
}