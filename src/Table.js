import React, { Component } from "react";
import TabBar from "./container/TabBar/TabBar";
import AnalyticContatiner from "./container/AnalyticContainer/AnalyticContainer";
import "./index.css";
import "./App.css"
import "tachyons";
import FileCard from "./component/FileCard/FileCard";
import axios from "axios";
import Scroll from "./container/Scroll/Scroll";
// import matchSorter from "match-sorter";
import "bootstrap/dist/css/bootstrap.min.css";

class App extends Component {
    constructor() {
        super();
        this.state = {
            activeTab: "Table",
            openFile: "",
            columns: [],
            data: [],
            visibleColumns: [],
            // searchMethod: "regex"
        };
    }

    uploadFile = () => {
        const input = document.getElementById("FileUpload");
        const reader = new FileReader();
        reader.onload = () => {
            const data = reader.result;
            console.log("Data fetched:", data); // Print statement
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            fetch("http://localhost:5000/create", {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify({ data: data })
            }).then(res => {
                res.json().then(data => {
                    console.log("Table data received:", data); // Print statement
                    this.createTable(data);
                });
            });
        };
        reader.readAsText(input.files[0]);
        this.setState({ openFile: input.files[0] });
    };

    createTable = tableData => {
        const data = tableData;
        console.log("Creating table with data:", data);
        // data.columns.map(obj => {
        //     let o = Object.assign({}, obj);
        //     o.filterMethod = (filter, rows) =>
        //         matchSorter(rows, filter.value, { keys: ["lastName"] });
        //     o.filterAll = true;
        //     return o;
        // });
        this.setState({
            columns: data.columns.map(obj => {
                let o = Object.assign({}, obj);
                o.filterAll = true;
                return o;
            }),
            data: data.data,
            visibleColumns: data.columns.map(col => col.Header)
        });
    };
    

    updateColumns = e => {
        if (e.target.checked === false) {
            this.setState({
                visibleColumns: this.state.visibleColumns.filter(col => {
                    console.log(col);
                    console.log(e.target.value);
                    return col !== e.target.value;
                })
            });
        } else {
            this.setState({
                visibleColumns: this.state.visibleColumns.concat(
                    String(e.target.value)
                )
            });
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
                <TabBar
                    changeTab={this.changeTab}
                    active={this.state.activeTab}
                    style={{ zIndex: 1 }}
                />

                {this.state.openFile !== "" ? (
                    <Scroll className="absolute pa5 row pagination-centered">
                        <AnalyticContatiner
                            activeTab={this.state.activeTab}
                            data={this.state.data}
                            columns={this.state.columns.filter(col => {
                                return this.state.visibleColumns.includes(
                                    col.Header
                                );
                            })}
                            style={{ zIndex: -1 }}
                            defaultFilterMethod={this.defaultFilterMethod(
                                this.state.searchMethod
                            )}
                        />
                    </Scroll>
                ) : (
                    <div className="center pa7 db row">
                        <FileCard onSubmit={this.uploadFile} />
                    </div>
                )}
                
            </div>
        );
    }
}
export default App;
