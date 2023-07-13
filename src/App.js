import React, { useEffect, useState, useRef } from "react";
import Loader from "./components/Loader";
import { ControlCenter } from "./components/ControlCenter";
import { processList } from "./longProcesses/enums";
import axios from 'axios';
import './index.css'
import Sidebar from "./sidebar/Sidebar"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Table from './Table.js'
import UploadFile from './UploadFile'

export const listPageSize = 10000;

const App = () => {

  const [lengthCount, setLengthCount] = useState({
    loading: true,
    value: 0,
  });
  const [profileList, setProfileList] = useState({
    loading: true,
    list: [],
    page: 1,
    // totalPages: 0,
  });

  useEffect(() => {
    
      const counter = new Worker(new URL("./longProcesses/count.js", import.meta.url));
      counter.postMessage(processList.count);

      counter.onmessage = (e) => {
        setLengthCount((prev) => ({
          ...prev,
          loading: false,
          value: Number(e.data) && Number(e.data),
        }));
      };

      const getData = new Worker(new URL("./longProcesses/getData.js", import.meta.url));
      const request = {
        action: processList.getData,
        period: "initial",
        thePageNumber: profileList.page,
      };

      getData.postMessage(JSON.stringify(request));

      getData.onmessage = (e) => {
        const response = JSON.parse(e.data);
        console.log({ response });

        setProfileList((prev) => ({
          ...prev,
          loading: response.loading,
          list: response.list,
          page: response.page,
        }));
      };
      return () => {
        counter.terminate();
        getData.terminate();
      };
    
  }, [profileList.page]);

  return (
    <main className="main-container" >  
      <Router>
        <Sidebar />
        <Routes>
          <Route path='/chart' element={<ControlCenter list={profileList.list}/>} />
          <Route path='/table' element={<Table />} />
          <Route path='/' element={<UploadFile />} />
        </Routes>
      </Router>
  </main>
);
        };

export default App;