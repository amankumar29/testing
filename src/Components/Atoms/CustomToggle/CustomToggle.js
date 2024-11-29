import React, { useState } from "react";
import "./CustomToggle.style.scss";

const CustomToggle = ({ initialState = false, onToggle }) => {
  const [isOn, setIsOn] = useState(initialState);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) {
      onToggle(newState); // Notify parent component of state change
    }
  };

  return (
    <div
      className={`toggle-switch ${isOn ? "on" : "off"}`}
      onClick={handleToggle}
    >
      <div className="toggle-handle"></div>
    </div>
  );
};

export default CustomToggle;
