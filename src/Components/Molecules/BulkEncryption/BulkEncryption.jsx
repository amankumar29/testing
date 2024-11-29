import CloseIcon from "@mui/icons-material/Close";
import { CustomButton } from "Components/Atoms/CustomButton/CustomButton";
import { Modal } from "Components/Atoms/Modal/Modal";
import SearchDropdown from "Components/Atoms/SearchDropdown/SearchDropdown";
import { EncryptionHelper } from "Helpers/EncryptionHelper/EncryptionHelper";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getSpreedsheet,
  updatesCells,
} from "Services/API/Spreadsheet/Spreadsheet";
import { WebsocketContext } from "Services/Socket/socketProvider";

const BulkEncryption = ({ isOpen, onClose, data ,setSpreadsheet,updateEncryptValues}) => {
  const [columnOption, setColumnOption] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [sheetData, setSheetData] = useState([]);
  const [payload, setPayload] = useState(null);
  const {socket} = useContext(WebsocketContext)
  const { defaultApplication ,userDetails} = useSelector((state) => state?.userDetails);

  const handleClose = () => {
    onClose();
    setSelectedColumn(null);
    setSheetData([]);
    setPayload(null);
  };

  useEffect(() => {
    const sheetIndex = data?.sheetIndex;
    if (data && isOpen) {
      getSpreedsheet(data?.spreadSheetId)
        .then((res) => {
          setSpreadsheet(res?.data)
          const data = res?.data?.sheets;
          const sheetData = data[sheetIndex]?.data;
          // console.log(sheetData);
          const filteredSheet = data[sheetIndex]?.data[0];
          setSheetData(sheetData);
          const columnList = filteredSheet.map((keyword, index) => ({
            id: index,
            keyword_name: keyword,
          }));
          const columnOpt = columnList.filter(
            (item) => item.keyword_name !== null
          );
          setColumnOption(columnOpt);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [isOpen]);

  const encryptData = async (data) => {
    const encryptedData = await Promise.all(
      data.map(async (item) => {
        const valueToEncrypt = item.value === undefined ? null : item.value;

        if (
          valueToEncrypt === null ||
          valueToEncrypt === "" ||
          (valueToEncrypt && valueToEncrypt.startsWith("ENC_"))
        ) {
          // Skip encryption for null, empty values, or values that already start with "ENC_"
          return {
            ...item,
            value: valueToEncrypt, // Ensure value is set to null if it was undefined
          };
        } else {
          const encryptedValue = await EncryptionHelper(valueToEncrypt);
          return {
            ...item,
            value: `ENC_${encryptedValue}`,
          };
        }
      })
    );
    return encryptedData;
  };

  useEffect(() => {
    if (selectedColumn?.keyword_name) {
      const filteredSheetData = sheetData.filter((_, index) => index !== 0);
      const modifedData = filteredSheetData.map((row, rowIndex) => ({
        sheetIndex: data?.sheetIndex,
        rowIndex: rowIndex + 1,
        cellIndex: selectedColumn?.id,
        value: row[selectedColumn?.id],
      }));
      // Encrypt the data before setting it to the state
      encryptData(modifedData).then((encryptedData) => {
        setPayload(encryptedData);
      });
    }
  }, [selectedColumn, data, sheetData]);

  const handleSelectColumn = (option) => {
    setSelectedColumn(option);
  };

  const handleGenerate = () => {
    const finalData = payload?.filter((item) => item?.value !== null);
    const spreadsheetId = data?.spreadSheetId;

    const updates = {
      updates: finalData,
    };
    updatesCells(spreadsheetId, updates)
      .then(() => {
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
            spreadsheetId: spreadsheetId,
            updates:finalData,
          }
        })
        updateEncryptValues(finalData)
        setPayload(null);
        handleClose();
      })
      .catch(() => {
        toast.error("Failed to encrypt. Please try again");
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      modalClassName="z-[300]"
      isstopPropagationReq={true}
    >
      <div className="w-[400px] h-[325px]">
        <div className="flex items-center justify-center h-20 bg-ibl7 rounded-t-[10px] relative">
          <p
            className="text-lg font-medium leading-7"
            data-testid="add_new_application"
          >
            Generate Encrypted Data
          </p>
          <div className="absolute right-0 mr-[33px] cursor-pointer text-ibl1 hover:text-ibl3 hover:transition-all hover:duration-300 hover:ease-in">
            <CloseIcon onClick={handleClose} data-testid="close_Icon" />
          </div>
        </div>
        <div className="flex justify-center mt-4 text-base leading-5 ">
          <p className="max-w-[350px] text-center">
            Select the column to encrypt
          </p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="w-[276px] mt-6">
            <SearchDropdown
              option={columnOption}
              placeHolder="Choose Column"
              label={"Column"}
              className={`h-10 w-[276px] bg-iwhite`}
              hideCross={true}
              isEditable={true}
              selectedOption={selectedColumn}
              onSelect={handleSelectColumn}
            />
          </div>
          <div className="mt-4">
            <CustomButton
              data-testid="submit_button"
              type="submit"
              disable={selectedColumn === null}
              label={"Generate"}
              onClick={handleGenerate}
              className={`w-[150px] h-[52px] mt-[7px]`}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BulkEncryption;
