import React, { useEffect, useState, useRef } from "react";
import Loader from "./components/Loader";
import { ControlCenter } from "./components/ControlCenter";
import { processList } from "./longProcesses/enums";
import axios from 'axios';
import './index.css'
import Sidebar from "./sidebar/Sidebar"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Table from './Table.js'

export const listPageSize = 10000;

const App = () => {
  const [file, setFile] = useState('');
  const [columnTypes, setColumnTypes] = useState([]);
  const [data, getFile] = useState({ name: "", path: "" });
  const [progress, setProgess] = useState(0);
  const el = useRef();

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

  const handleChange = (e) => {
    setProgess(0)
    const file = e.target.files[0]
    console.log(file);
    setFile(file)
  }

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

  useEffect(() => {
    if (data) {
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
    }
  }, [data, profileList.page]);

  return (
    <main className="main-container">
    <div>
      <div className="file-upload">
        <input type="file" ref={el} onChange={handleChange} />
        <div className="progressBar" style={{ width: progress }}>
          {progress}
        </div>
        <button onClick={uploadFile} className="upbutton">upload</button>
        <hr />
        {data.path && <div><textarea value={data.path} onChange={uploadFile} /></div>}
      </div>

      <div>
        <Router>
          <Sidebar />
          <Routes>
            <Route path='/chart' element={<ControlCenter list={profileList.list}/>} />
            <Route path='/table' element={<Table />} />
          </Routes>
        </Router>
      </div>
      {/* {data.path && <img src={data.path} alt={data.name} />} */}
      {/* <section className="table-container">
        {profileList.loading ? (
          <Loader size={40} display="block" />
        ) : (
          <>
            <div className="control-side">
              <Table list={profileList.list} />
            </div>
          </>
        )}
      </section> */}
      
    </div>
  </main>
);
        };

export default App;