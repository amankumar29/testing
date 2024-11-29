import webicon from "Assets/Images/web-20.svg";
import android from "Assets/Images/Android-20.svg";
import ios from "Assets/Images/iOS-20.svg";
import rest from "Assets/Images/API-20.svg";
import DropDownList from "../DropdownList/DropdownList";

const DropDown = () => {
  const options = [
    { name: "Web", img: webicon },
    { name: "Android", img: android },
    { name: "ios", img: ios },
    { name: "REST API", img: rest },
  ];
  return <DropDownList label="APPLICATION TYPE" list={options} />;
};

export default DropDown;
