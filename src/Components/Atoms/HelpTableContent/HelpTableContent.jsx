import MenuIcon from '@mui/icons-material/Menu';
import styles from "../../../Pages/Help/Help.module.scss"

const HelpTableContent = ({ selectedTopic, getWebTableOfContents }) => {
  const tableOfContents = getWebTableOfContents(selectedTopic);

  const scrollIntoSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={`lg:w-[240px] p-4 right-[20px] top-[100px] h-auto flex-shrink-0 rounded-lg bg-iwhite ${styles.stepsContainer}`}>
      <div className="flex flex-row items-center">
        <div className="mr-2 text-center"><MenuIcon /></div>
        <div className="text-[18px] font-medium mb-4 text-center pt-4">Contents</div>
      </div>
      <ul className="mt-2 space-y-3 pl-6">
        {tableOfContents && tableOfContents.map((section) => (
          <li
            key={section.id}
            className="cursor-pointer hover:text-blue-500 hover:underline"
            onClick={() => scrollIntoSection(section.id)}
          >
            {section.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HelpTableContent;