import React, { useState, useEffect } from "react";
import "react-table/react-table.css";
import "./styles.css";
import ReactTable, { ReactTableDefaults } from "react-table";
import axios from 'axios';

const Table = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get("http://localhost:5000/create")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data.data);
        setData(data.data);
        setColumns(data.columns);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const columnDefaults = {
    ...ReactTableDefaults.column,
    headerClassName: "wordwrap"
  };

  return (
    <ReactTable
      filterable
      data={data}
      columns={columns || []}
      
      style={{
        height: "800px" // This will force the table body to overflow and scroll, since there is not enough room
      }}
      className="-striped -highlight pa3"
    />
  );
};

export default Table;

