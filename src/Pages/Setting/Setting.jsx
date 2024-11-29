import { Outlet } from "react-router-dom";
import SettingMenu from "./SettingMenu/SettingMenu";

const Setting = () => {
  return (
    <div className="">
      <div className="mb-4 text-xl font-medium">Settings</div>
      <div className="md:flex gap-6">
        <div>
          <SettingMenu />
        </div>
        <div className="w-full xlMax:overflow-x-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Setting;
