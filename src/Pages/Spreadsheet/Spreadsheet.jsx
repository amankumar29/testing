import { HotTable } from "@handsontable/react";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import BulkEncryption from "Components/Molecules/BulkEncryption/BulkEncryption";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useBulkEncryption from "Store/useBulkEncryption";
import { useMediaQuery } from "../../Hooks/useMediaQuery";
// import socket from "../../Services/Socket/socket";
import "./Spreadsheet.styles.scss";
import { useContext } from "react";
import { WebsocketContext } from "Services/Socket/socketProvider";
import { useSelector, useStore } from "react-redux";
import { addSheet, getSpreedsheet, renameSheet, updatesCells } from "Services/API/Spreadsheet/Spreadsheet";

const Spreadsheet = () => {
  const { id, application } = useParams();
  const [spreadsheet, setSpreadsheet] = useState(null);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const hotTableComponent = useRef(null);
  const [editingCells, setEditingCells] = useState([]);
  const isDesktop = useMediaQuery("(min-width: 1616px)");
  const [isRenaming, setIsRenaming] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const [renameIndex, setRenameIndex] = useState(null);
  const inputRef = useRef(null);
  const { isOpen, setShow, setHide } = useBulkEncryption();
  const { socket } = useContext(WebsocketContext)
  const { defaultApplication, userDetails } = useSelector((state) => state?.userDetails);
  const currentStore = useStore()
  const activeSheetIndexRef = useRef()
  const [hotInstanceData,setHotInstanceData]=useState()

  const bulkPayload = {
    spreadSheetId: id,
    sheetIndex: activeSheetIndex,
  };

  const padArray = (arr) => {
    // Determine the maximum length of the sub-arrays
    const maxLength = Math.max(...arr.map((subArray) => subArray.length));

    // Pad each sub-array with null until they all reach maxLength
    return arr.map((subArray) => {
      while (subArray.length < maxLength) {
        subArray.push(null);
      }
      return subArray;
    });
  };

  const handleDoubleClick = (index, name) => {
    setIsRenaming(true);
    setCurrentName(name);
    setRenameIndex(index);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleRename =async (e) => {
    if (e.key === "Enter") {
      if (currentName.trim() === "") {
        toast.error("Sheet name cannot be blank");
        setCurrentName(spreadsheet.sheets[renameIndex].sheetName); // Revert to original name
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, 0); // Keep the input field open and focus on it
      } else if (
        spreadsheet.sheets.some(
          (sheet, i) =>
            sheet.sheetName === currentName.trim() && i !== renameIndex
        )
      ) {
        toast.error("Sheet name already exists");
        setCurrentName(spreadsheet.sheets[renameIndex].sheetName); // Revert to original name
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, 0); // Keep the input field open and focus on it
      } else {
        try {
          const payload = {
            spreadSheetId: id,
            sheetIndex: renameIndex,
            newSheetName: currentName,
          }
          const response = await renameSheet(payload)
          if(response){
            const updatedSheets = spreadsheet.sheets.map((sheet, i) => {
              if (i === renameIndex) {
                return { ...sheet, sheetName: currentName };
              }
              return sheet;
            });
            setSpreadsheet({ ...spreadsheet, sheets: updatedSheets });
            setIsRenaming(false);
            socket.emit('onSpreadsheet',{
              command:"renameSheet",
              organizationId:userDetails?.organizationId,
              applicationId: defaultApplication?.id,
              projectId: defaultApplication?.projectId,
              user:{
                userName:userDetails?.userName,
                userId:userDetails?.userId
              },
              data:{
                spreadsheetId: id,
                sheetIndex: renameIndex,
                newSheetName: currentName,
                newData:response?.results
              }
            })
          }
        } catch (error) {
          setCurrentName(spreadsheet.sheets[renameIndex].sheetName);
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
              inputRef.current.select();
            }
          }, 0);
          toast.error('Error While rename')
        }
      }
    }
  };

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const fetchSpreadsheet = async () => {
      try {
        const response = await getSpreedsheet(id);
        if (response?.data) {
          setSpreadsheet(response?.data);
        } else {
          console.error("Empty response received:", response);
        }
      } catch (error) {
        console.error("Error fetching spreadsheet:", error);
      }
    };

    fetchSpreadsheet();

  }, [id, activeSheetIndex]);

  const handleAfterChange = async(changes, source) => {
    if (!changes || source === "external") return;

    // const updates = changes.map(([row, col, oldValue, newValue]) => ({
    //   sheetIndex: activeSheetIndex,
    //   rowIndex: row,
    //   cellIndex: col,
    //   value: newValue === "" || newValue === null ? null : newValue,
    // }));
    const updates = changes.map(([row, col, oldValue, newValue]) => {
      if (oldValue !== newValue) {
        return {
          sheetIndex: activeSheetIndex,
          rowIndex: row,
          cellIndex: col,
          value: newValue === "" || newValue === null ? null : newValue,
        };
      }
      return null;
    }).filter(update => update !== null);

    if(updates?.length == 0 ) return;
    await updatesCells(id,{updates})
    socket.emit('onSpreadsheet',{
      command:"updateCells",
      organizationId:userDetails?.organizationId,
      applicationId: defaultApplication?.id,
      projectId: defaultApplication?.projectId,
      user:{
        userName:userDetails?.userName,
        userId:userDetails?.userId
      },
      data:{
        spreadsheetId: id,
        updates:updates
      }
    })

  };

  const handleOnCellMouseDown = (event, coords) => {
    socket.emit('onSpreadsheet',{
      command:"editingCell",
      organizationId:userDetails?.organizationId,
      applicationId: defaultApplication?.id,
      projectId: defaultApplication?.projectId,
      user:{
        userName:userDetails?.userName,
        userId:userDetails?.userId
      },
      data:{
        spreadsheetId: id,
        sheetIndex: activeSheetIndex,
        rowIndex: coords.row,
        cellIndex: coords.col,
      }
    })
  };

  const generateColumnHeaders = (index) => {
    let columnName = "";
    while (index >= 0) {
      columnName = String.fromCharCode((index % 26) + 65) + columnName;
      index = Math.floor(index / 26) - 1;
    }
    return columnName;
  };

  const importantRenderer = function (instance, td) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.style.fontWeight = "bold";
    td.style.backgroundColor = "#FFCCCC";
  };

  const formatCell = (row, col, prop, value, cellProperties) => {
    if (value === "Important") {
      cellProperties.renderer = importantRenderer;
      cellProperties.readOnly = true;
    }

    const isEditing = editingCells.some(
      (cell) => cell.rowIndex === row && cell.cellIndex === col
    );

    if (isEditing) {
      cellProperties.className = "editing-cell";
    }

    if (row === 0) {
      cellProperties.className = "first-row-cell";
    }

    return cellProperties;
  };

  const handleSheetAdd = async() => {
    const response = await addSheet(id)
    setSpreadsheet(response?.data);
    setActiveSheetIndex(response?.data?.sheets?.length - 1); 
    socket.emit('onSpreadsheet',{
      command:"addSheet",
      organizationId:userDetails?.organizationId,
      applicationId: defaultApplication?.id,
      projectId: defaultApplication?.projectId,
      user:{
        userName:userDetails?.userName,
        userId:userDetails?.userId
      },
      data:{
        spreadsheetId: id,
        newSpreadsheet: response?.data
      }
    })
  };

  const handleBlur = async() => {
    if (currentName.trim() === "") {
      toast.error("Sheet name cannot be blank");
      setCurrentName(spreadsheet.sheets[renameIndex].sheetName); // Revert to original name
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0); // Keep the input field open and focus on it
    } else if (
      spreadsheet.sheets.some(
        (sheet, i) =>
          sheet.sheetName === currentName.trim() && i !== renameIndex
      )
    ) {
      toast.error("Sheet name already exists");
      setCurrentName(spreadsheet.sheets[renameIndex].sheetName); // Revert to original name
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0); // Keep the input field open and focus on it
    } else {
      try {
        const payload = {
          spreadSheetId: id,
          sheetIndex: renameIndex,
          newSheetName: currentName,
        }
        const response = await renameSheet(payload)
        if(response){
          const updatedSheets = spreadsheet.sheets.map((sheet, i) => {
            if (i === renameIndex) {
              return { ...sheet, sheetName: currentName };
            }
            return sheet;
          });
          setSpreadsheet({ ...spreadsheet, sheets: updatedSheets });
          setIsRenaming(false);
          socket.emit('onSpreadsheet',{
            command:"renameSheet",
            organizationId:userDetails?.organizationId,
            applicationId: defaultApplication?.id,
            projectId: defaultApplication?.projectId,
            user:{
              userName:userDetails?.userName,
              userId:userDetails?.userId
            },
            data:{
              spreadsheetId: id,
              sheetIndex: renameIndex,
              newSheetName: currentName,
              newData:response?.results
            }
          })
        }
      } catch (error) {
        setCurrentName(spreadsheet.sheets[renameIndex].sheetName);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, 0);
        toast.error('Error While rename')
      }
    }
  };

  const calculateWidth = (text) => {
    const charWidth = 8; // Approximate width of a character in pixels
    return text.length * charWidth;
  };


  // Function to generate row headers starting from 0
  const rowHeaders = (row) => row.toString();

  const handleGenerate = () => {
    setShow();
  };

  const spreadsheetSocket = async(response)=>{
    const sendUser= response?.user
    const {defaultApplication:currentProject} = currentStore?.getState()?.userDetails
    if(currentProject?.id == response?.applicationId && currentProject?.projectId === response?.projectId && id == response?.data?.spreadsheetId){
        if(response?.command == "renameSheet"){
          const {sheetIndex, newSheetName} = response?.data
          setSpreadsheet((prevSpreadsheet) => {
            const updatedSheets = [...prevSpreadsheet.sheets];
            updatedSheets[sheetIndex].sheetName = newSheetName;
            return {
              ...prevSpreadsheet,
              sheets: updatedSheets,
            };
          });
        }

        if(response?.command == "editingCell"){
          const  {sheetIndex, rowIndex, cellIndex} = response?.data
          if (sheetIndex === activeSheetIndex) {
            setEditingCells((prevEditingCells) => [
              ...prevEditingCells,
              { sheetIndex, rowIndex, cellIndex },
            ]);
            setTimeout(() => {
              setEditingCells((prevEditingCells) =>
                prevEditingCells.filter(
                  (cell) =>
                    cell.rowIndex !== rowIndex || cell.cellIndex !== cellIndex
                )
              );
            }, 3000); // Keep the highlight for 3 seconds
          }
        }

      if (response?.command === "updateCells") {
        const { updates } = response?.data;
        const hotInstance = hotTableComponent.current.hotInstance;
        if (hotInstance) {
          hotInstance.batch(() => {
            updates.forEach(({ sheetIndex, rowIndex, cellIndex, value }) => {
              if (sheetIndex === activeSheetIndexRef.current) {
                const currentCellValue = hotInstance.getDataAtCell(rowIndex, cellIndex);
                if (currentCellValue !== value) {
                  hotInstance.setDataAtCell(rowIndex, cellIndex, value, "external");
                }
              }
            });
          });
        }
      }

      if(response?.command == "addSheet"){
        const {newSpreadsheet} = response?.data
        setSpreadsheet(newSpreadsheet);
      }
    }
  }

  useEffect(()=>{
    if(socket){
      socket.on("onSpreadsheetResponse",spreadsheetSocket)
      return () =>{
        socket.off("onSpreadsheetResponse",spreadsheetSocket)
      }
    }
  }, []);

  useEffect(() => {
    activeSheetIndexRef.current = activeSheetIndex
  }, [activeSheetIndex])

  useEffect(()=>{
    const data = spreadsheet?.sheets[activeSheetIndex].data || [[]];
    const paddedData = padArray(data);
    setHotInstanceData(paddedData)
  },[spreadsheet])

  const updateEncryptValues=(updates)=>{
    const hotInstance = hotTableComponent.current.hotInstance;
    if (hotInstance) {
      hotInstance.batch(() => {
        updates.forEach(({ sheetIndex, rowIndex, cellIndex, value }) => {
          if (sheetIndex === activeSheetIndexRef.current) {
            const currentCellValue = hotInstance.getDataAtCell(rowIndex, cellIndex);
            if (currentCellValue !== value) {
              hotInstance.setDataAtCell(rowIndex, cellIndex, value, "external");
            }
          }
        });
      });
    }
  }

  return (
    <div className="flex flex-col justify-between">
      <div>
        <div className="md:flex justify-between manage-data-btn">
          <div />
          <div
            data-testid="spreadsheet"
            className="flex items-center justify-center text-2xl font-normal capitalize"
          >
            {application} Test Data
          </div>
          <div className="encrypted-btn mdMax:flex mdMax:justify-center">
            <CustomButton
              label="Generate Encrypted Data"
              className="w-[250px]"
              onClick={handleGenerate}
            />
          </div>
          <BulkEncryption
            isOpen={isOpen}
            onClose={setHide}
            data={bulkPayload}
            setSpreadsheet={setSpreadsheet}
            updateEncryptValues={updateEncryptValues}
          />
        </div>
        <div className="w-full mt-5 overflow-hidden h-[calc(100vh-260px)] mdMax:h-[calc(100vh-300px)]">
          <div className="handsontable-wrapper">
            <HotTable
              ref={hotTableComponent}
              data={hotInstanceData}
              colHeaders={(index) => generateColumnHeaders(index)}
              rowHeaders={rowHeaders}
              width="100%"
              height={isDesktop ? "100%" : "685"}
              licenseKey="non-commercial-and-evaluation"
              stretchH="all"
              contextMenu={true}
              manualRowResize={true}
              manualColumnResize={true}
              minSpareRows={1}
              minSpareCols={1}
              minCols={10}
              minRows={100}
              afterChange={handleAfterChange}
              afterOnCellMouseDown={handleOnCellMouseDown}
              allowInsertRow={true}
              allowInsertColumn={true}
              allowRemoveRow={true}
              allowRemoveColumn={true}
              autoWrapCol={true}
              autoWrapRow={true}
              editor="text"
              cells={(row, col, prop) => {
                const cellProperties = {};
                return formatCell(row, col, prop, null, cellProperties);
              }}
              mergeCells={true}
              dragToScroll
              copyPaste={true}
              copyable={true}
              undo={true}
            />
          </div>
        </div>
      </div>
      <div className="h-14 bg-[#d6e6f8] rounded-b-[10px] pl-20 flex gap-10 w-full">
        <div className="flex gap-8 overflow-y-hidden max-w-[1000px] scroll">
          {spreadsheet?.sheets.map((sheet, index) => (
            <div
              key={index}
              className={`px-3 py-2 flex items-center justify-center  h-10 ${
                activeSheetIndex === index
                  ? "font-semibold bg-iwhite rounded-b-[10px]"
                  : "font-medium cursor-pointer"
              }`}
              onClick={() => setActiveSheetIndex(index)}
              onDoubleClick={() => handleDoubleClick(index, sheet.sheetName)}
              style={{
                minwidth: calculateWidth(sheet.sheetName),
                whiteSpace: "nowrap",
              }}
            >
              {isRenaming && index === renameIndex ? (
                <input
                  type="text"
                  value={currentName}
                  ref={inputRef}
                  onChange={(e) => setCurrentName(e.target.value)}
                  onKeyDown={handleRename}
                  onBlur={handleBlur}
                  maxLength={20}
                  autoFocus
                  className={`focus:outline-none  h-10 rounded-b-[10px]   placeholder:text-igy5 bg-iwhite`}
                  style={{
                    minwidth: "100px",
                    whiteSpace: "nowrap",
                    maxWidth: calculateWidth(currentName),
                  }}
                />
              ) : (
                <span style={{ whiteSpace: "nowrap" }}>{sheet.sheetName}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center p-3">
          <button
            className="w-8 h-8 text-3xl rounded-[10px] hover:bg-iwhite hover:transition-all hover:duration-300 hover:ease-in"
            onClick={handleSheetAdd}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;
