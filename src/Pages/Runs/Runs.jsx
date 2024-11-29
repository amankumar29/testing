import { useLocation } from "react-router-dom";
import RunsTabs from "../../Components/Atoms/RunsTabs/RunsTabs";
import RunsSwitcherSection from "./RunsSwitcherSection/RunsSwitcherSection";
import RunTestCases from "./RunsTestCase/RunsTestCase";
import SearchInput from "../../Components/Atoms/SearchInput/SearchInput";
import { useState, useEffect, useRef } from "react";
import RunsTestSuites from "./RunsTestSuites/RunsTestSuites";
import RunsTestPlans from "./RunsTestPlans/RunsTestPlans";
// import { MdOutlineFilterAlt } from "react-icons/md";                        // this is for feature reference i need
// import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";

import { useOutsideClick } from "Hooks/useOutSideClick";
import SelectDropdown from "../../Components/Atoms/SelectDropdown/SelectDropdown";
import { DateRangeModal } from "../../Components/Molecules/DateRangeModal/DateRangeModal";
import Switcher from "Components/Molecules/Switcher/Switcher";

const Runs = () => {
  const [searchValue, setSearchValue] = useState({
    value: "",
    error: null,
  });
  const [isBackProjectData, setIsBackProjectData] = useState({});
  const [isBackApplicationData, setIsBackApplicationData] = useState({});
  const [newSearchValue, setNewSearchValue] = useState("");
  const [activePath, setActivePath] = useState("");
  const [dropdown, setDropDown] = useState(false);
  const [searchSubmit, setSearchSubmit] = useState("");
  const [ItemDeleted, setItemDeleted] = useState("");
  const [removeSearchValue, setRemoveSearchValue] = useState("");
  const [rowId, setRowId] = useState([]);
  const dropdownRef = useRef(false);
  const location = useLocation();

  const projectList = [
    { id: 1, name: "Today" },
    { id: 2, name: "Yesterday" },
    { id: 3, name: "Last 7 Days" },
    { id: 4, name: "Last Month" },
    { id: 5, name: "Custom" },
  ];

  // State to manage the selected option
  const [selectedOption, setSelectedOption] = useState(null);
  const [closeDateRange, setCloseDateRange] = useState(false);
  const [customDate, setCustomDate] = useState(false);
  const [todayDate, setTodayDate] = useState(false);
  const [yesterDayDate, setYesterDayDate] = useState(false);
  const [lastWeekDate, setLastWeekDate] = useState(false);
  const [lastMonthDate, setLastMonthDate] = useState(false);
  const [resetRunTestCasesCheckBoxes, setResetRunTestCasesCheckBoxes] =
    useState(false);
  const [dateRangeValue, setDateRangeValue] = useState([]);
  const [isReClick, setIsReClick] = useState(false);
  const [removeDatePikerValue, setRemoveDatePikerValue] = useState(false);
  const [clearCheckBoxes, setClearCheckBoxes] = useState(false);

  const startDate = dateRangeValue ? dateRangeValue[0]?.toISOString() : null;
  const endDate = dateRangeValue ? dateRangeValue[1]?.toISOString() : null;

  useEffect(() => {
    const Path = location?.pathname?.split("/")?.[2];
    setActivePath(Path);
  }, [location]);

  useEffect(() => {
    // Assuming dateRangeValue is an array where the first element is startDate and the second element is endDate
    if (dateRangeValue?.length === 2) {
      const startDate = dateRangeValue[0];
      let endDate = dateRangeValue[1];

      // Check if endDate is showing an extra day, correct it by subtracting one day
      if (endDate > startDate) {
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setDate(adjustedEndDate.getDate() - 1);

        setCloseDateRange(false);
        setSelectedOption({
          id: 6,
          name: `${
            selectedOption?.name === "Today"
              ? "Today"
              : selectedOption?.name === "Yesterday"
              ? "Yesterday"
              : `${formatDate(startDate)} - ${formatDate(adjustedEndDate)}`
          }`,
        });
      }
    }
  }, [dateRangeValue]);

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const handleSearch = (value) => {
    const searchValueString = value?.trim();
    setNewSearchValue((prevPayload) => ({
      ...prevPayload,
      searchKey: searchValueString,
    }));
    handleSearchSubmit(searchValueString);
  };

  const handleSearchSubmit = (val) => {
    setSearchSubmit(val);
  };

  const handleOption = (option) => {
    setSelectedOption(option);
    if (option?.name === "Today") {
      const today = new Date();
      const startOfDay = new Date(today.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setUTCHours(23, 59, 59, 999));
      setDateRangeValue([startOfDay, endOfDay]);
      setCustomDate(false);
      setTodayDate(true);
    } else if (option?.name === "Yesterday") {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const startOfYesterday = new Date(yesterday.setUTCHours(0, 0, 0, 0)); // Start of yesterday
      const endOfYesterday = new Date(yesterday.setUTCHours(23, 59, 59, 999)); // End of yesterday
      setDateRangeValue([startOfYesterday, endOfYesterday]);
      setCustomDate(false);
      setTodayDate(false);
      setYesterDayDate(true);
    } else if (option?.name === "Last 7 Days") {
      const today = new Date();
      const lastWeekStartDate = new Date(today);
      lastWeekStartDate.setDate(today.getDate() - 7); // Start of last week
      const startOfLastWeek = new Date(
        lastWeekStartDate.setUTCHours(0, 0, 0, 0)
      ); // Start time

      const lastWeekEndDate = new Date(lastWeekStartDate);
      lastWeekEndDate.setDate(lastWeekStartDate.getDate() + 6); // End of last week
      const endOfLastWeek = new Date(
        lastWeekEndDate.setUTCHours(23, 59, 59, 999)
      ); // End time

      setDateRangeValue([startOfLastWeek, endOfLastWeek]);
      setCustomDate(false);
      setTodayDate(false);
      setYesterDayDate(false);
      setLastWeekDate(true);
    } else if (option?.name === "Last Month") {
      // this is for feature reference i need that's why i am commanting.

      //   const today = new Date();
      //   const startOfCurrentMonth = new Date(
      //     today.getFullYear(),
      //     today.getMonth(),
      //     1
      //   );
      //   const endOfLastMonth = new Date(startOfCurrentMonth - 1); // Last day of the previous month
      //   // First day of the last month
      // const startOfLastMonth = new Date(endOfLastMonth.getFullYear(), endOfLastMonth.getMonth(), 1);

      // console.log(startOfLastMonth);

      // const startOfLastMonthTime = new Date(startOfLastMonth.setUTCHours(0, 0, 0, 0)); // Start time
      // const endOfLastMonthTime = new Date(endOfLastMonth.setUTCHours(23, 59, 59, 999)); // End time

      //   setDateRangeValue([startOfLastMonthTime, endOfLastMonthTime]);
      //   setCustomDate(false);
      //   setTodayDate(false);
      //   setYesterDayDate(false);
      //   setLastWeekDate(false);
      //   setLastMonthDate(true);

      const today = new Date();
      const startOfCurrentMonth = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
      );
      const endOfLastMonth = new Date(startOfCurrentMonth);
      endOfLastMonth.setUTCDate(0);
      endOfLastMonth.setUTCHours(23, 59, 59, 999);
      const startOfLastMonth = new Date(
        Date.UTC(
          endOfLastMonth.getUTCFullYear(),
          endOfLastMonth.getUTCMonth(),
          1
        )
      );
      setDateRangeValue([startOfLastMonth, endOfLastMonth]);
      setCustomDate(false);
      setTodayDate(false);
      setYesterDayDate(false);
      setLastWeekDate(false);
      setLastMonthDate(true);
    } else if (option?.name === "Custom") {
      handleOpenDateRange();
      setCustomDate(true);
    } else {
      setTodayDate(false);
      setYesterDayDate(false);
      setLastWeekDate(false);
      setLastMonthDate(false);
    }
    if (option?.name !== "Custom") {
      setIsReClick(!isReClick);
    }
  };

  const handleDropDownShow = () => {
    setDropDown(!dropdown);
  };

  useOutsideClick(dropdownRef, () => {
    if (dropdown) {
      setDropDown(false);
    }
  });

  const handleItemDeleted = (id) => {
    setItemDeleted(id);
  };

  useEffect(() => {
    setNewSearchValue({ value: "", error: null });
    setSearchValue({ value: "", error: null });
    setSelectedOption(null);
    fetchRunTestCasesData();
  }, [ItemDeleted, removeSearchValue, removeDatePikerValue]);

  const clearSearchValue = (value) => {
    setRemoveSearchValue(value);
  };

  const handleRowIdUpdate = (rowId) => {
    const trueIDs = Object.keys(rowId)
      .filter((key) => rowId[key])
      .map(Number);
    setRowId(trueIDs);
  };

  const handleCloseDateRange = (startDate, endDate) => {
    fetchRunTestCasesData();
    setCloseDateRange(false);
    setSelectedOption(null);
    if (startDate && endDate) {
      // Convert startDate and endDate to UTC
      const startDateUTC = new Date(startDate.setUTCHours(0, 0, 0, 0));
      const endDateUTC = new Date(endDate.setUTCHours(23, 59, 59, 999));
      setDateRangeValue([startDateUTC, endDateUTC]);
      setIsReClick(!isReClick);
    }
  };

  const handleOpenDateRange = () => {
    setCloseDateRange(!closeDateRange);
  };

  const fetchRunTestCasesData = () => {
    setDateRangeValue([]);
    setCustomDate(false);
    setTodayDate(false);
    setYesterDayDate(false);
    setLastWeekDate(false);
    setLastMonthDate(false);
    setClearCheckBoxes(!clearCheckBoxes);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        fetchRunTestCasesData();
        setSelectedOption(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const clearDatePicker = () => {
    setRemoveDatePikerValue(!removeDatePikerValue);
  };

  const clearSearchField = () => {
    setNewSearchValue({ value: "", error: null });
    setSearchValue({ value: "", error: null });
  };

  const noEmojiValidation = (value) => {
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    return emojiRegex.test(value);
  };

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    if (value === " " && value?.length === 1) {
      setSearchValue({ value: "", error: null });
    } else if (noEmojiValidation(value)) {
      setSearchValue({ value, error: "Emojis are not allowed." });
    } else {
      setSearchValue({ value: e?.target?.value });
      handleSearch(value);
    }
  };

  return (
    <div>
      <div className="items-end justify-between lg:flex input-half">
        <Switcher shouldSetCookies={true} setSearchValue={setSearchValue}/>
        <div className="w-full  md:w-[296px] h-[40px] right">
          <SearchInput
            placeHolder="Search"
            maxLength={255}
            onChange={handleInputChange}
            value={searchValue.value}
            error={searchValue.error}
          />
        </div>
      </div>
      <div
        className="flex items-end justify-between mt-4 mdMax:flex-col test-case-tab"
        ref={dropdownRef}
      >
        <RunsTabs
          clearSearchValue={clearSearchValue}
          clearDatePicker={clearDatePicker}
        />
        <div className="flex items-center justify-between mdMax:w-full">
          {/* 
            // this is for feature reference i need
            <CustomTooltip
            title="Filter"
            placement="bottom"
            height={"28px"}
            fontSize="11px"
          >
            <div
              className="w-10 h-10 rounded-[8px] border border-ibl1 flex items-center justify-center hover:!bg-ibl25 mt-1 cursor-pointer"
              data-testid="filter_Icon"
            >
              <MdOutlineFilterAlt className="w-6 h-6 text-ibl1" />
            </div>
          </CustomTooltip> */}

          <SelectDropdown
            id={"selectOptions"}
            options={projectList}
            placeHolder={"Select Date Range"}
            value={selectedOption}
            onChange={(option) => handleOption(option)}
            className={"w-full md:w-[296px] h-[40px] bg-iwhite"}
            inputClassName={"text-sm"}
            clearSelectionCallback={fetchRunTestCasesData}
            dateRange={true}
          />

          <div>
            <DateRangeModal
              isOpen={closeDateRange}
              onClose={handleCloseDateRange}
            />
          </div>
        </div>
      </div>
      {activePath === "test-case" && (
        <>
          <div>
            <RunTestCases
              searchKey={newSearchValue}
              onProjectSelect={isBackProjectData}
              onApplicationSelect={isBackApplicationData}
              handleSearchSubmit={searchSubmit}
              onItemDeleted={handleItemDeleted}
              rowIdUpdate={handleRowIdUpdate}
              startDate={startDate}
              endDate={endDate}
              customDate={customDate}
              todayDate={todayDate}
              yesterDayDate={yesterDayDate}
              lastWeekDate={lastWeekDate}
              lastMonthDate={lastMonthDate}
              isReClick={isReClick}
              clearCheckBoxes={clearCheckBoxes}
              setDropDown={setDropDown}
            />
          </div>
        </>
      )}

      {activePath === "test-suite" && (
        <>
          <div>
            <RunsTestSuites
              searchKey={newSearchValue}
              onProjectSelect={isBackProjectData}
              onApplicationSelect={isBackApplicationData}
              handleSearchSubmit={searchSubmit}
              onItemDeleted={handleItemDeleted}
              startDate={startDate}
              endDate={endDate}
              customDate={customDate}
              todayDate={todayDate}
              yesterDayDate={yesterDayDate}
              lastWeekDate={lastWeekDate}
              lastMonthDate={lastMonthDate}
              isReClick={isReClick}
            />
          </div>
        </>
      )}

      {activePath === "test-scheduler" && (
        <>
          <div>
            <RunsTestPlans
              searchKey={newSearchValue}
              onProjectSelect={isBackProjectData}
              onApplicationSelect={isBackApplicationData}
              handleSearchSubmit={searchSubmit}
              onItemDeleted={handleItemDeleted}
              startDate={startDate}
              endDate={endDate}
              customDate={customDate}
              todayDate={todayDate}
              yesterDayDate={yesterDayDate}
              lastWeekDate={lastWeekDate}
              lastMonthDate={lastMonthDate}
              isReClick={isReClick}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Runs;
