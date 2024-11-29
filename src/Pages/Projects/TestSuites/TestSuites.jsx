import React, { useContext, useEffect, useState } from "react";
import Table from "../../../Components/Atoms/Table/Table";
import {
  deleteTestSuite,
  duplicateTestSuite,
  getTestSuitInfo,
  getTestSuiteList,
} from "../../../Services/API/Projects/Projects";
import { toast } from "react-toastify";
import ActionIcons from "Components/Atoms/ActionIcons/ActionIcons";
import "./TestSuites.style.scss";
import { ThemeProvider } from "@emotion/react";
import { Pagination } from "@mui/material";
import { createMuiTheme } from "@mui/material";
import { Tooltip } from "react-tooltip";
import textEllipsis from "../../../Helpers/TextEllipsis/TextEllipsis";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import DonutChart from "Components/Molecules/DonutChart/DonutChart";
import { useDispatch, useSelector, useStore } from "react-redux";
import { setIsrunned, setsuiteIsCreated, setTestSuitesList } from "Store/ducks/testCases";
import { WebsocketContext } from "Services/Socket/socketProvider";
import { fetchDefaultData } from "Helpers/DefaultApi/FetchDefaultApi";
import { useLazyGetUserDataQuery, useSetDefaultMutation } from "Services/API/apiHooks";

const TestSuites = ({
  selectedProject,
  selectedApplication,
  searchKey,
  selectTestSuiteCheckBox,
  selectAllTestSuites,
  testSuiteModal = false,
  testSuiteModalData = false,
  allCheckBoxes = false,
  onRowData,
  projectName,
  applicationName,
  applicationType,
  onTestSuiteRun = () => {},
}) => {
  const List = useSelector((state)=>state?.testCases?.testSuites)
  const {suiteRunned,suiteIsCreated} = useSelector((state)=>state?.testCases)
  const [testSuiteData, setTestSuiteData] = useState(List?.list || []);
  const [isLoading, setIsLoading] = useState(List?.list?.length > 0 ? false : true);
  const [progressBarPoPUp, setProgressBarPoPUp] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);
  const [rowId, setRowId] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [dataCount, setDataCount] = useState(List?.totalCount ? List?.totalCount  : 0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(List?.currentOffset ? Math.floor(List?.currentOffset / rowsPerPage)+1 : 1);
  const [totalPages, setTotalPages] = useState(List?.totalCount ? Math.ceil( List?.totalCount / rowsPerPage) : 0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [testSuitInfo, setTestSuitInfo] = useState([]);
  const [activeRowMorePopup, setActiveRowMorePopup] = useState(null);
  const [activeRowRunPopup, setActiveRowRunPopup] = useState(null);
  const [disableRunImage, setDisableRunImage] = useState(false);
  const { defaultApplication,userDetails } = useSelector((state) => state?.userDetails);
  const {socket} =  useContext(WebsocketContext)
  const currentStore = useStore()
  const [setDefault] = useSetDefaultMutation();
  const [getuserDetails] = useLazyGetUserDataQuery();

  const navigate = useNavigate();
  const dispatch = useDispatch()
  
  const updateRowId = (id, isChecked) => {
    setRowId((prevRowIds) => {
      if (isChecked) {
        // Add id if it's checked and not already in the array
        if (!prevRowIds.includes(id)) {
          return [...prevRowIds, id];
        }
      } else {
        // Remove id if it's unchecked
        return prevRowIds.filter((rowId) => rowId !== id);
      }
      return prevRowIds;
    });
  };

  // Function to handle checkbox change in table data rows
  const handleCheckboxChange = (rowId, row) => (event) => {
    onRowData(row);
    const isChecked = event?.target?.checked;
    setCheckedItems((prevCheckedItems) => {
      const newCheckedItems = {
        ...prevCheckedItems,
        [rowId]: isChecked,
      };

      updateRowId(rowId, isChecked);
      return newCheckedItems;
    });
  };

  useEffect(() => {
    setCheckedItems([]);
    setSelectAll(false);
    setRowId([]);
  }, [allCheckBoxes]);

  // Function to check or uncheck all checkboxes in tbody
  const handleSelectAllCheckboxes = () => {
    const newCheckedItems = {};
    const newRowId = [];
    testSuiteData.forEach((row) => {
      if(row?.testCases?.length >= 1){
        newCheckedItems[row?._id] = !selectAll;
        if (!selectAll) {
          newRowId.push(row?._id);
        }
      }
    });
    setCheckedItems(newCheckedItems);
    setRowId(newRowId);
    setSelectAll(!selectAll);
  };

  const fetchTestCasesData = (limit, offset,isdelete,isduplicate,rowChanged,pageChanged) => {
    //  if(List?.list?.length == 0 || rowChanged || pageChanged || isdelete || isduplicate || List?.projectId !=defaultApplication?.projectId || List?.applicationId != defaultApplication?.id || suiteRunned || suiteIsCreated || searchKey){   // narendhra is going to handle this condition in feature
    setIsLoading(true);
    const requestBody = {
      applicationId: defaultApplication?.id,
      projectId: defaultApplication?.projectId,
      limit,
      offset,
      includeCount: true,
      search: searchKey || '',
      sort: "_id",
      sortDirection: "desc",
    };
    getTestSuiteList(requestBody)
      .then((res) => {
          const data = res?.data?.results;
          dispatch(setTestSuitesList({
            projectId: defaultApplication?.projectId,
            applicationId: defaultApplication?.id,
            currentOffset:offset,
            totalCount:res?.data?.count,
            list:data})
          )
          setTestSuiteData(data);
          setDataCount(res?.data?.count);
          setIsLoading(false);
          setCurrentOffset(res?.data?.offset);
          setTotalPages(Math.ceil(res?.data?.count / limit));
      })
      .catch((error) => {
          const message = error?.response?.data?.details;
          toast.error(message || "Error retrieving testcases list data");
          setIsLoading(false);
      });
      dispatch(setIsrunned({type:'test-suites',value:false}))
       dispatch(setsuiteIsCreated(false))
    // }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 10);
    setPage(1);
    setRowsPerPage(newRowsPerPage);
    setCheckedItems([]);
    setRowId([]);
    fetchTestCasesData(newRowsPerPage, 0,false,false,true,false);
  };

  const handleChangePage = (event, newPage) => {
    const offset = (newPage - 1) * rowsPerPage;
    setPage(newPage);
    setRowId([]);
    setCheckedItems([]);
    fetchTestCasesData(rowsPerPage, offset,false,false,false,true);
  };

  const handleDeleteTestSuite = (newId) => {
    deleteTestSuite(newId)
      .then((res) => {
        const message = res?.data?.message;
        const offset = (page - 1) * rowsPerPage;
        socket.emit('onTestsuites',{
          command:"testSuiteDelete",
          organizationId:userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user:{
            userName:userDetails?.userName,
            userId:userDetails?.userId
          },
          data: {
            testSuiteId:newId
          }
        })
        fetchTestCasesData(rowsPerPage, offset,true ,false,false,false);
        // setPayload({});
        toast.success(message);
        setCheckedItems([]);
        setSelectAll(false);
        setRowId([]);
      })
      .catch((err) => {
        const errMsg = err?.response?.data?.details;
        toast.error(errMsg);
      });
  };

  const handleDuplicateTestSuite = (id, name) => {
    const payload = {
      originalTestSuiteId:id,
      duplicateTestSuiteName: name,
    };
    duplicateTestSuite(payload)
      .then((res) => {
        const message = res?.data?.message;
        socket.emit('onTestsuites',{
          command:"testSuiteDuplicate",
          organizationId:userDetails?.organizationId,
          applicationId: defaultApplication?.id,
          projectId: defaultApplication?.projectId,
          user:{
            userName:userDetails?.userName,
            userId:userDetails?.userId
          },
          data: {
            testSuite:res?.data?.results
          }
        })
        const offset = (page - 1) * rowsPerPage;
        fetchTestCasesData(rowsPerPage, offset,false,true,false,false);
        toast.success(message);
        setCheckedItems([]);
        setSelectAll(false);
        setRowId([]);
      })
      .catch((err) => {
        const errMsg = err?.response?.data?.details;
        toast.error(errMsg);
      });
  };

  const fetchTestSuiteInfo = (id) => {
    // const payload = {
    //   test_suite_id: id,
    // };
    getTestSuitInfo(id)
      .then((res) => {
        const data = res?.data?.results;
        setTestSuitInfo(data);
      })
      .catch((err) => {
        const errMsg = err?.response?.data?.details;
        toast.error(errMsg);
      });
  };

  useEffect(() => {
    if (defaultApplication?.id && !testSuiteModal) {
      setPage(List?.currentOffset ? Math.floor(List?.currentOffset / rowsPerPage)+1 : 1);
      setRowId([]);
      setCheckedItems([]);
      fetchTestCasesData(25, 0);
      setRowsPerPage(25);
    }
  }, [searchKey, testSuiteModalData,defaultApplication]);

  useEffect(() => {
    selectTestSuiteCheckBox(rowId);
    selectAllTestSuites(checkedItems);
    if (rowId?.length > 0 && rowId?.length === testSuiteData?.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
    if (rowId?.length <= 1) {
      setDisableRunImage(false);
    } else {
      setDisableRunImage(true);
    }
  }, [rowId, checkedItems]);

  const rowCheckBoxClear = () => {
    setRowId([]);
    setCheckedItems([]);
    setSelectAll(false);
  };

  // it runs only for specific single run in test suite
  const runDefaultTestSuite = () => {
    fetchDefaultData(setDefault, defaultApplication, getuserDetails); 
  }

  const RunTestCaseData = () => {
    const offset = (page - 1) * rowsPerPage;
    fetchTestCasesData(rowsPerPage, offset);
    onTestSuiteRun();
    runDefaultTestSuite()
  };

  useEffect(()=>{
    if(suiteRunned || suiteIsCreated){
      fetchTestCasesData(rowsPerPage, List?.currentOffset,false,false,false,false)
    }
  },[suiteRunned,suiteIsCreated])

  const handleTestsuitesSocket = async(response)=>{
    const sendUser= response?.user
    const {defaultApplication:currentProject} = currentStore?.getState()?.userDetails
    const {targetProjectId,targetApplicationId} = response?.data
    if(currentProject?.id == (response?.applicationId || targetApplicationId)&& currentProject?.projectId === (response?.projectId || targetProjectId)){
      switch(response?.command){
        case "testSuiteCreate":
          const newTestSuite = response?.data
          if(newTestSuite){
            setTestSuiteData((preItem)=>{
              const newTestSuiteList = [...preItem, newTestSuite];
              const uniqueList = newTestSuiteList.filter((item, index, self) =>
                index === self.findIndex((t) => t._id === item._id)
              );
            return uniqueList;
            })
            toast.dismiss()
            toast.success(`Hello Team! ${sendUser?.userName} has created New TestSuite ${response?.data?.name}`)
          }
          break;
        case "testSuiteDelete":
          const {testSuiteId} = response?.data
          if(testSuiteId){
            setTestSuiteData((prevItems) =>
              prevItems.filter((item) =>item._id !== testSuiteId)
            )
            toast.dismiss()
            toast.success(`Hello Team! ${sendUser?.userName} has deleted ${testSuiteId} TestSuite`)          
          }
          break;
        case "testSuiteUpdate":
          const {caseList,name,testsuiteId} = response?.data
          if(testsuiteId){
            setTestSuiteData((prevItems) => 
              prevItems.map((item) => 
                item._id === testsuiteId && caseList?.length > 0
                  ? {
                      ...item,
                      testCases: [
                        ...item.testCases,
                        ...caseList.map(newId => ({ _id: newId }))
                      ]
                    }
                  : item._id === testsuiteId 
                    ? setTestSuiteData((prevItems) =>
                      prevItems.map((item) =>
                        item._id === testsuiteId
                          ? {
                            ...item,
                            name:name
                          }
                          : item
                      )
                    )
                  :  item
              )
            );
          }
          toast.dismiss()
          toast.success(`Hello Team! ${sendUser?.userName} has Updated ${testsuiteId} TestSuite`)
          break;
        case "testSuiteDuplicate":
          const {testSuite} = response?.data
          setTestSuiteData((preItem)=>{
            const newTestSuiteList = [...preItem, testSuite];
            const uniqueList = newTestSuiteList.filter((item, index, self) =>
              index === self.findIndex((t) => t._id === item._id)
            );
          return uniqueList;
          })
          toast.dismiss()
          toast.success(`Hello Team! ${sendUser?.userName} has created new ${testSuite?._id} TestSuite`)
          break;
        case "testSuiteTransfer":
          const newItem = response?.data?.data;
          setTestSuiteData((preItem)=>{
            const newTestSuiteList = [...preItem, newItem];
            const uniqueList = newTestSuiteList.filter((item, index, self) =>
              index === self.findIndex((t) => t._id === item._id)
            );
          return uniqueList;
          })
          toast.dismiss()
          toast.success(`Hello Team! ${sendUser?.userName} has transfered ${newItem?._id} TestSuite`)
          break;
      }
    }
  }

  useEffect(()=>{
    if(socket){
        socket.on('onTestsuitesResponse',handleTestsuitesSocket)
      return()=>{
        socket.off('onTestsuitesResponse',handleTestsuitesSocket)
      }
    }
  },[])

  return (
    <div className="test-Suites">
      <div className="mt-4 bg-iwhite p-5 rounded-[8px] table-div">
        <div className="tableScroll tableScrollNew">
          <Table
            isDisableCheckbox={true}
            isLoading={isLoading}
            data={testSuiteData}
            checkbox={true}
            handleCheckboxChange={handleCheckboxChange}
            handleSelectAllCheckboxes={handleSelectAllCheckboxes}
            selectAll={selectAll}
            checkedItems={checkedItems}
            onRowClick={(row) => {
              navigate("/projects/test-suites/test-cases", {
                state: {
                  id: row?._id,
                  project: selectedProject,
                  application: selectedApplication,
                  isDuplicate: row?.is_duplicate,
                  name: row?.name,
                  projectName: projectName,
                  applicationName: applicationName,
                  applicationType: applicationType,
                },
              });
            }}
            onRowClickPointer={true}
            columns={[
              {
                label: "",
                tHeadClass: "w-[6%]",
              },
              {
                tHeadClass: "w-[8%]",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "ID",
                column: "id",
                cell: (row) => (
                  <div className="flex items-center justify-center row-id">
                    {row?._id}
                  </div>
                  ),
              },
              {
                tHeadClass: "w-[14%] text-left pl-4",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "Name",
                column: "test_case_name",
                cell: (row) => (
                  <>
                    <div
                      className={`!text-left w-fit ${
                        row?.name?.length > 30 && "cursor-pointer"
                      }`}
                    >
                      <div
                        data-tooltip-id="testCaseName"
                        data-tooltip-content={
                          row?.name?.length > 30 ? row?.name : ""
                        }
                      >
                        {textEllipsis(row?.name, 30)}
                      </div>
                    </div>
                    <Tooltip
                      id="testCaseName"
                      place="bottom"
                      className="!text-[11px] max-w-[300px] break-all !text-left"
                    />
                  </>
                ),
              },
              {
                tHeadClass: "w-[14%]",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "No. Of Test Cases",
                column: "total_steps",
                cell: (row) => (
                  <div className="flex items-center justify-center">
                    {row.testCases?.length}
                  </div>
                ),
              },
              // {
              //   tHeadClass: "w-[14%]",
              //   tbodyClass: "text-igy1 text-sm font-normal",
              //   label: "Last Run History",
              //   column: "last run history",
              //   cell: (row, index) => {
              //     const rowData = row?.test_suite_runs[0];
              //     return (
              //       <>
              //         <div className="flex flex-row justify-center">
              //           <div
              //             className={`relative ${
              //               row?.status === "Failed"
              //                 ? "failed-progress"
              //                 : "sucess-process"
              //             } z-0 `}
              //             onMouseEnter={() => setProgressBarPoPUp(index)}
              //             onMouseLeave={() => setProgressBarPoPUp("")}
              //           >
              //             {/* Check if test_suite_runs is empty or rowData doesn't exist */}
              //             {!rowData ? (
              //               <p className="font-normal text-xs text-igy16 cursor-default">
              //                 Not Executed
              //               </p>
              //             ) : (
              //               <DonutChart row={rowData} />
              //             )}

              //             {rowData && progressBarPoPUp === index && (
              //               <div className="bg-iwhite w-[88px] h-[68px] text-igy1 absolute top-[-10px] left-[50px] rounded-[4px] px-[10px] py-[2px] flex flex-col progressBarPoPUp">
              //                 <div className="flex justify-between text-[11px] font-medium">
              //                   <p>Passed</p>
              //                   <p>{rowData?.passed_tests}</p>
              //                 </div>
              //                 <div className="flex justify-between text-[11px] font-medium">
              //                   <p>Failed</p>
              //                   <p>{rowData?.failed_tests}</p>
              //                 </div>
              //                 <div className="flex justify-between text-[11px] font-medium">
              //                   <p>Skipped</p>
              //                   <p>{rowData?.skipped_tests}</p>
              //                 </div>
              //               </div>
              //             )}
              //           </div>
              //         </div>
              //       </>
              //     );
              //   },
              // },
              {
                tHeadClass: "w-[14%]",
                tbodyClass: "text-igy1 text-sm font-normal",
                label: "Actions",
                column: "actions",
                cell: (row) => (
                  <div className="flex items-center justify-center">
                    <ActionIcons
                      data={row}
                      fetchDuplicateRow={handleDuplicateTestSuite}
                      fetchDeleteTestCase={() => handleDeleteTestSuite(row?._id)}
                      // transferData={transferData}
                      selectedProject={selectedProject}
                      selectedApplication={selectedApplication}
                      id={row?._id}
                      paramType="test-suites"
                      onRowCheckBoxClear={rowCheckBoxClear}
                      fetchTestSuiteInfo={fetchTestSuiteInfo}
                      testSuitInfo={testSuitInfo}
                      fetchTestCasesData={RunTestCaseData}
                      checkApk={selectedApplication?.appData?.apkFile}
                      projectName={projectName}
                      applicationName={applicationName}
                      applicationType={applicationType}
                      setActiveRowMorePopup={setActiveRowMorePopup}
                      activeRowMorePopup={activeRowMorePopup}
                      setActiveRowRunPopup={setActiveRowRunPopup}
                      activeRowRunPopup={activeRowRunPopup}
                      disableRunImage={disableRunImage}
                    />
                  </div>
                ),
              },
            ]}
          />
          <div className="flex items-center justify-between mt-8 mb-[10px]">
          {!isLoading && dataCount > 0 && (
            <div className="text-sm text-ibl1">{`Showing ${
              testSuiteData?.length
            } out of ${dataCount}`}</div>
          )}
          {!isLoading && dataCount > 25 && (
            <div className="flex items-center">
              <div className="flex text-[15px] text-ibl1 font-medium">
                <div className="flex items-center gap-2">
                  <div>Page Limit:</div>
                  <div>
                    <select
                      name="pageValue"
                      id="pageValue"
                      onChange={handleChangeRowsPerPage}
                      value={rowsPerPage}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={75}>75</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                <div>
                  <ThemeProvider theme={theme}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handleChangePage}
                      showFirstButton
                      showLastButton
                      color="primary"
                      className=" relative z-[1]"
                    />
                  </ThemeProvider>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#052C85",
      contrastText: "#ffffff", // or any contrasting color
    },
  },
});

export default TestSuites;

TestSuites.propTypes = {
  selectedProject: PropTypes.number,
  selectedApplication: PropTypes.number,
  searchKey: PropTypes.string,
  selectTestSuiteCheckBox: PropTypes.func,
  selectAllTestSuites: PropTypes.func,
  testSuiteModal: PropTypes.bool,
  testSuiteModalData: PropTypes.bool,
  allCheckBoxes: PropTypes.bool,
  onTestSuiteRun: PropTypes.func,
};
