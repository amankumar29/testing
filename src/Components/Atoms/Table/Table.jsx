import nodataimg from "Assets/Images/nodatafound.svg";
import PropTypes from "prop-types";
import { Checkbox } from "../Checkbox/Checkbox";
import styles from "./Table.module.scss";
import CircularProgress from "@mui/material/CircularProgress";
import { Tooltip } from "react-tooltip";

const Table = ({
  data,
  columns,
  checkbox,
  isLoading,
  handleSelectAllCheckboxes = () => {},
  handleCheckboxChange = () => {},
  selectAll,
  checkedItems,
  onRowClick = () => {},
  onRowClickPointer = false,
  isDisableCheckbox = false,
}) => {
  return (
    <>
      <table className="w-full h-auto border-collapse border-spacing-y-1">
        <thead className="h-[50px] bg-ibl1 text-iwhite">
          <tr className="h-[55px]">
            {columns?.map((item, index) => (
              <th
                data-testid={`column_name_${index}`}
                key={index}
                className={`${item?.tHeadClass} ${
                  index == 0 && "rounded-l-[2px]"
                } ${index == columns?.length - 1 && "rounded-r-[2px]"}`}
              >
                <div
                  data-tooltip-id="selectall"
                  data-tooltip-content={
                    selectAll ? "Deselect All" : "Select All"
                  }
                >
                  {index === 0 && checkbox && (
                    <div className="relative">
                      <Checkbox
                        id={`checkbox_${index}`}
                        checked={selectAll}
                        disable={
                          data?.length === 0 ||
                          data?.every((row) => row?.noOfSteps === 0) ||
                          data?.every((row) => row?.testSteps?.length === 0)
                        } // Disable checkbox when no data
                        className={`cursor-pointer ${
                          data?.length === 0 ||
                          data?.every((row) => row?.noOfSteps === 0) ||
                          data?.every((row) => row?.testSteps?.length === 0)
                            ? "!cursor-default opacity-80"
                            : ""
                        }`}
                        onChange={handleSelectAllCheckboxes}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {data?.length > 0 && (
                        <Tooltip
                          id="selectall"
                          place="bottom"
                          noArrow
                          className="!text-[11px] h-[28px] flex justify-center items-center mt-3 !left-0 !top-[10px]"
                        />
                      )}
                    </div>
                  )}
                </div>

                <span
                  className="text-base font-medium text-nowrap"
                  data-testid={`label_${item?.label}`}
                >
                  {item?.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        {isLoading ? (
          <tbody className="h-[400px] relative">
            <div className={styles.spinnerContainer} data-testid={`spinner`}>
              <CircularProgress />
            </div>
          </tbody>
        ) : (
          <tbody>
            {/* <tr className="w-full h-1" /> */}
            {data?.length > 0 &&
              data?.map((row, rowIndex) => (
                <tr
                  data-testid={`row_name_${rowIndex}`}
                  key={rowIndex}
                  className={`p-5 bg-iwhite h-[55px] rounded-[2px] hover:bg-ibl12 ${
                    styles.tablerow
                  } ${
                    onRowClickPointer ? "cursor-pointer" : "cursor-default"
                  } `}
                  onClick={() => onRowClick(row)}
                >
                  {columns?.map((item, colIndex) => {
                    return (
                      <td
                        data-testid={`row_${rowIndex} col_${colIndex} `}
                        key={colIndex}
                        className={`${item?.tHeadClass} ${item?.tbodyClass} ${
                          colIndex == 0 && "rounded-l-[2px]"
                        } ${
                          colIndex == columns?.length - 1 && "rounded-r-[2px]"
                        } relative`}
                      >
                        {colIndex === 0 && checkbox && (
                          <Checkbox
                            disable={
                              (isDisableCheckbox && row?.total_suites == 0) ||
                              (isDisableCheckbox && row?.totalTestCases == 0) ||
                              (isDisableCheckbox &&
                                row?.testSteps?.length == 0) ||
                              row?.noOfSteps === 0 ||
                              row?.testCases?.length === 0 || 
                              row?.status === 'OBSOLETE' ||
                              row.status === 'BLOCKED' 
                                ? true
                                : false
                            }
                            id={`checkbox_${colIndex}`}
                            checked={
                              (checkedItems && checkedItems[row?._id]) || false
                            }
                            onChange={handleCheckboxChange(row?._id, row)}
                            isHeaderCheck={checkedItems}
                            className="cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        {item.cell ? (
                          <>{item?.cell(row, rowIndex)}</>
                        ) : (
                          <div
                            key={colIndex}
                            className={`text-center`}
                            data-testid={`column_${row[item?.column]}`}
                          >
                            {row[item?.column]}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        )}
        <tfoot></tfoot>
      </table>
      {!isLoading && data?.length === 0 && (
        <div className="flex flex-col items-center justify-center">
          <div className="mt-[164px]">
            <img
              data-testid="no_data_Image"
              src={nodataimg}
              alt="no data image"
              className="w-[177px] h-[128px]"
            />
            <div
              className="text-[23px] text-ibl3 font-semibold text-center mt-3"
              data-testid="no_data_Message"
            >
              No Data Found
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Table;

Table.propTypes = {
  data: PropTypes.any,
  columns: PropTypes.any,
  checkbox: PropTypes.bool,
  isLoading: PropTypes.bool,
  handleSelectAllCheckboxes: PropTypes.func,
  handleCheckboxChange: PropTypes.func,
  selectAll: PropTypes.any,
  checkedItems: PropTypes.any,
};
