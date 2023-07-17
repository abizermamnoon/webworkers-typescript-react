import React, { Component } from "react";
import TabBar from "./container/TabBar/TabBar";
import AnalyticContatiner from "./container/AnalyticContainer/AnalyticContainer";
import "./App.css";
import "tachyons";
import axios from "axios";
import Scroll from "./container/Scroll/Scroll";
import matchSorter from "match-sorter";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "./components/Loader";

class App extends Component {
    constructor() {
        super();
        this.state = {
            activeTab: "Table",
            openFile: "",
            columns: [],
            data: [],
            visibleColumns: [],
            selectedColumn: "",
            groups: [], // Added groups state
            selectedGroups: [], // Added selectedGroup state
            calculation: "",
            columnTypes: [],
            isCalculating: false,
        };
    }

    componentDidMount() {
        this.fetchData();
    }
    
    fetchData = () => {
    const worker = new Worker(new URL("./longProcesses/getTable.js", import.meta.url));

    worker.addEventListener("message", event => {
        const data = event.data;
        this.createTable(data);
        this.findcol(data);
    });

    worker.postMessage(""); // Pass an empty message since no file is being uploaded
    };

    createTable = tableData => {
        console.log("Received tableData:", tableData);
        if (tableData && tableData.columns && tableData.data) {
        const data = tableData;
        this.setState({
            columns: data.columns,
            data: data.data,
        });
    } else {
        console.error("Invalid tableData format:", tableData);
      }
    };

    findcol = tableData => {
        if (tableData) {
            axios
            .post("http://localhost:5000/coltype")
            .then(response => {
              // Handle the response from the backend
              console.log("Column Types:", response.data);
              this.setState({ columnTypes: response.data});
            })
            .catch(error => {
              console.error("Error retrieving Column Types:", error);
            });
        }
    }

    handleColumnSelect = event => {
        const selectedColumn = event.target.value;
        this.setState({ selectedColumn });

        // Send POST request to Flask backend
        axios
        .post("http://localhost:5000/get_groups", { column: selectedColumn })
        .then(response => {
            // Handle the response from the backend
            console.log("Groups:", response.data);
            // Update the state with the received groups if necessary
            this.setState({ groups: response.data, selectedGroup: "" });
        })
        .catch(error => {
            console.error("Error retrieving groups:", error);
        });
    };

    handleGroupSelect = (event) => {
        const selectedGroups = Array.from(event.target.selectedOptions, (option) =>
            option.value
        );
        this.setState({ selectedGroups });

        if (selectedGroups.length > 0) {
            axios
            .post("http://localhost:5000/filter", { group: selectedGroups })
            .then(response => {
                // Handle the response from the backend
                console.log("Filtered Data:", response.data);
                // Update the state with the received groups if necessary
                this.setState({ data: response.data.data });
            })
            .catch(error => {
                console.error("Error retrieving Filtered Data:", error);
            });
        } else {
            // Reset to the original table data
            this.fetchData();
        }
        console.log("Selected Groups:", selectedGroups);
    };

    handleCalculateChange = (e) => {
        this.setState({ calculation: e.target.value });
    };

    handleCalculateKeyDown = (e) => {
        if (e.key === 'Enter') {
          this.postCalculation();
        }
      };
    
      postCalculation = () => {
        this.setState({ isCalculating: true });
        const { calculation } = this.state;
    
        axios
          .post("http://localhost:5000/calculation", { calculation: calculation })
          .then(response => {
            // Handle the response from the backend
            console.log("Calculation result:", response.data);

            this.setState({
                columns: response.data.columns,
                data: response.data.data,
                isCalculating: false,
            });
            
          })
          .catch(error => {
            console.error("Error posting calculation:", error);
            this.setState({ isCalculating: false });
          });
      };
    
    // Function to send POST request to transformtable endpoint
    handleTransformClick = () => {
        this.setState({ isTransforming: true });
        axios
        .post("http://localhost:5000/transformtable")
        .then(response => {
            // Handle the response from the backend
            console.log("Transformation Result:", response.data);
            // Update the state with the transformed data if necessary
            this.setState({
                isTransforming: false, // Set isTransforming to false when the transformation is complete
                showTransformedMessage: true, // Set showTransformedMessage to true to display the message
            });
        })
        .catch(error => {
            console.error("Error posting transformation:", error);
            this.setState({ isTransforming: false }); 
        });
    };


    render() {
        const { data, columns, selectedColumn, groups, selectedGroups, isCalculating, isTransforming, showTransformedMessage } = this.state;
        return (
            <div className="App container-fluid">
                <div className="d-flex mb-3">
                    <div className="p-2">
                        <label>Group by:</label>
                            <select value={selectedColumn} onChange={this.handleColumnSelect}>
                                <option key="" value=""></option>
                                {columns.map((column, index) => (
                                    // Only render the option if the column data type is string
                                    this.state.columnTypes[column.accessor] === "string" && (
                                        <option key={`column-${index}`} value={column.accessor}>
                                            {column.Header}
                                        </option>
                                    )
                                ))}
                            </select>

                    {groups.length > 0 && (
                        <div>
                        <label>Filter by:</label>
                        <select
                            value={selectedGroups}
                            onChange={this.handleGroupSelect}
                            multiple
                        >
                            {groups.map((group, index) => (
                                <option key={`group-${index}`} value={group} selected={selectedGroups.includes(group)}>
                                {group}
                                </option>
                            ))}
                        </select>
                        </div>
                    )}
                        
                    <label>Calculation  : </label>
                    <input id="calculation" value={this.state.calculation} onChange={this.handleCalculateChange} onKeyDown={this.handleCalculateKeyDown} style={{ width: '400px' }} />
             
                    {isCalculating && <div>Calculating... Please wait.</div>}
                   
                    <button onClick={this.handleTransformClick} disabled={isTransforming}>{isTransforming ? "Transforming..." : "Transform"}</button>
               
                        {/* Show the message when transformation is complete */}
                        {showTransformedMessage && <div>Data has been transformed.</div>}
                        {/* Show "Transforming..." while transformation is in progress */}
                        {isTransforming && !showTransformedMessage && <div>Transforming... Please wait.</div>}
                    </div>
                </div>
                
            {this.state.data.length > 0 ? (
                    <Scroll className="absolute pa5 row pagination-centered">
                        <AnalyticContatiner
                            activeTab={this.state.activeTab}
                            data={this.state.data} // Use the first 100 rows
                            columns={this.state.columns}
                            style={{ zIndex: -1 }}
                        />
                    </Scroll>
                ) : (
                    <div className="center pa7 db row">
                        <Loader size={40} display="block" />
                    </div>
                )}
                
            </div>
        );
    }
}
export default App;
