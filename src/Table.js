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
            calculation: ""
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
        const { calculation } = this.state;
    
        axios
          .post("http://localhost:5000/calculation", { calculation: calculation })
          .then(response => {
            // Handle the response from the backend
            console.log("Calculation result:", response.data);

            this.setState({
                columns: response.data.columns,
                data: response.data.data,
            });
            
          })
          .catch(error => {
            console.error("Error posting calculation:", error);
          });
      };

    render() {
        const { data, columns, selectedColumn, groups, selectedGroups } = this.state;
        return (
            <div className="App container-fluid">
                <div className="d-flex mb-3">
                    <div className="mr-3">
                        <label>Group by:</label>
                            <select value={selectedColumn} onChange={this.handleColumnSelect}>
                                <option key="" value=""></option>
                                {columns.map((column, index) => (
                                    <option key={`column-${index}`} value={column.accessor}>
                                    {column.Header}
                                    </option>
                                ))}
                            </select>
                    </div>
                    <div className="pl-3">
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
                    <div className="pl-3">
                        <label>Calculation  : </label>
                        <input id="calculation" value={this.state.calculation} onChange={this.handleCalculateChange} onKeyDown={this.handleCalculateKeyDown} style={{ width: '400px' }} />
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
