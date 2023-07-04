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
            searchMethod: "regex"
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
        // data.columns.map(obj => {
        //     let o = Object.assign({}, obj);
        //     o.filterMethod = (filter, rows) =>
        //         matchSorter(rows, filter.value, { keys: ["lastName"] });
        //     o.filterAll = true;
        //     return o;
        // });
        this.setState({
            columns: data.columns,
            data: data.data,
        });
    } else {
        console.error("Invalid tableData format:", tableData);
      }
    };

    defaultFilterMethod = selector => {
        switch (selector) {
        default:
            return (filter, row) => {
                try {
                    return String(row[filter.id])
                        .toLowerCase()
                        .search(filter.value.toLowerCase()) === -1
                        ? false
                        : true;
                } catch (e) {
                    return false;
                }
            };
        }
    };

    updateSearchMethod = newMethod => {
        this.setState({ searchMethod: newMethod });
    };

    render() {
        return (
            <div className="App container-fluid">
                {/* <TabBar
                    changeTab={this.changeTab}
                    active={this.state.activeTab}
                    style={{ zIndex: 1 }}
                /> */}

            {this.state.data.length > 0 ? (
                    <Scroll className="absolute pa5 row pagination-centered">
                        <AnalyticContatiner
                            activeTab={this.state.activeTab}
                            data={this.state.data}
                            columns={this.state.columns}
                            style={{ zIndex: -1 }}
                            defaultFilterMethod={this.defaultFilterMethod(
                                this.state.searchMethod
                            )}
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
