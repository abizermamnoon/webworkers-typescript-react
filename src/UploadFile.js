import React, { useEffect, useState, useRef } from "react";
import { processList } from "./longProcesses/enums";
import axios from 'axios';
import './index.css';
import ReactTable, { ReactTableDefaults } from "react-table";
import Loader from "./components/Loader";

const UploadFile = () => {
    const [file, setFile] = useState('');
    const [data, getFile] = useState({ name: "", path: "" });
    const [columns, setColumns] = useState([]);
    const [nuldata, setNulData] = useState([]);
    const [progress, setProgess] = useState(0);
    const el = useRef();
    const [isTableReady, setIsTableReady] = useState(false);
    const [hasNullValues, setHasNullValues] = useState(false);
    const [selectedAction, setSelectedAction] = useState("drop");

    const uploadFile = () => {
        const formData = new FormData();
        formData.append('file', file)
        axios.post('http://localhost:5000/upload', formData, {
            onUploadProgress: (ProgressEvent) => {
                let progress = Math.round(ProgressEvent.loaded / ProgressEvent.total * 100) + '%';
                setProgess(progress)
            }
        }).then(res => {
            console.log(res);
            getFile({ name: res.data.name, path: 'http://localhost:5000' + res.data.path })
            // el.current.value = "";
        }).catch(err => console.log(err))
    }

    const handleChange = (e) => {
        setProgess(0)
        const file = e.target.files[0]
        console.log(file);
        setFile(file)
    }

    useEffect(() => {
        fetchData();
      }, []);

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

          // Check for non-zero values in the 'count_nuls' column
        const countNulsColumn = tableData.columns.find(column => column.accessor === 'count_nuls');
        const countNulsValues = tableData.data.map(row => row[countNulsColumn.accessor]);
        const hasNonZeroValues = countNulsValues.some(value => value !== 0);
        setHasNullValues(hasNonZeroValues);

        } else {
            console.error("Invalid tableData format:", tableData);
        }
    };

    const handleLoadTable = () => {
        // Send POST request to Flask backend
        axios
        .post("http://localhost:5000/loadTable")
        .then(response => {
            // Handle the response from the backend
            console.log("Data_Loaded:", response.data);
            // Update the state with the received groups if necessary
        })
        .catch(error => {
            console.error("Error loading data:", error);
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
            // Update the state with the received groups if necessary
        })
        .catch(error => {
            console.error("Error loading data:", error);
        });
    };

    return (
        <div className='container'>
          <div className="file-upload">
            <input type="file" ref={el} onChange={handleChange} />
            <div className="progressBar" style={{ width: progress }}>
              {progress}
            </div>
            <button onClick={uploadFile} className="upbutton">upload</button>
            <hr />
            {data.path && <div><textarea value={data.path} onChange={uploadFile} /></div>}
          </div>

          {isTableReady ? (
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
                {hasNullValues && (
                <div>
                    The dataframe has null values. Would you like to drop the NA values?
                        <select value={selectedAction} onChange={handleDropNa}>
                            <option value="drop">Drop NA</option>
                            <option value="fill">Fill NA</option>
                        </select>
                </div>
                )}
            </React.Fragment>
            ) : (
            <div className="center pa7 db row">
                <Loader size={40} display="block" />
            </div>
            )}

            <button onClick={handleLoadTable}>Load</button>
        </div>
    );
};
export default UploadFile