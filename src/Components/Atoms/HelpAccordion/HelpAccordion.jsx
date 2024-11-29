import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

const HelpAccordion = ({ accordionName, topics, setSelectedTopic, selectedTopic }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <div
        className="flex justify-between items-center cursor-pointer p-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-[18px] font-medium py-2">{accordionName}</div>
        <span className={`cursor-pointer transition-transform duration-300 text-[18px] text-[#052C85] ${isOpen ? 'rotate-0':'-rotate-90'}`}>{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </div>
      {isOpen && (
        <div className="w-[247px] mx-auto max-w-xs">
        <ul className="mt-2 space-y-2">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className={`cursor-pointer py-2 px-4 focus:outline-none rounded-md ${
                selectedTopic === topic.id ? "bg-ibl7 font-medium" : "hover:transition-all hover:duration-300 hover:ease-in-out hover:bg-ibl12"
              }`}
              onClick={() => setSelectedTopic(topic.id)}
            >
              {topic.label}
            </li>
          ))}
        </ul>
        </div>
      )}
    </div>
  );
};

export default HelpAccordion;