import React, { useEffect, useState, useRef } from "react";
import { processList } from "./longProcesses/enums";
import axios from 'axios';
import './index.css';
import ReactTable, { ReactTableDefaults } from "react-table";
import Loader from "./components/Loader";
import styled from "styled-components";
import { IconContext } from "react-icons/lib";
import * as AiIcons from "react-icons/ai";
import Scroll from "./container/Scroll/Scroll";

const Nav = styled.div`
  background: white;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  
`;
 
const TabNav = styled.nav`
  background: white;
  width: 200px;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 4;
  left: ${({ tabview }) => (tabview ? "auto" : "-100%")};
  right: 0;
  top: 0;
  z-index: 10;
`;
 
const ControlWrap = styled.div`
  width: 100%;
  position: relative;
`;

const UploadFile = () => {
    const [file, setFile] = useState([]);
    const [data, getFile] = useState({ name: "", path: "" });
    const [columns, setColumns] = useState([]);
    const [nuldata, setNulData] = useState([]);
    const [progress, setProgess] = useState(0);
    const el = useRef();
    const [isTableReady, setIsTableReady] = useState(false);
    const [selectedAction, setSelectedAction] = useState("");
    const [ColNul, setColNul] = useState([]);
    const [DropNa, setDropNa] = useState('');
    const [LoadData, setLoadData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [joinType, setJoinType] = useState("");
    const [primaryKey, setPrimaryKey] = useState("");
    const [DropColumns, setDropColumns] = useState([]);
    const [yAxisParams, setYAxisParams] = useState([]);
    const [yAxisParamsToSend, setYAxisParamsToSend] = useState([]);
    const [isFileUploadHidden, setIsFileUploadHidden] = useState(false);
    const [table, setTable] = useState(false);
    const [DfJoin, setDfJoin] = useState(false);
    const [DropNaVal, setDropNaVal] = useState(false);
    const [tabview, setTabView] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const showTabView = () => setTabView(!tabview);

    const uploadFile = () => {
       const formData = new FormData();
        file.forEach((file, index) => {
            formData.append(`file_${index}`, file);
        });
        console.log('formData:', formData)
        axios.post('http://localhost:5000/upload', formData, {
            onUploadProgress: (ProgressEvent) => {
                let progress = Math.round(ProgressEvent.loaded / ProgressEvent.total * 100) + '%';
                setProgess(progress)
            }
        }).then(res => {
            console.log(res);
            setIsTableReady(false);
            const uploadedFilesData = res.data.files.map(fileData => ({
                name: fileData.file,
                path: 'http://localhost:5000' + fileData.path
            }));
            console.log('Uploaded files data:', uploadedFilesData)
            getFile(uploadedFilesData);
        }).catch(err => console.log(err))
    } 

    const handleChange = (e) => {
        setProgess(0)
        const selectedFiles = e.target.files;
        const filesArray = [];
        for (let i = 0; i < selectedFiles.length; i++) {
            filesArray.push(selectedFiles[i]);
        }
        console.log(filesArray);
        setFile(filesArray)
    }

    const handleJoinTypeChange = (event) => {
        setJoinType(event.target.value);
    };

    const handlePrimaryKeyChange = (event) => {
        setPrimaryKey(event.target.value);
    };

    const handleYAxisChange = (column, index) => {
        setYAxisParams((prevParams) => {
          const updatedParams = [...prevParams];
          if (updatedParams[index] === column) {
            // If the clicked chart icon is already active, make it inactive
            updatedParams[index] = undefined; // Deselect the series option
          } else {
            updatedParams[index] = column; // Select the series option
          }
          return updatedParams;
        });
      };
    
    const handleYAxisSubmit = () => {
        setYAxisParamsToSend(yAxisParams);
        setDropColumns((prevColumns) =>
            prevColumns.filter((column, index) => yAxisParams[index] === undefined)
        );
        
    };

    useEffect(() => {  
        if (yAxisParamsToSend.length > 0) {
        axios
        .post("http://localhost:5000/dropcol", { yAxisParams: yAxisParamsToSend })
        .then(response => {
            console.log("Result:", response.data);
            setTable(true)
        })
        .catch(error => {
            console.error("Error retrieving Table Data:", error);
        });
        }   
    }, [yAxisParamsToSend]);

    const handleSelectedTable = (index) => {
        setSelectedFiles(index)
      
        // Assuming the backend endpoint to send the data is '/findtable'
        axios
          .post("http://localhost:5000/findtable", { selectedFiles: [index] }) // Pass the selectedFiles array
          .then((response) => {
            // Handle the response from the backend if needed
            console.log("Selected data sent successfully:", response.data);
          })
          .catch((error) => {
            console.error("Error sending selected data:", error);
          });
      };

    const handleJoinTable = () => {
        axios
            .post("http://localhost:5000/jointable", { joinType, primaryKey })
            .then((response) => {
                // Handle the response from the backend
                console.log("Join Table Result:", response.data);
                setDfJoin(true);
                setDropColumns(response.data)
                // Update the state or perform any additional actions
            })
            .catch((error) => {
                console.error("Error performing join:", error);
            });
    };

    useEffect(() => {  
        console.log('column names:', DropColumns) 
      }, [DropColumns]);

    useEffect(() => {  
        fetchData();   
      }, [DfJoin, table, DropNaVal]);
    
    useEffect(() => {
    // Whenever data changes, check if it is not empty and hide the file-upload section
    if (data.name !== "" && data.length > 0) {
        setIsFileUploadHidden(true);
    }
    }, [data]);

    const fetchData = () => {
    axios
    .post("http://localhost:5000/nullval")
    .then(response => {
        const tableData = response.data
        createTable(tableData);
        console.log('Received tableData:', tableData);
    })
    .catch(error => {
        console.error("Error retrieving Table Data:", error);
    });
    }

    const createTable = tableData => {
        console.log("Received tableData:", tableData);
        if (tableData && tableData.columns && tableData.data) {
          setColumns(tableData.columns);
          setNulData(tableData.data);
          setIsTableReady(true); 
          
        } else {
            console.error("Invalid tableData format:", tableData);
        }
    };

    const handleLoadTable = () => {
        setIsLoading(true);
        // Send POST request to Flask backend
        axios
        .post("http://localhost:5000/loadTable")
        .then(response => {
            // Handle the response from the backend
            console.log("Data_Loaded:", response.data);
            setLoadData(true)
            setIsLoading(false);
            // Update the state with the received groups if necessary
        })
        .catch(error => {
            console.error("Error loading data:", error);
            setIsLoading(false);
        });
    };

    const handleDropNa = (event) => {
        const selectedAction = event.target.value;
        setSelectedAction(selectedAction);
        axios
        .post("http://localhost:5000/dropna", { action: selectedAction })
        .then(response => {
            // Handle the response from the backend
            console.log("Data Frame:", response.data);
            setDropNa(response.data)
            setDropNaVal(true)
            // Update the state with the received groups if necessary
        })
        .catch(error => {
            console.error("Error loading data:", error);
        });
    };

    return (
        <>
        {data.name !== "" && (
            <>
            <Nav>
                <button onClick={showTabView}>Table View</button>  
            </Nav>
            <IconContext.Provider value={{ color: "black" }}>
       
            <TabNav tabview={tabview}>
                <ControlWrap> 
                <Scroll>     
                <AiIcons.AiOutlineClose onClick={showTabView} style={{ position: "absolute", top: 0, right: 0 }}/>
                {data.map((fileData, index) => (
                    <div key={index} className={`chart-icon ${selectedFiles === index ? "active" : ""}`}>
                    <input
                        type="radio"
                        checked={selectedFiles === index}
                        onChange={() => handleSelectedTable(index)}
                         />
                        {fileData.name} 
                    </div>
                ))}
                </Scroll>
                </ControlWrap>
                </TabNav>
            </IconContext.Provider> 
            </>     
        )}
        
        <div className='container'>
        
        {data.name === "" && (
        <div className={isFileUploadHidden ? 'hidden' : 'file-upload'}>
            <input type="file" id="fileInput" ref={el} onChange={handleChange} multiple/>
            <div className="progressBar" style={{ width: progress }}>
              {progress}
            </div>
            <button onClick={uploadFile} className="upbutton">upload</button>
            <hr />
        </div>
        )}

          {data.name !== "" && data.length > 1 && (
                <div className = 'box-chart'>
                    Select join type:
                    <select value={joinType} onChange={handleJoinTypeChange}>
                        <option value=""></option>
                        <option value="inner">Inner Join</option>
                        <option value="left">Left Join</option>
                        <option value="right">Right Join</option>
                    </select>

                    Enter Primary Key:
                    <input
                        type="text"
                        value={primaryKey}
                        onChange={handlePrimaryKeyChange}
                    />
                    

                    <button onClick={handleJoinTable}>Join Table</button>
                </div>
            )}

            <div>
                {DropColumns && DropColumns.length > 0 && (
                <>
                    <label>Choose Series Options to Drop:</label>
                    <div className="icon-container">
                    {DropColumns.map((column, index) => (
                        <div key={index} className={`chart-icon ${ yAxisParams[index] === column ? "active" : ""}`} onClick={() => handleYAxisChange(column, index)}>
                        <input type="checkbox" checked={yAxisParams[index] === column} onChange={() => handleYAxisChange(column, index)} />
                        {column}
                        </div>
                    ))}
                    </div>
                    <button onClick={handleYAxisSubmit}>Submit</button>
                </> 
            )}
            </div>

          {isFileUploadHidden && isTableReady ? (
            <React.Fragment>
                <ReactTable
                filterable
                data={nuldata}
                columns={columns}
                style={{
                    height: "400px" // This will force the table body to overflow and scroll, since there is not enough room
                }}
                className="-striped -highlight pa3"
                />
                {nuldata && nuldata.length > 0 && (
                <div>
                    The dataframe has null values. Would you like to drop the NA values?
                        <select value={selectedAction} onChange={handleDropNa}>
                            <option value=""></option>
                            <option value="drop">Drop NA</option>
                            <option value="next">next value</option>
                            <option value="prev">previous value</option>
                            <option value="interp">linear interpolation</option>   
                        </select>
                        {DropNa && (
                            <div style={{ fontStyle: 'italic', fontSize: '12px' }}>
                                {JSON.stringify(DropNa)}
                            </div>
                        )}
                </div>
                )}
            </React.Fragment>
            ) : isFileUploadHidden && (
                <div className="center pa7 db row">
                    <Loader size={40} display="block" />
                </div>
            )}

            <button onClick={handleLoadTable}>{isLoading ? 'Loading...' : 'Load'}</button>

            {LoadData && isFileUploadHidden && (
                <div style={{ fontStyle: 'italic', fontSize: '12px' }}>
                    Data has been loaded
                </div>
            )}
        </div>
        </> 
    );
};
export default UploadFile