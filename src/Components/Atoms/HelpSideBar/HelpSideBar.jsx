import HelpAccordion from "../HelpAccordion/HelpAccordion";
import styles from "../../../Pages/Help/Help.module.scss"

const HelpSideBar = ({ webTestTopics, integrationTopics, selectedTopic, setSelectedTopic ,  isOpen , setIsOpen }) => {
  return (
    <div className={`lg:w-[290px] p-8 flex-shrink-0 h-auto top-[100px] rounded-lg bg-iwhite lgMax:mb-5 tableScroll ${styles.stepsContainer} overflow-auto`}>
      <HelpAccordion
        accordionName="Web Tests"
        topics={webTestTopics}
        setSelectedTopic={setSelectedTopic}
        selectedTopic={selectedTopic}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <HelpAccordion
        accordionName="Mobile Tests"
        topics={webTestTopics}
        setSelectedTopic={setSelectedTopic}
        selectedTopic={selectedTopic}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <HelpAccordion
        accordionName="Advanced"
        topics={webTestTopics}
        setSelectedTopic={setSelectedTopic}
        selectedTopic={selectedTopic}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <HelpAccordion
        accordionName="Integrations"
        topics={integrationTopics}
        setSelectedTopic={setSelectedTopic}
        selectedTopic={selectedTopic}
         isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </div>
  );
};

export default HelpSideBar;